import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import { ArrowRightIcon } from "@/components/ui/icons";
import CounterConstellation from "./CounterConstellation";

/**
 * The claim in flat black caps, the dataset drawing itself beside it, and the
 * accent glow behind both. The headline carries no colour of its own: the
 * identity lives in the glow and in the accent tiles further down, which is
 * what keeps a three-colour flag from turning into a gradient.
 */
export default function HeroSection() {
  return (
    <section className="stage relative overflow-hidden">
      <div
        className="glow left-[30%] top-[16%] h-[22rem] w-[22rem] opacity-25 sm:left-[22%] sm:h-[34rem] sm:w-[38rem] sm:opacity-70"
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-[82rem] items-center gap-12 px-6 pb-[var(--bay)] pt-10 sm:px-10 sm:pt-14 lg:grid-cols-[1.15fr_.85fr] lg:gap-14">
        <div>
          <Reveal>
            <div className="eyebrow-rule">
              <p className="eyebrow">8,899,632 hourly readings</p>
            </div>
          </Reveal>

          <Reveal delay={90}>
            <h1 className="display-xl mt-9 max-w-[22ch]">
              We taught a model the rhythm of a country&rsquo;s roads
            </h1>
          </Reveal>

          <Reveal delay={180}>
            <p className="lede mt-9 max-w-[48ch]">
              270 counters across Luxembourg, every hour of 2024. From them, an
              hour-by-hour forecast of 2025 — shown next to what the road actually
              recorded, so you can mark it yourself.
            </p>
          </Reveal>

          <Reveal delay={260}>
            <div className="mt-11 flex flex-wrap items-center gap-x-8 gap-y-4">
              <Link href="/map" className="pill px-6 py-3.5 text-[13px]">
                Explore 270 counters
                <ArrowRightIcon />
              </Link>
              <a href="#proof" className="link-arrow text-[13px]">
                See how close it got
                <ArrowRightIcon size={14} />
              </a>
            </div>
          </Reveal>
        </div>

        <div className="ticked relative mx-auto w-full max-w-[320px] p-4 lg:max-w-none">
          <CounterConstellation className="h-auto w-full" />
          <p className="label-mono mt-4 text-center lg:text-left">
            270 counters · true positions
          </p>
        </div>
      </div>
    </section>
  );
}
