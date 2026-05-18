'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Giriş başarısız');
      if (data.user.role !== 'admin') throw new Error('Admin yetkisi gereklidir.');
      localStorage.setItem('admin_token', data.token);
      router.push('/admin');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'grid', placeItems: 'center',
      background: '#212121', fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: 40,
        width: 380, boxShadow: '0 8px 32px rgba(0,0,0,0.32)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🕳️</div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#212121', margin: 0 }}>Admin Girişi</h1>
          <p style={{ fontSize: 13, color: '#9E9E9E', margin: '4px 0 0' }}>Alo Çukur Hattı Yönetim Paneli</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#616161' }}>E-posta</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              style={{ padding: '12px 14px', borderRadius: 10, border: '1px solid #EEEEEE', fontSize: 15, outline: 'none' }}
              placeholder="admin@mail.com"
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#616161' }}>Şifre</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)} required
              style={{ padding: '12px 14px', borderRadius: 10, border: '1px solid #EEEEEE', fontSize: 15, outline: 'none' }}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div style={{ background: '#FFCDD2', color: '#B71C1C', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            background: '#E53935', color: '#fff', border: 'none',
            borderRadius: 999, height: 52, fontSize: 16, fontWeight: 700,
            cursor: 'pointer', opacity: loading ? 0.7 : 1,
          }}>
            {loading ? 'Giriş yapılıyor…' : 'Giriş Yap'}
          </button>
        </form>
      </div>
    </div>
  );
}
