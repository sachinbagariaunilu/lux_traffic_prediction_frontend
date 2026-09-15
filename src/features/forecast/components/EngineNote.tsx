import Disclosure from "@/components/ui/Disclosure";
import { longDate } from "@/lib/format";
import type { EngineOutcome } from "../hooks/useForecastRun";

/**
 * Says when a SHORT-HORIZON model answered instead of the page's own model.
 *
 * Why this has to be visible at all. The page states, prominently, which model
 * is behind it -- that is the point ModelBadge exists to make. For two dates per
 * counter that statement is not true: the day after this series' last recorded
 * hour, and the day after that, are answered by the 24h and 48h models, which
 * were handed the counter's own recent traffic.
 *
 * An unannounced swap would be the same failure this project was built to avoid,
 * in miniature -- a number whose provenance the reader cannot see. It is also a
 * visibly BETTER number on those days, and a reader who cannot tell why one date
 * is sharper than its neighbour learns to distrust both.
 *
 * One line, then the reasoning behind a dropdown. Renders nothing on the
 * ordinary path, which is most dates on both pages.
 */
export default function EngineNote({ outcome }: { outcome: EngineOutcome | null }) {
  if (!outcome) return null;
  const { engine, fellBack } = outcome;

  // The lag model was chosen and refused. The forecast on screen is real and
  // came from the page's usual model -- a note, not an error.
  if (fellBack && fellBack.from.kind === "lag") {
    return (
      <div className="space-y-2">
        <p className="rounded-[var(--r-control)] border border-[var(--viz-axis)]/40 bg-[var(--viz-surface)] px-3 py-2.5 text-[12.5px] leading-snug text-[var(--viz-muted)]">
          The {fellBack.from.lead}-hour model would normally answer this date. It could
          not, so this came from the page&apos;s usual model.
        </p>
        <Disclosure label="Why the sharper model was unavailable">
          <div className="bg-[var(--viz-surface)] px-4 py-3.5 text-[11.5px] leading-relaxed text-[var(--viz-ink-2)] ring-1 ring-[var(--viz-border)]">
            <p>
              Short-horizon models need this counter&apos;s recent recorded counts sent
              with the request, and they refuse rather than guess when those counts are
              missing or too old.
            </p>
            <p className="mt-2 text-[var(--viz-muted)]">{fellBack.reason}</p>
          </div>
        </Disclosure>
      </div>
    );
  }

  if (engine.kind !== "lag") return null;

  const tone = "var(--viz-actual)";
  return (
    <div className="space-y-2">
      <div
        className="rounded-[var(--r-control)] border px-3 py-2.5"
        style={{ borderColor: `${tone}44`, background: `${tone}0d` }}
      >
        <p className="label-mono flex flex-wrap items-center gap-x-1.5 leading-tight">
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ background: tone }}
            aria-hidden
          />
          <span style={{ color: tone }}>{engine.lead}-hour model</span>
          <span className="text-[var(--viz-muted)]">
            · given real counts to {longDate(engine.lastObserved)}
          </span>
        </p>
      </div>

      <Disclosure label="Why this date uses a sharper model">
        <div className="space-y-2.5 bg-[var(--viz-surface)] px-4 py-3.5 text-[11.5px] leading-relaxed text-[var(--viz-ink-2)] ring-1 ring-[var(--viz-border)]">
          <p>
            This date is close enough to real data to be answered by a better model. It
            was given this counter&apos;s own recorded traffic up to{" "}
            <strong className="font-semibold text-[var(--viz-ink)]">
              {longDate(engine.lastObserved)}
            </strong>
            , rather than only the date — so it reads the last few days of actual
            conditions instead of an average of past years.
          </p>
          <p>
            That also means it carries today&apos;s traffic levels, so the growth caveat
            on the rest of this page does not apply to it.
          </p>
          <p className="text-[var(--viz-muted)]">
            Beyond {engine.lead === 24 ? "one day" : "two days"} past the recorded data
            this model refuses, and the page&apos;s usual model takes over.
          </p>
        </div>
      </Disclosure>
    </div>
  );
}
