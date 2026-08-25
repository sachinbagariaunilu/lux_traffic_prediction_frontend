/**
 * Says, before anything is run, whether the chosen date can be scored at all.
 * Without it the only way to find out is to run a forecast and see the actual
 * line missing.
 */
export default function RecordedDataNote({
  hasData,
  range,
}: {
  hasData: boolean;
  range: { first: string; last: string; n: number } | null;
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
