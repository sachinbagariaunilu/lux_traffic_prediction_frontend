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
 *
 * The drawer used to open with a paragraph restating the visible one in other
 * words -- what the model reads from the calendar, and what it does not know.
 * Its one load-bearing sentence ("read it as a Tuesday like this one, as busy
 * as 2024-2025 was") is now IN the visible text, where it turns the claim into
 * an instruction, and the rest went. A drawer whose first paragraph repeats the
 * paragraph above it teaches the reader that opening it is not worth doing.
 */
/**
 * HIDDEN 2026-09-16, at the user's request, "for now". Flip to true to restore;
 * nothing else has to change and no markup was deleted.
 *
 * Annotated `: boolean` on purpose -- as a bare `false` TypeScript narrows it to
 * the literal type and reads everything below as unreachable.
 *
 * WHAT IS SWITCHED OFF, so the decision can be re-taken with it in view: this
 * block is the only place the page says the forecast sits at the model's
 * TRAINED volumes with no growth added. Without it a reader sees a 2026 number
 * with nothing indicating it runs ~0.5% low, and the drawer's two measured
 * caveats -- the 0-1% growth range, and the 11.4%/-3.3% sensor check -- have no
 * other home in the UI. The verdict above still says the day cannot be scored,
 * so the "nothing to compare against" fact survives; the LEVEL fact does not.
 *
 * Only the projection branch is gated. The other branch -- a past date the
 * counter failed to report -- is a different message about a different
 * situation and still renders.
 */
const SHOW_PROJECTION_NOTE: boolean = false;

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
        This counter recorded nothing on {date}, so there is no real count to compare
        the forecast with. The forecast itself is unaffected.
      </p>
    );
  }

  if (!SHOW_PROJECTION_NOTE) return null;

  return (
    <div className="space-y-2">
      <p className="bg-[var(--viz-surface)] px-4 py-3 text-[11.5px] leading-relaxed text-[var(--viz-ink-2)] ring-1 ring-[var(--viz-border)]">
        <strong className="font-semibold text-[var(--viz-ink)]">
          This day hasn&apos;t happened yet,
        </strong>{" "}
        so there is nothing to check the forecast against. We take how busy this
        counter was in {product.levelLabel} and apply the {year} calendar — the day
        of the week, and the holidays. So read it as: a {dayName} like this one, as
        busy as {product.levelLabel} was.
        {shortfall && (
          <>
            {" "}
            Traffic grows a little each year and we do not add that on, so the
            real count is probably about{" "}
            <strong className="font-semibold text-[var(--viz-ink)]">
              {shortfall.central}% higher
            </strong>{" "}
            than this.
          </>
        )}
      </p>

      <Disclosure label="How much could it be off?">
        <div className="space-y-2.5 bg-[var(--viz-surface)] px-4 py-3.5 text-[11.5px] leading-relaxed text-[var(--viz-ink-2)] ring-1 ring-[var(--viz-border)]">
          {shortfall && (
            <p>
              We could only measure two years of growth and they disagreed, so by{" "}
              {year} anything from 0% to {shortfall.high}% fits —{" "}
              <strong className="font-semibold text-[var(--viz-ink)]">
                {shortfall.central}%
              </strong>{" "}
              is the middle. For a single hour that is a vehicle or two, too small to
              matter. Across a whole year and every counter it adds up instead of
              cancelling out, so add it back for big totals, not for the numbers on
              this page.
            </p>
          )}

          {/* Named sample in the same sentence as the number: it is three
              counters over two months, not a network figure, and it will be
              read as one the moment the two are separated. */}
          {product.measured && (
            <p>
              We did test it against real traffic it had never seen —{" "}
              {product.measured.where}. In a typical hour it was out by{" "}
              <strong className="font-semibold text-[var(--viz-ink)]">
                {product.measured.errPct}%
              </strong>
              , and it counted {Math.abs(product.measured.shortfallPct)}% fewer
              vehicles than the road really saw. That is three counters over two
              months, not the whole network.
            </p>
          )}
        </div>
      </Disclosure>
    </div>
  );
}
