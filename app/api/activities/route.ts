import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { format, startOfWeek } from 'date-fns';
import { getActivitiesData } from '@/lib/activities';

export async function GET(req: NextRequest) {
  const athleteId = req.cookies.get('athlete_id')?.value;
  if (!athleteId) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  }

  try {
    const data = await getActivitiesData(athleteId);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Fetch activities API route error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 },
    );
  }
}
