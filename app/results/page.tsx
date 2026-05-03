import { readStore } from "@/lib/storage";

export const dynamic = "force-dynamic";
export const metadata = { title: "Recent Results — Fade The Money" };

export default async function ResultsPage() {
  const store = await readStore();
  const last7 = store.history.slice(0, 7);

  return (
    <div className="container" style={{ padding: "56px 32px" }}>
      <div className="section-h">Recent results</div>
      <h1 className="serif" style={{ fontSize: 44, fontWeight: 400, letterSpacing: "-0.022em", marginBottom: 12 }}>
        Last 7 days,<br />
        <em>public vs Vegas.</em>
      </h1>
      <p style={{ color: "var(--text-secondary)", fontSize: 15, marginBottom: 36, maxWidth: 560 }}>
        Daily ledger of how the public&apos;s bets fared against the spread.
      </p>

      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        overflow: "hidden",
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-mono)", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "var(--bg-section)", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.12em", fontSize: 11 }}>
              <th style={{ textAlign: "left", padding: "14px 18px" }}>Date</th>
              <th style={{ textAlign: "right", padding: "14px 18px" }}>Public</th>
              <th style={{ textAlign: "right", padding: "14px 18px" }}>Vegas</th>
              <th style={{ textAlign: "right", padding: "14px 18px" }}>Push</th>
              <th style={{ textAlign: "right", padding: "14px 18px" }}>Winner</th>
            </tr>
          </thead>
          <tbody>
            {last7.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>No history yet.</td></tr>
            )}
            {last7.map((d) => {
              const winner =
                d.publicWins === d.vegasWins ? "—" :
                d.publicWins > d.vegasWins ? "Public" : "Vegas";
              const winnerColor =
                winner === "Public" ? "var(--public-text)" :
                winner === "Vegas" ? "var(--vegas-text)" : "var(--text-muted)";
              return (
                <tr key={d.date} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={{ padding: "14px 18px", color: "var(--text)" }}>{d.date}</td>
                  <td style={{ padding: "14px 18px", textAlign: "right", color: "var(--public-text)", fontWeight: 500 }}>{d.publicWins}</td>
                  <td style={{ padding: "14px 18px", textAlign: "right", color: "var(--vegas-text)", fontWeight: 500 }}>{d.vegasWins}</td>
                  <td style={{ padding: "14px 18px", textAlign: "right", color: "var(--text-muted)" }}>{d.pushes}</td>
                  <td style={{ padding: "14px 18px", textAlign: "right", color: winnerColor, fontWeight: 500 }}>{winner}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
