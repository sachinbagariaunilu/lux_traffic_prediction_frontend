"use client";

import { useId, useState } from "react";
import { ChevronDownIcon } from "./icons";

/**
 * Collapsed-by-default section: a full-width button that rotates its chevron,
 * and the panel it controls. Open state is owned here -- no caller has a reason
 * to know whether a details drawer happens to be open.
 *
 * The row is styled by `.drawer` in globals.css, which is where the accent chip
 * on the chevron and its rotation live -- both keyed off `aria-expanded`, so
 * the thing a screen reader is told and the thing everyone else can see are
 * driven by one attribute and cannot drift apart.
 */
export default function Disclosure({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className={`drawer label-mono flex w-full items-center justify-between gap-3 px-4 py-3 text-left ring-1 transition ${
          open
            ? "bg-[var(--lux-blue)]/6 text-[var(--accent-ink)] ring-[var(--accent-ink)]/35"
            : "bg-[var(--viz-surface)] text-[var(--viz-ink)] ring-[var(--viz-border)] hover:bg-[var(--lux-blue)]/5"
        }`}
      >
        {label}
        <span className="drawer-chevron" aria-hidden>
          <ChevronDownIcon />
        </span>
      </button>
      {open && <div id={panelId}>{children}</div>}
    </>
  );
}
