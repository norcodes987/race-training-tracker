'use client';

import { formatDistance, formatPace, paceStatus, TARGETS } from '@/lib/pace';
import { format } from 'date-fns';

interface RecentActivity {
  id: number;
  name: string;
  start_date: string;
  distance_m: number;
  duration_s: number;
  avg_pace_s_km: number | null;
  avg_hr: number | null;
}

export default function RecentRuns({
  activities,
}: {
  activities: RecentActivity[];
}) {
  // show last 10, most recent first
  const recent = [...activities].reverse().slice(0, 10);
  const paceColour = (pace: number | null) => {
    const s = paceStatus(pace, TARGETS.halfMarathon); // use HM as baseline
    return {
      green: 'text-green-400 bg-green-400/10',
      amber: 'text-yellow-400 bg-yellow-400/10',
      red: 'text-red-400 bg-red-400/10',
      unknown: 'text-zinc-500 bg-zinc-800',
    }[s];
  };
  return (
    // only show recent runs if in desktop
    <div className='bg-zinc 900/60 border border-zinc-800 rounded-2xl overflow-hidden hidden md:block'>
      <div className='px-6 py-4 boder-b border-zinc-800 flex items-center justify-between'>
        <h3 className='font-bold text-white'>Recent Runs</h3>
        <span className='text-xs font-mono text-zinc-500'>
          last 10 activities
        </span>
      </div>

      {/* Header */}

      <div className='grid grid-cols-5 px-6 py-2 text-xs font-mono uppercase tracking-wider text-zinc-600 border-b border-zinc-800/50'>
        <span>Data</span>
        <span className='col-span-2'>Name</span>
        <span>Distance</span>
        <span>Pace</span>
      </div>

      {recent.map((run) => (
        <div
          key={run.id}
          className='grid grid-cols-5 px-6 py-3 border-b border-zinc-800/50 hover:bg-white/[0.02] transition-colors'
        >
          <span className='text-xs font-mono text-zince-500 self-center'>
            {format(new Date(run.start_date), 'MMM d')}
          </span>
          <span className='col-span-2 text-sm text-zinc-200 self-center truncate pr-4'>
            {run.name}
          </span>
          <span className='text-sm text-zinc-300 font-mono self-center'>
            {formatDistance(run.distance_m)}
          </span>
          <span className='self-center'>
            <span
              className={`text-xs font-mono px-2 py-1 rounded-md ${paceColour(run.avg_pace_s_km)}`}
            >
              {formatPace(run.avg_pace_s_km)}
            </span>
          </span>
        </div>
      ))}

      {recent.length === 0 && (
        <div className='px-6 py-12 text-center text-zinc-600 font-mono text-sm'>
          No runs synced yet. Click "Sync Strava"
        </div>
      )}
    </div>
  );
}
