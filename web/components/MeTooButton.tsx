'use client';
import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function MeTooButton({ reportId, initialCount }: { reportId: number; initialCount: number }) {
  const [count, setCount] = useState(initialCount);
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleMeToo() {
    if (voted || loading) return;
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || null;

      // 1. Insert me_too log
      const { error: meTooErr } = await supabase.from('me_too').insert({
        report_id: reportId,
        user_id: userId,
      });
      if (meTooErr) throw meTooErr;

      // 2. Increment me_too_count
      const { data: updatedReport, error: updateErr } = await supabase
        .from('reports')
        .update({ me_too_count: count + 1 })
        .eq('id', reportId)
        .select('me_too_count')
        .single();
      if (updateErr) throw updateErr;

      setCount(updatedReport.me_too_count);
      setVoted(true);
    } catch (err) {
      console.error(err);
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
