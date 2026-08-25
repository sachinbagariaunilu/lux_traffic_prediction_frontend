import type { Metadata } from "next";
import CounterExplorer from "@/features/counters/components/CounterExplorer";

export const metadata: Metadata = {
  title: "Map",
  description:
    "All 270 Luxembourg traffic counters. Pick one, pick a date, and see the hourly forecast against what the road recorded.",
};

export default function MapPage() {
  return <CounterExplorer />;
}
