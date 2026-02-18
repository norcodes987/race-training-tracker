'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SyncButton() {
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<string | null>(null);
  const router = useRouter();

  async function handleSync() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/strava/sync', { method: 'POST' });
      const data = await res.json();
      setResult(`✓ ${data.synced} runs synced`);
      router.refresh();
    } catch {
      setResult('Sync failed = check console');
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className='flex items-center gap-3'>
      {result && (
        <span className='text-xs font-mono text-zinc-500'>{result}</span>
      )}
      <button
        onClick={handleSync}
        disabled={loading}
        className='px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 border border-zinc-700 rounded-lg text-sm font-mono transition-colors'
      >
        {loading ? 'Syncing...' : '↻ Sync Strava'}
      </button>
    </div>
  );
}
