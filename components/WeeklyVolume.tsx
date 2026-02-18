'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface WeekData {
  week: string;
  km: number;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const pace = payload[0]?.value;
  return (
    <div className='bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-sm shadow-xl'>
      <p className='text-zinc-400 font-mono text-xs mb-1'>Week of {label}</p>
      <p className='text-white font-bold'>{payload[0].value} km</p>
    </div>
  );
}

export default function WeeklyVolume({ data }: { data: WeekData[] }) {
  // highlight the most recent (current) week
  const maxIdx = data.length - 1;
  return (
    <div className='bg-zinc 900/60 border border-zinc-800 rounded-2xl p-6'>
      <div className='flex items-center justify-between mb-6'>
        <h3 className='font-bold text-white'>Weekly Volume</h3>
        <span className='text-xs font-mono text-zinc-500'>km per week</span>
      </div>

      <ResponsiveContainer width='100%' height={280}>
        <BarChart
          data={data}
          margin={{ top: 5, right: 10, bottom: 5, left: 10 }}
        >
          <CartesianGrid
            strokeDasharray='3 3'
            stroke='#27303f'
            vertical={false}
          />
          <XAxis
            dataKey='week'
            tick={{ fill: '#5a6a82', fontSize: 11, fontFamily: 'monospace' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#5a6a82', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey='km' radius={[4, 4, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={i === maxIdx ? '#e8ff47' : '#252d40'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
