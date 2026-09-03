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
  range: { first: string; last: string; n: number } | null;
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
            Recorded — the forecast can be scored
          </span>
        </>
      ) : (
        <>
          <span
            className="mt-[3px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--viz-axis)]"
            aria-hidden
          />
          <span className="text-[var(--viz-muted)]">
            No recorded data for this date
            {range && ` · this series covers ${range.first} → ${range.last}`}
          </span>
        </>
      )}
    </p>
  );
}
