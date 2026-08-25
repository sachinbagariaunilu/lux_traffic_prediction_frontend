import Reveal from "@/components/ui/Reveal";
import { LIMITS } from "../content";
import SectionShell from "./SectionShell";

/**
 * Said out loud, before anyone quotes a number from here. Flag red leads these
 * rows rather than flag cyan -- the only place in the app where the alert
 * colour is used as identity, and it is used to admit something.
 */
export default function LimitsSection() {
  return (
    <SectionShell
      eyebrow="What it cannot do"
      heading={<>Worth knowing before you trust a number.</>}
    >
      <ul className="mt-14">
        {LIMITS.map((c, i) => (
          <Reveal as="li" key={c.title} delay={i * 90}>
            <div className="rule-row grid gap-x-10 gap-y-4 py-9 md:grid-cols-[3.25rem_18rem_1fr]">
              <span className="tile-alert h-[3.25rem] w-[3.25rem] text-[15px]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="display-md pt-2">{c.title}</h3>
              <p className="max-w-[64ch] text-[14px] leading-[1.6] text-[var(--viz-ink-2)]">
                {c.body}
              </p>
            </div>
          </Reveal>
        ))}
      </ul>
    </SectionShell>
  );
}
