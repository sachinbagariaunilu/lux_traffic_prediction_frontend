import { AlertIcon } from "./icons";

/**
 * A failure the user can act on: what broke, then the message the throwing
 * layer wrote. Two sizes, because the same notice appears full-width in the
 * map area and inline inside the forecast panel.
 *
 * Class names are written out in full rather than interpolated -- Tailwind
 * extracts them statically, so a built-up string produces no CSS.
 */
export default function ErrorNotice({
  title,
  message,
  size = "md",
}: {
  title: string;
  message: string;
  size?: "sm" | "md";
}) {
  const sm = size === "sm";
  return (
    <div
      className={
        sm
          ? "bg-[var(--viz-surface)] px-4 py-3.5 ring-1 ring-[var(--status-bad)]/35"
          : "bg-[var(--viz-surface)] px-6 py-5 ring-1 ring-[var(--status-bad)]/35"
      }
    >
      <div
        className={`flex items-center gap-2 text-[var(--status-bad)] ${sm ? "mb-1" : "mb-2"}`}
      >
        <AlertIcon size={sm ? 14 : 16} />
        <span className={sm ? "label-mono text-[10px]" : "label-mono text-[11px]"}>
          {title}
        </span>
      </div>
      <p
        className={
          sm
            ? "text-[11px] leading-relaxed text-[var(--viz-ink-2)]"
            : "text-xs leading-relaxed text-[var(--viz-ink-2)]"
        }
      >
        {message}
      </p>
    </div>
  );
}
