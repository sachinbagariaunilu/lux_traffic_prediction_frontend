import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/icons";

/**
 * The rotating seal: a ring of text turning slowly around a solid accent disc
 * with an arrow in it. The reference layout's primary call to action, and the
 * one piece of motion in the hero that runs continuously.
 *
 * Built as an SVG `textPath` rather than a stack of absolutely-positioned
 * letters. The alternative -- one <span> per character, each rotated by
 * `i * (360/n)` degrees -- is what most implementations reach for, and it costs
 * a span per character, breaks the string for a screen reader and for
 * translation, and needs remeasuring whenever the label changes length. A
 * textPath keeps the label as ONE string that the browser distributes along a
 * circle itself, so the label can be edited freely and still fits.
 *
 * The ring is `aria-hidden` and the accessible name comes from the link's own
 * label -- otherwise the name would be the ring text read twice, once around
 * the circle and once in the middle.
 *
 * Server Component: the spin is a CSS animation on `.seal`, so nothing here
 * ships as JavaScript.
 */
export default function SealCTA({
  href,
  ring,
  label,
  className = "",
}: {
  href: string;
  /** The text that runs around the circle. Repeated to close the ring. */
  ring: string;
  /** The accessible name for the link. */
  label: string;
  className?: string;
}) {
  // Two copies with a separator, so the ring reads continuously however the
  // label is phrased -- one copy leaves a gap at the top of the circle.
  const around = `${ring} · ${ring} · `;

  // The ring is r=74, so the path is 2*pi*74 long. Handing that to `textLength`
  // with lengthAdjust="spacing" makes the browser distribute the string over
  // exactly one revolution: the label can be any length and it still closes the
  // circle without overlapping itself. Without this the text runs past its own
  // start and the two copies collide, which is what letter-spacing guesswork
  // gets you the moment the label is edited.
  const CIRCUMFERENCE = 2 * Math.PI * 74;

  return (
    <Link
      href={href}
      aria-label={label}
      className={`seal-stop group relative grid h-[132px] w-[132px] shrink-0 place-items-center sm:h-[156px] sm:w-[156px] ${className}`}
    >
      <svg viewBox="0 0 200 200" className="seal absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          {/* Drawn as two arcs rather than a <circle>, because text only flows
              along a path. Starts at the left so the label begins at 9 o'clock
              and reads over the top. */}
          <path id="seal-ring" d="M 100,100 m -74,0 a 74,74 0 1,1 148,0 a 74,74 0 1,1 -148,0" />
        </defs>
        <text
          fill="currentColor"
          fontSize="12.5"
          className="font-[family-name:var(--font-space-mono)] uppercase"
        >
          <textPath
            href="#seal-ring"
            startOffset="0"
            textLength={CIRCUMFERENCE}
            lengthAdjust="spacing"
          >
            {around}
          </textPath>
        </text>
      </svg>

      <span
        className="grid h-[58px] w-[58px] place-items-center rounded-full bg-[var(--lux-blue)] text-[#0a0a0a] transition-transform duration-300 group-hover:scale-110 sm:h-[68px] sm:w-[68px]"
        aria-hidden
      >
        <ArrowRightIcon size={20} />
      </span>
    </Link>
  );
}
