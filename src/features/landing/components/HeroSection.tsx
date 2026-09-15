import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import { ArrowRightIcon } from "@/components/ui/icons";
import { CHECK_2025, FORECAST_2026 } from "@/features/forecast/lib/products";
import CounterConstellation from "./CounterConstellation";
import SealCTA from "./SealCTA";

/**
 * The hero: the claim on the left, the dataset drawing itself on the right.
 *
 * The counter map is CounterConstellation -- the real 270 positions on the real
 * border, on one shared projection, drawing itself in on load. It is back in
 * the hero, and in the right-hand column, because a still picture of the
 * network could never do what it does: the border strokes itself and then 270
 * counters land one after another, which states the size of the dataset in the
 * time it takes to watch. A background image said the same thing and said it
 * silently.
 *
 * It replaced a full-bleed wallpaper render of the same data. Two pictures of
 * one network on one screen is one too many, so the wallpaper is gone and the
 * plate is now just the near-black ground and the engineering grid -- which
 * also means the headline sits on a flat field and its contrast no longer
 * depends on what the picture happens to be doing behind it.
 *
 * The constellation's blue is re-pointed to the flag cyan for this section
 * only. `--viz-series` is #1f6ac4, chosen and measured against a white chart
 * plane; on a near-black plate it is one of the darkest things on screen. The
 * token is overridden on the wrapper rather than in the component, so the
 * charts -- where that value was validated -- keep it unchanged.
 *
 * There is no figures strip under the claim any more. It listed 17.7M readings,
 * 273 counters, 1,070 series and ±13.0 -- and three of those four are the
 * figures EvidenceSection states, larger and with the note that explains each.
 * Saying them twice bought nothing and cost the map the height it needed.
 *
 * Server Component: the draw-in is CSS, the seal spins in CSS.
 */

/** The index in the top corner -- what the project does, in three lines. */
const INDEX = [
  { n: "01", label: "Learn the rhythm" },
  { n: "02", label: "Two models, kept apart" },
  { n: "03", label: "Mark its homework" },
] as const;

export default function HeroSection() {
  return (
    <section className="inverted relative isolate flex min-h-[calc(100svh-3.75rem)] flex-col overflow-hidden">
      <div className="grid-field absolute inset-0 -z-10" aria-hidden />
      {/* One soft pool of light behind the map, so the plate is not a flat
          rectangle of black. Cheaper and steadier than the animated .glow, and
          it sits off to the right where no type crosses it. */}
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_55%_at_78%_42%,rgba(0,161,222,0.16),transparent_70%)]"
        aria-hidden
      />

      <div className="relative mx-auto flex w-full max-w-[82rem] flex-1 flex-col px-6 sm:px-10">
        {/* ---- top rail: the mark, and the index ---------------------------- */}
        <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-6 pt-9 sm:pt-11">
          <Reveal>
            <p className="eyebrow-bracket">
              <b>LU®</b>
              <i>‒</i>
              <span>Traffic forecasting / 2025 → 2028</span>
            </p>
          </Reveal>

          <Reveal delay={80}>
            <ol className="flex flex-col gap-1.5 sm:items-end">
              {INDEX.map((s) => (
                <li key={s.n} className="label-mono flex items-baseline gap-2.5">
                  <span className="text-[var(--lux-blue)]">{s.n}.</span>
                  <span className="text-[var(--viz-ink-2)]">{s.label}</span>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>

        {/* ---- claim left, network right ------------------------------------ */}
        <div className="mt-auto grid items-center gap-10 pb-6 pt-8 lg:grid-cols-[1.05fr_.95fr] lg:gap-14">
          <div>
            <Reveal delay={120}>
              <h1 className="hero-display max-w-[14ch]">
                less guessing<i>.</i>
                <br />
                <em>more evidence<i>.</i></em>
              </h1>
            </Reveal>

            <Reveal delay={200}>
              <p className="lede mt-8 max-w-[46ch]">
                We taught a model the rhythm of a country&rsquo;s roads.{" "}
                {FORECAST_2026.sites} counters across Luxembourg, every hour of 2024
                and 2025. From them, two models on two pages: one predicts 2025 and can
                be marked against what the road actually recorded, the other forecasts
                2026 to 2028 and admits there is nothing left to mark it with.
              </p>
            </Reveal>

            {/* The seal rides on the end of the action row rather than on a row
                of its own. Below the buttons it added its full 156px to the
                column, which pushed the figures strip off the bottom of the
                screen; here it fills space the row already had. Same
                destination as the filled pill -- on the reference layout the
                seal IS the primary action, and pointing it somewhere else would
                make the hero offer three choices instead of two. */}
            <Reveal delay={260}>
              <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-5">
                <Link
                  href={CHECK_2025.href}
                  className="cut cut-s pill px-6 py-3.5 text-[13px]"
                >
                  Check 2025 against reality
                  <ArrowRightIcon />
                </Link>
                <Link href={FORECAST_2026.href} className="link-arrow text-[13px]">
                  Or forecast 2026–28
                  <ArrowRightIcon size={14} />
                </Link>
                <SealCTA
                  href={CHECK_2025.href}
                  ring="Check 2025 against reality"
                  label="Check the 2025 forecasts against what the road recorded"
                  className="ml-auto hidden text-[var(--viz-ink-2)] xl:grid"
                />
              </div>
            </Reveal>
          </div>

          {/* ---- the dataset, drawing itself -------------------------------- */}
          <Reveal delay={180}>
            {/* No plate around it. The map is the picture, and a framed box on
                a black ground only drew a second rectangle inside the section's
                own edges -- the drawing already reads as an object because the
                border strokes itself in. Only the token override stays. */}
            <div
              className="mx-auto w-full max-w-[20rem] lg:max-w-none"
              style={{ "--viz-series": "var(--lux-blue)" } as React.CSSProperties}
            >
              {/* Width-bound, so the map fills its column and the country is
                  drawn at a size worth looking at. Capping the HEIGHT instead --
                  which an earlier revision did, to keep the whole hero inside
                  one screen -- squeezed a 300x420 portrait projection into a
                  landscape gap and left the country small and marooned. The
                  figures strip that was competing for the same vertical space
                  has gone (see below), which is what buys the room back. */}
              <CounterConstellation className="mx-auto h-auto w-full" />
              <p className="label-mono mt-5 text-center">
                270 counters · true positions
              </p>
            </div>
          </Reveal>
        </div>

      </div>
    </section>
  );
}
