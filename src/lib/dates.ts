/**
 * Parses an ISO date-only string ("2026-09-17") as a LOCAL calendar date.
 * `new Date("2026-09-17")` would be UTC midnight and shift a day west of Greenwich.
 */
export function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}
