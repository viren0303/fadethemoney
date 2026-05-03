import type { Game } from "./types";
import type { ScrapedMatchup } from "./sportsbettingdime";
import { publicCovering } from "./calc";

export function mergeTrends(games: Game[], trends: ScrapedMatchup[]): Game[] {
  return games.map((g) => {
    // SBD's feed only contains upcoming matchups (status: not_started). If
    // the same team-pair plays today and yesterday, today's pre-game splits
    // would otherwise be wrongly attached to yesterday's final. So: never
    // merge SBD onto a final game. Finals keep whatever trend they had at
    // game time (or stay trendless if we missed that window).
    if (g.status === "final") return g;

    const match = trends.find(
      (t) => t.homeAbbr === g.home.abbr && t.awayAbbr === g.away.abbr,
    );
    if (!match) return g;
    const next: Game = { ...g, trend: match.trend };
    next.publicCovering = publicCovering(next);
    if (next.status === "final" && next.trend) {
      const margin =
        (next.home.score ?? 0) + next.trend.spread - (next.away.score ?? 0);
      const totalScored = (next.home.score ?? 0) + (next.away.score ?? 0);
      next.finalResult = {
        winnerSide: (next.home.score ?? 0) > (next.away.score ?? 0) ? "home" : "away",
        margin: Math.abs((next.home.score ?? 0) - (next.away.score ?? 0)),
        publicCovered: margin === 0 ? null : next.publicCovering ?? null,
        totalGoOver:
          totalScored === next.trend.total ? null : totalScored > next.trend.total,
      };
    }
    return next;
  });
}
