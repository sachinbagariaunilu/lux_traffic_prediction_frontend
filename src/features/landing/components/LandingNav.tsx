import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/icons";
import { CHECK_2025, FORECAST_2026 } from "@/features/forecast/lib/products";

/**
 * Sticky wordmark and both pages. The rule under it wipes in on scroll through
 * a scroll-driven animation -- no listener, no state, and it degrades to a
 * ruleless header where unsupported.
 *
 * Both products are named here rather than behind one "open the map" button:
 * the split is the first thing to understand, and a single entry point implies
 * a single model.
 *
 * It used to carry `.inverted` so it could float over the black hero plate.
 * The hero is paper now, so the bar is too -- `.site-nav` is translucent in
 * whatever `--viz-plane` resolves to, which is the whole reason that rule never
 * hard-coded a colour.
 */
export default function LandingNav() {
  return (
    <nav className="site-nav">
      <div className="mx-auto flex max-w-[82rem] items-center gap-3 px-6 py-3.5 sm:gap-4 sm:px-10">
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
        <span className="label-mono ml-2 hidden lg:block">LU · 2025 → 2028</span>

        {/* The credit rides with the dateline, not with the navigation. Both are
            context about the site rather than a way through it, so they share
            the label styling and the lg breakpoint -- on a narrow bar the two
            product links are what has to survive.

            NO arrow, unlike the two links on the right: in this bar the arrow
            means "a page of this site", and pointing it off-site would make
            that promise false.

            `pill-quiet` supplies the border -- the same outlined control the
            rest of the app uses -- and with it the underline goes: a box and an
            underline both say "clickable", and running the two together is how
            a chip starts looking like a mistake. `lg:inline-flex` rather than
            lg:block because pill-quiet is itself inline-flex. */}
        <a
          href="https://www.mdf.lu/welcome"
          target="_blank"
          rel="noopener noreferrer"
          className="pill-quiet label-mono hidden whitespace-nowrap px-2.5 py-1.5 text-[var(--viz-ink-2)] lg:inline-flex"
        >
          Built by MDF
        </a>

        {/* The forecast page is the quieter link: the scored one is where the
            evidence is, so it keeps the filled pill. */}
        <Link
          href={FORECAST_2026.href}
          className="link-arrow ml-auto hidden whitespace-nowrap text-[12.5px] sm:inline-flex"
        >
          {FORECAST_2026.nav}
        </Link>
        <Link
          href={CHECK_2025.href}
          className="cut cut-s pill ml-auto whitespace-nowrap px-4 py-2.5 text-[12.5px] sm:ml-0 sm:px-5"
        >
          {CHECK_2025.nav}
          <ArrowRightIcon size={14} />
        </Link>
      </div>
    </nav>
  );
}
