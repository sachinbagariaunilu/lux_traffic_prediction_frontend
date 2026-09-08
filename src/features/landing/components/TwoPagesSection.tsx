import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import { ArrowRightIcon } from "@/components/ui/icons";
import { PRODUCT_LIST, type Product } from "@/features/forecast/lib/products";
import SectionShell from "./SectionShell";

/**
 * The two pages, side by side, with the difference stated rather than implied.
 *
 * This section exists because the split is the honest part of the project and
 * it is invisible unless it is drawn. A reader who does not know that the 2025
 * comparison comes from a model trained on 2024 ALONE has no reason to believe
 * the comparison at all -- and the natural assumption, that we trained on
 * everything and then quoted an error against data the model had memorised, is
 * exactly what the two pages exist to rule out.
 *
 * Every figure and sentence comes from features/forecast/lib/products.ts, the
 * same file the pages themselves read, so the overview cannot describe a page
 * that no longer works that way.
 */
function specs(p: Product): { k: string; v: string }[] {
  return [
    { k: "Model", v: `trained on ${p.trainedOn}` },
    { k: "Dates", v: p.dateLabel },
    {
      k: "Counters",
      v: `${p.sites} counters · ${p.series.toLocaleString("en-GB")} series`,
    },
    {
      k: "Stated error",
      v: p.statedError
        ? `±${p.statedError.toFixed(1)} vehicles/hour`
        : "none — no unseen year to measure on",
    },
  ];
}

export default function TwoPagesSection() {
  return (
    <SectionShell
      id="two-pages"
      eyebrow="Two models, two pages"
      heading={<>One page can be marked. The other cannot.</>}
      lede={
        <>
          There are two models, and they are kept apart on purpose. A model may never
          be asked about a year it studied — that is recall, not prediction, and
          scoring it would flatter the model. So each page uses one model, offers only
          the years that model has never seen, and lists only the counters it has
          history for.
        </>
      }
    >
      <div className="mt-14 grid gap-px bg-[var(--viz-hairline)] lg:grid-cols-2">
        {PRODUCT_LIST.map((p, i) => {
          // Same tokens the badge and the charts use: the scored page takes the
          // recorded-truth colour, the forecast page the prediction colour.
          const tone = p.scoreable ? "var(--viz-actual)" : "var(--viz-series)";
          return (
            <Reveal key={p.id} delay={i * 90}>
              <div className="flex h-full flex-col bg-[var(--viz-surface)] p-7 sm:p-9">
                <p className="label-mono flex items-center gap-2">
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: tone }}
                    aria-hidden
                  />
                  <span style={{ color: tone }}>{p.roleLabel}</span>
                </p>

                <h3 className="display-md mt-5">{p.title}</h3>
                <p className="mt-4 max-w-[42ch] text-[14px] leading-[1.6] text-[var(--viz-ink-2)]">
                  {p.promise}
                </p>

                <dl className="mt-7 border-t border-[var(--viz-hairline)]">
                  {specs(p).map((s) => (
                    <div
                      key={s.k}
                      className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-[var(--viz-hairline)] py-3"
                    >
                      <dt className="label-mono">{s.k}</dt>
                      <dd className="text-[13px] font-medium tabular-nums text-[var(--viz-ink)]">
                        {s.v}
                      </dd>
                    </div>
                  ))}
                </dl>

                <p className="mt-6 max-w-[42ch] text-[12.5px] leading-relaxed text-[var(--viz-muted)]">
                  {p.caveat}
                </p>

                {/* mt-auto so both buttons sit on one line however unevenly the
                    two cards fill. Outlined, not filled: the two pages are
                    peers, and two filled primaries side by side would make the
                    choice look like a recommendation. */}
                <div className="mt-auto pt-8">
                  <Link href={p.href} className="pill-quiet px-6 py-3.5 text-[13px]">
                    {p.nav}
                    <ArrowRightIcon />
                  </Link>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>

      <Reveal delay={200}>
        <p className="mt-8 max-w-[64ch] text-[12.5px] leading-relaxed text-[var(--viz-muted)]">
          The counter lists differ by three: 607 Marnach, 1414 France Frontière and
          1444 Schifflange only started reporting during 2025, so the 2024-only model
          has no history for them and refuses to guess — a counter&rsquo;s traffic
          volume cannot be read off its location. They appear on the forecast page
          only. The API enforces all of this independently: asking the 2024 + 2025
          model about a 2025 date is refused, not answered.
        </p>
      </Reveal>
    </SectionShell>
  );
}
