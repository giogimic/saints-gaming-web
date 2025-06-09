import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SaintsGaming",
  description: "Welcome to SaintsGaming - Your Ultimate Gaming Community",
  keywords: ['gaming', 'community', 'forums', 'steam', 'saintsgaming'],
  authors: [{ name: 'SaintsGaming' }],
  creator: 'SaintsGaming',
  publisher: 'SaintsGaming',
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
  icons: {
    icon: '/favicon.ico',
  },
}; 