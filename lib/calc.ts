import type { Game, Side } from "./types";

/**
 * Determine if the public side is currently covering the spread.
 * Returns true (covering), false (not covering), or null (push / unknown).
 */
export function publicCovering(game: Game): boolean | null {
  if (!game.trend) return null;
  // 0-0 isn't "Vegas winning" — there's just no game yet.
  if (game.status !== "live" && game.status !== "final") return null;
  const homeScore = game.home.score ?? 0;
  const awayScore = game.away.score ?? 0;
  const homeSpread = game.trend.spread; // home line
  const adjustedHome = homeScore + homeSpread;
  const margin = adjustedHome - awayScore;
  if (margin === 0) return null;
  const homeCovering = margin > 0;
  const publicSide: Side = game.trend.pickedSide;
  return publicSide === "home" ? homeCovering : !homeCovering;
}

export function statusLabel(game: Game): "Public Winning" | "Vegas Winning" | "Push" | "—" {
  const c = publicCovering(game);
  if (c === null) return game.status === "scheduled" ? "—" : "Push";
  return c ? "Public Winning" : "Vegas Winning";
}

import { etDateKey } from "./time";

/** Today in US Eastern time, as "YYYY-MM-DD". */
export function todayKey(d = new Date()): string {
  return etDateKey(d);
}

export function summarizeDay(games: Game[]): { publicWins: number; vegasWins: number; pushes: number } {
  let publicWins = 0, vegasWins = 0, pushes = 0;
  for (const g of games) {
    if (g.status !== "final" || !g.finalResult) continue;
    const c = g.finalResult.publicCovered;
    if (c === null) pushes++;
    else if (c) publicWins++;
    else vegasWins++;
  }
  return { publicWins, vegasWins, pushes };
}
