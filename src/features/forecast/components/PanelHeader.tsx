"use client";

import { CloseIcon } from "@/components/ui/icons";
import type { CounterSite } from "@/lib/types";

/** Which counter this panel is about, and the way out of it. */
export default function PanelHeader({
  site,
  heading,
  onClose,
}: {
  site: CounterSite;
  /** The selected series' `sens` -- the direction in words. */
  heading?: string;
  onClose: () => void;
}) {
  return (
    <header className="relative shrink-0 overflow-hidden bg-[var(--viz-surface)] px-6 pb-6 pt-6">
      <span className="lux-rule absolute inset-x-0 top-0 h-[3px]" aria-hidden />
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-center gap-2">
            <span className="tile-accent px-2.5 py-1 text-[10.5px]">{site.route}</span>
            <span className="label-mono">counter {site.poste_id}</span>
          </div>
          <h2 className="display-lg truncate text-[clamp(1.5rem,4.5vw,2rem)] text-[var(--viz-ink)]">
            {site.localite}
          </h2>
          <p className="mt-2 line-clamp-2 text-[12px] leading-snug text-[var(--viz-ink-2)]">
            {heading}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close panel"
          className="-mr-1.5 -mt-1.5 shrink-0 p-2 text-[var(--viz-muted)] transition hover:bg-[var(--viz-ink)]/6 hover:text-[var(--viz-ink)]"
        >
          <CloseIcon />
        </button>
      </div>
    </header>
  );
}
