import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Alo Çukur Hattı — Türkiye Yol Hasar Haritası',
  description: 'Vatandaşların yol çukurlarını harita üzerinde fotoğraflı raporladığı platform.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
