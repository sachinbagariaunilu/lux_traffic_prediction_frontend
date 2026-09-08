import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import { ArrowRightIcon } from "@/components/ui/icons";
import { CHECK_2025, FORECAST_2026 } from "@/features/forecast/lib/products";
import SiteFooter from "./SiteFooter";

/**
 * The page's one inverted section. It carries no data, which is exactly why it
 * can go black: nothing here has a contrast ratio that was measured against
 * white. The footer rides inside it.
 */
export default function ClosingSection() {
  return (
    <section className="inverted relative overflow-hidden">
      <div
        className="glow -bottom-[18rem] left-1/2 h-[36rem] w-[52rem] -translate-x-1/2 opacity-40"
        aria-hidden
      />
      <div className="relative mx-auto max-w-[82rem] px-6 py-[var(--bay)] sm:px-10">
        <Reveal>
          <div className="eyebrow-rule">
            <p className="eyebrow">Try it on a day you know</p>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="display-xl mt-9 max-w-[18ch]">Pick a counter. Pick a day.</h2>
        </Reveal>
        <Reveal delay={140}>
          <p className="lede mt-8 max-w-[48ch]">
            Choose a counter, a date, a direction and a vehicle type. On a day in 2025
            you also get what the road recorded, so you can see for yourself how the
            forecast held up — hour by hour.
          </p>
        </Reveal>
        <Reveal delay={200}>
          <div className="mt-11 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link href={CHECK_2025.href} className="pill px-7 py-4 text-[13.5px]">
              {CHECK_2025.nav}
              <ArrowRightIcon size={16} />
            </Link>
            <Link href={FORECAST_2026.href} className="link-arrow text-[13.5px]">
              {FORECAST_2026.nav}
              <ArrowRightIcon size={15} />
            </Link>
          </div>
        </Reveal>
      </div>

      <SiteFooter />
    </section>
  );
}
