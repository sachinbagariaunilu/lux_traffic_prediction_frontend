import { longDate, weekdayName } from "@/lib/format";
import { RHYTHM } from "../data/landing-data";

/**
 * The picture on the Check 2025 card: one real day, the prediction over the
 * recorded truth, with the two lines NAMED underneath.
 *
 * It replaces /media/rhythm.svg, a pre-rendered file of the same day. That file
 * drew the recorded curve with a heavy orange area fill under it and carried no
 * legend at all, so the card showed one orange shape and a reader had no way to
 * tell which line was the model and which was the road -- which is the entire
 * claim the card is making. A picture whose subject is "these two lines nearly
 * coincide" cannot leave the two lines unlabelled.
 *
 * So: equal stroke weight on both, no area fill to tip the eye towards either,
 * and a legend that names them.
 *
 * THE LEGEND IS HTML, NOT SVG, and that is not a stylistic preference. Text
 * inside a viewBox scales with the drawing: the first pass set these labels at
 * 10.5 user units, which is a fair 10px on a 600px-wide card and 5.6px once the
 * cards stack on a phone -- too small to read, on the half of the traffic that
 * needs the legend most. Only the lines scale now; the words are a normal
 * `.label-mono` row and stay 10.5px at every width. It is the same split
 * HourlyChart uses in the app, for the same reason.
 *
 * The plate keeps `.media-bar`, so the card still has exactly one strip under
 * its picture -- the legend simply took the place of a bar that restated the
 * date range the spec list gives four lines further down.
 *
 * Server Component: renders to markup, reads the live palette tokens, ships no
 * JavaScript. The file it replaced had #d9541f baked in and could not have
 * followed the palette anywhere.
 */

const W = 640;
const H = 360;
const PAD = { t: 26, r: 24, b: 26, l: 24 };
const IW = W - PAD.l - PAD.r;
const IH = H - PAD.t - PAD.b;

function path(values: readonly number[], max: number) {
  return values
    .map((v, i) => {
      const x = PAD.l + (i / (values.length - 1)) * IW;
      const y = PAD.t + IH - (v / max) * IH;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join("");
}

export default function ScoredDayFigure({ note }: { note: string }) {
  const day = weekdayName(RHYTHM.date);
  const max =
    Math.max(...RHYTHM.actual, ...RHYTHM.predicted, ...RHYTHM.typical) * 1.08;

  const legend = [
    { label: "Our prediction", color: "var(--viz-series)", dashed: false },
    { label: "Really happened", color: "var(--viz-actual)", dashed: false },
    { label: `A usual ${day}`, color: "var(--viz-baseline)", dashed: true },
  ];

  return (
    <>
      <div className="media aspect-[16/9]">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={`Hourly traffic at ${RHYTHM.counter} on ${longDate(
            RHYTHM.date,
          )}: the model's predicted curve in blue and the recorded count in orange, tracking each other across 24 hours`}
        >
          <rect width={W} height={H} fill="var(--viz-surface)" />

          {/* Horizontal steps, and a guide at 06 / 12 / 18 so the shape reads
              as a day rather than as an abstract curve. No tick LABELS: at card
              size they would be the same unreadable 5.6px the legend was, and
              the strip below says what the axis is. */}
          {[0, 0.25, 0.5, 0.75, 1].map((f) => (
            <line
              key={f}
              x1={PAD.l}
              y1={PAD.t + IH * f}
              x2={W - PAD.r}
              y2={PAD.t + IH * f}
              stroke="var(--viz-grid)"
              strokeWidth="1"
            />
          ))}
          {[6, 12, 18].map((h) => (
            <line
              key={h}
              x1={PAD.l + (h / 24) * IW}
              y1={PAD.t}
              x2={PAD.l + (h / 24) * IW}
              y2={PAD.t + IH}
              stroke="var(--viz-grid)"
              strokeWidth="1"
            />
          ))}

          {/* Context first, so the two answers draw on top of it. */}
          <path
            d={path(RHYTHM.typical, max)}
            fill="none"
            stroke="var(--viz-baseline)"
            strokeWidth="2"
            strokeDasharray="7 5"
          />
          {/* Equal weight on both. The near-coincidence IS the claim, so
              neither line may be drawn as the important one. */}
          <path
            d={path(RHYTHM.actual, max)}
            fill="none"
            stroke="var(--viz-actual)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={path(RHYTHM.predicted, max)}
            fill="none"
            stroke="var(--viz-series)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="media-bar flex-wrap gap-y-2">
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {legend.map((l) => (
            <li key={l.label} className="label-mono flex items-center gap-1.5">
              <span
                className={l.dashed ? "w-3.5 border-t-2 border-dashed" : "h-0.5 w-3.5"}
                style={l.dashed ? { borderColor: l.color } : { background: l.color }}
                aria-hidden
              />
              <span style={l.dashed ? undefined : { color: l.color }}>{l.label}</span>
            </li>
          ))}
        </ul>
        {/* ml-auto as well as the bar's space-between: once the legend
            wraps on a narrow card, space-between has nothing left to push
            against and the note lands at the START of its own line. */}
        <span className="label-mono ml-auto">{note}</span>
      </div>
    </>
  );
}
