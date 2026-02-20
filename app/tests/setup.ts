import '@testing-library/jest-dom';

// Mock localStorage for testing
const store: Record<string, string> = {};

const localStorageMock = {
  getItem: (key: string): string | null => store[key] || null,
  setItem: (key: string, value: string): void => { store[key] = value; },
  removeItem: (key: string): void => { delete store[key]; },
  clear: (): void => { Object.keys(store).forEach(key => delete store[key]); },
  get length(): number { return Object.keys(store).length; },
  key: (index: number): string | null => Object.keys(store)[index] || null,
};

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock crypto.randomUUID
Object.defineProperty(globalThis, 'crypto', {
  value: {
    randomUUID: () => `test-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
  },
});

// Clean localStorage before each test
beforeEach(() => {
  localStorageMock.clear();
});
