import { supabaseAdmin } from './supabase';
import { startOfWeek, format } from 'date-fns';

export interface Activity {
  id: number;
  name: string;
  start_date: string;
  distance_m: number;
  duration_s: number;
  avg_pace_s_km: number | null;
  avg_hr: number | null;
  type: string;
}

export interface WeeklyVolume {
  week: string;
  km: number;
}

export interface ActivitiesData {
  activities: Activity[];
  weeklyVolume: WeeklyVolume[];
  currentPace: number | null;
  totalRuns: number;
  thisWeekKm: number;
}

export async function getActivitiesData(
  athleteId: string,
): Promise<ActivitiesData> {
  // Fetch last 60 days of runs from Supabase
  const since = new Date();
  since.setDate(since.getDate() - 60);

  const { data, error } = await supabaseAdmin
    .from('activities')
    .select(
      'id, name, start_date, distance_m, duration_s, avg_pace_s_km, avg_hr, type',
    )
    .eq('athlete_id', athleteId)
    .eq('type', 'Run')
    .gte('start_date', since.toISOString())
    .order('start_date', { ascending: true });

  if (error) {
    console.error('Failed to fetch activities:', error);
    throw new Error('Failed to fetch activities from database');
  }

  const activities = data ?? [];

  if (activities.length === 0) {
    return {
      activities: [],
      weeklyVolume: [],
      currentPace: null,
      totalRuns: 0,
      thisWeekKm: 0,
    };
  }

  // Compute weekly volume (group by week starting Monday)
  const weeklyMap = new Map<string, number>();
  activities.forEach((activity) => {
    const weekStart = startOfWeek(new Date(activity.start_date), {
      weekStartsOn: 1,
    });
    const weekKey = format(weekStart, 'MMM d');
    const currentKm = weeklyMap.get(weekKey) ?? 0;
    weeklyMap.set(weekKey, currentKm + activity.distance_m / 1000);
  });

  const weeklyVolume = Array.from(weeklyMap.entries()).map(([week, km]) => ({
    week,
    km: Math.round(km * 10) / 10,
  }));

  // Compute current pace = average of last 5 runs with valid pace data
  const recentFive = [...activities]
    .reverse()
    .slice(0, 5)
    .filter((a) => a.avg_pace_s_km !== null && a.avg_pace_s_km > 0);

  const currentPace =
    recentFive.length > 0
      ? recentFive.reduce((sum, a) => sum + a.avg_pace_s_km!, 0) /
        recentFive.length
      : null;

  // Compute this week's km for header display
  const thisWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const thisWeekKey = format(thisWeekStart, 'MMM d');
  const thisWeekKm = weeklyVolume.find((w) => w.week === thisWeekKey)?.km ?? 0;

  return {
    activities,
    weeklyVolume,
    currentPace,
    totalRuns: activities.length,
    thisWeekKm,
  };
}
