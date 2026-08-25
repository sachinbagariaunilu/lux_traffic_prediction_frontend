import Reveal from "@/components/ui/Reveal";
import { DATASET_NAME, DATASET_URL, SOURCE_FACTS } from "../content";
import SectionShell from "./SectionShell";

/** Provenance, so any figure on this page can be traced back to the open data. */
export default function SourceSection() {
  return (
    <SectionShell eyebrow="Where the data comes from">
      <div className="mt-12 grid gap-14 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
        <Reveal delay={80}>
          <p className="text-[clamp(1.05rem,1.6vw,1.375rem)] leading-[1.5] text-[var(--viz-ink)]">
            Every number here traces back to{" "}
            <a
              href={DATASET_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="underline decoration-[var(--lux-blue)] decoration-2 underline-offset-[6px] transition hover:text-[var(--lux-blue-ink)]"
            >
              {DATASET_NAME}
            </a>
            , the open dataset of Luxembourg&rsquo;s permanent traffic counting stations.
          </p>
          <p className="mt-6 max-w-[58ch] text-[12.5px] leading-relaxed text-[var(--viz-muted)]">
            Nothing here is simulated — the counts are what the road administration&rsquo;s
            own equipment recorded. Those permanent stations are the <em>postes</em> the
            data is keyed on, which is why every counter carries a{" "}
            <code className="bg-[var(--viz-ink)]/6 px-1.5 py-0.5 font-[family-name:var(--font-mono)] text-[11px]">
              POSTE_ID
            </code>
            .
          </p>
        </Reveal>

        <Reveal delay={140}>
          <dl className="text-[13px]">
            {SOURCE_FACTS.map(([term, value]) => (
              <div key={term} className="rule-row flex gap-6 py-4">
                <dt className="label-mono shrink-0 pt-0.5">{term}</dt>
                <dd className="ml-auto text-right text-[var(--viz-ink)]">{value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </SectionShell>
  );
}
