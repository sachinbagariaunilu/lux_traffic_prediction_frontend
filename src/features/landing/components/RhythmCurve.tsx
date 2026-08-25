import { RHYTHM } from "../data/landing-data";

/**
 * One real day at counter 1410, drawn as the page's second signature graphic.
 * The prediction and the recorded truth almost overlap -- that near-coincidence
 * IS the story, so the lines are drawn at the same weight and left to speak.
 *
 * Hand-rolled SVG rather than a chart library: this is a static hero graphic,
 * and shipping a charting runtime for 24 points would be indefensible.
 *
 * Server-rendered for the same reason as CounterConstellation -- the path
 * maths runs on the server and the client receives markup.
 */

const W = 900;
const H = 260;
const PAD = { t: 18, r: 16, b: 26, l: 16 };

function line(values: readonly number[], max: number) {
  const iw = W - PAD.l - PAD.r;
  const ih = H - PAD.t - PAD.b;
  return values
    .map((v, i) => {
      const x = PAD.l + (i / (values.length - 1)) * iw;
      const y = PAD.t + ih - (v / max) * ih;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join("");
}

export default function RhythmCurve({ className = "" }: { className?: string }) {
  const max = Math.max(...RHYTHM.actual, ...RHYTHM.predicted, ...RHYTHM.typical) * 1.08;
  const area =
    line(RHYTHM.actual, max) +
    `L${W - PAD.r},${H - PAD.b}L${PAD.l},${H - PAD.b}Z`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={className}
      role="img"
      aria-label={`Hourly traffic at ${RHYTHM.counter} on ${RHYTHM.date}: prediction and recorded counts, nearly identical`}
    >
      <defs>
        <linearGradient id="rc-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--viz-actual)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--viz-actual)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Midnight / 06 / 12 / 18 / 24 guides */}
      {[0, 6, 12, 18, 24].map((h) => {
        const x = PAD.l + (h / 24) * (W - PAD.l - PAD.r);
        return (
          <g key={h}>
            <line
              x1={x}
              y1={PAD.t}
              x2={x}
              y2={H - PAD.b}
              stroke="var(--viz-grid)"
              strokeWidth="1"
            />
            <text
              x={x}
              y={H - 8}
              textAnchor="middle"
              fontSize="10"
              fill="var(--viz-muted)"
            >
              {String(h).padStart(2, "0")}
            </text>
          </g>
        );
      })}

      <path d={area} fill="url(#rc-area)" className="rc-area" />

      <path
        d={line(RHYTHM.typical, max)}
        fill="none"
        stroke="var(--viz-baseline)"
        strokeWidth="1.6"
        strokeDasharray="5 4"
        pathLength={1}
        className="rc-typical"
      />
      <path
        d={line(RHYTHM.actual, max)}
        fill="none"
        stroke="var(--viz-actual)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        className="rc-line rc-actual"
      />
      <path
        d={line(RHYTHM.predicted, max)}
        fill="none"
        stroke="var(--viz-series)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        className="rc-line rc-pred"
      />
    </svg>
  );
}
