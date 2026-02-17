import { getStravaAuthUrl } from "@/lib/strava";

export default function Home() {
  const stravaUrl = getStravaAuthUrl();

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">
          Race Training Programme
        </h1>
        <p className="text-gray-400 mb-8">Track your path to race day</p>
        <a
          href={stravaUrl}
          className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition"
        >
          Connect with Strava
        </a>
      </div>
    </main>
  );
}
