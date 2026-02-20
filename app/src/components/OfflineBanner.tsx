'use client';

import { useEffect, useState, useCallback } from 'react';
import { isOnline, onOnlineStatusChange, processQueue, getQueuedActions } from '../lib/offline';

type BannerState = 'hidden' | 'offline' | 'back-online';

export default function OfflineBanner() {
  const [state, setState] = useState<BannerState>('hidden');
  const [queueCount, setQueueCount] = useState(0);
  const [syncedCount, setSyncedCount] = useState(0);

  const checkQueue = useCallback(async () => {
    try {
      const actions = await getQueuedActions();
      setQueueCount(actions.length);
    } catch {
      // Silently ignore — queue may not be available
    }
  }, []);

  useEffect(() => {
    // Set initial state
    if (!isOnline()) {
      setState('offline');
      checkQueue();
    }

    const unsubscribe = onOnlineStatusChange(async (online) => {
      if (online) {
        setState('back-online');

        // Process queued actions
        try {
          const result = await processQueue();
          setSyncedCount(result.processed);
        } catch {
          // Sync failed silently
        }

        // Auto-hide after 4 seconds
        const timer = setTimeout(() => {
          setState('hidden');
          setSyncedCount(0);
        }, 4000);

        return () => clearTimeout(timer);
      } else {
        setState('offline');
        checkQueue();
      }
    });

    // Listen for sync messages from service worker
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SYNC_COMPLETE') {
        setSyncedCount(event.data.processed);
        if (event.data.remaining === 0) {
          setQueueCount(0);
        } else {
          setQueueCount(event.data.remaining);
        }
      }
    };

    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleMessage);
    }

    return () => {
      unsubscribe();
      if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
      }
    };
  }, [checkQueue]);

  if (state === 'hidden') {
    return null;
  }

  if (state === 'offline') {
    return (
      <div
        role="status"
        aria-live="polite"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          backgroundColor: '#fef3c7',
          borderBottom: '1px solid #f59e0b',
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontSize: '14px',
          color: '#92400e',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          animation: 'coassure-slide-down 0.3s ease-out',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: '8px',
            height: '8px',
            backgroundColor: '#f59e0b',
            borderRadius: '50%',
            flexShrink: 0,
          }}
        />
        <span>
          You&apos;re offline — some features may be limited
          {queueCount > 0 && (
            <span style={{ marginLeft: '6px', opacity: 0.75 }}>
              ({queueCount} pending {queueCount === 1 ? 'action' : 'actions'})
            </span>
          )}
        </span>
      </div>
    );
  }

  // state === 'back-online'
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        backgroundColor: '#d1fae5',
        borderBottom: '1px solid #34d399',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontSize: '14px',
        color: '#065f46',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        animation: 'coassure-slide-down 0.3s ease-out',
      }}
    >
      <span
        style={{
          display: 'inline-block',
          width: '8px',
          height: '8px',
          backgroundColor: '#34d399',
          borderRadius: '50%',
          flexShrink: 0,
        }}
      />
      <span>
        Back online
        {syncedCount > 0
          ? ` — synced ${syncedCount} ${syncedCount === 1 ? 'action' : 'actions'}`
          : ' — syncing...'}
      </span>
    </div>
  );
}
