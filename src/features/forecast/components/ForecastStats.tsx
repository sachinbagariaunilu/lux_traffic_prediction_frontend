import StatTile from "@/components/ui/StatTile";
import { formatCount, formatHour, formatSignedPercent } from "@/lib/format";
import type { DaySummary } from "../lib/hourly";

/** The four figures worth reading before the chart. */
export default function ForecastStats({ summary }: { summary: DaySummary }) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      <StatTile
        label="We predicted"
        value={formatCount(summary.predictedTotal)}
        sub="vehicles all day"
        tone="series"
      />
      <StatTile
        label="Really happened"
        value={summary.actualTotal === null ? "—" : formatCount(summary.actualTotal)}
        sub={
          summary.actualTotal === null
            ? "not recorded"
            : summary.complete
              ? "vehicles all day"
              : "partial day only"
        }
        tone="actual"
      />
      <StatTile
        label="How close we were"
        value={summary.dayError === null ? "—" : formatSignedPercent(summary.dayError)}
        sub={
          summary.mae === null
            ? "nothing to check against"
            : `off by ${formatCount(summary.mae)}/h on average`
        }
      />
      <StatTile
        label="Busiest hour"
        value={formatHour(summary.peak.hour)}
        sub={`${formatCount(summary.peak.predicted)} vehicles/h`}
      />
    </div>
  );
}
