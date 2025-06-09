'use client';

import { MainNav } from '@/components/main-nav';
import { Footer } from '@/components/footer';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/components/auth-provider';
import { CookieConsent } from '@/components/cookie-consent';
import { AgeVerification } from '@/components/age-verification';
import { GlobalErrorBoundary } from '@/components/global-error-boundary';

export function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <GlobalErrorBoundary>
        <div className="min-h-screen flex flex-col">
          <MainNav />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <CookieConsent />
          <AgeVerification />
          <Toaster />
        </div>
      </GlobalErrorBoundary>
    </AuthProvider>
  );
} 