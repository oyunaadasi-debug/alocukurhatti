'use client';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());
const API = process.env.NEXT_PUBLIC_API_URL;
const MEDALS = ['🥇', '🥈', '🥉'];

export default function ReportersTable() {
  const { data, isLoading } = useSWR(`${API}/api/stats/reporters`, fetcher, { refreshInterval: 120000 });
  const reporters: any[] = data?.reporters || [];

  if (isLoading) return <div style={{ textAlign: 'center', padding: 40, color: '#9E9E9E', fontSize: 14 }}>Yükleniyor…</div>;
  if (reporters.length === 0) return (
    <div style={{ textAlign: 'center', padding: 40, color: '#9E9E9E', fontSize: 14, background: '#FAFAFA', borderRadius: 14, border: '1px dashed #EEEEEE' }}>
      Henüz kayıtlı kullanıcı raporu yok.
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {reporters.map((r, i) => (
        <div key={r.id} style={{
          background: '#fff', borderRadius: 14, padding: '14px 20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{ fontSize: i < 3 ? 22 : 14, fontWeight: 700, color: '#9E9E9E', width: 32, textAlign: 'center', flexShrink: 0 }}>
            {i < 3 ? MEDALS[i] : i + 1}
          </div>
          <div style={{
            width: 38, height: 38, borderRadius: 9999, background: '#E53935',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 16, flexShrink: 0,
          }}>
            {r.display_name[0].toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#212121', marginBottom: 2 }}>{r.display_name}</div>
            <div style={{ fontSize: 12, color: '#9E9E9E' }}>
              {r.report_count} şikayet · {r.resolved_count} çözüldü · {r.total_metoo || 0} destek aldı
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#E53935', letterSpacing: '-0.02em' }}>{r.report_count}</div>
            <div style={{ fontSize: 11, color: '#9E9E9E' }}>şikayet</div>
          </div>
        </div>
      ))}
    </div>
  );
}
