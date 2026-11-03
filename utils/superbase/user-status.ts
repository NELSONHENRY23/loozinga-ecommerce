// Returns true only while the ban is still in effect.
export function isUserBlocked(bannedUntil?: string | null): boolean {
  if (!bannedUntil) return false;

  const until = new Date(bannedUntil).getTime();

  return Number.isFinite(until) && until > Date.now();
}