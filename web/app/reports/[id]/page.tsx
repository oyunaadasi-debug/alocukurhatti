import { notFound } from 'next/navigation';
import Image from 'next/image';
import ReportActions from '@/components/ReportActions';

const API = process.env.NEXT_PUBLIC_API_URL;

const ISSUE_TYPE_MAP: Record<string, { emoji: string; label: string }> = {
  cukur:         { emoji: '🕳️', label: 'Çukur' },
  bozuk_yol:     { emoji: '🛣️', label: 'Bozuk Yol' },
  kaldirim:      { emoji: '🚶', label: 'Kaldırım Hasarı' },
  tumsek:        { emoji: '⛰️', label: 'Tümsek' },
  su_birikintisi:{ emoji: '💧', label: 'Su Birikintisi' },
};

const UPDATE_TYPE_MAP: Record<string, { emoji: string; label: string; color: string; bg: string }> = {
  complaint_joined: { emoji: '🙋', label: 'Ben de Şikayetçiyim', color: '#F57F17', bg: '#FFF8E1' },
  still_unresolved: { emoji: '⏳', label: 'Hala Devam Ediyor',   color: '#C62828', bg: '#FFEBEE' },
  resolution_proof: { emoji: '✅', label: 'Çözüldü — Vatandaş Kanıtı', color: '#2E7D32', bg: '#F1F8E9' },
};

const STATUS_LABEL: Record<string, string> = {
  open: 'Açık',
  forwarded: 'Belediyeye İletildi',
  reviewing: 'İnceleniyor',
  resolved: 'Çözüldü ✓',
  rejected: 'Reddedildi',
};

const STATUS_COLOR: Record<string, string> = {
  open: '#E53935',
  forwarded: '#F57F17',
  reviewing: '#1565C0',
  resolved: '#2E7D32',
  rejected: '#9E9E9E',
};

const SEVERITY_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  small: { label: 'Küçük', color: '#5C574D', bg: '#E8E2D6' },
  medium: { label: 'Orta', color: '#178A70', bg: '#CDEDE3' },
  dangerous: { label: 'Tehlikeli', color: '#C9524B', bg: '#F8D8CC' },
};

export async function generateMetadata({ params }: { params: { id: string } }) {
  const res = await fetch(`${API}/api/reports/${params.id}`, { next: { revalidate: 60 } });
  if (!res.ok) return { title: 'Rapor Bulunamadı' };
  const report = await res.json();
  const iInfo = ISSUE_TYPE_MAP[report.issue_type] || ISSUE_TYPE_MAP.cukur;
  const sev = SEVERITY_STYLE[report.severity] || SEVERITY_STYLE.medium;
  const place = [report.address, report.district, report.city].filter(Boolean).join(', ') || 'Türkiye';
  const pageUrl = `${SITE_URL}/reports/${params.id}`;
  const description = `${place} için ${sev.label.toLowerCase()} ${iInfo.label.toLowerCase()} bildirimi. ${report.me_too_count || 0} kişi de gördü.`;
  return {
    title: `${iInfo.emoji} ${iInfo.label} Raporu — ${place} | Alo Çukur Hattı`,
    description: report.description || description,
    openGraph: {
      title: `${iInfo.emoji} ${sev.label} ${iInfo.label} Bildirimi`,
      description,
      url: pageUrl,
      images: report.photo_url ? [{ url: report.photo_url }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${iInfo.emoji} ${sev.label} ${iInfo.label} Bildirimi`,
      description,
      images: report.photo_url ? [report.photo_url] : undefined,
    },
  };
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://web-ten-kappa-37.vercel.app';

export default async function ReportPage({ params }: { params: { id: string } }) {
  const res = await fetch(`${API}/api/reports/${params.id}`, { next: { revalidate: 60 } });
  if (!res.ok) notFound();
  const report = await res.json();

  const statusColor = STATUS_COLOR[report.status] || '#9E9E9E';
  const statusLabel = STATUS_LABEL[report.status] || report.status;
  const issueInfo = ISSUE_TYPE_MAP[report.issue_type] || ISSUE_TYPE_MAP.cukur;
  const severityInfo = SEVERITY_STYLE[report.severity] || SEVERITY_STYLE.medium;
  const date = new Date(report.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  const pageUrl = `${SITE_URL}/reports/${params.id}`;
  const shareText = `Alo Çukur Hattı: ${report.address || report.city || 'Yol hasarı'} bölgesinde ${issueInfo.label.toLowerCase()} bildirimi. ${pageUrl}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: '24px 16px' }}>
      <a href="/" style={{ color: '#E53935', fontSize: 14, textDecoration: 'none', display: 'inline-block', marginBottom: 16 }}>← Haritaya dön</a>

      <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', background: '#fff' }}>
        <div style={{ position: 'relative', width: '100%', height: 280, background: '#eee' }}>
          <Image src={report.photo_url} alt="Çukur fotoğrafı" fill style={{ objectFit: 'cover' }} />
          <span style={{ position: 'absolute', top: 12, left: 12, background: statusColor, color: '#fff', borderRadius: 999, padding: '4px 12px', fontSize: 13, fontWeight: 600 }}>
            {statusLabel}
          </span>
          <span style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.65)', color: '#fff', borderRadius: 999, padding: '4px 12px', fontSize: 13, fontWeight: 600 }}>
            {issueInfo.emoji} {issueInfo.label}
          </span>
          <span style={{ position: 'absolute', bottom: 12, left: 12, background: severityInfo.bg, color: severityInfo.color, borderRadius: 999, padding: '4px 12px', fontSize: 13, fontWeight: 700 }}>
            {severityInfo.label}
          </span>
        </div>

        <div style={{ padding: 24 }}>
          <p style={{ fontSize: 12, color: '#9E9E9E', marginBottom: 8 }}>{date}</p>
          {report.address && <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{report.address}</p>}
          {(report.city || report.district) && (
            <p style={{ fontSize: 14, color: '#616161', marginBottom: 16 }}>{[report.district, report.city].filter(Boolean).join(', ')}</p>
          )}
          {report.description && <p style={{ fontSize: 15, lineHeight: 1.6, color: '#424242', marginBottom: 20 }}>{report.description}</p>}

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ background: '#1565C0', color: '#fff', borderRadius: 999, padding: '8px 20px', fontSize: 14, fontWeight: 600 }}>
              👍 {report.me_too_count} kişi de gördü
            </span>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ background: '#25D366', color: '#fff', borderRadius: 999, padding: '8px 20px', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}
            >
              WhatsApp'ta Paylaş
            </a>
            <span style={{ fontSize: 13, color: '#9E9E9E' }}>
              {report.reporter_name ? `Bildiren: ${report.reporter_name}` : 'Anonim vatandaş'}
            </span>
          </div>

          {report.resolutions?.length > 0 && (
            <div style={{ marginTop: 24, padding: 16, background: '#F1F8E9', borderRadius: 12 }}>
              <p style={{ fontWeight: 600, color: '#2E7D32', marginBottom: 8 }}>Çözüm Kanıtı</p>
              {report.resolutions.map((r: any) => (
                <div key={r.id}>
                  {r.photo_url && (
                    <div style={{ position: 'relative', width: '100%', height: 200, borderRadius: 8, overflow: 'hidden', marginBottom: 8 }}>
                      <Image src={r.photo_url} alt="Çözüm fotoğrafı" fill style={{ objectFit: 'cover' }} />
                    </div>
                  )}
                  {r.note && <p style={{ fontSize: 14, color: '#424242' }}>{r.note}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Vatandaş güncellemeleri zaman çizelgesi */}
          {report.updates?.length > 0 && (
            <div style={{ marginTop: 28 }}>
              <p style={{ fontWeight: 700, fontSize: 14, color: '#212121', marginBottom: 12 }}>Vatandaş Güncellemeleri</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {report.updates.map((u: any) => {
                  const tc = UPDATE_TYPE_MAP[u.update_type] || { emoji: '📝', label: u.update_type, color: '#9E9E9E', bg: '#F5F5F5' };
                  const uDate = new Date(u.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
                  return (
                    <div key={u.id} style={{ border: `1.5px solid ${tc.color}`, borderRadius: 12, padding: 14, background: tc.bg }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: u.photo_url || u.note ? 10 : 0 }}>
                        <span style={{ fontSize: 18 }}>{tc.emoji}</span>
                        <span style={{ fontWeight: 700, fontSize: 13, color: tc.color }}>{tc.label}</span>
                        <span style={{ marginLeft: 'auto', fontSize: 11, color: '#9E9E9E' }}>{uDate}</span>
                      </div>
                      {u.photo_url && (
                        <div style={{ position: 'relative', width: '100%', height: 160, borderRadius: 8, overflow: 'hidden', marginBottom: 8 }}>
                          <Image src={u.photo_url} alt="Güncelleme fotoğrafı" fill style={{ objectFit: 'cover' }} />
                        </div>
                      )}
                      {u.note && <p style={{ fontSize: 13, color: '#424242', margin: 0 }}>{u.note}</p>}
                      {u.reporter_name && <p style={{ fontSize: 11, color: '#9E9E9E', marginTop: 4, marginBottom: 0 }}>— {u.reporter_name}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <ReportActions reportId={report.id} />
        </div>
      </div>
    </main>
  );
}
