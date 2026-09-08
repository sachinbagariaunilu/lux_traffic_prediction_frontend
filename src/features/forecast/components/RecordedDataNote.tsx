import type { RecordedRange } from "../hooks/useRecordedDays";

/**
 * Says, before anything is run, whether the chosen date can be scored at all.
 * Without it the only way to find out is to run a forecast and see the actual
 * line missing.
 *
 * Rendered ONLY on the page whose dates can be scored. It used to carry a third
 * "projection" state for 2026+ dates, because a 2025 day the counter skipped
 * and a day the road has not reached are entirely different things and one
 * sentence covering both makes the honest one look broken. That distinction is
 * now structural -- the two cases live on two pages -- so what is left here is
 * the one case this page has: a 2025 day, reported or missed.
 */
export default function RecordedDataNote({
  hasData,
  range,
}: {
  hasData: boolean;
  range: RecordedRange | null;
}) {
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
