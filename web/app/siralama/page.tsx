import Header from '@/components/Header';
import StatsBar from '@/components/StatsBar';
import Leaderboard from '@/components/Leaderboard';

export const metadata = { title: 'Şehir Sıralaması — Alo Çukur Hattı' };

export default function SiralamePage() {
  return (
    <>
      <Header />
      <StatsBar />
      <main style={{ maxWidth: 700, margin: '0 auto', padding: '24px 16px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4, letterSpacing: '-0.02em' }}>Şehir Sıralaması</h1>
        <p style={{ fontSize: 14, color: '#616161', marginBottom: 24 }}>En fazla açık raporu olan şehirler.</p>
        <Leaderboard />
      </main>
    </>
  );
}
