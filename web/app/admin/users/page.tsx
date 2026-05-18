'use client';
import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL;

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  admin:        { bg: '#212121', text: '#fff' },
  municipality: { bg: '#1565C0', text: '#fff' },
  citizen:      { bg: '#EEEEEE', text: '#616161' },
};

const ROLE_LABEL: Record<string, string> = {
  admin: '⚙️ Admin',
  municipality: '🏛 Belediye',
  citizen: '👤 Vatandaş',
};

export default function UsersPage() {
  const [users, setUsers]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [changingRole, setChangingRole] = useState<number | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : '';

  async function load() {
    setLoading(true);
    const url = `${API}/api/admin/users${roleFilter ? `?role=${roleFilter}` : ''}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setUsers(data.users ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [roleFilter]);

  async function changeRole(userId: number, newRole: string) {
    setChangingRole(userId);
    await fetch(`${API}/api/admin/users/${userId}/role`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    });
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    setChangingRole(null);
  }

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: '#212121', margin: '0 0 8px' }}>Kullanıcılar</h1>
      <p style={{ fontSize: 14, color: '#9E9E9E', margin: '0 0 24px' }}>
        Tüm kayıtlı kullanıcılar — rol değiştirmek için seçin
      </p>

      {/* Filtre */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {['', 'citizen', 'municipality', 'admin'].map(r => (
          <button key={r} onClick={() => setRoleFilter(r)} style={{
            border: 'none', cursor: 'pointer', borderRadius: 999,
            padding: '8px 16px', fontSize: 13, fontWeight: 600,
            background: roleFilter === r ? '#212121' : '#EEEEEE',
            color: roleFilter === r ? '#fff' : '#616161',
          }}>
            {r === '' ? 'Tümü' : ROLE_LABEL[r]}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ color: '#9E9E9E' }}>Yükleniyor…</div>
      ) : (
        <div style={{
          background: '#fff', borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F5F5F5', fontSize: 12, fontWeight: 700, color: '#9E9E9E', textTransform: 'uppercase' }}>
                {['#', 'İsim', 'E-posta', 'Rol', 'Kayıt Tarihi', 'İşlem'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => {
                const rc = ROLE_COLORS[u.role] ?? ROLE_COLORS.citizen;
                return (
                  <tr key={u.id} style={{ borderTop: '1px solid #F5F5F5', fontSize: 14 }}>
                    <td style={{ padding: '14px 16px', color: '#9E9E9E' }}>{u.id}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: '#212121' }}>{u.name || '—'}</td>
                    <td style={{ padding: '14px 16px', color: '#616161' }}>{u.email}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        background: rc.bg, color: rc.text,
                        borderRadius: 999, padding: '3px 10px', fontSize: 12, fontWeight: 600,
                      }}>
                        {ROLE_LABEL[u.role] ?? u.role}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#9E9E9E', fontSize: 13 }}>
                      {new Date(u.created_at).toLocaleDateString('tr-TR')}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <select
                        value={u.role}
                        disabled={changingRole === u.id}
                        onChange={e => changeRole(u.id, e.target.value)}
                        style={{
                          border: '1px solid #EEEEEE', borderRadius: 8,
                          padding: '6px 10px', fontSize: 13, cursor: 'pointer',
                          background: '#F5F5F5',
                        }}
                      >
                        <option value="citizen">Vatandaş</option>
                        <option value="municipality">Belediye</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {users.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: '#9E9E9E' }}>Kullanıcı bulunamadı.</div>
          )}
        </div>
      )}
    </div>
  );
}
