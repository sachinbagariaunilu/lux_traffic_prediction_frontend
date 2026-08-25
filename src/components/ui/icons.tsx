/**
 * The seven icons this app uses, inline. Cheaper as JSX than an icon font, a
 * sprite sheet or a dependency, and they stay in step with the type scale
 * because every one takes its colour from `currentColor` and its size from a
 * prop. All are decorative: the label always sits in the text beside them.
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
