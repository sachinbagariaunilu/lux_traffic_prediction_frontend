import Disclosure from "@/components/ui/Disclosure";
import { levelShortfall } from "../lib/constants";
import type { Product } from "../lib/products";

/**
 * Why this forecast has no line to be scored against -- one sentence, with the
 * reasoning behind a dropdown.
 *
 * This block used to be a single ~150-word paragraph, always open, stacking
 * three separate arguments: what a projection is, how much traffic has grown
 * since, and what the sensor comparison measured. All three are true and worth
 * keeping. None of them is what a reader wants in the two seconds after a chart
 * appears, and the first of them merely repeated the verdict directly above it.
 *
 * So the claim stays visible and the argument moves behind a disclosure. The
 * test applied: if a sentence would change what a reader DOES with the number,
 * it is visible; if it explains why the number is what it is, it is in the
 * drawer.
 */
export default function ProjectionNote({
  product,
  date,
  dayName,
  /** False when the counter simply did not report -- a different situation. */
  projection,
}: {
  product: Product;
  date: string;
  dayName: string;
  projection: boolean;
}) {
  const year = date.slice(0, 4);
  const shortfall = levelShortfall(Number(year), product.levelYear);

  // Not a projection: a past date the counter failed to report. Two short
  // sentences and nothing to expand -- there is no argument here, just a gap.
  if (!projection) {
    return (
      <p className="bg-[var(--viz-surface)] px-4 py-3 text-[11.5px] leading-relaxed text-[var(--viz-ink-2)] ring-1 ring-[var(--viz-border)]">
        This counter did not report on {date}, so there is nothing to score the forecast
        against. The forecast itself still stands.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="bg-[var(--viz-surface)] px-4 py-3 text-[11.5px] leading-relaxed text-[var(--viz-ink-2)] ring-1 ring-[var(--viz-border)]">
        <strong className="font-semibold text-[var(--viz-ink)]">Projection.</strong>{" "}
        Built from this counter&apos;s {product.levelLabel} traffic levels, applied to the{" "}
        {year} calendar.
        {shortfall && (
          <>
            {" "}
            Likely <strong className="font-semibold text-[var(--viz-ink)]">
              {shortfall.central}% low
            </strong>{" "}
            for {year}.
          </>
        )}
      </p>

      <Disclosure label="What this figure assumes">
        <div className="space-y-2.5 bg-[var(--viz-surface)] px-4 py-3.5 text-[11.5px] leading-relaxed text-[var(--viz-ink-2)] ring-1 ring-[var(--viz-border)]">
          <p>
            The model reads the {year} calendar — weekday, public and school holidays,
            distance to the nearest one — but its traffic volumes are this
            counter&apos;s {product.levelLabel} volumes. There is no trend term, so read
            it as “a {dayName} like this, at {product.levelLabel} volumes”.
          </p>

          {shortfall && (
            <p>
              Traffic has grown since — roughly{" "}
              <strong className="font-semibold text-[var(--viz-ink)]">
                {shortfall.central}%
              </strong>{" "}
              by {year}, though the two years we could measure disagreed enough that
              anything from 0% to {shortfall.high}% fits the data. On a single hour
              that gap is noise; summed over a network-year it never cancels, so add it
              back for totals, not for the figures on this page.
            </p>
          )}

          {/* Named sample in the same sentence as the number: it is three
              counters over two months, not a network figure, and it will be
              read as one the moment the two are separated. */}
          {product.measured && (
            <p>
              Checked against traffic no model had seen — {product.measured.where} — it
              was out by{" "}
              <strong className="font-semibold text-[var(--viz-ink)]">
                {product.measured.errPct}%
              </strong>{" "}
              an hour and ran {Math.abs(product.measured.shortfallPct)}% below what the
              road recorded. Three counters over two months, not the whole network.
            </p>
          )}
        </div>
      </Disclosure>
    </div>
  );
}
