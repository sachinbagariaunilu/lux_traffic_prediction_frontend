import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/icons";

/**
 * Sticky wordmark, a mono dateline, and one filled call to action. The rule
 * under it wipes in on scroll through a scroll-driven animation -- no
 * listener, no state, and it degrades to a ruleless header where unsupported.
 */
export default function LandingNav() {
  return (
    <nav className="site-nav">
      <div className="mx-auto flex max-w-[82rem] items-center gap-4 px-6 py-3.5 sm:px-10">
        <Image
          src="/world.png"
          alt="Luxembourg"
          width={26}
          height={26}
          priority
          className="h-[26px] w-[26px] rounded-full ring-1 ring-[var(--viz-border)]"
        />
        <span className="whitespace-nowrap font-[family-name:var(--font-grotesk)] text-[13.5px] font-medium uppercase tracking-[0.01em] sm:text-[15px]">
          Traffic Forecasting
        </span>
        <span className="label-mono ml-2 hidden sm:block">LU · 2024 → 2025</span>
        <Link
          href="/map"
          className="pill ml-auto whitespace-nowrap px-4 py-2.5 text-[12.5px] sm:px-5"
        >
          {/* "Open the map" does not fit beside the wordmark on a phone. */}
          <span className="hidden sm:inline">Open the map</span>
          <span className="sm:hidden">Map</span>
          <ArrowRightIcon size={14} />
        </Link>
      </div>
    </nav>
  );
}
