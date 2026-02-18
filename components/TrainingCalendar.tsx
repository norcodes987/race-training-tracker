'use client';

import { PlanWeek } from '@/lib/training-plan';
import { format } from 'date-fns';

export default function TrainingCalendar({ weeks }: { weeks: PlanWeek[] }) {
  if (weeks.length === 0) {
    return (
      <div className='bg-zinc-900/60 border border-zinc-800 rounded-2xl p-8 text-center'>
        <p className='text-zinc-500 font-mono text-sm'>
          No training plan found. Run the plan generator script
        </p>
      </div>
    );
  }
  return (
    <div className='space-y-6'>
      {weeks.map((week) => (
        <div
          key={week.weekStart}
          className='bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6'
        >
          {/* Week headers */}
          <div className='flex items-center justify-between mb-4 pb-3 border-b border-zinc-800'>
            <h3 className='font-mono text-xs uppercase tracking-widest text-zinc-400'>
              Week of {week.weekLabel}
            </h3>
            <span
              className={`font-mono text-xs ${
                week.completionRate >= 80
                  ? 'text-green-400'
                  : week.completionRate >= 60
                    ? 'text-yellow-400'
                    : 'text-red-400'
              }`}
            >
              {week.completionRate}% completed
            </span>
          </div>

          {/* Day headers */}
          <div className='grid grid-cols-7 gap-2 mb-2'>
            {['Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div
                key={day}
                className='text-center font-mono text-xs text-zince-600 uppercase tracking-wider'
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className='grid grid-cols-7 gap-2'>
            {week.days.map((day) => {
              const isRest = day.session_type === 'rest';
              const isRace = day.session_type === 'race';
              const dayNum = format(new Date(day.date), 'd');

              let bgClass = 'bg-zinc-800/50 border-zinc-700';
              if (isRest) bgClass = 'bg-zinc-950 border-zinc-800/50';
              if (isRace) bgClass = 'bg-yellow-500/10 border-yellow-500/30';
              if (day.completed && !isRest)
                bgClass = 'bg-green-500/10 border-green-500/30';
              if (
                !day.completed &&
                !isRest &&
                new Date(day.date) < new Date()
              ) {
                bgClass = 'bg-red-500/10 border-red-500/30';
              }
              return (
                <div
                  key={day.date}
                  className={`border rounded-lg p-3 min-h-[90px] flex flex-col ${bgClass}`}
                >
                  <div className='font-mono text-xs text-zinc-500 mb-1'>
                    {dayNum}
                  </div>
                  <div className='text-xs text-zinc-300 flex-1'>
                    {day.description}
                  </div>
                  {day.completed && !isRest && (
                    <div className='w-2 h-2 bg-green-400 rounded-full mt-auto'></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
