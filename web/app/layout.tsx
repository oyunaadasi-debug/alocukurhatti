import type { Metadata, Viewport } from 'next';
import './globals.css';
import CookieBanner from '@/components/CookieBanner';

export const metadata: Metadata = {
  title: 'Alo Çukur Hattı — Türkiye Yol Hasar Haritası',
  description: 'Vatandaşların yol çukurlarını harita üzerinde fotoğraflı raporladığı platform.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
