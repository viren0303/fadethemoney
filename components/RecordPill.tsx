export function RecordPill({
  publicWins, vegasWins, pushes,
}: { publicWins: number; vegasWins: number; pushes: number }) {
  return (
    <div className="panel px-4 py-2 flex items-center gap-4 text-sm">
      <span className="text-xs uppercase text-muted">Today</span>
      <span><span className="text-accent font-semibold">{publicWins}</span> Public</span>
      <span className="text-muted">·</span>
      <span><span className="text-danger font-semibold">{vegasWins}</span> Vegas</span>
      {pushes > 0 && <>
        <span className="text-muted">·</span>
        <span className="text-muted">{pushes} push</span>
      </>}
    </div>
  );
}
