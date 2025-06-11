"use client";

import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { EditModeProvider } from '../contexts/EditModeContext';

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <EditModeProvider>
        {children}
      </EditModeProvider>
    </SessionProvider>
  );
} 