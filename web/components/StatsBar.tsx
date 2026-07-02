'use client';
import useSWR from 'swr';
import { supabase } from '../lib/supabase';

const fetcher = async () => {
  const { data, error } = await supabase.from('stats_by_city').select('*');
  if (error) throw error;
  return { cities: data || [] };
};

export default function StatsBar() {
  const { data } = useSWR('stats_by_city', fetcher, { refreshInterval: 30000 });

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
