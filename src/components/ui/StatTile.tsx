/** One headline figure with its label and a line of context under it. */
export default function StatTile({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "actual" | "series";
}) {
  const accent =
    tone === "actual"
      ? "text-[var(--viz-actual)]"
      : tone === "series"
        ? "text-[var(--viz-series)]"
        : "text-[var(--viz-ink)]";
  return (
    <div className="bg-[var(--viz-surface)] px-4 py-3.5 ring-1 ring-[var(--viz-border)]">
      <div className="label-mono text-[9.5px]">{label}</div>
      <div
        className={`display-num mt-2 text-[24px] ${accent}`}
      >
        {value}
      </div>
      {sub && (
        <div className="mt-1.5 text-[10px] leading-tight text-[var(--viz-ink-2)]">{sub}</div>
      )}
    </div>
  );
}
