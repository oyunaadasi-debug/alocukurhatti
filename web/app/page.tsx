import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import StatsBar from '@/components/StatsBar';

// Leaflet SSR desteklemez — client-only yükle
const MapView = dynamic(() => import('@/components/MapView'), { ssr: false, loading: () => <div style={{ height: '100vh', display: 'grid', placeItems: 'center', color: '#9E9E9E' }}>Harita yükleniyor…</div> });

export default function HomePage() {
  return (
    <>
      <Header />
      <StatsBar />
      <main style={{ height: 'calc(100vh - 108px)' }}>
        <MapView />
      </main>
    </>
  );
}
