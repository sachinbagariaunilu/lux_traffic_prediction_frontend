"use client";

import { CloseIcon, CollapseIcon, ExpandIcon, MapPinIcon } from "@/components/ui/icons";
import type { CounterSite } from "@/lib/types";

/** Which counter this panel is about, and the way out of it. */
export default function PanelHeader({
  site,
  heading,
  onClose,
  wide,
  onToggleWide,
}: {
  site: CounterSite;
  /** The selected series' `sens` -- the direction in words. */
  heading?: string;
  onClose: () => void;
  wide: boolean;
  onToggleWide: () => void;
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
          {/* Drops a pin at this counter. It confirms WHICH ROAD and place --
              never which direction, even though it sits under `heading`, which
              is the direction in words. `sens` is a LABEL: at Findel the feed
              said outboundFromTown while the traffic peaked the other way, and
              believing it moved MAE from 95 to 404 with a near-zero bias, so it
              never read as a bug. Direction is settled by correlating the daily
              shape, not by looking at a map. Site check only. */}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${site.lat.toFixed(6)},${site.lon.toFixed(6)}`}
            target="_blank"
            rel="noopener noreferrer"
            title={`Open ${site.lat.toFixed(5)}, ${site.lon.toFixed(5)} in Google Maps`}
            className="pill-quiet mt-3.5 px-3 py-2 text-[12px] text-[var(--viz-ink-2)]"
          >
            {/* A BUTTON, not a dotted-underlined phrase. As muted 11.5px text
                under a 2rem heading it read as a caption, and the 11px pin was
                small enough to pass for punctuation -- nothing said it could be
                clicked. `pill-quiet` is the same outlined control used for every
                other secondary action in the panel, so it is recognisable before
                it is read. Size is set here rather than on the icon's default,
                which stays at 11 for the inline use in CounterDetails. */}
            <MapPinIcon size={15} className="shrink-0" />
            Open in Google Maps
          </a>
        </div>
        {/* md, and the number is arithmetic rather than taste: the wide state
            is 80vw against a 540px cap, so it only WIDENS above 540/0.8 = 675px
            of viewport. Below that it would shrink the panel -- at sm (640px)
            80vw is 512px -- so the control is hidden where it would do the
            opposite of its label. md (768px) is the first breakpoint clear of
            that, at 614px.

            What earns the button: the comparison chart is three days by three
            readings, and nine lines do not fit in 540px. */}
        <button
          type="button"
          onClick={onToggleWide}
          aria-pressed={wide}
          aria-label={wide ? "Narrow the panel" : "Widen the panel"}
          title={wide ? "Narrow the panel" : "Widen the panel"}
          className="-mt-1.5 hidden shrink-0 p-2 text-[var(--viz-muted)] transition hover:bg-[var(--viz-ink)]/6 hover:text-[var(--viz-ink)] md:block"
        >
          {wide ? <CollapseIcon /> : <ExpandIcon />}
        </button>
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
