'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';

const API = process.env.NEXT_PUBLIC_API_URL;

const STATUS_COLORS: Record<string, string> = {
  pending: '#F57F17',
  flagged:  '#B71C1C',
};

export default function ModerationQueuePage() {
  const [reports, setReports]   = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState<'pending' | 'flagged'>('flagged');
  const [acting, setActing]     = useState<number | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : '';

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/queue?status=${filter}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setReports(data.reports ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [filter]);

  async function approve(id: number) {
    setActing(id);
    await fetch(`${API}/api/admin/reports/${id}/approve`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}` },
    });
    setReports(prev => prev.filter(r => r.id !== id));
    setActing(null);
  }

  async function reject(id: number) {
    setActing(id);
    await fetch(`${API}/api/admin/reports/${id}/reject`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'Admin kararı' }),
    });
    setReports(prev => prev.filter(r => r.id !== id));
    setActing(null);
  }

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: '#212121', margin: '0 0 8px' }}>Moderasyon Kuyruğu</h1>
      <p style={{ fontSize: 14, color: '#9E9E9E', margin: '0 0 24px' }}>Onay bekleyen ve şikayet edilen raporlar</p>

      {/* Filtre */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {(['flagged', 'pending'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            border: 'none', cursor: 'pointer', borderRadius: 999,
            padding: '8px 18px', fontSize: 13, fontWeight: 600,
            background: filter === f ? STATUS_COLORS[f] : '#EEEEEE',
            color: filter === f ? '#fff' : '#616161',
          }}>
            {f === 'flagged' ? '🚩 Şikayet Edildi' : '⏳ Onay Bekliyor'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ color: '#9E9E9E' }}>Yükleniyor…</div>
      ) : reports.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 12, padding: 40, textAlign: 'center', color: '#9E9E9E' }}>
          ✅ Kuyruk boş
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {reports.map((r: any) => (
            <div key={r.id} style={{
              background: '#fff', borderRadius: 12, overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}>
              {r.photo_url && (
                <div style={{ position: 'relative', height: 180 }}>
                  <Image src={r.photo_url} alt="Rapor" fill style={{ objectFit: 'cover' }} />
                  <span style={{
                    position: 'absolute', top: 8, left: 8,
                    background: STATUS_COLORS[r.moderation_status] || '#9E9E9E',
                    color: '#fff', borderRadius: 999, padding: '3px 10px', fontSize: 12, fontWeight: 600,
                  }}>
                    {r.moderation_status === 'flagged' ? `🚩 ${r.flag_count} şikayet` : '⏳ Bekliyor'}
                  </span>
                </div>
              )}
              <div style={{ padding: 16 }}>
                <p style={{ fontWeight: 600, fontSize: 14, margin: '0 0 4px', color: '#212121' }}>
                  #{r.id} — {r.address || r.city || 'Konum yok'}
                </p>
                {r.description && <p style={{ fontSize: 13, color: '#616161', margin: '0 0 12px' }}>{r.description}</p>}
                <p style={{ fontSize: 11, color: '#9E9E9E', margin: '0 0 12px' }}>
                  {new Date(r.created_at).toLocaleString('tr-TR')}
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => approve(r.id)} disabled={acting === r.id} style={{
                    flex: 1, border: 'none', cursor: 'pointer', borderRadius: 999,
                    padding: '10px 0', background: '#2E7D32', color: '#fff', fontSize: 13, fontWeight: 700,
                    opacity: acting === r.id ? 0.6 : 1,
                  }}>
                    ✓ Onayla
                  </button>
                  <button onClick={() => reject(r.id)} disabled={acting === r.id} style={{
                    flex: 1, border: 'none', cursor: 'pointer', borderRadius: 999,
                    padding: '10px 0', background: '#FFCDD2', color: '#B71C1C', fontSize: 13, fontWeight: 700,
                    opacity: acting === r.id ? 0.6 : 1,
                  }}>
                    ✕ Reddet
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
