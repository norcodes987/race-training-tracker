import { addWeeks, format, isSameDay, startOfWeek, subWeeks } from 'date-fns';
import { supabaseAdmin } from './supabase';

export interface PlanDay {
  id: string;
  date: string;
  session_type: string;
  description: string;
  target_distance_m: number | null;
  target_pace_s_km: number | null;
  notes: string | null;
  completed: boolean;
  actual_activity_id: number | null;
}

export interface PlanWeek {
  weekStart: string;
  weekLabel: string;
  days: PlanDay[];
  completionRate: number; // 0-100
}

export async function getTrainingPlan(
  athleteId: string,
  activities: any[],
): Promise<PlanWeek[]> {
  // Fetch plan for last 4 weeks + next 4 weeks (8 weeks total)
  const startDate = subWeeks(startOfWeek(new Date(), { weekStartsOn: 1 }), 3);
  const endDate = addWeeks(startOfWeek(new Date(), { weekStartsOn: 1 }), 5);

  const { data: planDays, error } = await supabaseAdmin
    .from('training_plan')
    .select('*')
    .eq('athlete_id', athleteId)
    .gte('date', format(startDate, 'yyyy-MM-dd'))
    .lte('date', format(endDate, 'yyyy-MM-dd'))
    .order('date', { ascending: true });

  if (error) {
    console.error('Failed to fetch training plan: ', error);
    return [];
  }
  if (!planDays || planDays.length === 0) {
    return [];
  }

  // match each plan day with activities
  const enrichedDays: PlanDay[] = planDays.map((day) => {
    const dayDate = new Date(day.date);
    const activity = activities.find((a) =>
      isSameDay(new Date(a.start_date), dayDate),
    );

    let completed = false;

    if (day.session_type === 'rest') {
      completed = true;
    } else if (activity && day.target_distance_m) {
      const tolerance = 0.9;
      const minDistance = day.target_distance_m * tolerance;
      completed = activity.distance_m >= minDistance;
    } else if (activity && !day.target_distance_m) {
      completed = true;
    }
    return {
      id: day.id,
      date: day.date,
      session_type: day.session_type,
      description: day.description,
      target_distance_m: day.target_distance_m,
      target_pace_s_km: day.target_pace_s_km,
      notes: day.notes,
      completed,
      actual_activity_id: activity?.id ?? null,
    };
  });

  // group by week
  const weekMap = new Map<string, PlanDay[]>();
  enrichedDays.forEach((day) => {
    const weekStart = startOfWeek(new Date(day.date), {
      weekStartsOn: 1,
    });
    const key = format(weekStart, 'yyyy-MM-dd');
    if (!weekMap.has(key)) weekMap.set(key, []);
    weekMap.get(key)!.push(day);
  });

  // convert to array and compute completion rates
  const weeks: PlanWeek[] = Array.from(weekMap.entries()).map(
    ([weekStart, days]) => {
      const workoutDays = days.filter((d) => d.session_type !== 'rest');
      const completedWorkouts = workoutDays.filter((d) => d.completed).length;
      const completionRate =
        workoutDays.length > 0
          ? Math.round((completedWorkouts / workoutDays.length) * 100)
          : 100;

      return {
        weekStart,
        weekLabel: format(new Date(weekStart), 'MMM d'),
        days,
        completionRate,
      };
    },
  );
  return weeks;
}
