'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

const NAV = [
  { href: '/', label: 'Harita' },
  { href: '/raporlar', label: 'Raporlar' },
  { href: '/siralama', label: 'Sıralama' },
  { href: '/investor', label: 'Yatırımcılar' },
];

type User = { id: string; email: string; name: string | null; role: string };

export default function Header() {
  const path = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [dropOpen, setDropOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name || null,
          role: session.user.user_metadata?.role || 'citizen',
        });
      } else {
        setUser(null);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name || null,
          role: session.user.user_metadata?.role || 'citizen',
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [path]);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    setDropOpen(false);
    router.push('/');
  }

  const initial = user ? (user.name || user.email)[0].toUpperCase() : '';

  return (
    <header style={{
      height: 60, background: '#fff', borderBottom: '1px solid #EEEEEE',
      display: 'flex', alignItems: 'center', padding: '0 20px',
      position: 'sticky', top: 0, zIndex: 900,
    }}>
      {/* Logo */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginRight: 32 }}>
        <div style={{ width: 10, height: 10, borderRadius: 9999, background: '#E53935' }} />
        <span style={{ fontWeight: 700, fontSize: 15, color: '#212121', whiteSpace: 'nowrap' }}>Alo Çukur Hattı</span>
      </Link>

      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1 }}>
        {NAV.map(n => {
          const active = path === n.href;
          return (
            <Link key={n.href} href={n.href} style={{
              textDecoration: 'none', fontSize: 14,
              fontWeight: active ? 700 : 500,
              color: active ? '#E53935' : '#616161',
              padding: '6px 14px', borderRadius: 9999,
              background: active ? '#FFF0F0' : 'transparent',
            }}>
              {n.label}
            </Link>
          );
        })}
      </nav>

      {/* Sağ taraf */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
        {user ? (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setDropOpen(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 9999,
              }}
            >
              <div style={{
                width: 34, height: 34, borderRadius: 9999, background: '#E53935',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 14,
              }}>
                {initial}
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#212121' }}>
                {user.name || user.email.split('@')[0]}
              </span>
              <span style={{ fontSize: 10, color: '#9E9E9E' }}>▼</span>
            </button>

            {dropOpen && (
              <div style={{
                position: 'absolute', top: '110%', right: 0, background: '#fff',
                borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                border: '1px solid #EEEEEE', minWidth: 200, overflow: 'hidden', zIndex: 1000,
              }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid #EEEEEE' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#212121' }}>{user.name || 'Kullanıcı'}</div>
                  <div style={{ fontSize: 12, color: '#9E9E9E', marginTop: 2 }}>{user.email}</div>
                  <div style={{
                    display: 'inline-block', marginTop: 6,
                    background: '#FFF0F0', color: '#E53935', fontSize: 11, fontWeight: 700,
                    borderRadius: 9999, padding: '2px 10px',
                  }}>
                    {user.role === 'citizen' ? '👤 Vatandaş' : user.role === 'municipality' ? '🏛 Belediye' : '⚙️ Admin'}
                  </div>
                </div>
                <Link
                  href="/profilim"
                  onClick={() => setDropOpen(false)}
                  style={{ display: 'block', padding: '12px 16px', fontSize: 14, color: '#212121', textDecoration: 'none', borderBottom: '1px solid #EEEEEE' }}
                >
                  📋 Şikayetlerim
                </Link>
                <Link
                  href="/raporlar"
                  onClick={() => setDropOpen(false)}
                  style={{ display: 'block', padding: '12px 16px', fontSize: 14, color: '#212121', textDecoration: 'none', borderBottom: '1px solid #EEEEEE' }}
                >
                  🗺️ Haritayı Gör
                </Link>
                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    onClick={() => setDropOpen(false)}
                    style={{ display: 'block', padding: '12px 16px', fontSize: 14, color: '#1565C0', textDecoration: 'none', borderBottom: '1px solid #EEEEEE' }}
                  >
                    ⚙️ Admin Paneli
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'block', width: '100%', padding: '12px 16px',
                    fontSize: 14, color: '#E53935', background: 'none', border: 'none',
                    textAlign: 'left', cursor: 'pointer', fontWeight: 600,
                  }}
                >
                  Çıkış Yap
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link href="/giris" style={{ textDecoration: 'none', fontSize: 13, fontWeight: 600, color: '#616161', padding: '6px 14px' }}>
              Giriş Yap
            </Link>
            <Link href="/kayit" style={{
              textDecoration: 'none', fontSize: 13, fontWeight: 700,
              color: '#fff', background: '#E53935', borderRadius: 9999, padding: '8px 20px',
            }}>
              Kayıt Ol
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
