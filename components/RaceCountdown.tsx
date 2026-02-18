'use client';
import { formatPace, paceStatus, TARGETS } from '@/lib/pace';
import { differenceInDays } from 'date-fns';

interface RaceCardProps {
  name: string;
  date: string; // ISO date string e.g. "2026-04-16"
  distance: string; // e.g. "5.6km"
  targetPace: number; // seconds/km
  currentPace: number | null;
}
function RaceCard({
  name,
  date,
  distance,
  targetPace,
  currentPace,
}: RaceCardProps) {
  const daysLeft = differenceInDays(new Date(date), new Date());
  const status = paceStatus(currentPace, targetPace);

  const statusColours = {
    green: {
      ring: 'border-green-500/40',
      text: 'text-green-400',
      bg: 'bg-green-500/10',
    },
    amber: {
      ring: 'border-yellow-500/40',
      text: 'text-yellow-400',
      bg: 'bg-ye;;pw-500/10',
    },
    red: {
      ring: 'border-red-500/40',
      text: 'text-red-400',
      bg: 'bg-red-500/10',
    },
    unknown: {
      ring: 'border-zinc-700',
      text: 'text-zinc-400',
      bg: 'bg-zinc-800',
    },
  };
  const colours = statusColours[status];
  const paceGap = currentPace && currentPace - targetPace;
  const gapText = paceGap
    ? paceGap > 0
      ? `${Math.round(paceGap)}s/km slower than target`
      : `${Math.abs(Math.round(paceGap))}s/km faster than target 🎉`
    : 'No recent runs yet';
  return (
    <div className={`rounded-2xl border p-6 ${colours.ring} ${colours.bg}`}>
      <div className='flex items-start justify-between mb-4'>
        <div>
          <p className='text-xs font-mono uppercase tracking-wideset text-zinc-500 mb-1'>
            {distance} · {date}
          </p>
          <h2 className='text-lg font-bold text-white'>{name}</h2>
        </div>
        <div className='text-right'>
          <span className='text-4xl font-black text-white'>{daysLeft}</span>
          <span className='text-zinc-400 text-sm ml-1'>days</span>
        </div>
      </div>

      <div className='grid grid-cols-2 gap-3'>
        <div className='bg-black/20 rounded-xl p-3'>
          <p className='text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1'>
            Target
          </p>
          <p className='text-xl font-bold text-whote'>
            {formatPace(targetPace)}
          </p>
        </div>
        <div className='bg-black/20 rounded-xl p-3'>
          <p className='text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1'>
            Current
          </p>
          <p className={`text-xl font-bold ${colours.text}`}>
            {formatPace(currentPace)}
          </p>
        </div>
      </div>

      <p className='text-xs text-zinc-500 ont-mono mt-3'>{gapText}</p>
    </div>
  );
}

export default function RaceCountdown({
  currentPace,
}: {
  currentPace: number | null;
}) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
      <RaceCard
        name='JP Morgan Run'
        date='2026-04-16'
        distance='5.6km'
        targetPace={TARGETS.fivepointsixKm}
        currentPace={currentPace}
      />
      <RaceCard
        name='NTUC Income Race'
        date='2026-04-19'
        distance='21.1km'
        targetPace={TARGETS.halfMarathon}
        currentPace={currentPace}
      />
    </div>
  );
}
