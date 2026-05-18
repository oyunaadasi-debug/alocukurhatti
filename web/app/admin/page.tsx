'use client';
import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL;

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 12, padding: '20px 24px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)', flex: 1, minWidth: 140,
    }}>
      <div style={{ fontSize: 28, fontWeight: 900, color }}>{value}</div>
      <div style={{ fontSize: 13, color: '#616161', marginTop: 4 }}>{label}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    fetch(`${API}/api/admin/stats`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 40, color: '#9E9E9E' }}>Yükleniyor…</div>;

  const r = stats?.reports ?? {};
  const u = stats?.users   ?? {};

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: '#212121', margin: '0 0 8px' }}>Dashboard</h1>
      <p style={{ fontSize: 14, color: '#9E9E9E', margin: '0 0 32px' }}>Platform genel durumu</p>

      <h2 style={{ fontSize: 16, fontWeight: 700, color: '#616161', margin: '0 0 12px' }}>Raporlar</h2>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 32 }}>
        <StatCard label="Açık Raporlar"       value={r.open_reports      ?? '—'} color="#E53935" />
        <StatCard label="Çözülen"             value={r.resolved_reports  ?? '—'} color="#2E7D32" />
        <StatCard label="Moderasyon Bekliyor" value={r.pending_moderation ?? '—'} color="#F57F17" />
        <StatCard label="Şikayet Edildi"      value={r.flagged_reports   ?? '—'} color="#B71C1C" />
        <StatCard label="Reddedilen"          value={r.rejected_reports  ?? '—'} color="#9E9E9E" />
        <StatCard label="Toplam Rapor"        value={r.total_reports     ?? '—'} color="#212121" />
      </div>

      <h2 style={{ fontSize: 16, fontWeight: 700, color: '#616161', margin: '0 0 12px' }}>Kullanıcılar</h2>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 40 }}>
        <StatCard label="Toplam Kullanıcı"    value={u.total_users        ?? '—'} color="#1565C0" />
        <StatCard label="Belediye Memuru"     value={u.municipality_users ?? '—'} color="#1565C0" />
        <StatCard label="Admin"               value={u.admin_users        ?? '—'} color="#212121" />
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <a href="/admin/queue" style={{
          background: '#E53935', color: '#fff', borderRadius: 999,
          padding: '12px 28px', textDecoration: 'none', fontSize: 14, fontWeight: 700,
        }}>
          Moderasyon Kuyruğunu Aç →
        </a>
        <a href="/admin/users" style={{
          background: '#F5F5F5', color: '#212121', borderRadius: 999,
          padding: '12px 28px', textDecoration: 'none', fontSize: 14, fontWeight: 600,
          border: '1px solid #EEEEEE',
        }}>
          Kullanıcıları Yönet →
        </a>
      </div>
    </div>
  );
}
