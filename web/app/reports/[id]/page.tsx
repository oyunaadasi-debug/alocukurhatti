import { notFound } from 'next/navigation';
import Image from 'next/image';

const API = process.env.NEXT_PUBLIC_API_URL;

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

export async function generateMetadata({ params }: { params: { id: string } }) {
  const res = await fetch(`${API}/api/reports/${params.id}`, { next: { revalidate: 60 } });
  if (!res.ok) return { title: 'Rapor Bulunamadı' };
  const report = await res.json();
  return {
    title: `Çukur Raporu — ${report.address || report.city || 'Türkiye'} | Alo Çukur Hattı`,
    description: report.description || `${report.city || ''} ${report.district || ''} bölgesinde yol hasarı raporu.`,
  };
}

export default async function ReportPage({ params }: { params: { id: string } }) {
  const res = await fetch(`${API}/api/reports/${params.id}`, { next: { revalidate: 60 } });
  if (!res.ok) notFound();
  const report = await res.json();

  const statusColor = STATUS_COLOR[report.status] || '#9E9E9E';
  const statusLabel = STATUS_LABEL[report.status] || report.status;
  const date = new Date(report.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: '24px 16px' }}>
      <a href="/" style={{ color: '#E53935', fontSize: 14, textDecoration: 'none', display: 'inline-block', marginBottom: 16 }}>← Haritaya dön</a>

      <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', background: '#fff' }}>
        <div style={{ position: 'relative', width: '100%', height: 280, background: '#eee' }}>
          <Image src={report.photo_url} alt="Çukur fotoğrafı" fill style={{ objectFit: 'cover' }} />
          <span style={{ position: 'absolute', top: 12, left: 12, background: statusColor, color: '#fff', borderRadius: 999, padding: '4px 12px', fontSize: 13, fontWeight: 600 }}>
            {statusLabel}
          </span>
        </div>

        <div style={{ padding: 24 }}>
          <p style={{ fontSize: 12, color: '#9E9E9E', marginBottom: 8 }}>{date}</p>
          {report.address && <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{report.address}</p>}
          {(report.city || report.district) && (
            <p style={{ fontSize: 14, color: '#616161', marginBottom: 16 }}>{[report.district, report.city].filter(Boolean).join(', ')}</p>
          )}
          {report.description && <p style={{ fontSize: 15, lineHeight: 1.6, color: '#424242', marginBottom: 20 }}>{report.description}</p>}

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ background: '#1565C0', color: '#fff', borderRadius: 999, padding: '8px 20px', fontSize: 14, fontWeight: 600 }}>
              👁 {report.me_too_count} kişi de gördü
            </span>
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
        </div>
      </div>
    </main>
  );
}
