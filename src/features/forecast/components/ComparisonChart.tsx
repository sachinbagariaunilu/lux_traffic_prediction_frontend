"use client";

import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCount } from "@/lib/format";
import {
  CMP_COLORS,
  CMP_KINDS,
  toChartRows,
  type CmpKindKey,
  type ComparisonLine,
} from "../lib/comparison";

/**
 * Up to three days overlaid, each with the same three readings the main chart
 * shows -- recorded, predicted, and a usual day of that weekday.
 *
 * TWO CHANNELS, NOT ONE. The main chart can give each reading its own colour
 * because it only ever draws one day. Here colour is already carrying WHICH
 * DAY, so the reading moves to line style: solid prediction, dashed recorded,
 * dotted usual. Spending colour on both would need nine hues and the palette
 * has three.
 *
 * ONE Y AXIS, always. Every line is vehicles/hour on the same counter, so a
 * second scale would invent a difference that is not in the data.
 */

interface TipPayload {
  dataKey: string;
  value: number | null;
}

function CmpTooltip({
  active,
  payload,
  label,
  lines,
  shown,
}: {
  active?: boolean;
  payload?: TipPayload[];
  label?: number;
  lines: ComparisonLine[];
  shown: Set<CmpKindKey>;
}) {
  if (!active || !payload?.length) return null;
  const at = new Map(payload.map((p) => [p.dataKey, p.value]));
  return (
    <div className="ring-hairline bg-[var(--viz-surface)] px-3 py-2 text-[11px]">
      <div className="label-mono mb-1.5">{String(label).padStart(2, "0")}:00</div>
      {lines.map((l) => {
        const vals = CMP_KINDS.filter((k) => shown.has(k.key)).map((k) => ({
          label: k.label === "A usual day" ? `A usual ${l.weekday}` : k.label,
          v: at.get(`${k.prefix}${l.id}`),
        }));
        if (vals.every((x) => x.v == null)) return null;
        return (
          <div key={l.id} className="mt-1.5 first:mt-0">
            <div className="flex items-center gap-1.5 text-[var(--viz-ink-2)]">
              <span
                className="h-0.5 w-3 shrink-0 rounded-full"
                style={{ background: CMP_COLORS[l.slot] }}
              />
              {l.date} · dir {l.direction} · {l.vehicule}
            </div>
            {vals.map((x) => (
              <div key={x.label} className="flex justify-between gap-4 pl-4.5">
                <span className="text-[var(--viz-muted)]">{x.label}</span>
                <span className="tabular-nums text-[var(--viz-ink)]">
                  {x.v == null ? "—" : formatCount(x.v)}
                </span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

export default function ComparisonChart({
  lines,
  height = 260,
}: {
  lines: ComparisonLine[];
  height?: number;
}) {
  const [shown, setShown] = useState<Set<CmpKindKey>>(
    () => new Set(CMP_KINDS.filter((k) => k.on).map((k) => k.key)),
  );
  const rows = toChartRows(lines);

  function toggle(k: CmpKindKey) {
    setShown((prev) => {
      const next = new Set(prev);
      // Never let the last one off -- an empty chart is not a view state.
      if (next.has(k)) {
        if (next.size > 1) next.delete(k);
      } else next.add(k);
      return next;
    });
  }

  const hasData = (prefix: string) =>
    rows.some((r) => lines.some((l) => r[`${prefix}${l.id}`] != null));

  return (
    <figure className="viz-root m-0">
      {/* Identity is never colour alone: every day is named here and again in
          the table below, which doubles as the table view. */}
      <figcaption className="mb-2 flex flex-wrap items-center gap-1.5 text-[11px]">
        {lines.map((l) => (
          <span
            key={l.id}
            className="label-mono flex items-center gap-1.5 px-2 py-1.5"
            style={{
              background: `color-mix(in srgb, ${CMP_COLORS[l.slot]} 10%, transparent)`,
            }}
          >
            <span
              className="h-0.5 w-3.5 rounded-full"
              style={{ background: CMP_COLORS[l.slot] }}
            />
            {l.date} · {l.weekday} · dir {l.direction} · {l.vehicule}
          </span>
        ))}
      </figcaption>

      {/* The reading switches. Named exactly as the main chart names them, so
          the two charts can be read with one vocabulary. */}
      <div className="mb-3 flex flex-wrap items-center gap-1.5 text-[11px]">
        {CMP_KINDS.map((k) => {
          const on = shown.has(k.key);
          const empty = !hasData(k.prefix);
          return (
            <button
              key={k.key}
              type="button"
              onClick={() => toggle(k.key)}
              disabled={empty}
              aria-pressed={on}
              title={empty ? "Nothing recorded for these days" : undefined}
              className={`label-mono flex items-center gap-1.5 px-2 py-1.5 transition ${
                on
                  ? "bg-[var(--viz-ink)]/8 text-[var(--viz-ink)]"
                  : "text-[var(--viz-muted)] hover:text-[var(--viz-ink-2)]"
              } disabled:opacity-40`}
            >
              <span
                className="w-3.5 border-t-2 border-[var(--viz-ink-2)]"
                style={{
                  borderStyle: k.key === "p" ? "solid" : k.key === "a" ? "dashed" : "dotted",
                }}
              />
              {k.label}
            </button>
          );
        })}
      </div>

      <div style={{ height }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 8, right: 10, bottom: 4, left: 0 }}>
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
              content={<CmpTooltip lines={lines} shown={shown} />}
              cursor={{ stroke: "var(--viz-axis)", strokeWidth: 1 }}
            />

            {/* Context first, then truth, then the prediction on top -- the
                same stacking order the main chart uses. */}
            {CMP_KINDS.filter((k) => shown.has(k.key))
              .slice()
              .sort((a, b) => (a.key === "p" ? 1 : b.key === "p" ? -1 : 0))
              .flatMap((k) =>
                lines.map((l) => (
                  <Line
                    key={`${k.prefix}${l.id}`}
                    type="monotone"
                    dataKey={`${k.prefix}${l.id}`}
                    stroke={CMP_COLORS[l.slot]}
                    strokeWidth={2}
                    strokeDasharray={k.dash}
                    strokeOpacity={k.key === "t" ? 0.7 : 1}
                    dot={false}
                    activeDot={
                      k.key === "p"
                        ? { r: 4, strokeWidth: 2, stroke: "var(--viz-surface)" }
                        : false
                    }
                    connectNulls={false}
                    isAnimationActive={false}
                  />
                )),
              )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="label-mono mt-1 text-center">Hour of day</p>
    </figure>
  );
}
