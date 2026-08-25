import Reveal from "@/components/ui/Reveal";

/**
 * The rhythm every section shares: one measure, one whitespace bay, a mono
 * eyebrow over a hairline, then the headline in caps. Having it in one place is
 * what keeps eight sections reading as one page -- and `--bay` means the
 * vertical rhythm is tuned once, in the stylesheet.
 */
export default function SectionShell({
  id,
  eyebrow,
  heading,
  lede,
  tone = "plane",
  children,
}: {
  id?: string;
  eyebrow: string;
  heading?: React.ReactNode;
  lede?: React.ReactNode;
  /** plane = the grey ground, band = the quiet step, inverted = black. */
  tone?: "plane" | "band" | "inverted";
  children: React.ReactNode;
}) {
  const ground = tone === "band" ? "band" : tone === "inverted" ? "inverted" : "";

  return (
    <section id={id} className={`${ground} ${id ? "scroll-mt-16" : ""}`}>
      <div className="mx-auto max-w-[82rem] px-6 py-[var(--bay)] sm:px-10">
        <Reveal>
          <div className="eyebrow-rule">
            <p className="eyebrow">{eyebrow}</p>
          </div>
        </Reveal>

        {heading && (
          <Reveal delay={80}>
            <h2 className="display-lg mt-8 max-w-[26ch]">{heading}</h2>
          </Reveal>
        )}

        {lede && (
          <Reveal delay={140}>
            <p className="lede mt-7 max-w-[56ch]">{lede}</p>
          </Reveal>
        )}

        {children}
      </div>
    </section>
  );
}
