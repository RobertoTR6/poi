'use client';
import { AppProvider } from '@/context/AppContext';

export function Providers({ children }) {
  return <AppProvider>{children}</AppProvider>;
}
