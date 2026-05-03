import type { Game, Side } from "@/lib/types";
import { publicCovering } from "@/lib/calc";

function fmtSpread(n: number) {
  if (n === 0) return "PK";
  return n > 0 ? `+${n}` : `${n}`;
}

function timeLabel(g: Game) {
  if (g.status === "live") return g.period ?? "LIVE";
  if (g.status === "final") return g.period ?? "Final";
  return new Date(g.startTime).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function GameCard({ game }: { game: Game }) {
  const t = game.trend;
  const publicSide: Side | null = t?.pickedSide ?? null;
  const publicTeam = publicSide === "home" ? game.home : publicSide === "away" ? game.away : null;
  const publicSpreadValue = publicSide && t
    ? publicSide === "home" ? t.spread : -t.spread
    : null;
  const publicPct = publicSide && t
    ? publicSide === "home" ? t.publicPctHome : t.publicPctAway
    : null;
  const moneyPct = publicSide && t
    ? publicSide === "home" ? t.moneyPctHome : t.moneyPctAway
    : null;

  const covering = publicCovering(game);
  const isFinal = game.status === "final" && game.finalResult;

  return (
    <article className="card">
      <div className="card-header">
        <span className="league-pill">{game.league}</span>
        <span className={`game-status${game.status === "live" ? " live" : ""}`}>
          {timeLabel(game)}
        </span>
      </div>

      <TeamRow team={game.away} isPublic={publicSide === "away"} />
      <TeamRow team={game.home} isPublic={publicSide === "home"} />

      {publicTeam && t && publicSpreadValue !== null ? (
        <div className="public-block">
          <div className="public-side-row">
            <span className="public-side-tag">Public side</span>
            <span className="ou">O/U {t.total}</span>
          </div>
          <div className="public-team">
            <strong>{publicTeam.name}</strong>
            <span className="spread">{fmtSpread(publicSpreadValue)}</span>
          </div>
          <div className="pct-row">
            <div className="pct-cell">
              <span className="pct-label">Spread bets</span>
              <span className="pct-val">{publicPct}%</span>
            </div>
            <div className="pct-cell" title="Share of moneyline dollars on this team — the sharp-action signal">
              <span className="pct-label">$ on team</span>
              <span className="pct-val">{moneyPct}%</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="no-trend">No betting trend yet</div>
      )}

      <div className="card-footer">
        <span>{t ? `Spread ${fmtSpread(t.spread)} · Total ${t.total}` : "—"}</span>
        <ResultPill game={game} covering={covering} />
      </div>

      {isFinal && t && (
        <ResultLine game={game} />
      )}
    </article>
  );
}

function TeamRow({ team, isPublic }: { team: Game["home"]; isPublic: boolean }) {
  return (
    <div className="team-row">
      <span className="team-abbr">{team.abbr}</span>
      <span>
        <span className="team-name">{team.name}</span>
        {isPublic && <span className="pub-tag">Pub</span>}
      </span>
      <span className="team-score">{team.score ?? 0}</span>
    </div>
  );
}

function ResultPill({ game, covering }: { game: Game; covering: boolean | null }) {
  if (game.status === "scheduled") {
    return <span className="result-pill result-pending">Upcoming</span>;
  }
  if (game.status === "final" && game.finalResult) {
    const c = game.finalResult.publicCovered;
    if (c === true) return <span className="result-pill result-public">Public won</span>;
    if (c === false) return <span className="result-pill result-vegas">Vegas won</span>;
    return <span className="result-pill result-pending">Push</span>;
  }
  // live
  if (covering === true) return <span className="result-pill result-public">Public winning</span>;
  if (covering === false) return <span className="result-pill result-vegas">Vegas winning</span>;
  return <span className="result-pill result-pending">Push</span>;
}

function ResultLine({ game }: { game: Game }) {
  const r = game.finalResult!;
  const t = game.trend!;
  const covered = r.publicCovered;
  const totalText =
    r.totalGoOver === null
      ? `Total push ${t.total}`
      : `Total ${r.totalGoOver ? "OVER" : "UNDER"} ${t.total}`;
  if (covered === true) {
    return <div className="card-resultline public">✓ <em>Public covered</em> · {totalText}</div>;
  }
  if (covered === false) {
    return <div className="card-resultline">✗ <em>Public did not cover</em> · {totalText}</div>;
  }
  return <div className="card-resultline">— Push · {totalText}</div>;
}
