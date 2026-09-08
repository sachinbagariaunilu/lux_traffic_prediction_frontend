import Reveal from "@/components/ui/Reveal";
import { STEPS } from "../content";
import SectionShell from "./SectionShell";

/**
 * Train, predict, then score -- in that order, because that order is the point.
 * Each step is a ruled row led by an accent tile carrying its number, the way
 * the reference leads every row with a filled square.
 */
export default function HowItWorksSection() {
  return (
    <SectionShell
      eyebrow="How it works"
      heading={<>2024 taught it. 2025 tested it. 2026 is next.</>}
    >
      <ol className="mt-14">
        {STEPS.map((s, i) => (
          <Reveal as="li" key={s.n} delay={i * 90}>
            <div className="rule-row grid gap-x-10 gap-y-5 py-9 md:grid-cols-[3.25rem_16rem_1fr]">
              <span className="tile-accent h-[3.25rem] w-[3.25rem] text-[15px]">
                {s.n}
              </span>
              <h3 className="display-md pt-2">{s.title}</h3>
              <div>
                <p className="max-w-[64ch] text-[14px] leading-[1.6] text-[var(--viz-ink-2)]">
                  {s.body}
                </p>
                <p className="label-mono mt-4">{s.footnote}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </ol>
    </SectionShell>
  );
}
