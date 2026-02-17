import axios from "axios";
import { supabaseAdmin } from "./supabase";

const STRAVA_BASE = "https://www.strava.com/api/v3";

// send user to Strava login page
export function getStravaAuthUrl() {
  const params = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID!,
    redirect_uri: `${process.env.NEXTAUTH_URL}/api/strava/callback`,
    response_type: "code",
    scope: "activity:read_all",
  });
  return `https://www.strava.com/oauth/authorize?${params}`;
}

// exchange one time code for access + refresh tokens
export async function exchangeCodeForTokens(code: string) {
  const { data } = await axios.post("https://www.strava.com/oauth/token", {
    client_id: process.env.STRAVA_CLIENT_ID,
    client_secret: process.env.STRAVA_CLIENT_SECRET,
    code,
    grant_type: "authorization_code",
  });
  return data;
  // Returns: { access_token, refresh_token, expires_at, athlete: {...} }
}

// if access token is expired, get a new one using refresh token
export async function refreshAccessToken(athleteId: number) {
  const { data: stored } = await supabaseAdmin
    .from("strava_tokens")
    .select("*")
    .eq("athlete_id", athleteId)
    .single();

  //if token still valid
  if (stored.expires_at > Date.now() / 1000) {
    return stored.access_token;
  }

  //if token expired
  const { data } = await axios.post("https://www.strava.com/oauth/token", {
    client_id: process.env.STRAVA_CLIENT_ID,
    client_secret: process.env.STRAVA_CLIENT_SECRET,
    grant_type: "refresh_token",
    refresh_token: stored.refresh_token,
  });

  await supabaseAdmin
    .from("strava_tokens")
    .update({ access_token: data.access_token, expires_at: data.expires_at })
    .eq("athlete_id", athleteId);

  return data.access_token;
}

// fetch activities from Strava and upsert into db
export async function syncActivities(athleteId: number) {
  const token = await refreshAccessToken(athleteId);
  let page = 1;
  let totalSynced = 0;

  while (true) {
    const { data: activities } = await axios.get(
      `${STRAVA_BASE}/athlete/activities`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { per_page: 100, page },
      },
    );
    if (activities.length === 0) break;

    const runs = activities
      .filter((a: any) => a.type === "Run")
      .map((a: any) => ({
        id: a.id,
        athlete_id: athleteId,
        name: a.name,
        type: a.type,
        start_data: a.start_data,
        distance_m: a.distance,
        duration_s: a.moving_time,
        avg_pace_s_km: a.average_speed > 0 ? 1000 / a.average_speed : null, //convert m/s to s/km
        avg_hr: a.average_heartrate ?? null,
        max_hr: a.max_heartrate ?? null,
        elevation_m: a.total_elevation_gain,
        avg_cadence: a.average_cadence ?? null,
        map_polyline: a.map?.summary_polyline ?? null,
        raw_data: a,
      }));

    if (runs.length > 0) {
      await supabaseAdmin.from("activities").upsert(runs, { onConflict: "id" });
      totalSynced += runs.length;
    }
    page++;
  }
  return { synced: totalSynced };
}
