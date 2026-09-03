import { formatCount } from "@/lib/format";

/**
 * Turns the numbers into a sentence, so nobody has to decode the chart first.
 *
 * It compares against the truth where we have it and against the forecast
 * where we do not -- and says which it did, because "busier than usual" means
 * something different when it is a prediction.
 */
export default function ForecastVerdict({
  dayName,
  predicted,
  actual,
  typical,
  projection,
}: {
  dayName: string;
  predicted: number;
  actual: number | null;
  typical: number;
  /** Date past the recorded window -- unscoreable because it has not happened. */
  projection: boolean;
}) {
  const basis = actual ?? predicted;
  const vsUsual = typical > 0 ? (basis / typical - 1) * 100 : 0;
  const mood =
    vsUsual > 8 ? "busier than usual" : vsUsual < -8 ? "quieter than usual" : "about normal";

  const headline = actual
    ? `That ${dayName} was ${mood}.`
    : `We expect a ${mood === "about normal" ? "normal" : mood.replace(" than usual", "-than-usual")} ${dayName}.`;

  const errPct = actual && actual > 0 ? (predicted / actual - 1) * 100 : null;
  const accuracy =
    errPct === null
      ? null
      : Math.abs(errPct) < 2
        ? "and the forecast was within 2% of it"
        : `and the forecast ran ${Math.abs(errPct).toFixed(0)}% ${errPct > 0 ? "high" : "low"}`;

  return (
    <div className="relative overflow-hidden bg-[var(--viz-surface)] ring-1 ring-[var(--viz-border)]">
      <span className="lux-rule-y absolute inset-y-0 left-0 w-[3px]" aria-hidden />
      <div className="py-4 pl-5 pr-4">
        <p className="display-md">{headline}</p>
        <p className="mt-2.5 text-[12.5px] leading-relaxed text-[var(--viz-ink-2)]">
          {actual ? (
            <>
              The road actually saw{" "}
              <strong className="font-semibold text-[var(--viz-actual)]">
                {formatCount(actual)}
              </strong>{" "}
              vehicles, {accuracy} at{" "}
              <strong className="font-semibold text-[var(--viz-series)]">
                {formatCount(predicted)}
              </strong>
              .
            </>
          ) : (
            <>
              We predict{" "}
              <strong className="font-semibold text-[var(--viz-series)]">
                {formatCount(predicted)}
              </strong>{" "}
              vehicles.{" "}
              {projection
                ? "This date has not happened yet, so there is nothing to check it against."
                : "Nothing was recorded on this date, so there is no way to check it."}
            </>
          )}{" "}
          A usual {dayName} here sees about{" "}
          <strong className="font-semibold">{formatCount(typical)}</strong>.
        </p>
      </div>
    </div>
  );
}
