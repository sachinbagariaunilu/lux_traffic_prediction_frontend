import { formatCount, formatHour } from "@/lib/format";
import type { MergedHour } from "@/lib/types";

/**
 * The chart's own numbers, for anyone who would rather read than eyeball.
 *
 * The Pred column is NOT hedged per row -- 24 rows each reading "about 1,240"
 * would be unreadable, and the tabular-nums alignment that makes the column
 * scannable would break. One footer line carries the hedge for the whole
 * column instead, which is also where a reader looks once rather than 24 times.
 */
export default function HourlyTable({
  hours,
  dayName,
}: {
  hours: MergedHour[];
  dayName: string;
}) {
  return (
    <div className="overflow-hidden bg-[var(--viz-surface)] ring-1 ring-[var(--viz-border)]">
      <table className="w-full text-[11px]">
        <thead>
          <tr className="label-mono border-b border-[var(--viz-grid)]">
            <th className="px-4 py-2.5 text-left font-normal">Hour</th>
            <th className="px-4 py-2.5 text-right font-normal">Real</th>
            <th className="px-4 py-2.5 text-right font-normal">Pred</th>
            <th className="px-4 py-2.5 text-right font-normal">
              Usual {dayName.slice(0, 3)}
            </th>
          </tr>
        </thead>
        <tbody>
          {hours.map((h) => (
            <tr key={h.hour} className="border-t border-[var(--viz-grid)] first:border-t-0">
              <td className="px-4 py-1.5 tabular-nums text-[var(--viz-muted)]">
                {formatHour(h.hour)}
              </td>
              <td className="px-4 py-1.5 text-right font-semibold tabular-nums text-[var(--viz-actual)]">
                {h.actual === null ? "—" : formatCount(h.actual)}
              </td>
              <td className="px-4 py-1.5 text-right font-semibold tabular-nums text-[var(--viz-ink)]">
                {formatCount(h.predicted)}
              </td>
              <td className="px-4 py-1.5 text-right tabular-nums text-[var(--viz-ink-2)]">
                {formatCount(h.typical_2024)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="border-t border-[var(--viz-grid)] px-4 py-2.5 text-[11px] leading-snug text-[var(--viz-muted)]">
        Pred and Usual are estimates, not counts. Real is what the counter recorded.
      </p>
    </div>
  );
}
