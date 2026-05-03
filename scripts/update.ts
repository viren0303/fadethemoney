import { fetchEspnScoreboard } from "../lib/espn";
import { scrapeLeagueTrends } from "../lib/sportsbettingdime";
import { mergeTrends } from "../lib/merge";
import { readStore, upsertGames, recordDaily, setStreak } from "../lib/storage";
import { summarizeDay, todayKey } from "../lib/calc";
import { etDateKeyOf } from "../lib/time";
import { notifyAdmin } from "../lib/mailer";
import type { League, StreakState } from "../lib/types";

const LEAGUES: League[] = ["nba", "mlb", "nfl", "nhl"];

async function safeScrape(league: League) {
  try {
    return await scrapeLeagueTrends(league);
  } catch (err) {
    console.warn(`[scrape] ${league} failed:`, (err as Error).message);
    return [];
  }
}

async function run() {
  const allGames = [];
  for (const league of LEAGUES) {
    try {
      const espn = await fetchEspnScoreboard(league);
      const trends = await safeScrape(league);
      const merged = mergeTrends(espn, trends);
      allGames.push(...merged);
      console.log(`[update] ${league}: ${merged.length} games`);
    } catch (err) {
      console.warn(`[update] ${league} failed:`, (err as Error).message);
    }
  }

  await upsertGames(allGames);

  const today = todayKey();
  const todays = allGames.filter((g) => etDateKeyOf(g.startTime) === today);
  const summary = summarizeDay(todays);
  await recordDaily(today, { ...summary, games: todays.map((g) => g.id) });

  // Update streak based on completed games today
  const store = await readStore();
  const finals = todays.filter((g) => g.status === "final" && g.finalResult);
  let streak: StreakState = { ...store.streak };
  for (const g of finals) {
    if (streak.history.find((h) => h.date === `${today}:${g.id}`)) continue;
    const c = g.finalResult!.publicCovered;
    if (c === null) continue;
    const winner = c ? "public" : "vegas";
    if (streak.current === winner) streak.count += 1;
    else {
      streak.current = winner;
      streak.count = 1;
      streak.lastNotifiedCount = 0;
    }
    streak.history.unshift({ date: `${today}:${g.id}`, winner });
  }
  streak.history = streak.history.slice(0, 50);

  if (streak.count >= 2 && streak.count > streak.lastNotifiedCount) {
    await notifyAdmin({
      subject: `Fade The Money — ${streak.current} on a ${streak.count}-game streak`,
      text: `${streak.current?.toUpperCase()} has won ${streak.count} bets in a row. Check the dashboard.`,
    });
    streak.lastNotifiedCount = streak.count;
  }
  await setStreak(streak);

  console.log("[update] done", {
    games: allGames.length,
    streak: `${streak.current ?? "—"} x${streak.count}`,
  });
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
