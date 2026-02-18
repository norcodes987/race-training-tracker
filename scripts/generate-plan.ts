import { supabaseAdmin } from '@/lib/supabase';
import { addDays, format, startOfWeek } from 'date-fns';

const ATHLETE_ID = 146666378;

// race dates
const RACE_5POINT6K_DATE = new Date('2026-04-16');
const RACE_HM_DATE = new Date('2026-04-19');
const rawStart = addDays(RACE_5POINT6K_DATE, -56); // 8 weeks before
const PLAN_START = startOfWeek(rawStart, { weekStartsOn: 1 }); // then align to Mon
// session types
type SessionType = 'easy' | 'tempo' | 'interval' | 'long' | 'rest' | 'race';

interface PlanDay {
  date: string;
  session_type: SessionType;
  description: string;
  target_distance_m: number | null;
  target_pace_s_km: number | null;
  notes: string | null;
}

/**
 * Generate an 8-week periodized training plan
 * Weeks 1-2: Base building
 * Weeks 3-5: Build phase (volume peaks)
 * Weeks 6-7: Sharpening (reduced volume, maintain intensity)
 * Week 8: Taper + races
 */

function generatePlan(): PlanDay[] {
  const plan: PlanDay[] = [];
  let currentDate = PLAN_START;

  // helper to add a day
  const addDay = (
    type: SessionType,
    desc: string,
    distM: number | null,
    paceS: number | null,
    notes: string | null = null,
  ) => {
    plan.push({
      date: format(currentDate, 'yyyy-MM-dd'),
      session_type: type,
      description: desc,
      target_distance_m: distM,
      target_pace_s_km: paceS,
      notes,
    });
    currentDate = addDays(currentDate, 1);
  };
  // Week 1-2: Base (Mon-Sun pattern: Easy, Interval, Rest, Tempo, Easy, Long, Easy)
  for (let week = 0; week < 2; week++) {
    addDay('easy', 'Easy run', 8000, null, 'Conversational pace');
    addDay(
      'interval',
      '6×800m @ 4:15/km',
      6000,
      255,
      '2min jog recovery between reps',
    );
    addDay('rest', 'Rest or walk', null, null, null);
    addDay('tempo', 'Tempo 6km @ 4:44/km', 6000, 284, 'HM goal pace');
    addDay('easy', 'Easy run', 6000, null, null);
    addDay(
      'long',
      `Long run ${14 + week * 2}km`,
      (14 + week * 2) * 1000,
      null,
      'Easy pace, build endurance',
    );
    addDay('rest', 'Rest', null, null, null);
  }

  // Week 3-5: Build (peak volume)
  for (let week = 0; week < 3; week++) {
    addDay('easy', 'Easy run', 8000, null, null);
    addDay('interval', '5×1km @ 4:20/km', 8000, 260, '90s jog recovery');
    addDay('rest', 'Rest', null, null, null);
    addDay('tempo', 'Tempo 8km @ 4:44/km', 8000, 284, 'HM pace');
    addDay('easy', 'Easy run', 6000, null, null);
    addDay(
      'long',
      `Long run ${17 + week}km`,
      (17 + week) * 1000,
      null,
      'Peak long run',
    );
    addDay('easy', 'Recovery run', 5000, null, 'Very easy');
  }

  // Week 6-7: Sharpening (reduce volume 20%, keep intensity)
  for (let week = 0; week < 2; week++) {
    addDay('easy', 'Easy run', 7000, null, null);
    addDay('interval', '3×1 mile @ 4:20/km', 6000, 260, '3min recovery');
    addDay('rest', 'Rest', null, null, null);
    addDay('tempo', '10km @ 4:44/km', 10000, 284, 'HM dress rehearsal');
    addDay('easy', 'Easy + strides', 5000, null, '6×20s strides at end');
    addDay('long', `Long run ${13 + week}km`, (13 + week) * 1000, null, null);
    addDay('rest', 'Rest', null, null, null);
  }

  // Week 8: Taper + Race week
  addDay('easy', 'Easy run', 5000, null, 'Keep legs fresh');
  addDay('interval', '4×400m @ 4:10/km', 2400, 250, 'Sharp but short');
  addDay('rest', 'Rest', null, null, null);
  addDay('easy', 'Easy 3km + strides', 3000, null, 'Last sharpener');
  addDay('rest', 'Rest', null, null, 'Day before race');
  addDay('race', '🏁 5.6km Race', 5600, 270, 'Target sub-4:30/km');
  addDay('easy', 'Easy recovery jog', 3000, null, 'Flush legs between races');
  addDay('rest', 'Rest + prep', null, null, 'Day before HM');
  addDay('race', '🏁 Half Marathon', 21097, 284, 'Target 1:40:00');

  return plan;
}

async function main() {
  console.log('🏃 Generating 8-week training plan...');

  const plan = generatePlan();
  console.log(`Generated ${plan.length} days of training`);

  const rows = plan.map((day) => ({
    athlete_id: ATHLETE_ID,
    ...day,
  }));

  const { error } = await supabaseAdmin.from('training_plan').insert(rows);
  if (error) {
    console.error('Failed to insert plan: ', error);
    process.exit(1);
  }

  console.log('Training plan generated successfully!');
  console.log(
    `Plan runs from ${format(PLAN_START, 'MMM d, yyyy')} to ${format(RACE_HM_DATE, 'MMM d yyyy')}`,
  );
  process.exit(0);
}
main();
//npx tsx --env-file=.env scripts/generate-plan.ts
