'use client';
import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

export default function KayitPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            name: form.name,
            role: 'citizen',
          }
        }
      });
      if (error) throw error;
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F5F5', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 40, width: '100%', maxWidth: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
          <div style={{ width: 10, height: 10, borderRadius: 9999, background: '#E53935' }} />
          <span style={{ fontWeight: 700, fontSize: 15, color: '#212121' }}>Alo Çukur Hattı</span>
        </div>

        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6, letterSpacing: '-0.02em' }}>Kayıt Ol</h1>
        <p style={{ fontSize: 14, color: '#616161', marginBottom: 28 }}>
          Zaten hesabın var mı?{' '}
          <Link href="/giris" style={{ color: '#E53935', fontWeight: 600, textDecoration: 'none' }}>Giriş yap</Link>
        </p>

        {error && (
          <div style={{ background: '#FFF0F0', border: '1px solid #FFCDD2', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#B71C1C', marginBottom: 20 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#212121', display: 'block', marginBottom: 6 }}>Ad Soyad</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
              placeholder="Adın Soyadın"
              style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #EEEEEE', background: '#F5F5F5', fontSize: 15, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#212121', display: 'block', marginBottom: 6 }}>E-posta</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
              placeholder="ornek@mail.com"
              style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #EEEEEE', background: '#F5F5F5', fontSize: 15, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#212121', display: 'block', marginBottom: 6 }}>Şifre</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
              placeholder="En az 6 karakter"
              minLength={6}
              style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #EEEEEE', background: '#F5F5F5', fontSize: 15, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{ background: loading ? '#BDBDBD' : '#E53935', color: '#fff', border: 'none', borderRadius: 9999, padding: '14px', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4 }}
          >
            {loading ? 'Kayıt oluşturuluyor…' : 'Kayıt Ol'}
          </button>
        </form>

        <p style={{ fontSize: 12, color: '#9E9E9E', textAlign: 'center', marginTop: 20 }}>
          Kayıt olarak{' '}
          <Link href="/investor" style={{ color: '#9E9E9E' }}>kullanım koşullarını</Link>
          {' '}kabul etmiş olursunuz.
        </p>
      </div>
    </div>
  );
}
