import Reveal from "@/components/ui/Reveal";

/**
 * The rhythm every section shares: one measure, one whitespace bay, a bracketed
 * mono marker, then the headline in caps. Having it in one place is what keeps
 * eight sections reading as one page -- and `--bay` means the vertical rhythm is
 * tuned once, in the stylesheet.
 *
 * The marker is now the bracketed form -- [ LU® ‒ SECTION ] -- rather than a
 * label sitting on a rule. It is the same information; the brackets just make
 * it read as a machine-set index entry, which is the register the rest of the
 * theme is in. The brackets themselves are drawn by ::before/::after in
 * `.eyebrow-bracket`, so the label stays one clean string for assistive tech.
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
  /** plane = the white ground, band = the one quiet step, inverted = black. */
  tone?: "plane" | "band" | "inverted";
  children: React.ReactNode;
}) {
  const ground = tone === "band" ? "band" : tone === "inverted" ? "inverted" : "";

  return (
    <section id={id} className={`${ground} ${id ? "scroll-mt-16" : ""}`}>
      <div className="mx-auto max-w-[82rem] px-6 py-[var(--bay)] sm:px-10">
        <Reveal>
          <p className="eyebrow-bracket">
            <b>LU®</b>
            <i>‒</i>
            <span>{eyebrow}</span>
          </p>
        </Reveal>

        {heading && (
          <Reveal delay={80}>
            <h2 className="display-lg mt-6 max-w-[26ch]">{heading}</h2>
          </Reveal>
        )}

        {lede && (
          <Reveal delay={140}>
            <p className="lede mt-6 max-w-[56ch]">{lede}</p>
          </Reveal>
        )}

        {children}
      </div>
    </section>
  );
}
