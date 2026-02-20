'use client';

import { useEffect } from 'react';
import OfflineBanner from './OfflineBanner';
import { registerServiceWorker } from '@/lib/offline';

export default function AppProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <>
      <OfflineBanner />
      {children}
    </>
  );
}
