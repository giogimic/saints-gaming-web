import './globals.css';
import { Inter } from 'next/font/google';
import { ClientProviders } from './components/ClientProviders';
import { ReactNode } from 'react';
import { Metadata } from 'next';
import { Providers } from '@/components/providers';
import { MainNav } from '@/components/main-nav';
import { Footer } from '@/components/footer';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/app/contexts/AuthContext";
import { EditModeProvider } from "@/app/contexts/EditModeContext";
import { AuthSessionProvider } from "@/components/providers/session-provider";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Saints Gaming',
  description: 'A modern gaming community for everyone',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap" rel="stylesheet" />
      </head>
      <body 
        className={`${inter.className} bg-[var(--background)] text-[var(--foreground)] min-h-screen flex flex-col`} 
        suppressHydrationWarning
      >
        <AuthSessionProvider>
          <AuthProvider>
            <EditModeProvider>
              <ClientProviders>
                <Providers>
                  <MainNav />
                  <main className="flex-1 container mx-auto px-4 py-8">
                    {children}
                  </main>
                  <Footer />
                </Providers>
              </ClientProviders>
              <Toaster />
            </EditModeProvider>
          </AuthProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}