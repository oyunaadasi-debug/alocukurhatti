'use client';
import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());
const API = process.env.NEXT_PUBLIC_API_URL;

const ISSUE_TYPES = [
  { key: 'cukur', emoji: '🕳️', label: 'Çukur' },
  { key: 'bozuk_yol', emoji: '🛣️', label: 'Bozuk Yol' },
  { key: 'kaldirim', emoji: '🚶', label: 'Kaldırım' },
  { key: 'tumsek', emoji: '⛰️', label: 'Tümsek' },
  { key: 'su_birikintisi', emoji: '💧', label: 'Su Birikintisi' },
];

const TURKEY_BOUNDS = L.latLngBounds([35.5, 25.5], [42.5, 45.0]);

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

type NominatimResult = { place_id: string; display_name: string; lat: string; lon: string };

function FlyController({ target }: { target: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo(target, 15, { animate: true, duration: 1.2 });
  }, [target]); // eslint-disable-line
  return null;
}

function MapClickHandler({ onPin }: { onPin: (pos: [number, number]) => void }) {
  useMapEvents({ click(e) { onPin([e.latlng.lat, e.latlng.lng]); } });
  return null;
}

function makePinIcon() {
  return L.divIcon({
    html: `<div style="width:22px;height:32px;position:relative;filter:drop-shadow(0 3px 6px rgba(0,0,0,0.35))"><div style="width:22px;height:22px;background:#E53935;border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);position:absolute;top:0;left:0"></div><div style="width:6px;height:6px;background:#fff;border-radius:50%;position:absolute;top:8px;left:8px"></div></div>`,
    iconSize: [22, 32], iconAnchor: [11, 32], className: '',
  });
}

// ── Şikayet formu paneli ──────────────────────────────────────────────
function ReportPanel({
  pos, address, onClose, onSuccess,
}: {
  pos: [number, number];
  address: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [desc, setDesc] = useState('');
  const [name, setName] = useState('');
  const [kvkkConsent, setKvkkConsent] = useState(false);
  const [issueType, setIssueType] = useState('cukur');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Giriş yapılmışsa ismi doldur
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch(`${API}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.name) setName(d.name); else if (d?.email) setName(d.email.split('@')[0]); })
      .catch(() => {});
  }, []);

  function pickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhoto(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleSubmit() {
    if (!photo) { setError('Fotoğraf zorunludur.'); return; }
    if (!kvkkConsent) { setError('Lütfen aydınlatma metnini okuyup onaylayın.'); return; }
    setSending(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('photo', photo);
      fd.append('lat', String(pos[0]));
      fd.append('lng', String(pos[1]));
      if (desc.trim()) fd.append('description', desc.trim());
      if (name.trim()) fd.append('reporter_name', name.trim());
      fd.append('issue_type', issueType);

      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API}/api/reports`, { method: 'POST', headers, body: fd });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'Gönderim başarısız.');
      }
      setDone(true);
      setTimeout(() => { onSuccess(); }, 2000);
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="report-panel" style={{
      position: 'absolute', top: 0, right: 0, height: '100%', width: 380,
      background: '#fff', boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
      zIndex: 1100, display: 'flex', flexDirection: 'column',
      overflowY: 'auto',
    }}>
      <style>{`
        @media (max-width: 600px) {
          .report-panel {
            top: auto !important;
            right: 0 !important;
            bottom: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 85% !important;
            border-radius: 20px 20px 0 0 !important;
            box-shadow: 0 -4px 32px rgba(0,0,0,0.2) !important;
          }
        }
      `}</style>
      {/* Başlık */}
      <div style={{
        padding: '16px 20px', borderBottom: '1px solid #EEEEEE',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#212121' }}>Şikayet Bildir</div>
          <div style={{ fontSize: 12, color: '#9E9E9E', marginTop: 2 }}>
            📍 {address || `${pos[0].toFixed(4)}, ${pos[1].toFixed(4)}`}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 22, color: '#9E9E9E', lineHeight: 1, padding: 4 }}
        >
          ×
        </button>
      </div>

      {done ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 }}>
          <div style={{ fontSize: 48 }}>✅</div>
          <div style={{ fontWeight: 800, fontSize: 18, color: '#2E7D32', textAlign: 'center' }}>Şikayetiniz alındı!</div>
          <div style={{ fontSize: 13, color: '#616161', textAlign: 'center' }}>Moderasyon sonrası haritada görünecek.</div>
        </div>
      ) : (
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>

          {/* Şikayet Türü */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#212121', marginBottom: 8 }}>
              Şikayet Türü <span style={{ color: '#E53935' }}>*</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {ISSUE_TYPES.map(t => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setIssueType(t.key)}
                  style={{
                    border: `2px solid ${issueType === t.key ? '#E53935' : '#EEEEEE'}`,
                    borderRadius: 10, padding: '8px 4px',
                    background: issueType === t.key ? '#FFF0F0' : '#FAFAFA',
                    cursor: 'pointer', textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 20 }}>{t.emoji}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: issueType === t.key ? '#E53935' : '#616161', marginTop: 2 }}>
                    {t.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Fotoğraf */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#212121', marginBottom: 8 }}>
              Fotoğraf <span style={{ color: '#E53935' }}>*</span>
            </div>
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                border: `2px dashed ${preview ? '#E53935' : '#DDDDDD'}`,
                borderRadius: 12, height: 160, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', background: '#FAFAFA',
              }}
            >
              {preview ? (
                <img src={preview} alt="Önizleme" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ textAlign: 'center', color: '#9E9E9E' }}>
                  <div style={{ fontSize: 32, marginBottom: 6 }}>📷</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Fotoğraf seç</div>
                  <div style={{ fontSize: 11, marginTop: 2 }}>Tıklayın veya sürükleyin</div>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={pickPhoto} style={{ display: 'none' }} />
            {preview && (
              <button
                onClick={() => { setPhoto(null); setPreview(null); }}
                style={{ marginTop: 6, fontSize: 12, color: '#9E9E9E', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Fotoğrafı değiştir
              </button>
            )}
          </div>

          {/* Açıklama */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#212121', marginBottom: 8 }}>Açıklama</div>
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="Çukurun boyutu, tehlike durumu vb."
              maxLength={500}
              rows={3}
              style={{
                width: '100%', border: '1.5px solid #EEEEEE', borderRadius: 10,
                padding: '10px 12px', fontSize: 13, color: '#212121', resize: 'vertical',
                outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
              }}
            />
          </div>

          {/* İsim */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#212121', marginBottom: 8 }}>İsminiz (isteğe bağlı)</div>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Adınız"
              maxLength={100}
              style={{
                width: '100%', border: '1.5px solid #EEEEEE', borderRadius: 10,
                padding: '10px 12px', fontSize: 13, color: '#212121',
                outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
              }}
            />
          </div>

          {/* KVKK onayı */}
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: 12, color: '#616161', lineHeight: 1.5 }}>
            <input
              type="checkbox"
              checked={kvkkConsent}
              onChange={e => setKvkkConsent(e.target.checked)}
              style={{ marginTop: 2, flexShrink: 0, accentColor: '#E53935' }}
            />
            <span>
              Konum ve fotoğraf bilgilerimin{' '}
              <a href="/kvkk" target="_blank" rel="noopener" style={{ color: '#E53935', textDecoration: 'underline' }}>
                KVKK Aydınlatma Metni
              </a>{' '}
              kapsamında işlenmesine onay veriyorum.
            </span>
          </label>

          {error && (
            <div style={{ background: '#FFF0F0', color: '#E53935', borderRadius: 10, padding: '10px 14px', fontSize: 13, fontWeight: 600 }}>
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={sending}
            style={{
              background: sending ? '#EF9A9A' : '#E53935',
              color: '#fff', border: 'none', borderRadius: 12,
              padding: '14px 0', fontSize: 15, fontWeight: 800,
              cursor: sending ? 'not-allowed' : 'pointer', width: '100%',
              marginTop: 'auto',
            }}
          >
            {sending ? 'Gönderiliyor…' : 'Şikayet Gönder'}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Ana bileşen ──────────────────────────────────────────────────────
export default function MapView() {
  const [filter, setFilter] = useState('open');
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);
  const [pinPos, setPinPos] = useState<[number, number] | null>(null);
  const [pinAddress, setPinAddress] = useState('');
  const [pinIcon, setPinIcon] = useState<L.DivIcon | null>(null);
  const [showPanel, setShowPanel] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showLocationConsent, setShowLocationConsent] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, mutate } = useSWR(
    `${API}/api/reports?status=${filter}`,
    fetcher,
    { refreshInterval: 60000 }
  );
  const reports = data?.reports || [];

  useEffect(() => { setPinIcon(makePinIcon()); }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Pin düşünce adres al
  async function placePin(pos: [number, number]) {
    setPinPos(pos);
    setShowPanel(true);
    setPinAddress('');
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${pos[0]}&lon=${pos[1]}&format=json`,
        { headers: { 'Accept-Language': 'tr' } }
      );
      const j = await res.json();
      if (j?.display_name) setPinAddress(j.display_name.split(',').slice(0, 3).join(', '));
    } catch {}
  }

  function handleSearch(val: string) {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim().length < 2) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&format=json&countrycodes=tr&limit=6&addressdetails=0`,
          { headers: { 'Accept-Language': 'tr' } }
        );
        const json: NominatimResult[] = await res.json();
        setSuggestions(json);
        setShowSuggestions(true);
      } catch { setSuggestions([]); }
    }, 350);
  }

  function handleSelect(item: NominatimResult) {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    setFlyTarget([lat, lng]);
    setPinPos([lat, lng]);
    setPinAddress(item.display_name.split(',').slice(0, 3).join(', '));
    setShowPanel(true);
    setQuery(item.display_name.split(',').slice(0, 2).join(','));
    setSuggestions([]);
    setShowSuggestions(false);
  }

  function closePanel() {
    setShowPanel(false);
    setPinPos(null);
    setPinAddress('');
  }

  return (
    <div style={{ position: 'relative', height: '100%' }}>

      <style>{`
        @media (max-width: 600px) {
          .map-search { width: calc(100vw - 24px) !important; left: 12px !important; }
          .map-filters {
            left: 12px !important; right: 12px !important;
            top: 68px !important; transform: none !important;
            overflow-x: auto; justify-content: flex-start !important;
            scrollbar-width: none;
          }
          .map-filters::-webkit-scrollbar { display: none; }
        }
      `}</style>

      {/* Sol arama */}
      <div ref={searchRef} className="map-search" style={{ position: 'absolute', top: 12, left: 12, zIndex: 1000, width: 280 }}>
        <div style={{
          display: 'flex', alignItems: 'center', background: '#fff',
          borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
          padding: '0 12px', gap: 8,
        }}>
          <span style={{ fontSize: 16, color: '#9E9E9E', flexShrink: 0 }}>🔍</span>
          <input
            type="text" value={query}
            onChange={e => handleSearch(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="Mahalle, ilçe, şehir ara…"
            style={{
              border: 'none', outline: 'none', fontSize: 13, fontWeight: 500,
              color: '#212121', flex: 1, padding: '10px 0', background: 'transparent',
            }}
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setSuggestions([]); closePanel(); }}
              style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#9E9E9E', fontSize: 16, padding: 0, lineHeight: 1 }}
            >×</button>
          )}
        </div>
        {showSuggestions && suggestions.length > 0 && (
          <div style={{ marginTop: 4, background: '#fff', borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.16)', overflow: 'hidden' }}>
            {suggestions.map(item => (
              <button key={item.place_id} onClick={() => handleSelect(item)}
                style={{
                  width: '100%', border: 'none', background: 'none', cursor: 'pointer',
                  textAlign: 'left', padding: '9px 14px', fontSize: 12, color: '#212121',
                  borderBottom: '1px solid #F5F5F5', lineHeight: 1.4, display: 'block',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#FFF0F0')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                📍 {item.display_name.split(',').slice(0, 3).join(', ')}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Durum filtresi */}
      <div className="map-filters" style={{
        position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
        zIndex: 1000, display: 'flex', gap: 6, background: '#fff',
        borderRadius: 999, padding: '5px 8px', boxShadow: '0 2px 8px rgba(0,0,0,0.16)',
      }}>
        {Object.entries(STATUS_LABEL).map(([key, label]) => (
          <button key={key} onClick={() => setFilter(key)} style={{
            border: 'none', cursor: 'pointer', borderRadius: 999,
            padding: '5px 12px', fontSize: 12, fontWeight: 600,
            background: filter === key ? STATUS_COLOR[key] : '#F5F5F5',
            color: filter === key ? '#fff' : '#616161',
            transition: 'all 0.15s', whiteSpace: 'nowrap',
          }}>
            {label}
          </button>
        ))}
      </div>

      {/* Konum rızası dialog */}
      {showLocationConsent && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2000,
          background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff', borderRadius: 16, padding: '28px 28px 24px',
            maxWidth: 380, width: '90%', boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
          }}>
            <div style={{ fontSize: 32, textAlign: 'center', marginBottom: 12 }}>📍</div>
            <h3 style={{ fontSize: 17, fontWeight: 800, textAlign: 'center', marginBottom: 8, color: '#212121' }}>
              Konum İzni Gerekiyor
            </h3>
            <p style={{ fontSize: 13, color: '#616161', lineHeight: 1.6, textAlign: 'center', marginBottom: 20 }}>
              Şikayetinizi haritaya işleyebilmek için anlık konumunuz alınacaktır.
              Konum bilgisi yalnızca bu şikayet için kullanılır ve
              {' '}<a href="/kvkk" target="_blank" rel="noopener" style={{ color: '#E53935' }}>KVKK Aydınlatma Metni</a>{' '}
              kapsamında işlenir.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowLocationConsent(false)}
                style={{
                  flex: 1, border: '1.5px solid #EEEEEE', background: '#fff', borderRadius: 10,
                  padding: '11px 0', fontSize: 14, fontWeight: 600, color: '#757575', cursor: 'pointer',
                }}
              >
                Vazgeç
              </button>
              <button
                onClick={() => {
                  setShowLocationConsent(false);
                  if (!navigator.geolocation) {
                    alert('Tarayıcınız konum desteğini desteklemiyor. Lütfen haritaya tıklayın.');
                    return;
                  }
                  navigator.geolocation.getCurrentPosition(
                    (pos) => {
                      placePin([pos.coords.latitude, pos.coords.longitude]);
                      setFlyTarget([pos.coords.latitude, pos.coords.longitude]);
                    },
                    () => { alert('Konum alınamadı. Lütfen haritada şikayetin olduğu yere tıklayın.'); }
                  );
                }}
                style={{
                  flex: 1, background: '#E53935', color: '#fff', border: 'none', borderRadius: 10,
                  padding: '11px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                }}
              >
                Onaylıyorum
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Şikayet Bildir butonu — harita ortasında */}
      {!pinPos && (
        <>
          <style>{`
            @keyframes sibtn-pulse {
              0%, 100% { box-shadow: 0 6px 28px rgba(229,57,53,0.5); }
              50% { box-shadow: 0 8px 48px rgba(229,57,53,0.75), 0 0 0 14px rgba(229,57,53,0.13); }
            }
          `}</style>
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            pointerEvents: 'none',
          }}>
            <button
              onClick={() => setShowLocationConsent(true)}
              style={{
                pointerEvents: 'auto',
                animation: 'sibtn-pulse 2.6s ease-in-out infinite',
                background: '#E53935',
                color: '#fff',
                border: 'none',
                borderRadius: '999px',
                padding: '18px 48px',
                fontSize: '18px',
                fontWeight: 800,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                letterSpacing: '0.3px',
              }}
            >
              📍 Şikayet Bildir
            </button>
          </div>
        </>
      )}

      {isLoading && (
        <div style={{
          position: 'absolute', top: 64, left: '50%', transform: 'translateX(-50%)',
          zIndex: 1000, background: '#fff', borderRadius: 999,
          padding: '6px 16px', fontSize: 13, color: '#9E9E9E',
        }}>
          Yükleniyor…
        </div>
      )}

      <MapContainer
        center={[39.0, 35.0]} zoom={7} minZoom={6} maxZoom={18}
        maxBounds={TURKEY_BOUNDS} maxBoundsViscosity={1.0}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FlyController target={flyTarget} />
        <MapClickHandler onPin={(pos) => { placePin(pos); setFlyTarget(null); }} />

        {pinPos && pinIcon && (
          <Marker position={pinPos} icon={pinIcon} draggable
            eventHandlers={{
              dragend(e) {
                const p = e.target.getLatLng();
                placePin([p.lat, p.lng]);
              },
            }}
          />
        )}

        {reports.map((r: any) => (
          <CircleMarker key={r.id} center={[r.lat, r.lng]} radius={8}
            pathOptions={{ fillColor: STATUS_COLOR[r.status] || '#E53935', color: '#fff', weight: 2, fillOpacity: 0.9 }}
          >
            <Popup>
              <div style={{ minWidth: 200 }}>
                {r.photo_url && (
                  <img src={r.photo_url} alt="Çukur"
                    style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }}
                  />
                )}
                <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
                  {r.address || `${r.city || ''} ${r.district || ''}`}
                </p>
                {r.description && <p style={{ fontSize: 13, color: '#616161', marginBottom: 8 }}>{r.description}</p>}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ background: STATUS_COLOR[r.status] || '#E53935', color: '#fff', borderRadius: 999, padding: '2px 10px', fontSize: 12, fontWeight: 600 }}>
                    {STATUS_LABEL[r.status] || r.status}
                  </span>
                  <button
                    onClick={async () => {
                      try {
                        const res2 = await fetch(`${API}/api/reports/${r.id}/metoo`, { method: 'POST' });
                        if (res2.ok) mutate();
                      } catch {}
                    }}
                    style={{ background: '#FFF0F0', border: 'none', borderRadius: 999, padding: '3px 10px', fontSize: 12, fontWeight: 600, color: '#E53935', cursor: 'pointer' }}
                  >
                    👍 Ben de gördüm ({r.me_too_count})
                  </button>
                </div>
                <a href={`/reports/${r.id}`} style={{
                  display: 'block', marginTop: 8, textAlign: 'center',
                  background: '#E53935', color: '#fff', borderRadius: 999,
                  padding: '6px 0', fontSize: 13, fontWeight: 600, textDecoration: 'none',
                }}>
                  Detay →
                </a>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Şikayet paneli */}
      {showPanel && pinPos && (
        <ReportPanel
          pos={pinPos}
          address={pinAddress}
          onClose={closePanel}
          onSuccess={() => { closePanel(); mutate(); }}
        />
      )}
    </div>
  );
}
