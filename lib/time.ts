/**
 * Time helpers. The product is US-sports-focused, so "today" always means
 * today in US Eastern time — that's the day window users (and the books)
 * organize their slate around.
 */

const ET_TZ = "America/New_York";

/**
 * Returns today's date in US Eastern time as "YYYY-MM-DD".
 * (At 1am UTC on May 4, this still returns "2026-05-03" because it's
 * 9pm May 3 in ET.)
 */
export function etDateKey(d: Date = new Date()): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: ET_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(d); // en-CA gives ISO-like YYYY-MM-DD
}

/**
 * Returns the ET date key for a given ISO timestamp string.
 * Example: "2026-05-04T00:40:00Z" → "2026-05-03" (8:40pm ET, May 3).
 */
export function etDateKeyOf(iso: string): string {
  return etDateKey(new Date(iso));
}
