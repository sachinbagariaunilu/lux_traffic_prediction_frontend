import Reveal from "@/components/ui/Reveal";
import { formatCount, longDate } from "@/lib/format";
import { DAY_ERROR_PCT, RHYTHM_TOTALS } from "../content";
import { RHYTHM } from "../data/landing-data";
import RhythmCurve from "./RhythmCurve";
import SectionShell from "./SectionShell";

/**
 * One real day, forecast against truth, with the miss stated up front. The
 * chart keeps its white plane and square edges: the validated palette was
 * measured against white, and a rounded card would soften a measurement.
 */
export default function ProofSection() {
  return (
    <SectionShell
      id="proof"
      eyebrow="One real day"
      heading={
        <>
          On {longDate(RHYTHM.date)}, we were {DAY_ERROR_PCT.toFixed(1)}% off
        </>
      }
      lede={
        <>
          A Thursday on the A1 at Findel, from the Check 2025 page. The model had never
          seen this day — it was trained on 2024 alone and reads only the calendar. Blue
          is what it predicted; orange is what the road recorded, and it tracked the
          shape to {RHYTHM.hourlyMae} vehicles an hour. This is a good day, not an
          average one: across all 1,054 scoreable series it is out by ±13.0 an hour.
        </>
      }
    >
      <Reveal delay={200} className="mt-12">
        <figure className="ring-hairline bg-[var(--viz-surface)] p-5 sm:p-9">
          <RhythmCurve className="h-auto w-full" />

          <figcaption className="mt-8 grid gap-px border-t border-[var(--viz-hairline)] pt-8 sm:grid-cols-3">
            {RHYTHM_TOTALS.map((r) => (
              <div key={r.key}>
                <div className="flex items-center gap-2.5">
                  <span
                    className={
                      r.dashed ? "w-5 border-t-2 border-dashed" : "h-0.5 w-5"
                    }
                    style={r.dashed ? { borderColor: r.color } : { background: r.color }}
                    aria-hidden
                  />
                  <span className="label-mono">{r.key}</span>
                </div>
                <div className="display-num mt-3 text-[clamp(1.75rem,2.4vw,2.25rem)]">
                  {formatCount(r.value)}
                </div>
              </div>
            ))}
          </figcaption>
        </figure>
      </Reveal>

      <Reveal delay={120}>
        <p className="mt-8 max-w-[64ch] text-[12.5px] leading-relaxed text-[var(--viz-muted)]">
          Picked as the model&rsquo;s best Wednesday at this counter, out of 49. It is not
          typical — the same model ran 11% high on a March Wednesday. Check 2025 shows
          you both kinds of day.
        </p>
      </Reveal>
    </SectionShell>
  );
}
