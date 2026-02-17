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
