import CountUp from "@/components/ui/CountUp";
import Reveal from "@/components/ui/Reveal";
import { EVIDENCE } from "../content";
import SectionShell from "./SectionShell";

/**
 * The scale of the training data, in four square blocks with mono captions.
 * One of them is filled with the accent -- the counter count, because that is
 * the figure the whole app is built around.
 */
export default function EvidenceSection() {
  return (
    <SectionShell eyebrow="The evidence">
      {/* Cut blocks with a gap between them, rather than four flush panes
          divided by hairlines. The chamfer only exists if the ground shows
          through it, so the moment these blocks are the theme's shape they
          also have to stop touching. */}
      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {EVIDENCE.map((m, i) => (
          <Reveal key={m.label} delay={i * 70} className="h-full">
            <div
              className={`cut cut-edge flex h-full flex-col p-7 ${
                m.accent ? "text-[#0a0a0a]" : ""
              }`}
              style={
                m.accent
                  ? ({ "--cut-fill": "var(--lux-blue)" } as React.CSSProperties)
                  : undefined
              }
            >
              <div
                className={`label-mono ${m.accent ? "text-[#0a0a0a]/70" : ""}`}
              >
                {m.label}
              </div>
              <div className="display-num mt-7">
                <CountUp value={m.value} decimals={m.decimals} suffix={m.suffix} />
              </div>
              <p
                className={`mt-4 max-w-[26ch] text-[12.5px] leading-relaxed ${
                  m.accent ? "text-[#0a0a0a]/75" : "text-[var(--viz-muted)]"
                }`}
              >
                {m.note}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}
