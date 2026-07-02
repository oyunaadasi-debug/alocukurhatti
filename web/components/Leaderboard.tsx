'use client';
import useSWR from 'swr';
import { supabase } from '../lib/supabase';

const fetcher = async () => {
  const { data, error } = await supabase.from('stats_by_city').select('*');
  if (error) throw error;
  return { cities: data || [] };
};

const MEDALS = ['🥇', '🥈', '🥉'];

export default function Leaderboard() {
  const { data, isLoading } = useSWR('stats_by_city', fetcher, { refreshInterval: 60000 });
  const cities: any[] = data?.cities || [];
  const sorted = [...cities].sort((a, b) => parseInt(b.open_count) - parseInt(a.open_count));
  const max = sorted[0] ? parseInt(sorted[0].open_count) : 1;

  if (isLoading) return <div style={{ textAlign: 'center', padding: 60, color: '#9E9E9E', fontSize: 14 }}>Yükleniyor…</div>;
  if (sorted.length === 0) return <div style={{ textAlign: 'center', padding: 60, color: '#9E9E9E', fontSize: 14 }}>Henüz veri yok.</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {sorted.map((city, i) => {
        const open = parseInt(city.open_count) || 0;
        const resolved = parseInt(city.resolved_count) || 0;
        const pct = Math.round((open / max) * 100);
        return (
          <div key={city.city} style={{ background: '#fff', borderRadius: 14, padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ fontSize: i < 3 ? 22 : 14, fontWeight: 700, color: '#9E9E9E', width: 32, textAlign: 'center', flexShrink: 0 }}>
                {i < 3 ? MEDALS[i] : i + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 16, color: '#212121' }}>{city.city}</span>
                  <span style={{ fontSize: 26, fontWeight: 800, color: '#E53935', letterSpacing: '-0.02em' }}>{open}</span>
                </div>
                <div style={{ height: 4, background: '#EEEEEE', borderRadius: 9999, overflow: 'hidden', marginBottom: 6 }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: '#2E7D32', borderRadius: 9999, transition: 'width 0.4s' }} />
                </div>
                <div style={{ fontSize: 12, color: '#9E9E9E' }}>
                  {open} açık · {resolved} çözüldü
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
