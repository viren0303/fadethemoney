# Fade The Money

A real-time dashboard that tracks whether public bettors are winning or Vegas is winning, across NBA and MLB.

## Stack
- Next.js 15 (App Router) · TypeScript · Tailwind CSS
- ESPN scoreboard (live scores) + SportsBettingDime (public betting trends)
- JSON-file storage in `/data` (no DB for MVP)
- Optional SMTP alerts when streaks ≥ 2

## Project layout
```
app/         routes (home dashboard, /about, /results, /api/*)
components/  UI building blocks (GameCard, StatusBadge, StreakBanner...)
lib/         data sources, calc, storage, mailer
scripts/     CLI updaters (update.ts, scrape.ts)
data/        JSON store (store.json)
```

## Local development
```bash
npm install
cp .env.example .env.local   # optional, for email alerts
npm run update-data          # one-time fetch into data/store.json
npm run dev
```
Open http://localhost:3000.

## Auto-refresh
- Local: `npm run update-data` on a cron (every 3–5 min)
- Vercel: `vercel.json` schedules `POST /api/refresh` every 5 min

Protect the endpoint by setting `REFRESH_TOKEN` and calling with `Authorization: Bearer <token>`.

## Adding a sport (NFL / NHL)
Add the league slug to `LEAGUES` in `scripts/update.ts` and `app/api/refresh/route.ts`. Endpoints already exist in `lib/espn.ts` and `lib/sportsbettingdime.ts`.

## Notes on scraping
SportsBettingDime markup changes occasionally. If trends stop populating, update the selectors in `lib/sportsbettingdime.ts` — the rest of the pipeline degrades gracefully (scores still show, lines blank).

## Deploy (Vercel)
```bash
vercel
```
Set env vars in the Vercel dashboard. The `crons` config triggers refresh automatically.
