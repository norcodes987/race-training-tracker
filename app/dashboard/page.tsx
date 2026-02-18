import PaceChart from '@/components/PaceChart';
import RaceCountdown from '@/components/RaceCountdown';
import RecentRuns from '@/components/RecentRuns';
import SyncButton from '@/components/SyncButton';
import WeeklyVolume from '@/components/WeeklyVolume';
import { getActivitiesData } from '@/lib/activities';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  // redirect to home if not authenticated
  const cookieStore = await cookies();
  const athleteId = cookieStore.get('athlete_id')?.value;
  if (!athleteId) redirect('/');

  let data;
  try {
    data = await getActivitiesData(athleteId);
  } catch (error) {
    console.log('Fetch activities Dashboard route error:', error);
    redirect('/?error=data_fetch_failed');
  }

  const { activities, weeklyVolume, currentPace, totalRuns, thisWeekKm } = data;

  return (
    <main className='min-h-screen bg-zinc-950 text-white'>
      <div className='max-w-5xl mx-auto px-6 py-10 space-y-8'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-black tracking-tight'>
              Race Training Programme
            </h1>
            <p className='text-zinc-500 font-mono text-sm mt-1'>
              {thisWeekKm}km this week · {activities?.length ?? 0} runs in the
              past 60 days
            </p>
          </div>
          <SyncButton />
        </div>

        {/* Race countdown cards */}
        <RaceCountdown currentPace={currentPace} />

        {/* Charts row */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <div className='lg:col-span-2'>
            <PaceChart activities={activities ?? []} />
          </div>
          <WeeklyVolume data={weeklyVolume} />
        </div>

        {/* Recent runs table */}
        <RecentRuns activities={activities ?? []} />
      </div>
    </main>
  );
}
