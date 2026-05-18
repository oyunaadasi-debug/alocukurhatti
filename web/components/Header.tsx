'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/', label: 'Harita' },
  { href: '/raporlar', label: 'Raporlar' },
  { href: '/siralama', label: 'Sıralama' },
  { href: '/investor', label: 'Yatırımcılar' },
];

export default function Header() {
  const path = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header style={{
      height: 60,
      background: '#fff',
      borderBottom: '1px solid #EEEEEE',
      display: 'flex',
      alignItems: 'center',
      padding: '0 20px',
      gap: 0,
      position: 'sticky',
      top: 0,
      zIndex: 900,
    }}>
      {/* Logo */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginRight: 32 }}>
        <div style={{ width: 10, height: 10, borderRadius: 9999, background: '#E53935' }} />
        <span style={{ fontWeight: 700, fontSize: 15, color: '#212121', whiteSpace: 'nowrap' }}>Alo Çukur Hattı</span>
      </Link>

      {/* Desktop Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1 }}>
        {NAV.map(n => {
          const active = path === n.href;
          return (
            <Link
              key={n.href}
              href={n.href}
              style={{
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: active ? 700 : 500,
                color: active ? '#E53935' : '#616161',
                padding: '6px 14px',
                borderRadius: 9999,
                background: active ? '#FFF0F0' : 'transparent',
                transition: 'all 0.15s',
              }}
            >
              {n.label}
            </Link>
          );
        })}
      </nav>

      {/* Sağ taraf */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
        <Link
          href="/giris"
          style={{
            textDecoration: 'none',
            fontSize: 13,
            fontWeight: 600,
            color: '#616161',
            padding: '6px 14px',
          }}
        >
          Giriş Yap
        </Link>
        <Link
          href="/kayit"
          style={{
            textDecoration: 'none',
            fontSize: 13,
            fontWeight: 700,
            color: '#fff',
            background: '#E53935',
            borderRadius: 9999,
            padding: '8px 20px',
            whiteSpace: 'nowrap',
          }}
        >
          Kayıt Ol
        </Link>
      </div>
    </header>
  );
}
