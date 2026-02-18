import { exchangeCodeForTokens } from "@/lib/strava";
import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect("/?error=no_code");
  }

  try {
    // Exchange code for tokens + athlete profile
    const tokenData = await exchangeCodeForTokens(code);

    const { error: upsertError } = await supabaseAdmin
      .from("strava_tokens")
      .upsert(
        {
          athlete_id: tokenData.athlete.id,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: tokenData.expires_at,
          athlete_name: `${tokenData.athlete.firstname} ${tokenData.athlete.lastname}`,
        },
        { onConflict: "athlete_id" },
      );

    if (upsertError) {
      console.error("Supabase upsert in strava_tokens db failed:", upsertError);
      throw upsertError;
    }

    const res = NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard`);
    res.cookies.set("athlete_id", String(tokenData.athlete.id), {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    return res;
  } catch (err) {
    console.error("Strava callback error:", err);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/?error=auth_failed`,
    );
  }
}
