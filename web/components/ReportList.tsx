'use client';
import { useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then(r => r.json());
const API = process.env.NEXT_PUBLIC_API_URL;

const STATUS_COLOR: Record<string, string> = {
  open: '#E53935', forwarded: '#F57F17', reviewing: '#1565C0', resolved: '#2E7D32',
};
const STATUS_LABEL: Record<string, string> = {
  open: 'Açık', forwarded: 'Belediyeye İletildi', reviewing: 'İnceleniyor', resolved: 'Çözüldü ✓',
};

export default function ReportList() {
  const [status, setStatus] = useState('open');
  const { data, isLoading } = useSWR(`${API}/api/reports?status=${status}&limit=50`, fetcher, { refreshInterval: 60000 });
  const reports = data?.reports || [];

  return (
    <div>
      {/* Filtre */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {Object.entries(STATUS_LABEL).map(([key, label]) => (
          <button key={key} onClick={() => setStatus(key)} style={{
            border: 'none', cursor: 'pointer', borderRadius: 9999,
            padding: '7px 16px', fontSize: 13, fontWeight: 600,
            background: status === key ? STATUS_COLOR[key] : '#F5F5F5',
            color: status === key ? '#fff' : '#616161',
          }}>
            {label}
          </button>
        ))}
      </div>

      {isLoading && <div style={{ textAlign: 'center', padding: 40, color: '#9E9E9E', fontSize: 14 }}>Yükleniyor…</div>}

      {!isLoading && reports.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: '#9E9E9E', fontSize: 14 }}>Bu kategoride rapor yok.</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {reports.map((r: any) => (
          <Link key={r.id} href={`/reports/${r.id}`} style={{ textDecoration: 'none' }}>
            <div style={{ background: '#fff', borderRadius: 14, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', display: 'flex', gap: 14, alignItems: 'flex-start', cursor: 'pointer' }}>
              {r.photo_url && (
                <img src={r.photo_url} alt="" style={{ width: 80, height: 80, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ background: STATUS_COLOR[r.status] || '#E53935', color: '#fff', borderRadius: 9999, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>
                    {STATUS_LABEL[r.status] || r.status}
                  </span>
                  <span style={{ fontSize: 12, color: '#9E9E9E' }}>👁 {r.me_too_count}</span>
                </div>
                <p style={{ fontWeight: 600, fontSize: 15, color: '#212121', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {r.address || `${r.city || ''} ${r.district || ''}`}
                </p>
                {r.description && (
                  <p style={{ fontSize: 13, color: '#616161', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.description}</p>
                )}
                <p style={{ fontSize: 12, color: '#9E9E9E', marginTop: 6 }}>
                  {r.created_at ? new Date(r.created_at).toLocaleDateString('tr-TR') : ''}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
