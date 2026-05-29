'use client';
import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function MeTooButton({ reportId, initialCount }: { reportId: number; initialCount: number }) {
  const [count, setCount] = useState(initialCount);
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleMeToo() {
    if (voted || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/reports/${reportId}/metoo`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setCount(data.me_too_count);
        setVoted(true);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleMeToo}
      disabled={voted || loading}
      style={{
        background: voted ? '#2E7D32' : '#1565C0',
        color: '#fff', border: 'none', borderRadius: 999,
        padding: '8px 20px', fontSize: 14, fontWeight: 600,
        cursor: voted ? 'default' : 'pointer', transition: 'background 0.2s',
      }}
    >
      {voted ? `✅ Kaydedildi (${count})` : `👍 Ben de Gördüm (${count})`}
    </button>
  );
}
