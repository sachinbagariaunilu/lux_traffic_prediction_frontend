/**
 * The one spinner. `tone="on-accent"` is for the filled accent button, where a
 * token-coloured ring would disappear into the gradient.
 */
export default function Spinner({
  size = 16,
  tone = "muted",
}: {
  size?: number;
  tone?: "muted" | "on-accent";
}) {
  return (
    <span
      role="status"
      aria-label="Loading"
      style={{ width: size, height: size }}
      className={`inline-block shrink-0 animate-spin rounded-full border-2 ${
        tone === "on-accent"
          ? "border-white/40 border-t-white"
          : "border-[var(--viz-axis)] border-t-[var(--viz-series)]"
      }`}
    />
  );
}
