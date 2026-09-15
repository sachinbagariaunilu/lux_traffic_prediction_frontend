"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCount, formatHour, formatSignedPercent } from "@/lib/format";
import type { MergedHour } from "@/lib/types";

/**
 * Three series, and they do different jobs:
 *   actual       -- the truth, when the day was recorded (slot 2, solid)
 *   predicted    -- what the model said (slot 1, solid)
 *   typical_2024 -- context, the 2024 norm for this weekday+hour (gray, dashed)
 *
 * Dashing the baseline keeps identity off colour alone. Palette validated
 * all-pairs in both modes: worst CVD dE 9.8 light / 11.3 dark.
 */

interface TooltipProps {
  active?: boolean;
  payload?: { payload: MergedHour }[];
  /** e.g. "Sunday" -- so the baseline reads "Usual Sunday", not "typical_2024". */
  dayName?: string;
}

function ChartTooltip({ active, payload, dayName }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  const err = p.actual !== null ? p.predicted - p.actual : null;
  // The same miss means very different things at different volumes: 73 vehicles
  // is a rounding error at 2,000/h and a doubling at 70/h. The percentage is
  // what makes the tooltip comparable across hours and across counters.
  //
  // WITHHELD below 10 recorded vehicles, and that is not a rare edge: 8.65% of
  // all recorded hours are exactly ZERO, which has no denominator at all, and
  // just above zero the figure explodes -- 5 predicted against 2 recorded is
  // "+150%", which reads as a catastrophic miss of three vehicles. The absolute
  // count is the honest statement down there, so only it is shown.
  //
  // SIGNED, and the sign is the same convention as the "How close we were"
  // tile: positive means the model predicted ABOVE what the road recorded.
  // Both derive from (predicted - actual), so a reader who sees -4.4% here and
  // -5% there is looking at the same direction of miss, hour and day.
  const errPct =
    p.actual !== null && p.actual >= 10 ? (err! / p.actual) * 100 : null;

  return (
    <div className="glass-strong ring-hairline-lg min-w-[172px] px-3.5 py-3">
      <div className="label-mono mb-2.5 text-[var(--viz-ink)]">
        {formatHour(p.hour)}–{formatHour((p.hour + 1) % 24)}
      </div>
      <dl className="space-y-1 text-xs">
        {p.actual !== null && (
          <div className="flex items-center gap-2">
            <span className="h-0.5 w-4 rounded-full bg-[var(--viz-actual)]" />
            <dt className="text-[var(--viz-ink-2)]">Actual</dt>
            <dd className="ml-auto font-semibold tabular-nums text-[var(--viz-ink)]">
              {formatCount(p.actual)}
            </dd>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="h-0.5 w-4 rounded-full bg-[var(--viz-series)]" />
          <dt className="text-[var(--viz-ink-2)]">Predicted</dt>
          <dd className="ml-auto font-semibold tabular-nums text-[var(--viz-ink)]">
            {formatCount(p.predicted)}
          </dd>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 border-t-2 border-dashed border-[var(--viz-baseline)]" />
          <dt className="text-[var(--viz-ink-2)]">
            Usual {dayName ?? "day"}
          </dt>
          <dd className="ml-auto tabular-nums text-[var(--viz-ink-2)]">
            {formatCount(p.typical_2024)}
          </dd>
        </div>
      </dl>
      {err !== null && (
        <div className="mt-1.5 flex items-baseline gap-1.5 border-t border-[var(--viz-grid)] pt-1.5 text-xs text-[var(--viz-ink-2)]">
          <span>
            Model was{" "}
            {err === 0
              ? "exact"
              : `${formatCount(Math.abs(err))} ${err > 0 ? "high" : "low"}`}
          </span>
          {errPct !== null && err !== 0 && (
            <span className="ml-auto font-semibold tabular-nums text-[var(--viz-ink)]">
              {/* One decimal, and no special case for tiny values: a "+0.0%"
                  cannot be misread as exact when the words beside it already
                  say "Model was 1 high". */}
              {formatSignedPercent(errPct, 1)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default function HourlyChart({
  hourly,
  dayName,
}: {
  hourly: MergedHour[];
  dayName: string;
}) {
  const hasActual = hourly.some((h) => h.actual !== null);

  return (
    <figure className="viz-root m-0">
      <figcaption className="mb-4 flex flex-wrap items-center gap-1.5 text-[11px]">
        {hasActual && (
          <span className="label-mono flex items-center gap-1.5 bg-[var(--viz-actual)]/10 px-2 py-1.5 text-[var(--viz-actual)]">
            <span className="h-0.5 w-3.5 rounded-full bg-[var(--viz-actual)]" />
            Really happened
          </span>
        )}
        <span className="label-mono flex items-center gap-1.5 bg-[var(--viz-series)]/10 px-2 py-1.5 text-[var(--viz-series)]">
          <span className="h-0.5 w-3.5 rounded-full bg-[var(--viz-series)]" />
          Our prediction
        </span>
        <span className="label-mono flex items-center gap-1.5 bg-[var(--viz-ink)]/5 px-2 py-1.5">
          <span className="w-3.5 border-t-2 border-dashed border-[var(--viz-baseline)]" />
          A usual {dayName || "day"}
        </span>
      </figcaption>

      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={hourly} margin={{ top: 8, right: 10, bottom: 4, left: 0 }}>
            <CartesianGrid stroke="var(--viz-grid)" vertical={false} />
            <XAxis
              dataKey="hour"
              tickFormatter={(h: number) => String(h).padStart(2, "0")}
              ticks={[0, 4, 8, 12, 16, 20, 23]}
              tick={{ fill: "var(--viz-muted)", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "var(--viz-axis)" }}
            />
            <YAxis
              tick={{ fill: "var(--viz-muted)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={44}
              tickFormatter={(v: number) =>
                v >= 1000 ? `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k` : String(v)
              }
            />
            <Tooltip
              content={<ChartTooltip dayName={dayName} />}
              cursor={{ stroke: "var(--viz-axis)", strokeWidth: 1 }}
            />

            {/* Context first, so the two real answers draw on top of it. */}
            <Line
              type="monotone"
              dataKey="typical_2024"
              stroke="var(--viz-baseline)"
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={false}
              activeDot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="var(--viz-series)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--viz-surface)" }}
              isAnimationActive={false}
            />
            {hasActual && (
              <Line
                type="monotone"
                dataKey="actual"
                stroke="var(--viz-actual)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--viz-surface)" }}
                connectNulls={false}
                isAnimationActive={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="label-mono mt-1 text-center">Hour of day</p>
    </figure>
  );
}
