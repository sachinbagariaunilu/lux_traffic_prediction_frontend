import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import { ArrowRightIcon } from "@/components/ui/icons";
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
            270 counters on the map. Choose a date, a direction and a vehicle type, and
            see how the forecast held up — hour by hour.
          </p>
        </Reveal>
        <Reveal delay={200}>
          <Link href="/map" className="pill mt-11 px-7 py-4 text-[13.5px]">
            Open the map
            <ArrowRightIcon size={16} />
          </Link>
        </Reveal>
      </div>

      <SiteFooter />
    </section>
  );
}
