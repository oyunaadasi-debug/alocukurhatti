'use client';
import { useState, useRef } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL;

const UPDATE_TYPES = [
  {
    key: 'complaint_joined',
    emoji: '🙋',
    label: 'Ben de Şikayetçiyim',
    subLabel: 'Sen de bu sorunu yaşıyor musun?',
    color: '#F57F17',
    bg: '#FFF8E1',
    photoRequired: false,
    photoLabel: 'Fotoğraf (isteğe bağlı)',
  },
  {
    key: 'still_unresolved',
    emoji: '⏳',
    label: 'Hala Devam Ediyor',
    subLabel: 'Sorun hala çözülmediyse bildir.',
    color: '#C62828',
    bg: '#FFEBEE',
    photoRequired: false,
    photoLabel: 'Güncel fotoğraf (isteğe bağlı)',
  },
  {
    key: 'resolution_proof',
    emoji: '✅',
    label: 'Çözüldü — Kanıtı Bu',
    subLabel: 'Sorun çözüldüyse fotoğraflı kanıt ekle.',
    color: '#2E7D32',
    bg: '#F1F8E9',
    photoRequired: true,
    photoLabel: 'Fotoğraf (zorunlu)',
  },
];

export default function ReportActions({ reportId }: { reportId: number }) {
  const [activeType, setActiveType] = useState<string | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [name, setName] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const cfg = UPDATE_TYPES.find(t => t.key === activeType);

  function resetForm() { setPhoto(null); setPreview(null); setNote(''); setError(''); }

  function selectType(key: string) {
    if (activeType === key) { setActiveType(null); resetForm(); return; }
    setActiveType(key); resetForm();
  }

  function pickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhoto(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleSubmit() {
    if (!activeType || !cfg) return;
    if (cfg.photoRequired && !photo) { setError('Bu güncelleme için fotoğraf zorunludur.'); return; }
    setSending(true); setError('');
    try {
      const fd = new FormData();
      fd.append('update_type', activeType);
      if (photo) fd.append('photo', photo);
      if (note.trim()) fd.append('note', note.trim());
      if (name.trim()) fd.append('reporter_name', name.trim());

      const res = await fetch(`${API}/api/reports/${reportId}/updates`, { method: 'POST', body: fd });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'Gönderim başarısız.');
      }
      setDone(true);
      setActiveType(null);
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu.');
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div style={{ marginTop: 28, background: '#F1F8E9', color: '#2E7D32', borderRadius: 12, padding: '16px 20px', fontSize: 14, fontWeight: 700, textAlign: 'center' }}>
        ✅ Güncellemeniz alındı! Teşekkürler.
      </div>
    );
  }

  return (
    <div style={{ marginTop: 28 }}>
      <p style={{ fontSize: 14, fontWeight: 700, color: '#212121', marginBottom: 12 }}>
        Bu raporla ilgili güncelleme ekle:
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {UPDATE_TYPES.map(t => (
          <div key={t.key}>
            <button
              onClick={() => selectType(t.key)}
              style={{
                width: '100%', textAlign: 'left',
                border: `1.5px solid ${activeType === t.key ? t.color : '#EEEEEE'}`,
                borderRadius: activeType === t.key ? '12px 12px 0 0' : 12,
                padding: '10px 14px', cursor: 'pointer',
                background: activeType === t.key ? t.bg : '#FAFAFA',
                display: 'flex', alignItems: 'center', gap: 10,
              }}
            >
              <span style={{ fontSize: 20 }}>{t.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: activeType === t.key ? t.color : '#212121' }}>{t.label}</div>
                <div style={{ fontSize: 11, color: '#9E9E9E', marginTop: 1 }}>{t.subLabel}</div>
              </div>
              <span style={{ fontSize: 12, color: '#9E9E9E' }}>{activeType === t.key ? '▲' : '▼'}</span>
            </button>

            {activeType === t.key && cfg && (
              <div style={{
                border: `1.5px solid ${t.color}`, borderTop: 'none',
                borderRadius: '0 0 12px 12px', padding: 16, background: '#fff',
                display: 'flex', flexDirection: 'column', gap: 12,
              }}>
                {/* Fotoğraf */}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#212121', marginBottom: 6 }}>
                    {cfg.photoLabel} {cfg.photoRequired && <span style={{ color: '#E53935' }}>*</span>}
                  </div>
                  <div
                    onClick={() => fileRef.current?.click()}
                    style={{
                      border: `2px dashed ${preview ? t.color : '#DDDDDD'}`,
                      borderRadius: 10, height: 110, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      overflow: 'hidden', background: '#FAFAFA',
                    }}
                  >
                    {preview ? (
                      <img src={preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ textAlign: 'center', color: '#9E9E9E' }}>
                        <div style={{ fontSize: 24, marginBottom: 4 }}>📷</div>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>Fotoğraf seç</div>
                      </div>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" onChange={pickPhoto} style={{ display: 'none' }} />
                  {preview && (
                    <button onClick={() => { setPhoto(null); setPreview(null); }}
                      style={{ marginTop: 4, fontSize: 11, color: '#9E9E9E', background: 'none', border: 'none', cursor: 'pointer' }}>
                      Fotoğrafı değiştir
                    </button>
                  )}
                </div>

                {/* Açıklama */}
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Kısa bir not (isteğe bağlı)..."
                  maxLength={300}
                  rows={2}
                  style={{
                    width: '100%', border: '1.5px solid #EEEEEE', borderRadius: 8,
                    padding: '8px 10px', fontSize: 13, resize: 'none',
                    outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
                  }}
                />

                {/* İsim */}
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="İsminiz (isteğe bağlı)"
                  maxLength={100}
                  style={{
                    width: '100%', border: '1.5px solid #EEEEEE', borderRadius: 8,
                    padding: '8px 10px', fontSize: 13, outline: 'none',
                    fontFamily: 'inherit', boxSizing: 'border-box',
                  }}
                />

                {error && (
                  <div style={{ background: '#FFF0F0', color: '#E53935', borderRadius: 8, padding: '8px 12px', fontSize: 12, fontWeight: 600 }}>
                    {error}
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={sending}
                  style={{
                    background: sending ? '#ccc' : t.color, color: '#fff', border: 'none',
                    borderRadius: 10, padding: '11px 0', fontSize: 14, fontWeight: 700,
                    cursor: sending ? 'not-allowed' : 'pointer', width: '100%',
                  }}
                >
                  {sending ? 'Gönderiliyor…' : 'Gönder'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
