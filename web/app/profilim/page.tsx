'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { supabase } from '@/lib/supabase';

type Report = {
  id: number;
  lat: number;
  lng: number;
  address: string | null;
  city: string | null;
  district: string | null;
  photo_url: string;
  description: string | null;
  status: string;
  me_too_count: number;
  created_at: string;
};

type User = { id: string; email: string; name: string | null; role: string };

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  open:       { label: 'Açık',        color: '#E53935', bg: '#FFF0F0' },
  forwarded:  { label: 'İletildi',    color: '#F57C00', bg: '#FFF3E0' },
  reviewing:  { label: 'İnceleniyor', color: '#1565C0', bg: '#E3F2FD' },
  resolved:   { label: 'Çözüldü',    color: '#2E7D32', bg: '#E8F5E9' },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_LABEL[status] ?? { label: status, color: '#616161', bg: '#F5F5F5' };
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, borderRadius: 9999,
      padding: '2px 10px', color: s.color, background: s.bg,
    }}>
      {s.label}
    </span>
  );
}

export default function ProfilimPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) {
        router.replace('/giris');
        return;
      }

      const userProfile: User = {
        id: session.user.id,
        email: session.user.email!,
        name: session.user.user_metadata?.name || null,
        role: session.user.user_metadata?.role || 'citizen',
      };
      setUser(userProfile);

      try {
        const { data, error } = await supabase
          .from('reports')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('moderation_status', 'approved')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setReports(data || []);
      } catch (err) {
        setError('Şikayetler yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    });
  }, [router]);

  return (
    <>
      <Header />
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px' }}>
        {user && (
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 4 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 9999, background: '#E53935',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 20,
              }}>
                {(user.name || user.email)[0].toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 20, color: '#212121' }}>
                  {user.name || user.email.split('@')[0]}
                </div>
                <div style={{ fontSize: 13, color: '#9E9E9E' }}>{user.email}</div>
              </div>
            </div>
          </div>
        )}

        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4, letterSpacing: '-0.02em' }}>
          Şikayetlerim
        </h2>
        <p style={{ fontSize: 14, color: '#616161', marginBottom: 20 }}>
          Gönderdiğiniz tüm yol hasarı raporları.
        </p>

        {loading && (
          <div style={{ textAlign: 'center', padding: 60, color: '#9E9E9E' }}>Yükleniyor…</div>
        )}
        {error && (
          <div style={{ textAlign: 'center', padding: 40, color: '#E53935' }}>{error}</div>
        )}

        {!loading && !error && reports.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '60px 20px',
            background: '#FAFAFA', borderRadius: 16, border: '1px dashed #EEEEEE',
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#424242', marginBottom: 6 }}>
              Henüz şikayet göndermediniz
            </div>
            <div style={{ fontSize: 13, color: '#9E9E9E' }}>
              Haritadan çukur bildirerek katkıda bulunabilirsiniz.
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {reports.map(r => (
            <div key={r.id} style={{
              background: '#fff', borderRadius: 16, border: '1px solid #EEEEEE',
              overflow: 'hidden', display: 'flex', gap: 0,
            }}>
              <img
                src={r.photo_url}
                alt="Rapor fotoğrafı"
                style={{ width: 120, height: 120, objectFit: 'cover', flexShrink: 0 }}
              />
              <div style={{ padding: '14px 16px', flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <StatusBadge status={r.status} />
                  <span style={{ fontSize: 11, color: '#9E9E9E' }}>
                    #{r.id} · {new Date(r.created_at).toLocaleDateString('tr-TR')}
                  </span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#212121', marginBottom: 2 }}>
                  {r.district && r.city ? `${r.district}, ${r.city}` : r.city || r.address || 'Konum bilinmiyor'}
                </div>
                {r.description && (
                  <div style={{ fontSize: 13, color: '#616161', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.description}
                  </div>
                )}
                <div style={{ fontSize: 12, color: '#9E9E9E' }}>
                  👍 {r.me_too_count} kişi aynı sorunu yaşadı
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
