import type { Product } from "../lib/products";

/**
 * The dashed line is the one thing people misread, so it is explained in words
 * under every report rather than in a tooltip they may never open.
 *
 * The years it averages are the model's OWN training years, so they differ by
 * page: the API field is named `typical_2024` for both models, but the
 * 2024+2025 bundle builds that baseline from both years. Naming 2024 on the
 * forecasting page would have been a quiet inaccuracy inherited from a field
 * name.
 */
export default function BaselineExplainer({
  product,
  dayName,
}: {
  product: Product;
  dayName: string;
}) {
  return (
    <div className="space-y-2.5 bg-[var(--viz-ink)]/4 px-4 py-4 text-[11.5px] leading-relaxed text-[var(--viz-ink-2)]">
      <p>
        <strong className="font-semibold text-[var(--viz-ink)]">
          “A usual {dayName}”
        </strong>{" "}
        is not one particular day. It averages <em>every {dayName}</em> this counter
        recorded during {product.levelLabel}, hour by hour — the 08:00 figure averages
        all the {dayName} 08:00s.
      </p>
      <p>
        Like a weather normal: “tomorrow 18°, normal for the season 21°”. The 21 was never
        a measured day; it tells you whether tomorrow is unusual.
      </p>
      <p className="text-[var(--viz-muted)]">
        Counts are whole vehicles. The model returns decimals, but its own error is far
        bigger than a decimal, so they are rounded away.
      </p>
    </div>
  );
}
