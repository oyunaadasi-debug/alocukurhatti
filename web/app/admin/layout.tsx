'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const LINKS = [
  { href: '/admin', label: '📊 Dashboard' },
  { href: '/admin/queue', label: '🔍 Moderasyon Kuyruğu' },
  { href: '/admin/users', label: '👥 Kullanıcılar' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const t = localStorage.getItem('admin_token');
    if (!t && pathname !== '/admin/login') {
      router.push('/admin/login');
    } else {
      setToken(t);
    }
  }, [pathname]);

  if (pathname === '/admin/login') return <>{children}</>;
  if (!token) return null;

  function logout() {
    localStorage.removeItem('admin_token');
    router.push('/admin/login');
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, background: '#212121', color: '#fff',
        display: 'flex', flexDirection: 'column', padding: '24px 0',
        position: 'fixed', top: 0, left: 0, height: '100vh',
      }}>
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid #333' }}>
          <div style={{ fontSize: 22 }}>🕳️</div>
          <div style={{ fontSize: 14, fontWeight: 700, marginTop: 4 }}>Alo Çukur Hattı</div>
          <div style={{ fontSize: 11, color: '#9E9E9E' }}>Admin Paneli</div>
        </div>

        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {LINKS.map(l => (
            <a key={l.href} href={l.href} style={{
              display: 'block', padding: '10px 12px', borderRadius: 8, fontSize: 14, fontWeight: 500,
              textDecoration: 'none', color: pathname === l.href ? '#fff' : '#9E9E9E',
              background: pathname === l.href ? '#E53935' : 'transparent',
            }}>
              {l.label}
            </a>
          ))}
        </nav>

        <div style={{ padding: '16px 20px', borderTop: '1px solid #333' }}>
          <button onClick={logout} style={{
            background: 'transparent', border: '1px solid #555', color: '#9E9E9E',
            borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontSize: 13, width: '100%',
          }}>
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Ana içerik */}
      <main style={{ marginLeft: 220, flex: 1, background: '#F5F5F5', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  );
}
