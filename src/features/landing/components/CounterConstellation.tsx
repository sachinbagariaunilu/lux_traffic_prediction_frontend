import { COUNTERS, LUX_OUTLINE, VIEW } from "../data/landing-data";

/**
 * NOTE the count here is 270 while the rest of the site says 269, and that is
 * correct rather than a typo. 270 counters exist in the 2024 network and this
 * draws all their true positions. The API serves 269, because counter 474
 * recorded nothing in 2025 and so has no actuals to be scored against -- see
 * the backend's COUNTER_MANIFEST.md. Product copy states what is SERVED; this
 * graphic states what EXISTS.
 *
 * The signature graphic: Luxembourg's border with the 270 real 2024 counters
 * plotted inside it. Border and dots share one projection, so each point sits
 * exactly where that counter physically stands -- this is the dataset drawing
 * itself, not an illustration of it.
 *
 * Dot radius follows sqrt(weight) so area, not radius, tracks traffic.
 *
 * No hooks and no handlers, so this stays a Server Component: the border path
 * and all 270 positions render to HTML once and never ship as JavaScript. The
 * draw-in is CSS (.cc-outline / .cc-dots), not JS.
 */
export default function CounterConstellation({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
      className={className}
      role="img"
      aria-label="Map of Luxembourg showing the positions of the traffic counter network"
    >
      <defs>
        <linearGradient id="cc-fill" x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="var(--viz-series)" stopOpacity="0.14" />
          <stop offset="100%" stopColor="var(--viz-actual)" stopOpacity="0.09" />
        </linearGradient>
        <linearGradient id="cc-stroke" x1="0" y1="0" x2="0.7" y2="1">
          <stop offset="0%" stopColor="var(--viz-series)" />
          <stop offset="100%" stopColor="var(--viz-actual)" />
        </linearGradient>
      </defs>

      {/* Border draws itself, then the counters arrive. */}
      <path
        d={LUX_OUTLINE}
        pathLength={1}
        fill="url(#cc-fill)"
        stroke="url(#cc-stroke)"
        strokeWidth="1.4"
        strokeLinejoin="round"
        className="cc-outline"
      />

      <g className="cc-dots">
        {COUNTERS.map(([x, y, w], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={1.4 + 3.6 * Math.sqrt(w)}
            fill={w > 0.34 ? "var(--viz-actual)" : "var(--viz-series)"}
            opacity={0.45 + 0.5 * Math.sqrt(w)}
            style={{ animationDelay: `${400 + (i % 45) * 26}ms` }}
          />
        ))}
      </g>
    </svg>
  );
}
