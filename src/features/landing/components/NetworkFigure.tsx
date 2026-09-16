import { FORECAST_2026 } from "@/features/forecast/lib/products";
import { COUNTERS, LUX_OUTLINE } from "../data/landing-data";

/**
 * The picture on the Forecast 2026-28 card: the country, every counter on it,
 * and the years the page answers for.
 *
 * It replaces /media/scan.svg -- a near-black render of one day's shape
 * repeated down the network. That picture showed the forecast and nothing else:
 * an abstract of a curve, on a card whose job is to tell you what you get if
 * you click it. It could not say WHERE the forecast applies, how much of the
 * country it covers, or that the counters differ from each other at all.
 *
 * A map answers all three at once, and it answers them with the project's own
 * coordinates rather than an illustration of them: the border and all 270
 * positions come from the same projection the hero constellation uses, so every
 * dot stands where that counter physically stands. Dot AREA tracks traffic
 * volume -- radius would exaggerate the motorways by squaring them -- which
 * turns the map into a second reading: the ring of heavy counters round the
 * capital and the Belgian and French crossings.
 *
 * ONLY DISPLAY TYPE LIVES IN THE SVG. Text inside a viewBox scales with the
 * drawing, so a 10.5-unit mono label that reads fine on a 600px card collapses
 * to 5.6px once the cards stack on a phone. Two lines of 34-unit display type
 * survive that (31px desktop, 18px phone); everything small -- the dot key, the
 * model label -- is HTML in the strip below, at a fixed 10.5px. Same split as
 * ScoredDayFigure, and as HourlyChart in the app.
 *
 * NOTE this draws the 270 counters the shared dataset holds positions for. The
 * forecasting model serves 273: 607 Marnach, 1414 France Frontiere and 1444
 * Schifflange started reporting during 2025. The strip below says "270 plotted"
 * rather than quoting a network total, so it cannot contradict the 273 the
 * card's own spec list gives from the product data.
 *
 * Server Component, inline SVG: renders to markup, reads the live tokens, and
 * ships no JavaScript.
 */

const W = 640;
const H = 360;

/** The box on the plate the country is fitted into. */
const BOX = { x: 28, y: 26, w: 330, h: 308 };

/**
 * FIT TO THE COUNTRY, NOT TO THE PROJECTION.
 *
 * The shared projection is 300x420 and the border only occupies x 10-290,
 * y 80-339 inside it -- it carries a wide margin because it was laid out for a
 * tall hero column. Scaling by its height, which is the obvious thing to do,
 * therefore spends 38% of a landscape plate on empty space and leaves the
 * country stranded in the middle of it, which is exactly what the first pass of
 * this figure did.
 *
 * So the bounds are measured off the path itself. Every number in LUX_OUTLINE
 * is a coordinate -- it is all M/L commands and a closing Z -- so reading the
 * pairs out gives the true extent, and the counters are folded in as well in
 * case any sits outside the simplified border. Module scope: this runs once, on
 * the server, at build.
 */
const NUMS = LUX_OUTLINE.match(/-?\d+(?:\.\d+)?/g)!.map(Number);
const XS = NUMS.filter((_, i) => i % 2 === 0).concat(COUNTERS.map((c) => c[0]));
const YS = NUMS.filter((_, i) => i % 2 === 1).concat(COUNTERS.map((c) => c[1]));
const MIN_X = Math.min(...XS);
const MIN_Y = Math.min(...YS);
const SPAN_X = Math.max(...XS) - MIN_X;
const SPAN_Y = Math.max(...YS) - MIN_Y;
const S = Math.min(BOX.w / SPAN_X, BOX.h / SPAN_Y);
/** Centred in whichever axis had the slack. */
const OX = BOX.x + (BOX.w - SPAN_X * S) / 2 - MIN_X * S;
const OY = BOX.y + (BOX.h - SPAN_Y * S) / 2 - MIN_Y * S;

/**
 * Dot radii are computed in FINAL user units rather than inherited from a
 * scaled <g>. Inside the group they would be multiplied by S as well, which at
 * this size left the busiest counter under 3px across -- a map whose marks are
 * too small to compare is just a silhouette.
 */
function radius(weight: number) {
  return 1.8 + 5.2 * Math.sqrt(weight);
}

/** The colour split is the constellation's: heavy counters take the truth hue. */
function tone(weight: number) {
  return weight > 0.34 ? "var(--viz-actual)" : "var(--viz-series)";
}

/** Where the display lines sit, clear of the map. */
const COL = 392;

export default function NetworkFigure({ note }: { note: string }) {
  return (
    <>
      <div className="media aspect-[16/9]">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label="Map of Luxembourg with every traffic counter the forecasting model covers plotted at its true position, each drawn at a size that tracks how much traffic it carries"
        >
          <rect width={W} height={H} fill="var(--viz-surface)" />

          <defs>
            <linearGradient id="nf-fill" x1="0" y1="0" x2="0.6" y2="1">
              <stop offset="0%" stopColor="var(--viz-series)" stopOpacity="0.10" />
              <stop offset="100%" stopColor="var(--viz-actual)" stopOpacity="0.07" />
            </linearGradient>
            <linearGradient id="nf-stroke" x1="0" y1="0" x2="0.7" y2="1">
              <stop offset="0%" stopColor="var(--viz-series)" />
              <stop offset="100%" stopColor="var(--viz-actual)" />
            </linearGradient>
          </defs>

          {/* ---- the country ------------------------------------------------ */}
          <g transform={`translate(${OX} ${OY}) scale(${S})`}>
            <path
              d={LUX_OUTLINE}
              fill="url(#nf-fill)"
              stroke="url(#nf-stroke)"
              strokeWidth="1.5"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </g>

          {/* ---- the counters, at true positions ---------------------------- */}
          <g>
            {COUNTERS.map(([x, y, w], i) => (
              <circle
                key={i}
                cx={OX + x * S}
                cy={OY + y * S}
                r={radius(w)}
                fill={tone(w)}
                opacity={0.42 + 0.5 * Math.sqrt(w)}
              />
            ))}
          </g>

          {/* ---- what the page answers, in display type --------------------- */}
          <text
            x={COL}
            y={148}
            fontSize="34"
            fontWeight="500"
            fill="var(--viz-ink)"
            className="font-[family-name:var(--font-grotesk)]"
          >
            EVERY HOUR
          </text>
          <line
            x1={COL}
            y1={172}
            x2={W - 28}
            y2={172}
            stroke="var(--viz-hairline)"
            strokeWidth="1"
          />
          <text
            x={COL}
            y={222}
            fontSize="34"
            fontWeight="500"
            fill="var(--viz-ink)"
            className="font-[family-name:var(--font-grotesk)]"
          >
            {/* From the product, never typed twice: the card's spec list quotes
                the same field, and the two must not be able to drift apart. */}
            {FORECAST_2026.dateLabel.toUpperCase()}
          </text>
        </svg>
      </div>

      <div className="media-bar flex-wrap gap-y-2">
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          <li className="label-mono flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[var(--viz-actual)]" aria-hidden />
            Busiest
          </li>
          <li className="label-mono flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-[var(--viz-series)]" aria-hidden />
            Quiet
          </li>
          <li className="label-mono">270 plotted · dot size = volume</li>
        </ul>
        {/* ml-auto as well as the bar's space-between: once the legend
            wraps on a narrow card, space-between has nothing left to push
            against and the note lands at the START of its own line. */}
        <span className="label-mono ml-auto">{note}</span>
      </div>
    </>
  );
}
