"use client";

import { useId, useState } from "react";
import { ChevronDownIcon } from "./icons";

/**
 * Collapsed-by-default section: a full-width button that rotates its chevron,
 * and the panel it controls. Open state is owned here -- no caller has a reason
 * to know whether a details drawer happens to be open.
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
        className="label-mono flex w-full items-center justify-between bg-[var(--viz-surface)] px-4 py-3 text-[var(--viz-ink)] ring-1 ring-[var(--viz-border)] transition hover:bg-[var(--viz-series)]/6"
      >
        {label}
        <ChevronDownIcon
          className={`text-[var(--viz-muted)] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div id={panelId}>{children}</div>}
    </>
  );
}
