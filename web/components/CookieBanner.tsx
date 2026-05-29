'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('kvkk_consent')) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem('kvkk_consent', '1');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
      background: '#212121', color: '#fff',
      padding: '14px 24px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 16, flexWrap: 'wrap',
      boxShadow: '0 -4px 20px rgba(0,0,0,0.25)',
    }}>
      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, flex: 1, minWidth: 240 }}>
        Bu platform oturum yönetimi için zorunlu teknik depolama kullanmaktadır.
        Şikayet bildirirken konum verileriniz KVKK kapsamında işlenir.{' '}
        <Link href="/kvkk" style={{ color: '#EF9A9A', textDecoration: 'underline' }}>
          Aydınlatma Metnini okuyun
        </Link>
        .
      </p>
      <button
        onClick={accept}
        style={{
          background: '#E53935', color: '#fff', border: 'none',
          borderRadius: 8, padding: '9px 20px',
          fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        Anladım, Kabul Et
      </button>
    </div>
  );
}
