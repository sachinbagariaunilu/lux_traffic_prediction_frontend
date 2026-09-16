import Link from "next/link";
import { type Product, otherProduct } from "../lib/products";

/**
 * Which model is behind this page, and why it is that one.
 *
 * This is the point the whole app has to make, so it is not a footnote. The
 * error figure on a 2025 date only means something because the model producing
 * it never saw 2025 -- and a reader has no way to know that unless the UI says
 * it. Left implicit, the natural assumption is that we trained on everything
 * and are quoting an error against data the model had already memorised.
 *
 * The model is not a control and never was. It is now a property of the PAGE,
 * so this states a fact rather than reporting a hidden decision -- and it links
 * to the other page, which is the only way to reach the other model.
 *
 * Two variants:
 *   "picker"  above the Run button, before anything is fetched -- says what
 *             WILL answer, so the pairing is understood before it is made.
 *   "result"  in the report, next to the number it justifies.
 */
export default function ModelBadge({
  product,
  variant = "picker",
}: {
  product: Product;
  variant?: "picker" | "result";
}) {
  const other = otherProduct(product);

  // The validation model earns the "measured" accent -- the same token the
  // recorded-truth line uses on every chart, so a badge in that colour and an
  // actual line in that colour mean the same thing. The forecasting model takes
  // the series colour, which is what predictions are drawn in.
  const tone = product.scoreable ? "var(--viz-actual)" : "var(--viz-series)";

  return (
    <div
      className="mt-2.5 rounded-[var(--r-control)] border px-3 py-2.5"
      style={{ borderColor: `${tone}44`, background: `${tone}0d` }}
    >
      <p className="label-mono flex flex-wrap items-center gap-x-1.5 leading-tight">
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ background: tone }}
          aria-hidden
        />
        <span style={{ color: tone }}>{product.modelLabel}</span>
        <span className="text-[var(--viz-muted)]">
          · trained on {product.trainedOn}
        </span>
        {/* The one number that entitles the comparison below. Dropped from the
            result variant's prose, kept here, so the cut removes words and not
            the evidence. */}
        {variant === "result" &&
          product.scoreable &&
          product.statedError !== null && (
            <span className="text-[var(--viz-muted)]">
              · ±{product.statedError.toFixed(1)}/h over the unseen year
            </span>
          )}
      </p>

      {/* The RESULT variant sits directly above the numbers it justifies, where
          a reader wants the claim and not the argument. The picker variant is
          read before anything is fetched, so it keeps the full sentence: that
          is the moment the pairing has to be understood. */}
      {variant === "picker" && (
        <p className="mt-1.5 text-[12.5px] leading-snug text-[var(--viz-muted)]">
          {product.scoreable ? (
            <>
              It has{" "}
              <strong className="font-semibold text-[var(--viz-ink)]">
                never seen {product.firstDate.slice(0, 4)}
              </strong>
              , so what it predicts here can be checked against what the road
              actually recorded — and across the whole year it is out by ±
              {/* One decimal, not formatCount: that rounds to whole vehicles and
                  would print ±13 where every other surface says ±13.0. */}
              {product.statedError?.toFixed(1)} vehicles an hour.
            </>
          ) : (
            <>
              It uses the{" "}
              <strong className="font-semibold text-[var(--viz-ink)]">
                most recent data
              </strong>{" "}
              we hold. Because it learned 2025, it is deliberately <em>not</em>{" "}
              used for 2025 — and no year is left to score it on.
            </>
          )}
        </p>
      )}

      {variant === "picker" && (
        <p className="label-mono mt-2 leading-tight text-[var(--viz-muted)]">
          {product.scoreable ? "For 2026 onward: " : "For 2025: "}
          <Link
            href={other.href}
            className="underline decoration-[var(--viz-axis)] decoration-dotted underline-offset-2 transition hover:text-[var(--viz-ink)]"
          >
            {other.nav}
          </Link>
          <span> · trained on {other.trainedOn}</span>
        </p>
      )}
    </div>
  );
}
