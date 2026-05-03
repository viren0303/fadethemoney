import type { Game, League, GameStatus } from "./types";
import { etDateKey } from "./time";

const ENDPOINTS: Record<League, string> = {
  nba: "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard",
  mlb: "https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard",
  nfl: "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard",
  nhl: "https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard",
};

interface EspnEvent {
  id: string;
  date: string;
  status: { type: { state: string; completed: boolean; shortDetail: string } };
  competitions: Array<{
    competitors: Array<{
      homeAway: "home" | "away";
      score: string;
      team: { id: string; displayName: string; abbreviation: string };
    }>;
  }>;
}

function mapStatus(state: string, completed: boolean): GameStatus {
  if (completed) return "final";
  if (state === "in") return "live";
  return "scheduled";
}

export async function fetchEspnScoreboard(league: League): Promise<Game[]> {
  // ESPN's default scoreboard pivots between yesterday's finals and today's
  // upcoming games depending on time-of-day. Pin it to today's US Eastern
  // date so we always get the slate users care about (matches SBD's window).
  const dateParam = etDateKey().replace(/-/g, ""); // YYYYMMDD
  const url = `${ENDPOINTS[league]}?dates=${dateParam}`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`ESPN ${league} ${res.status}`);
  const data = (await res.json()) as { events: EspnEvent[] };
  const now = new Date().toISOString();
  return (data.events ?? []).map((ev): Game => {
    const comp = ev.competitions[0];
    const home = comp.competitors.find((c) => c.homeAway === "home")!;
    const away = comp.competitors.find((c) => c.homeAway === "away")!;
    return {
      id: `${league}:${ev.id}`,
      league,
      startTime: ev.date,
      status: mapStatus(ev.status.type.state, ev.status.type.completed),
      period: ev.status.type.shortDetail,
      home: {
        id: home.team.id,
        name: home.team.displayName,
        abbr: home.team.abbreviation,
        score: home.score ? Number(home.score) : 0,
      },
      away: {
        id: away.team.id,
        name: away.team.displayName,
        abbr: away.team.abbreviation,
        score: away.score ? Number(away.score) : 0,
      },
      updatedAt: now,
    };
  });
}
