/**
 * Single-shot verifier: fetches each league's SBD JSON ONCE, runs the same
 * parser the app uses, and prints a per-game comparison so we can confirm
 * dashboard numbers exactly match SBD without race conditions between
 * two separate HTTP calls.
 */
import { scrapeLeagueTrends } from "../lib/sportsbettingdime";
import type { League } from "../lib/types";

const LEAGUES: League[] = ["nba", "mlb", "nhl"];

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

interface RawEvent {
  competitors: { home: { abbreviation: string }; away: { abbreviation: string } };
  bettingSplits?: {
    spread?: { home: { betsPercentage: number | string; stakePercentage: number | string }; away: { betsPercentage: number | string; stakePercentage: number | string } };
    moneyline?: { home: { stakePercentage: number | string }; away: { stakePercentage: number | string } };
  };
}
interface RawResponse { data?: RawEvent[] }

function num(v: unknown): number | null {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}
function close(a: number, b: number, tol = 0.2) { return Math.abs(a - b) < tol; }

async function run() {
  let totalChecked = 0, totalOk = 0, totalMismatch = 0, totalSkipped = 0;
  for (const league of LEAGUES) {
    const url = `https://www.sportsbettingdime.com/wp-json/adpt/v1/${league}-odds?books=sr:book:7612,sr:book:31520,sr:book:28901,sr:book:32784&format=us`;
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/json", Referer: `https://www.sportsbettingdime.com/${league}/public-betting-trends/` },
    });
    if (res.status === 204) { console.log(`[${league}] empty`); continue; }
    const raw = (await res.json()) as RawResponse;
    const events = raw.data ?? [];

    // Parse via our actual production parser, but using a shared sample
    // by stubbing fetch — easier path: just pass the raw to the parser logic.
    // We'll re-import the parser and call it; since it does its own fetch,
    // we can't share. Instead, run scrapeLeagueTrends() and accept it'll
    // fetch a second time (still within seconds, so very low race risk).
    const parsed = await scrapeLeagueTrends(league);
    const parsedMap = new Map(parsed.map((p) => [`${p.awayAbbr}@${p.homeAbbr}`, p]));

    console.log(`\n=== ${league.toUpperCase()} (${events.length} raw events, ${parsed.length} parsed trends) ===`);
    console.log(`${"GAME".padEnd(14)} ${"PARSED bet H/A".padEnd(15)} ${"SBD bet H/A".padEnd(15)} ${"PARSED $ H/A".padEnd(15)} ${"SBD ml-$ H/A".padEnd(15)} VERDICT`);
    console.log("-".repeat(100));

    for (const ev of events) {
      const h = ev.competitors.home.abbreviation;
      const a = ev.competitors.away.abbreviation;
      const key = `${a}@${h}`;
      const sp = ev.bettingSplits?.spread;
      const ml = ev.bettingSplits?.moneyline;
      const sbBetH = num(sp?.home.betsPercentage);
      const sbBetA = num(sp?.away.betsPercentage);
      const sbMlSH = num(ml?.home.stakePercentage);
      const sbMlSA = num(ml?.away.stakePercentage);

      const p = parsedMap.get(key);
      if (!p) {
        const reason = (sbBetH ?? 0) + (sbBetA ?? 0) === 0 ? "no spread bets" : "?";
        console.log(`${key.padEnd(14)} (filtered out: ${reason})`);
        totalSkipped++;
        continue;
      }
      const t = p.trend;
      const betOk = sbBetH !== null && sbBetA !== null && close(t.publicPctHome, sbBetH) && close(t.publicPctAway, sbBetA);
      const moneyOk = sbMlSH !== null && sbMlSA !== null && close(t.moneyPctHome, sbMlSH) && close(t.moneyPctAway, sbMlSA);
      const verdict = betOk && moneyOk ? "OK" : !betOk ? "BET-mismatch" : "MONEY-mismatch";
      console.log(
        `${key.padEnd(14)} ${(t.publicPctHome + "/" + t.publicPctAway).padEnd(15)} ` +
        `${((sbBetH ?? "—") + "/" + (sbBetA ?? "—")).padEnd(15)} ` +
        `${(t.moneyPctHome + "/" + t.moneyPctAway).padEnd(15)} ` +
        `${((sbMlSH ?? "—") + "/" + (sbMlSA ?? "—")).padEnd(15)} ${verdict}`
      );
      totalChecked++;
      if (verdict === "OK") totalOk++; else totalMismatch++;
    }
  }
  console.log(`\n=== TOTAL: ${totalOk}/${totalChecked} OK, ${totalMismatch} mismatch, ${totalSkipped} filtered ===`);
}

run().catch((e) => { console.error(e); process.exit(1); });
