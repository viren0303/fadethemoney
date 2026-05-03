import { NextResponse } from "next/server";
import { fetchEspnScoreboard } from "@/lib/espn";
import { scrapeLeagueTrends } from "@/lib/sportsbettingdime";
import { mergeTrends } from "@/lib/merge";
import { upsertGames, recordDaily, setStreak, readStore } from "@/lib/storage";
import { summarizeDay, todayKey } from "@/lib/calc";
import { etDateKeyOf } from "@/lib/time";
import { notifyAdmin } from "@/lib/mailer";
import type { League, StreakState } from "@/lib/types";

export const dynamic = "force-dynamic";

const LEAGUES: League[] = ["nba", "mlb", "nfl", "nhl"];

export async function POST(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  const token = process.env.REFRESH_TOKEN;
  if (token && auth !== `Bearer ${token}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const all = [];
  for (const league of LEAGUES) {
    try {
      const espn = await fetchEspnScoreboard(league);
      const trends = await scrapeLeagueTrends(league).catch(() => []);
      all.push(...mergeTrends(espn, trends));
    } catch (e) {
      console.warn("[refresh]", league, (e as Error).message);
    }
  }
  await upsertGames(all);

  const today = todayKey();
  const todays = all.filter((g) => etDateKeyOf(g.startTime) === today);
  const summary = summarizeDay(todays);
  await recordDaily(today, { ...summary, games: todays.map((g) => g.id) });

  const store = await readStore();
  const streak: StreakState = { ...store.streak };
  for (const g of todays.filter((g) => g.status === "final" && g.finalResult)) {
    const c = g.finalResult!.publicCovered;
    if (c === null) continue;
    const winner = c ? "public" : "vegas";
    if (streak.history.find((h) => h.date === `${today}:${g.id}`)) continue;
    if (streak.current === winner) streak.count += 1;
    else { streak.current = winner; streak.count = 1; streak.lastNotifiedCount = 0; }
    streak.history.unshift({ date: `${today}:${g.id}`, winner });
  }
  streak.history = streak.history.slice(0, 50);
  if (streak.count >= 2 && streak.count > streak.lastNotifiedCount) {
    await notifyAdmin({
      subject: `Fade The Money — ${streak.current} on a ${streak.count}-game streak`,
      text: `${streak.current} has won ${streak.count} bets in a row.`,
    });
    streak.lastNotifiedCount = streak.count;
  }
  await setStreak(streak);

  return NextResponse.json({ ok: true, count: all.length, streak });
}

export async function GET() {
  return NextResponse.json({ ok: true, hint: "POST to refresh" });
}
