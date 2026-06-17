export function parseIntOrNull(s: string | undefined): number | null {
  if (s === undefined || s.trim() === "") return null;
  const n = parseInt(s, 10);
  return isNaN(n) ? null : n;
}

export function parseStringOrNull(s: string | undefined): string | null {
  if (s === undefined || s.trim() === "") return null;
  return s.trim();
}
