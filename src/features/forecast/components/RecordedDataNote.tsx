import type { RecordedRange } from "../hooks/useRecordedDays";

/**
 * Says, before anything is run, whether the chosen date can be scored at all.
 * Without it the only way to find out is to run a forecast and see the actual
 * line missing.
 *
 * Three states, because "no recorded data" covers two very different cases and
 * conflating them makes the honest one look broken. A 2025 day this counter
 * skipped is a gap in the data; a 2026 or 2027 day is a date the road has not
 * reached yet. Only the first is a shortcoming.
 */
export default function RecordedDataNote({
  hasData,
  projection,
  range,
}: {
  hasData: boolean;
  projection: boolean;
  range: RecordedRange | null;
}) {
  if (projection) {
    return (
      <p className="label-mono mt-2.5 flex items-start gap-1.5 leading-tight">
        <span
          className="mt-[3px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--viz-series)]"
          aria-hidden
        />
        <span className="text-[var(--viz-muted)]">
          Projection — this date has not happened, so nothing can score it
        </span>
      </p>
    );
  }

  return (
    <p className="label-mono mt-2.5 flex items-start gap-1.5 leading-tight">
      {hasData ? (
        <>
          <span
            className="mt-[3px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--viz-actual)]"
            aria-hidden
          />
          <span className="text-[var(--viz-actual)]">
            This counter reported on this day — the chart will show what the road
            actually did, next to the forecast
          </span>
        </>
      ) : (
        <>
          <span
            className="mt-[3px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--viz-axis)]"
            aria-hidden
          />
          <span className="text-[var(--viz-muted)]">
            {range
              ? `The counter did not report on this day — it recorded ${range.n} of the ` +
                `${range.spanDays} days between ${range.first} and ${range.last}, and ` +
                `missed this one. The forecast still stands; there is just nothing to ` +
                `check it against.`
              : "This counter recorded nothing in 2025, so no date here can be checked against it."}
          </span>
        </>
      )}
    </p>
  );
}
