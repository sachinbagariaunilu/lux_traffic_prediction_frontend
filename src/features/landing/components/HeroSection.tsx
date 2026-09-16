import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import { ArrowRightIcon } from "@/components/ui/icons";
import { CHECK_2025, FORECAST_2026 } from "@/features/forecast/lib/products";
import CounterConstellation from "./CounterConstellation";
import SealCTA from "./SealCTA";

/**
 * The hero: the claim on the left, the dataset drawing itself on the right.
 *
 * ON PAPER, NOT ON A BLACK PLATE. The hero used to carry `.inverted`, which
 * re-pointed every token to the near-black set. It looked severe and it cost
 * more than it bought:
 *
 *   - The map had to borrow flag cyan to survive the dark ground, so the first
 *     picture on the page used a hue the charts are forbidden to use -- and the
 *     reader met the prediction colour twice, in two different colours.
 *   - The page then opened black, went white for eight sections and closed
 *     black, so the two inverted blocks read as a frame around the argument
 *     rather than as punctuation inside it. One of them had to go, and the
 *     closing section is the one with no data in it.
 *
 * So the hero is the same white as everything below it, separated from the next
 * section by a hairline rather than by a change of ground, and the constellation
 * finally draws in the same blue the charts use.
 *
 * The counter map is CounterConstellation -- the real 270 positions on the real
 * border, on one shared projection, drawing itself in on load. It is in the
 * right-hand column because a still picture of the network could never do what
 * it does: the border strokes itself and then 270 counters land one after
 * another, which states the size of the dataset in the time it takes to watch.
 *
 * There is no figures strip under the claim. It listed 17.7M readings, 273
 * counters, 1,070 series and ±13.0 -- and three of those four are the figures
 * EvidenceSection states, larger and with the note that explains each.
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
    <section className="relative isolate flex min-h-[calc(100svh-3.75rem)] flex-col overflow-hidden border-b border-[var(--viz-hairline)]">
      <div className="grid-field absolute inset-0 -z-10" aria-hidden />
      {/* One soft pool of colour behind the map, so the plate is not a flat
          rectangle of white. On paper it has to be a fraction of the strength
          it was on black -- at the old 0.16 the wash read as a printing fault
          rather than as light -- and it sits off to the right where no type
          crosses it. Cheaper and steadier than the animated .glow. */}
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(58%_52%_at_80%_44%,rgba(0,161,222,0.10),transparent_72%)]"
        aria-hidden
      />

      <div className="relative mx-auto flex w-full max-w-[82rem] flex-1 flex-col px-6 sm:px-10">
        {/* ---- top rail: the mark, and the index ---------------------------- */}
        <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-6 pt-8 sm:pt-10">
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
                  {/* --accent-ink, not the flag hue: these digits are TEXT, and
                      flag cyan on paper is 2.3:1. */}
                  <span className="text-[var(--accent-ink)]">{s.n}.</span>
                  <span className="text-[var(--viz-ink-2)]">{s.label}</span>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>

        {/* ---- claim left, network right ------------------------------------ */}
        <div className="mt-auto grid items-center gap-8 pb-10 pt-6 lg:grid-cols-[1.05fr_.95fr] lg:gap-14">
          <div>
            <Reveal delay={120}>
              {/* Two parties, two clauses -- and the second one is the offer.
                  "more evidence" could head any data product; this pair could
                  only head THIS one, because what is rare here is not accuracy
                  but that the 2025 half is open to inspection at all.

                  It also survives the honesty test the rest of the page is
                  built around: it promises no error figure, only that the
                  reader may look. `em` drops line two to muted ink, which is
                  what keeps "you check." an invitation rather than an order --
                  and the filled button directly below it is the way in. */}
              <h1 className="hero-display max-w-[14ch]">
                we predict<i>.</i>
                <br />
                <em>you check<i>.</i></em>
              </h1>
            </Reveal>

            <Reveal delay={200}>
              {/* The claim above is "more evidence", so the lede has to hand over
                  the evidence rather than describe the project. Three changes
                  from the version that read "we taught a model the rhythm of a
                  country's roads":

                  - the unseen year is now SAID, not implied. "Having never seen
                    a single hour of it" is the whole reason a 2025 number can be
                    checked at all, and without it "predicts 2025" sounds like a
                    model quoting data it already had.
                  - "marked" became "check". It is schoolroom English and most
                    readers here have English as a second or third language.
                  - "two models on two pages" went. Pages are this site's
                    architecture, not the reader's concern; the two links below
                    already make the split obvious. */}
              <p className="lede mt-7 max-w-[46ch]">
                We trained a model on {FORECAST_2026.sites} Luxembourg counters —
                every hour of 2024 and 2025. One version predicts 2025 having never
                seen a single hour of it, so you can check it against what the road
                really recorded. The other forecasts 2026 to 2028, where there is
                nothing to check it against yet, and says so.
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
              <div className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-5">
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
                  className="ml-auto hidden text-[var(--viz-muted)] xl:grid"
                />
              </div>
            </Reveal>
          </div>

          {/* ---- the dataset, drawing itself --------------------------------
              No plate around it, and no token override any more. On black the
              map had to be re-pointed to flag cyan to be visible at all; on
              paper it draws in --viz-series and --viz-actual, which are the
              exact two colours every chart further down the page uses for the
              prediction and the recorded truth. The first picture on the site
              now teaches the palette the rest of it depends on. */}
          <Reveal delay={180}>
            {/* Width-bound, so the map fills its column and the country is
                drawn at a size worth looking at. Capping the HEIGHT instead --
                which an earlier revision did, to keep the whole hero inside one
                screen -- squeezed a 300x420 portrait projection into a
                landscape gap and left the country small and marooned. */}
            <div className="mx-auto w-full max-w-[20rem] lg:max-w-none">
              <CounterConstellation className="mx-auto h-auto w-full" />
              <p className="label-mono mt-4 text-center">
                270 counters · true positions
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
