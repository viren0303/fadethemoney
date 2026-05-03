import { scrapeLeagueTrends } from "../lib/sportsbettingdime";
import type { League } from "../lib/types";

const league = (process.argv[2] as League) ?? "nba";

scrapeLeagueTrends(league)
  .then((rows) => {
    console.log(JSON.stringify(rows, null, 2));
    console.log(`[scrape] ${league}: ${rows.length} matchups`);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
