'use client';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());
const API = process.env.NEXT_PUBLIC_API_URL;

export default function StatsBar() {
  const { data } = useSWR(`${API}/api/stats/cities`, fetcher, { refreshInterval: 30000 });

  const totalOpen = data?.cities?.reduce((s: number, c: any) => s + parseInt(c.open_count || 0), 0) ?? '…';
  const totalResolved = data?.cities?.reduce((s: number, c: any) => s + parseInt(c.resolved_count || 0), 0) ?? '…';
  const cityCount = data?.cities?.length ?? '…';

  return (
    <div style={{
      height: 52,
      background: '#F5F5F5',
      borderBottom: '1px solid #EEEEEE',
      display: 'flex',
      alignItems: 'center',
      gap: 32,
      padding: '0 20px',
      fontSize: 13,
    }}>
      <span>🔴 <strong style={{ color: '#E53935' }}>{totalOpen}</strong> açık rapor</span>
      <span>✅ <strong style={{ color: '#2E7D32' }}>{totalResolved}</strong> çözüldü</span>
      <span>🏙️ <strong>{cityCount}</strong> şehir</span>
    </div>
  );
}
