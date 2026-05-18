import Header from '@/components/Header';
import StatsBar from '@/components/StatsBar';
import ReportList from '@/components/ReportList';

export const metadata = { title: 'Raporlar — Alo Çukur Hattı' };

export default function RaporlarPage() {
  return (
    <>
      <Header />
      <StatsBar />
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4, letterSpacing: '-0.02em' }}>Tüm Raporlar</h1>
        <p style={{ fontSize: 14, color: '#616161', marginBottom: 24 }}>Vatandaşların bildirdiği yol hasarları, en yeni önce.</p>
        <ReportList />
      </main>
    </>
  );
}
