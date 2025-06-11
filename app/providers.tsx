"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/toaster";
import { AdminWidget, EditModeProvider } from "@/components/admin-widget";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={0}>
      <EditModeProvider>
        {children}
        <AdminWidget />
        <Toaster />
      </EditModeProvider>
    </SessionProvider>
  );
} 