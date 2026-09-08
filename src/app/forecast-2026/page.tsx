import type { Metadata } from "next";
import CounterExplorer from "@/features/counters/components/CounterExplorer";
import { FORECAST_2026 } from "@/features/forecast/lib/products";

/**
 * PRODUCT B -- the forecast-only page.
 *
 * The model that learned 2024 AND 2025, answering 2026 to 2028. It is the more
 * accurate of the two, and nothing here can be scored: it studied every year we
 * hold recorded counts for, so no unseen year is left to measure it on. The
 * page says that rather than showing a blank ± figure.
 *
 * Identical component to /check-2025; only the product differs.
 */
export const metadata: Metadata = {
  title: FORECAST_2026.title,
  description: `${FORECAST_2026.standfirst} ${FORECAST_2026.sites} counters, ${FORECAST_2026.series} series.`,
};

export default function Forecast2026Page() {
  return <CounterExplorer product={FORECAST_2026} />;
}
