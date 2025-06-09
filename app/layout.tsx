import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { MainNav } from '@/components/main-nav';
import { Footer } from '@/components/footer';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/components/auth-provider';
import { CookieConsent } from '@/components/cookie-consent';
import { AgeVerification } from '@/components/age-verification';
import { GlobalErrorBoundary } from '@/components/global-error-boundary';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SaintsGaming',
  description: 'Welcome to SaintsGaming - Your Ultimate Gaming Community',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
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
      </body>
    </html>
  );
}