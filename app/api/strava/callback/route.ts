import { exchangeCodeForTokens } from "@/lib/strava";
import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect("/?error=no_code");
  }

  try {
    // exchange code for tokens + athlete profile
    const tokenData = await exchangeCodeForTokens(code);
    await supabaseAdmin.from("strava_tokens").upsert(
      {
        athlete_id: tokenData.athlete.id,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: tokenData.expires_at,
        athlete_name: `${tokenData.athlete.firstname} ${tokenData.athlete.lastname}`,
        athlete_photo: tokenData.athlete.profile,
      },
      { onConflict: "athlete_id" },
    );

    const res = NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard`);
    res.cookies.set("athlete_id", String(tokenData.athlete.id), {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });
    return res;
  } catch (err) {
    console.error("Strava callback error: , err");
    return NextResponse.redirect("?error=auth+failed");
  }
}
