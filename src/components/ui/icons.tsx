/**
 * The icons this app uses, inline. Cheaper as JSX than an icon font, a
 * sprite sheet or a dependency, and they stay in step with the type scale
 * because every one takes its colour from `currentColor` and its size from a
 * prop.
 *
 * Every one is `aria-hidden` and always will be: an icon here is never the
 * accessible name. Where the name sits in the text beside it that is automatic;
 * where the icon is alone in a button (see `.icon-btn`), the BUTTON carries an
 * `aria-label` and the icon stays silent, so the name is announced once rather
 * than twice.
 */

export interface IconProps {
  size?: number;
  className?: string;
}

function Svg({
  size,
  className,
  strokeWidth,
  children,
}: IconProps & { strokeWidth: number; children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function ArrowRightIcon({ size = 15, className }: IconProps) {
  return (
    <Svg size={size} className={className} strokeWidth={2.4}>
      <path d="M5 12h13M13 6l6 6-6 6" />
    </Svg>
  );
}

export function ChevronDownIcon({ size = 14, className }: IconProps) {
  return (
    <Svg size={size} className={className} strokeWidth={2.2}>
      <path d="m6 9 6 6 6-6" />
    </Svg>
  );
}

export function ChevronLeftIcon({ size = 9, className }: IconProps) {
  return (
    <Svg size={size} className={className} strokeWidth={3}>
      <path d="M15 19 8 12l7-7" />
    </Svg>
  );
}

export function CloseIcon({ size = 18, className }: IconProps) {
  return (
    <Svg size={size} className={className} strokeWidth={2}>
      <path d="M18 6 6 18M6 6l12 12" />
    </Svg>
  );
}

export function SearchIcon({ size = 14, className }: IconProps) {
  return (
    <Svg size={size} className={className} strokeWidth={2.2}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </Svg>
  );
}

export function AlertIcon({ size = 16, className }: IconProps) {
  return (
    <Svg size={size} className={className} strokeWidth={2}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5M12 16.5v.01" />
    </Svg>
  );
}

export function MapPinIcon({ size = 11, className }: IconProps) {
  return (
    <Svg size={size} className={className} strokeWidth={2}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </Svg>
  );
}

/**
 * The pin as a MAP MARKER: solid teardrop, knocked-out centre -- the shape
 * every mapping product uses, which is why it is legible with no label at all.
 * `MapPinIcon` above stays the outline one, for the inline use in
 * CounterDetails where it sits in a row of text at 11px and a solid blob that
 * size reads as a bullet.
 *
 * Deliberately NOT Google's own mark, even though the link goes to Google Maps:
 * that logo is their trademark and a hand-drawn approximation of it would be
 * both a worse drawing and someone else's brand. The shape does the
 * recognising; `aria-label` and `title` name the destination.
 */
export function MapMarkerIcon({ size = 15, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path
        d="M12 2a7.5 7.5 0 0 0-7.5 7.5c0 5.4 6.6 11.7 6.88 11.97a.9.9 0 0 0 1.24 0C12.9 21.2 19.5 14.9 19.5 9.5A7.5 7.5 0 0 0 12 2Zm0 10.25a2.75 2.75 0 1 1 0-5.5 2.75 2.75 0 0 1 0 5.5Z"
        fillRule="evenodd"
      />
    </svg>
  );
}

export function ExpandIcon({ size = 15, className }: IconProps) {
  return (
    <Svg size={size} className={className} strokeWidth={2}>
      <path d="m9 7-5 5 5 5M15 7l5 5-5 5" />
    </Svg>
  );
}

export function CollapseIcon({ size = 15, className }: IconProps) {
  return (
    <Svg size={size} className={className} strokeWidth={2}>
      <path d="m20 7-5 5 5 5M4 7l5 5-5 5" />
    </Svg>
  );
}

export function PencilIcon({ size = 14, className }: IconProps) {
  return (
    <Svg size={size} className={className} strokeWidth={2}>
      <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Z" />
      <path d="m14.5 5.5 4 4" />
    </Svg>
  );
}

export function TrashIcon({ size = 14, className }: IconProps) {
  return (
    <Svg size={size} className={className} strokeWidth={2}>
      <path d="M4 7h16M10 4h4M6 7l1 13h10l1-13" />
      <path d="M10.5 11v5.5M13.5 11v5.5" />
    </Svg>
  );
}

export function DownloadIcon({ size = 14, className }: IconProps) {
  return (
    <Svg size={size} className={className} strokeWidth={2}>
      <path d="M12 3v12M7.5 10.5 12 15l4.5-4.5" />
      <path d="M4 18v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2" />
    </Svg>
  );
}

export function LinkedInIcon({ size = 13, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.65h.05A4.17 4.17 0 0 1 17.6 8.7c4 0 4.75 2.5 4.75 5.77V21h-4v-5.73c0-1.37-.03-3.13-1.96-3.13-1.96 0-2.26 1.49-2.26 3.03V21h-4V9Z" />
    </svg>
  );
}
