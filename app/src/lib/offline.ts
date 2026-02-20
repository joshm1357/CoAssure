// Offline utilities for CoAssure
// Handles service worker registration, online/offline detection,
// and an IndexedDB-backed queue for syncing actions when connectivity returns.
// AI/Anthropic API calls are explicitly excluded from offline support.

const DB_NAME = 'coassure_offline';
const DB_VERSION = 1;
const STORE_NAME = 'offline_queue';

// ===================== Types =====================

export interface QueuedAction {
  id?: number;
  type: 'report' | 'form-submission' | 'training-record' | 'worker-update' | 'session-complete';
  url: string;
  method: string;
  headers: Record<string, string>;
  body: unknown;
  createdAt: string;
  retryCount: number;
}

type OnlineStatusCallback = (online: boolean) => void;

// ===================== Service Worker Registration =====================

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    // Listen for SW updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New SW installed but waiting — activate it
          newWorker.postMessage({ type: 'SKIP_WAITING' });
        }
      });
    });

    // Listen for messages from the service worker (sync results, etc.)
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'SYNC_COMPLETE') {
        console.log(
          `[Offline] Sync complete: ${event.data.processed} processed, ${event.data.remaining} remaining`
        );
      }
    });

    // Process any queued actions if we're online at registration time
    if (navigator.onLine) {
      // Small delay to let the SW finish activating
      setTimeout(() => processQueue(), 2000);
    }

    return registration;
  } catch (error) {
    console.error('[Offline] Service worker registration failed:', error);
    return null;
  }
}

// ===================== Online Status =====================

export function isOnline(): boolean {
  if (typeof navigator === 'undefined') return true;
  return navigator.onLine;
}

export function onOnlineStatusChange(callback: OnlineStatusCallback): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Return an unsubscribe function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

// ===================== IndexedDB Helpers =====================

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB not available'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ===================== Queue Management =====================

export async function queueAction(action: Omit<QueuedAction, 'id' | 'createdAt' | 'retryCount'>): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const entry: Omit<QueuedAction, 'id'> = {
      ...action,
      createdAt: new Date().toISOString(),
      retryCount: 0,
    };

    store.add(entry);

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    db.close();

    // Request background sync if available
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      const registration = await navigator.serviceWorker.ready;
      try {
        await (registration as ServiceWorkerRegistration & { sync: { register: (tag: string) => Promise<void> } }).sync.register('coassure-sync');
      } catch {
        // Background sync not supported or permission denied — will process manually
      }
    }
  } catch (error) {
    console.error('[Offline] Failed to queue action:', error);
    // Fallback: store in localStorage if IndexedDB fails
    try {
      const existing = JSON.parse(localStorage.getItem('coassure_offline_queue') || '[]');
      existing.push({
        ...action,
        createdAt: new Date().toISOString(),
        retryCount: 0,
      });
      localStorage.setItem('coassure_offline_queue', JSON.stringify(existing));
    } catch {
      console.error('[Offline] LocalStorage fallback also failed');
    }
  }
}

export async function getQueuedActions(): Promise<QueuedAction[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);

    return new Promise<QueuedAction[]>((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        db.close();
        resolve(request.result || []);
      };
      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch {
    // Fallback: check localStorage
    try {
      return JSON.parse(localStorage.getItem('coassure_offline_queue') || '[]');
    } catch {
      return [];
    }
  }
}

export async function processQueue(): Promise<{ processed: number; failed: number }> {
  const result = { processed: 0, failed: 0 };

  // Don't process if offline
  if (!isOnline()) {
    return result;
  }

  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);

    const actions: QueuedAction[] = await new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });

    if (actions.length === 0) {
      db.close();
      return result;
    }

    const keepActions: QueuedAction[] = [];

    for (const action of actions) {
      try {
        const response = await fetch(action.url, {
          method: action.method || 'POST',
          headers: action.headers || { 'Content-Type': 'application/json' },
          body: action.body ? JSON.stringify(action.body) : undefined,
        });

        if (response.ok) {
          result.processed++;
        } else if (response.status >= 500) {
          // Server error — retry later (up to 5 times)
          if (action.retryCount < 5) {
            keepActions.push({ ...action, retryCount: action.retryCount + 1 });
          }
          result.failed++;
        } else {
          // Client error (4xx) — drop it, won't succeed on retry
          result.failed++;
        }
      } catch {
        // Network error — keep for retry
        if (action.retryCount < 5) {
          keepActions.push({ ...action, retryCount: action.retryCount + 1 });
        }
        result.failed++;
      }
    }

    // Clear store and re-add failed actions
    const clearTx = db.transaction(STORE_NAME, 'readwrite');
    const clearStore = clearTx.objectStore(STORE_NAME);
    clearStore.clear();

    for (const action of keepActions) {
      // Remove the id so auto-increment assigns a new one
      const { id, ...rest } = action;
      clearStore.add(rest);
    }

    await new Promise<void>((resolve, reject) => {
      clearTx.oncomplete = () => resolve();
      clearTx.onerror = () => reject(clearTx.error);
    });

    db.close();

    // Also process localStorage fallback queue
    await processLocalStorageFallback();

    return result;
  } catch (error) {
    console.error('[Offline] Failed to process queue:', error);
    return result;
  }
}

async function processLocalStorageFallback(): Promise<void> {
  try {
    const raw = localStorage.getItem('coassure_offline_queue');
    if (!raw) return;

    const actions: QueuedAction[] = JSON.parse(raw);
    if (actions.length === 0) return;

    const remaining: QueuedAction[] = [];

    for (const action of actions) {
      try {
        const response = await fetch(action.url, {
          method: action.method || 'POST',
          headers: action.headers || { 'Content-Type': 'application/json' },
          body: action.body ? JSON.stringify(action.body) : undefined,
        });

        if (!response.ok && response.status >= 500 && action.retryCount < 5) {
          remaining.push({ ...action, retryCount: action.retryCount + 1 });
        }
      } catch {
        if (action.retryCount < 5) {
          remaining.push({ ...action, retryCount: action.retryCount + 1 });
        }
      }
    }

    if (remaining.length > 0) {
      localStorage.setItem('coassure_offline_queue', JSON.stringify(remaining));
    } else {
      localStorage.removeItem('coassure_offline_queue');
    }
  } catch {
    // Silently ignore — localStorage may not be available
  }
}

export async function clearQueue(): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).clear();

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    db.close();
  } catch {
    // Silently ignore
  }

  // Also clear localStorage fallback
  try {
    localStorage.removeItem('coassure_offline_queue');
  } catch {
    // Silently ignore
  }
}
