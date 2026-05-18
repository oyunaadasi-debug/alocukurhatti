'use client';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());
const API = process.env.NEXT_PUBLIC_API_URL;

const STATUS_COLOR: Record<string, string> = {
  open: '#E53935',
  forwarded: '#F57F17',
  reviewing: '#1565C0',
  resolved: '#2E7D32',
};

const STATUS_LABEL: Record<string, string> = {
  open: 'Açık',
  forwarded: 'Belediyeye İletildi',
  reviewing: 'İnceleniyor',
  resolved: 'Çözüldü ✓',
};

export default function MapView() {
  const [filter, setFilter] = useState('open');
  const { data, isLoading } = useSWR(
    `${API}/api/reports?status=${filter}`,
    fetcher,
    { refreshInterval: 60000 }
  );

  const reports = data?.reports || [];

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      {/* Filtre çubuğu */}
      <div style={{
        position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
        zIndex: 1000, display: 'flex', gap: 8, background: '#fff',
        borderRadius: 999, padding: '6px 10px', boxShadow: '0 2px 8px rgba(0,0,0,0.16)',
      }}>
        {Object.entries(STATUS_LABEL).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            style={{
              border: 'none', cursor: 'pointer', borderRadius: 999,
              padding: '6px 14px', fontSize: 13, fontWeight: 600,
              background: filter === key ? STATUS_COLOR[key] : '#F5F5F5',
              color: filter === key ? '#fff' : '#616161',
              transition: 'all 0.15s',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div style={{ position: 'absolute', top: 60, left: '50%', transform: 'translateX(-50%)', zIndex: 1000, background: '#fff', borderRadius: 999, padding: '6px 16px', fontSize: 13, color: '#9E9E9E' }}>
          Yükleniyor…
        </div>
      )}

      <MapContainer center={[39.0, 35.0]} zoom={6} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {reports.map((r: any) => (
          <CircleMarker
            key={r.id}
            center={[r.lat, r.lng]}
            radius={8}
            pathOptions={{ fillColor: STATUS_COLOR[r.status] || '#E53935', color: '#fff', weight: 2, fillOpacity: 0.9 }}
          >
            <Popup>
              <div style={{ minWidth: 200 }}>
                {r.photo_url && (
                  <img src={r.photo_url} alt="Çukur" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />
                )}
                <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{r.address || `${r.city || ''} ${r.district || ''}`}</p>
                {r.description && <p style={{ fontSize: 13, color: '#616161', marginBottom: 8 }}>{r.description}</p>}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ background: STATUS_COLOR[r.status] || '#E53935', color: '#fff', borderRadius: 999, padding: '2px 10px', fontSize: 12, fontWeight: 600 }}>
                    {STATUS_LABEL[r.status] || r.status}
                  </span>
                  <span style={{ fontSize: 12, color: '#9E9E9E' }}>👁 {r.me_too_count}</span>
                </div>
                <a
                  href={`/reports/${r.id}`}
                  style={{ display: 'block', marginTop: 8, textAlign: 'center', background: '#E53935', color: '#fff', borderRadius: 999, padding: '6px 0', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
                >
                  Detay →
                </a>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
