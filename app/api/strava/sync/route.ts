import { syncActivities } from "@/lib/strava";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const athleteId = req.cookies.get("athlete_id")?.value;
  if (!athleteId) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  try {
    const result = await syncActivities(Number(athleteId));
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
