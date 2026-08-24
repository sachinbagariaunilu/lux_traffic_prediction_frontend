import Image from "next/image";
import Link from "next/link";
import CountUp from "@/components/landing/CountUp";
import CounterConstellation from "@/components/landing/CounterConstellation";
import Reveal from "@/components/landing/Reveal";
import RhythmCurve from "@/components/landing/RhythmCurve";
import { RHYTHM } from "@/lib/landing-data";

/**
 * Overview page. Every figure is measured from the shipped model bundle and the
 * extracted counts -- see README for how each was derived. The two graphics are
 * the real dataset drawing itself, not illustrations of it.
 */

const dayError = Math.abs(RHYTHM.predictedTotal / RHYTHM.actualTotal - 1) * 100;

const prettyDate = new Date(`${RHYTHM.date}T00:00:00`).toLocaleDateString("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const STEPS = [
  {
    n: "01",
    t: "Learn the rhythm",
    b: "370,818 counter-days across every day of 2024 — 8,899,632 hourly readings. From those the model learns twelve signals: hour, weekday, weekend, public and school holidays, distance to the nearest holiday, and each counter's own profile.",
    f: "Trained through 31 December 2024",
  },
  {
    n: "02",
    t: "Predict any date",
    b: "Name a date, a counter, a direction and a vehicle type; get back 24 hourly numbers. It reads only the calendar — no live feed, no recent measurements — so next Tuesday and a Tuesday in 2029 cost the same.",
    f: "Forecast model · no lag features",
  },
  {
    n: "03",
    t: "Mark its homework",
    b: "For 2024 and 2025 we also hold what the road really recorded. Every forecast appears beside the true count for that exact date — including the days the model got wrong.",
    f: "733,562 recorded days to check against",
  },
];

const LIMITS = [
  {
    t: "The error figure is an average",
    b: "±18 vehicles/hour spans all 1,058 series, and most are quiet rural counters. On a motorway counter the real error is far larger — we measured ±77/h on one busy day.",
  },
  {
    t: "Reality stops at 2025",
    b: "Those are the years we hold recorded counts for. Ask for any other date and you get a forecast with nothing to check it against.",
  },
  {
    t: "The baseline ignores season",
    b: "March Sundays and November Sundays fold into a single “usual Sunday”, so the baseline runs high in winter and low in spring.",
  },
];

export default function Home() {
  return (
    <div className="bg-[var(--viz-plane)]">
      {/* ================= HERO ================= */}
      <section className="stage relative min-h-dvh overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(48rem 30rem at 78% 12%, rgba(0,161,222,.20), transparent 62%), radial-gradient(38rem 26rem at 12% 88%, rgba(237,41,57,.15), transparent 60%)",
          }}
        />

        <nav className="relative mx-auto flex max-w-6xl items-center gap-3 px-6 pt-7 sm:px-10">
          <Image
            src="/world.png"
            alt="Luxembourg"
            width={30}
            height={30}
            priority
            className="h-[30px] w-[30px] rounded-full ring-1 ring-white/20"
          />
          <span className="text-[13px] font-semibold tracking-tight">
            Traffic Forecasting
          </span>
          <Link
            href="/map"
            className="ml-auto rounded-full border border-white/18 px-4 py-1.5 text-[12px] font-medium text-white/85 transition hover:border-white/40 hover:text-white"
          >
            Open the map
          </Link>
        </nav>

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-6 pb-24 pt-14 sm:px-10 lg:grid-cols-[1.15fr_.85fr] lg:gap-6 lg:pb-28 lg:pt-20">
          <div>
            <Reveal>
              <p className="eyebrow">Luxembourg · 2024 → 2025</p>
            </Reveal>

            <Reveal delay={90}>
              <h1 className="display-xl mt-6 max-w-[15ch]">
                We taught a model
                <br />
                the rhythm of
                <br />
                <span
                  style={{
                    background:
                      "linear-gradient(100deg,var(--lux-red-ink),var(--lux-blue-ink))",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  a country&rsquo;s roads.
                </span>
              </h1>
            </Reveal>

            <Reveal delay={180}>
              <p className="mt-7 max-w-[46ch] text-[15px] leading-relaxed text-[var(--viz-ink-2)] sm:text-[17px]">
                8.9 million hourly readings from 270 counters across 2024. From them,
                an hour-by-hour forecast of 2025 — shown next to what the road
                actually recorded, so you can mark it yourself.
              </p>
            </Reveal>

            <Reveal delay={260}>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link
                  href="/map"
                  className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[13px] font-semibold text-[#0b0b0d] transition hover:gap-3"
                >
                  Explore 270 counters
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
                    <path d="M5 12h13M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
                <a
                  href="#proof"
                  className="rounded-full border border-white/18 px-6 py-3 text-[13px] font-medium text-white/85 transition hover:border-white/40 hover:text-white"
                >
                  See how close it got
                </a>
              </div>
            </Reveal>
          </div>

          {/* The dataset drawing itself. */}
          <div className="relative mx-auto w-full max-w-[290px] lg:max-w-none">
            <CounterConstellation className="h-auto w-full" />
            <p className="mt-4 text-center text-[10.5px] leading-relaxed text-[var(--viz-muted)] lg:text-left">
              Every one of the 270 counters, at its true position
            </p>
          </div>
        </div>
      </section>

      {/* ================= SCALE ================= */}
      <section className="border-b border-[var(--viz-border)]">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10 sm:py-28">
          <Reveal>
            <p className="eyebrow">The evidence</p>
          </Reveal>

          <div className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { v: 8.9, d: 1, s: "M", l: "hourly readings", n: "every hour of 2024, at every counter that reported" },
              { v: 270, d: 0, s: "", l: "road counters", n: "permanent stations, nationwide" },
              { v: 1058, d: 0, s: "", l: "measured series", n: "each counter × direction × vehicle type" },
              { v: 365, d: 0, s: "", l: "days learned", n: "the whole of 2024, nothing held back" },
            ].map((m, i) => (
              <Reveal key={m.l} delay={i * 80}>
                <div className="pt-1">
                  <span className="lux-stripe mb-5 block h-[3px] w-11 rounded-full" aria-hidden />
                  <div className="display-num text-[var(--viz-ink)]">
                    <CountUp value={m.v} decimals={m.d} suffix={m.s} />
                  </div>
                  <div className="mt-3 text-[13px] font-semibold text-[var(--viz-ink)]">
                    {m.l}
                  </div>
                  <p className="mt-1.5 text-[11.5px] leading-relaxed text-[var(--viz-muted)]">
                    {m.n}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PROOF ================= */}
      <section id="proof" className="stage scroll-mt-4 overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10 sm:py-28">
          <Reveal>
            <p className="eyebrow">One real day</p>
          </Reveal>

          <Reveal delay={80}>
            <h2 className="display-lg mt-5 max-w-[20ch]">
              On {prettyDate}, we were{" "}
              <span style={{ color: "#ee7442" }}>
                {dayError.toFixed(1)}% off.
              </span>
            </h2>
          </Reveal>

          <Reveal delay={150}>
            <p className="mt-5 max-w-[52ch] text-[14px] leading-relaxed text-[var(--viz-ink-2)] sm:text-[15px]">
              A Wednesday on the A3 at Bettembourg. The model had never seen this day
              — it was trained six months earlier and reads only the calendar. Blue is
              what it predicted; orange is what the road recorded.
            </p>
          </Reveal>

          <Reveal delay={200} className="mt-12">
            <figure className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-8">
              <RhythmCurve className="h-auto w-full" />

              <figcaption className="mt-7 grid gap-5 border-t border-white/10 pt-6 sm:grid-cols-3">
                {[
                  { k: "Recorded", v: RHYTHM.actualTotal, c: "#ee7442" },
                  { k: "Predicted", v: RHYTHM.predictedTotal, c: "#4a90e8" },
                  { k: "A usual Wednesday", v: RHYTHM.typicalTotal, c: "#85847e" },
                ].map((r) => (
                  <div key={r.k}>
                    <div className="flex items-center gap-2">
                      <span
                        className="h-0.5 w-4 rounded-full"
                        style={{ background: r.c }}
                        aria-hidden
                      />
                      <span className="text-[11px] text-[var(--viz-ink-2)]">{r.k}</span>
                    </div>
                    <div className="mt-1.5 text-[26px] font-semibold tabular-nums tracking-tight">
                      {r.v.toLocaleString("en-GB")}
                    </div>
                  </div>
                ))}
              </figcaption>
            </figure>
          </Reveal>

          <Reveal delay={120}>
            <p className="mt-6 max-w-[58ch] text-[12px] leading-relaxed text-[var(--viz-muted)]">
              Picked as the model&rsquo;s best Wednesday at this counter, out of 49. It
              is not typical — the same model ran 11% high on a March Wednesday. The
              map shows you both kinds of day.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ================= HOW ================= */}
      <section className="border-b border-[var(--viz-border)]">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10 sm:py-28">
          <Reveal>
            <p className="eyebrow">How it works</p>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="display-lg mt-5 max-w-[16ch]">
              2024 taught it. 2025 tests it.
            </h2>
          </Reveal>

          <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
            {STEPS.map((s, i) => (
              <Reveal as="li" key={s.n} delay={i * 100}>
                <div className="pt-1">
                  <span className="lux-stripe mb-5 block h-[3px] w-11 rounded-full" aria-hidden />
                  <span className="text-[11px] font-semibold tabular-nums text-[var(--viz-series)]">
                    {s.n}
                  </span>
                  <h3 className="mt-3 text-[19px] font-semibold tracking-tight text-[var(--viz-ink)]">
                    {s.t}
                  </h3>
                  <p className="mt-3 text-[13px] leading-relaxed text-[var(--viz-ink-2)]">
                    {s.b}
                  </p>
                  <p className="mt-4 text-[11px] text-[var(--viz-muted)]">{s.f}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ================= READING ================= */}
      <section className="border-b border-[var(--viz-border)] bg-[var(--viz-surface)]">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10 sm:py-28">
          <Reveal>
            <p className="eyebrow">Reading a forecast</p>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="display-lg mt-5 max-w-[18ch]">
              Every hour carries three numbers.
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:gap-16">
            <dl className="space-y-8">
              {[
                {
                  c: "var(--viz-actual)",
                  dash: false,
                  t: "What really happened",
                  b: "The count the counter recorded that hour. A whole number, straight from the open data.",
                },
                {
                  c: "var(--viz-series)",
                  dash: false,
                  t: "Our prediction",
                  b: "What the model expected, knowing only the calendar — never the answer.",
                },
                {
                  c: "var(--viz-baseline)",
                  dash: true,
                  t: "A usual Wednesday",
                  b: "Not one particular day. It averages every Wednesday this counter recorded in 2024, hour by hour — the 08:00 figure averages all the Wednesday 08:00s.",
                },
              ].map((r, i) => (
                <Reveal key={r.t} delay={i * 90}>
                  <div className="flex gap-4">
                    <span
                      className={`mt-2.5 h-0 w-7 shrink-0 ${r.dash ? "border-t-2 border-dashed" : "border-t-[3px]"}`}
                      style={r.dash ? { borderColor: r.c } : { borderColor: r.c }}
                      aria-hidden
                    />
                    <div>
                      <dt className="text-[15px] font-semibold tracking-tight text-[var(--viz-ink)]">
                        {r.t}
                      </dt>
                      <dd className="mt-1.5 text-[13px] leading-relaxed text-[var(--viz-ink-2)]">
                        {r.b}
                      </dd>
                    </div>
                  </div>
                </Reveal>
              ))}
            </dl>

            <Reveal delay={160}>
              <blockquote className="rounded-2xl bg-[var(--viz-ink)]/[0.04] p-7 lg:sticky lg:top-10">
                <p className="text-[17px] leading-relaxed tracking-tight text-[var(--viz-ink)]">
                  Like a weather normal: <em>“tomorrow 18°, normal for the season
                  21°”</em>. The 21 was never a measured day — it is there to tell you
                  whether tomorrow is unusual.
                </p>
                <footer className="mt-4 text-[12px] leading-relaxed text-[var(--viz-ink-2)]">
                  That is exactly the job the dashed line does. It is a yardstick, not
                  a reading — which is also why the raw figure arrives with decimals:
                  divide 13,418 vehicles by 27 recorded Sundays and you get 496.9.
                </footer>
              </blockquote>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================= LIMITS ================= */}
      <section className="border-b border-[var(--viz-border)]">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10 sm:py-28">
          <Reveal>
            <p className="eyebrow">What it cannot do</p>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="display-lg mt-5 max-w-[20ch]">
              Worth knowing before you trust a number.
            </h2>
          </Reveal>

          <ul className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
            {LIMITS.map((c, i) => (
              <Reveal as="li" key={c.t} delay={i * 100}>
                <div className="pt-1">
                  <span className="lux-stripe mb-5 block h-[3px] w-11 rounded-full" aria-hidden />
                  <h3 className="text-[16px] font-semibold tracking-tight text-[var(--viz-ink)]">
                    {c.t}
                  </h3>
                  <p className="mt-2.5 text-[12.5px] leading-relaxed text-[var(--viz-ink-2)]">
                    {c.b}
                  </p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ================= SOURCE ================= */}
      <section className="border-b border-[var(--viz-border)] bg-[var(--viz-surface)]">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10 sm:py-24">
          <Reveal>
            <p className="eyebrow">Where the data comes from</p>
          </Reveal>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
            <Reveal delay={80}>
              <p className="text-[17px] leading-relaxed tracking-tight text-[var(--viz-ink)]">
                Every number here traces back to{" "}
                <a
                  href="https://data.public.lu/en/datasets/pch-comptage-trafic/"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="underline decoration-[var(--viz-series)]/40 underline-offset-4 transition hover:decoration-[var(--viz-series)]"
                >
                  PCH&nbsp;: Comptage Trafic
                </a>
                , the open dataset of Luxembourg&rsquo;s permanent traffic counting
                stations.
              </p>
              <p className="mt-4 max-w-[54ch] text-[12.5px] leading-relaxed text-[var(--viz-muted)]">
                Nothing here is simulated — the counts are what the road
                administration&rsquo;s own equipment recorded. Those permanent stations
                are the <em>postes</em> the data is keyed on, which is why every
                counter carries a <code>POSTE_ID</code>.
              </p>
            </Reveal>

            <Reveal delay={140}>
              <dl className="text-[12.5px]">
                {[
                  ["Publisher", "Administration des Ponts et Chaussées"],
                  ["Portal", "data.public.lu"],
                  ["Licence", "Creative Commons Zero (CC0)"],
                  ["Files used", "2024 and 2025 annual exports"],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="flex gap-4 border-t border-[var(--viz-grid)] py-3 first:border-t-0"
                  >
                    <dt className="shrink-0 text-[var(--viz-muted)]">{k}</dt>
                    <dd className="ml-auto text-right font-medium text-[var(--viz-ink)]">
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="stage relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(40rem 22rem at 50% 120%, rgba(0,161,222,.22), transparent 65%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-6 py-24 text-center sm:px-10 sm:py-32">
          <Reveal>
            <h2 className="display-lg mx-auto max-w-[16ch]">
              Pick a counter. Pick a day.
            </h2>
          </Reveal>
          <Reveal delay={90}>
            <p className="mx-auto mt-5 max-w-[44ch] text-[14px] leading-relaxed text-[var(--viz-ink-2)]">
              270 counters on the map. Choose a date, a direction and a vehicle type,
              and see how the forecast held up — hour by hour.
            </p>
          </Reveal>
          <Reveal delay={160}>
            <Link
              href="/map"
              className="group mt-10 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-[14px] font-semibold text-[#0b0b0d] transition hover:gap-3"
            >
              Open the map
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
                <path d="M5 12h13M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </Reveal>
        </div>

        <footer className="relative border-t border-white/10">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-6 py-7 text-[11px] text-[var(--viz-muted)] sm:px-10">
            <span>
              Traffic counts:{" "}
              <a
                href="https://data.public.lu/en/datasets/pch-comptage-trafic/"
                target="_blank"
                rel="noreferrer noopener"
                className="underline underline-offset-2 transition hover:text-[var(--viz-ink-2)]"
              >
                PCH&nbsp;: Comptage Trafic
              </a>{" "}
              · Ponts et Chaussées · CC0
            </span>
            <span>Model trained through 31 December 2024</span>

            <a
              href="https://www.linkedin.com/in/sachin-bagaria/"
              target="_blank"
              rel="noreferrer noopener"
              className="group ml-auto inline-flex items-center gap-2 rounded-full border border-white/12 py-1.5 pl-2.5 pr-3.5 transition hover:border-white/35 hover:text-[var(--viz-ink)]"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden
                className="transition group-hover:text-[var(--lux-blue)]"
              >
                <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.65h.05A4.17 4.17 0 0 1 17.6 8.7c4 0 4.75 2.5 4.75 5.77V21h-4v-5.73c0-1.37-.03-3.13-1.96-3.13-1.96 0-2.26 1.49-2.26 3.03V21h-4V9Z" />
              </svg>
              Built by Sachin Bagaria
            </a>
          </div>
        </footer>
      </section>
    </div>
  );
}
