// convert seconds per km to "m:ss /km" string
export function formatPace(secondsPerKm: number | null): string {
  if (!secondsPerKm) return '—';
  const mins = Math.floor(secondsPerKm / 60);
  const secs = Math.round(secondsPerKm % 60)
    .toString()
    .padStart(2, '0');
  return `${mins}:${secs} /km`;
}

// compare a pace to target and return status colour
// within 5s = green, within 15s = amber, over 15s = red
export function paceStatus(
  currentPace: number | null,
  targetPace: number,
): 'green' | 'amber' | 'red' | 'unknown' {
  if (!currentPace) return 'unknown';
  if (currentPace >= targetPace) return 'green';
  const diff = currentPace - targetPace;
  if (diff <= 5) return 'green';
  else if (diff <= 15) return 'amber';
  else return 'red';
}

// convert total time in seconds to "h:mm:ss" or "mm:ss"
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = (seconds % 60).toString().padStart(2, '0');
  return h > 0 ? `${h}:${m.toString().padStart(2, '0')}:${s}` : `${m}:${s}`;
}

// convert distance in metres to "X.X km"
export function formatDistance(metres: number): string {
  return `${(metres / 1000).toFixed(1)} km`;
}

// target paces as seconds/km
export const TARGETS = {
  fivepointsixKm: 4 * 60 + 30, //4min 30s /km = 270s
  halfMarathon: 4 * 60 + 44, //4min 44s /km = 284s
};
