import type { Metadata } from "next";
import CounterExplorer from "@/features/counters/components/CounterExplorer";
import { CHECK_2025 } from "@/features/forecast/lib/products";

/**
 * PRODUCT A -- the marked page.
 *
 * A model that learned 2024 and nothing else, predicting 2025, next to the
 * counts the road actually recorded. The only page in the app where a
 * prediction can be scored, because it is the only pairing where the model has
 * never seen the year it is answering for.
 *
 * The page is one line because everything specific to it is data: see
 * features/forecast/lib/products.ts. /forecast-2026 is the same component with
 * the other product.
 */
export const metadata: Metadata = {
  title: CHECK_2025.title,
  description: `${CHECK_2025.standfirst} ${CHECK_2025.sites} counters, ${CHECK_2025.series} series.`,
};

export default function Check2025Page() {
  return <CounterExplorer product={CHECK_2025} />;
}
