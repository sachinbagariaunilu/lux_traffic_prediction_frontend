import Reveal from "@/components/ui/Reveal";
import { CHART_LINES } from "../content";
import SectionShell from "./SectionShell";

/** What the three lines mean -- the dashed baseline is what trips people up. */
export default function ReadingSection() {
  return (
    <SectionShell
      tone="band"
      eyebrow="Reading a forecast"
      heading={<>Every hour carries three numbers.</>}
    >
      <div className="mt-14 grid gap-14 lg:grid-cols-[1.15fr_.85fr] lg:gap-20">
        <dl>
          {CHART_LINES.map((r, i) => (
            <Reveal key={r.title} delay={i * 90}>
              <div className="rule-row flex gap-6 py-8">
                <span
                  className={`mt-3 h-0 w-10 shrink-0 ${
                    r.dashed ? "border-t-2 border-dashed" : "border-t-[3px]"
                  }`}
                  style={{ borderColor: r.color }}
                  aria-hidden
                />
                <div>
                  <dt className="display-md">{r.title}</dt>
                  <dd className="mt-2.5 max-w-[54ch] text-[13.5px] leading-[1.6] text-[var(--viz-ink-2)]">
                    {r.body}
                  </dd>
                </div>
              </div>
            </Reveal>
          ))}
        </dl>

        <Reveal delay={160}>
          <blockquote className="lg:sticky lg:top-24">
            <p className="text-[clamp(1.1rem,1.7vw,1.45rem)] font-normal leading-[1.45] text-[var(--viz-ink)]">
              Like a weather normal: <em>“tomorrow 18°, normal for the season 21°”</em>.
              The 21 was never a measured day — it is there to tell you whether tomorrow
              is unusual.
            </p>
            <footer className="mt-6 border-t border-[var(--viz-hairline)] pt-5 text-[12.5px] leading-relaxed text-[var(--viz-ink-2)]">
              That is exactly the job the dashed line does. It is a yardstick, not a
              reading — which is also why the raw figure arrives with decimals: divide
              13,418 vehicles by 27 recorded Sundays and you get 496.9.
            </footer>
          </blockquote>
        </Reveal>
      </div>
    </SectionShell>
  );
}
