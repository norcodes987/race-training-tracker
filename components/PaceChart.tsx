'use client';

import { formatPace, TARGETS } from '@/lib/pace';
import { format } from 'date-fns';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface Activity {
  start_date: string;
  avg_pace_s_km: number | null;
  name: string;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const pace = payload[0]?.value;
  return (
    <div className='bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-sm shadow-xl'>
      <p className='text-zinc-400 font-mono text-xs mb-1'>{label}</p>
      <p className='text-white font-bold'>{formatPace(pace)}</p>
    </div>
  );
}

export default function PaceChart({ activities }: { activities: Activity[] }) {
  // shape data for recharts
  const data = activities
    .filter((a) => a.avg_pace_s_km)
    .map((a) => ({
      date: format(new Date(a.start_date), 'MMM d'),
      pace: Math.round(a.avg_pace_s_km!),
      name: a.name,
    }));
  // Y-axis: invert so faster (lower number) = higher on chart
  // We show pace in seconds but format as "m:ss" on the axis
  const paceValues = data.map((d) => d.pace);
  const yMin = Math.min(...paceValues, TARGETS.fivepointsixKm) - 20;
  const yMax = Math.max(...paceValues) + 20;
  return (
    <div className='bg-zinc 900/60 border border-zinc-800 rounded-2xl p-6'>
      <div className='flex items-center justify-between mb-6'>
        <h3 className='font-bold text-white'>Pace Trend</h3>
        <div className='flex gap-4 text-xs font-mono'>
          <span className='flex items-center gap-1.5 text-yellow-400'>
            <span className='w-4 h-0.5 bg-yellow-400 inline-block'></span> 4:30
            (5.6km)
          </span>
          <span className='flex items-center gap-1.5 text-cyan-400'>
            <span className='w-4 h-0.5 bg-cyan-400 inline-block'></span> 4:44
            (HM)
          </span>
        </div>
      </div>

      <ResponsiveContainer width='100%' height={280}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 10, bottom: 5, left: 10 }}
        >
          <CartesianGrid strokeDasharray='3 3' stroke='#27303f' />
          <XAxis
            dataKey='date'
            tick={{ fill: '#5a6a82', fontSize: 11, fontFamily: 'monospace' }}
            axisLine={{ stroke: '#252d40' }}
            tickLine={false}
            interval='preserveStartEnd'
          />
          <YAxis
            domain={[yMin, yMax]}
            reversed
            tickFormatter={formatPace}
            tick={{ fill: '#5a6a82', fontSize: 11, fontFamily: 'monnospace' }}
            axisLine={false}
            tickLine={false}
            width={70}
          />
          <Tooltip content={<CustomTooltip />} />
          {/* Target Pace */}
          <ReferenceLine
            y={TARGETS.fivepointsixKm}
            stroke='#facc15'
            strokeDasharray='5 3'
            strokeWidth={1.5}
            label={{
              value: '4:30',
              fill: '#facc15',
              fontSize: 10,
              fontFamily: 'monospace',
            }}
          />
          <ReferenceLine
            y={TARGETS.halfMarathon}
            stroke='#22d3ee'
            strokeDasharray='5 3'
            strokeWidth={1.5}
            label={{
              value: '4:44',
              fill: '#22d3ee',
              fontSize: 10,
              fontFamily: 'monospace',
            }}
          />
          {/* Actual Pace */}
          <Line
            type='monotone'
            dataKey='pace'
            stroke='#e8ff47'
            strokeWidth={2}
            dot={{ fill: '#e8ff47', r: 3 }}
            activeDot={{ fill: '#e8ff47', r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
