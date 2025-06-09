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
import { AdminToolbar } from '@/components/admin-toolbar';
import Head from 'next/head';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SaintsGaming - Gaming Community',
  description: 'Join the SaintsGaming community for gaming discussions, events, and more.',
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
    <>
      <Head>
        <link rel="icon" href="/saintsgaming-icon.png" type="image/png" />
      </Head>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <AuthProvider>
            <GlobalErrorBoundary>
              <AdminToolbar />
              <div className="flex min-h-screen flex-col">
                <MainNav />
                <main className="flex-1">
                  {children}
                </main>
                <Footer />
              </div>
              <CookieConsent />
              <AgeVerification />
              <Toaster />
            </GlobalErrorBoundary>
          </AuthProvider>
        </body>
      </html>
    </>
  );
}