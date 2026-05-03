import type { Game } from "@/lib/types";
import { statusLabel } from "@/lib/calc";

export function StatusBadge({ game }: { game: Game }) {
  const label = statusLabel(game);
  const tone =
    label === "Public Winning" ? "bg-accent/15 text-accent border-accent/40" :
    label === "Vegas Winning"  ? "bg-danger/15 text-danger border-danger/40" :
    "bg-panel2 text-muted border-border";
  return <span className={`chip border ${tone}`}>{label}</span>;
}
