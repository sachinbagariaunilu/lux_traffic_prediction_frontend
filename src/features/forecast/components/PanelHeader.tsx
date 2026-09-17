"use client";

import { CloseIcon, CollapseIcon, ExpandIcon, MapMarkerIcon } from "@/components/ui/icons";
import type { CounterSite } from "@/lib/types";

/** Which counter this panel is about, and the three things you can do to it. */
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
  const coords = `${site.lat.toFixed(5)}, ${site.lon.toFixed(5)}`;

  return (
    <header className="relative shrink-0 overflow-hidden bg-[var(--viz-surface)] px-6 pb-5 pt-5">
      <span className="lux-rule absolute inset-x-0 top-0 h-[3px]" aria-hidden />
      <div className="flex items-start gap-4">
        {/* IDENTITY on the left, ACTIONS on the right -- and nothing crosses
            over. What this block says, top to bottom, is: which road, which
            counter, which place, which way. Four facts, no controls between
            them, so the panel opens with a sentence rather than a form. */}
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

        {/* One column, ordered by how often it is reached for and how hard it
            is to undo: dismissal alone on the first row, the two that merely
            change the view beneath it.

            The maps link USED to be a labelled pill under `heading`, which cost
            the header ~44px of height on every open -- a permanent price for a
            control most readers press once per counter, above a panel whose
            body is the thing they came for. As an icon it costs nothing, and
            the height goes back to the forecast.

            It is outlined rather than ghosted because it is the one action here
            with no conventional home: a reader expects `x` top-right and knows
            the chevrons, but nothing tells them a pin is sitting there. The
            hairline is what is left of the label.

            Still a SITE CHECK and nothing more: it confirms which road and
            place, never which direction, even though it now sits beside
            `heading`, which is the direction in words. `sens` is a LABEL -- at
            Findel the feed said outboundFromTown while the traffic peaked the
            other way, and believing it moved MAE from 95 to 404 with a
            near-zero bias, so it never read as a bug. Direction is settled by
            correlating the daily shape, not by looking at a map. */}
        <div className="-mr-2 -mt-2 flex shrink-0 flex-col items-end gap-1.5">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            title="Close panel (Esc)"
            className="icon-btn"
          >
            <CloseIcon />
          </button>

          <div className="flex items-center gap-1.5">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${site.lat.toFixed(6)},${site.lon.toFixed(6)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${coords} in Google Maps, opens in a new tab`}
              title={`Open ${coords} in Google Maps`}
              className="icon-btn icon-btn-line text-[var(--accent-ink)]"
            >
              <MapMarkerIcon />
            </a>

            {/* md, and the number is arithmetic rather than taste: the wide
                state is 80vw against a 540px cap, so it only WIDENS above
                540/0.8 = 675px of viewport. Below that it would shrink the
                panel -- at sm (640px) 80vw is 512px -- so the control is hidden
                where it would do the opposite of its label. md (768px) is the
                first breakpoint clear of that, at 614px.

                What earns the button: the comparison chart is three days by
                three readings, and nine lines do not fit in 540px. */}
            <button
              type="button"
              onClick={onToggleWide}
              aria-pressed={wide}
              aria-label={wide ? "Narrow the panel" : "Widen the panel"}
              title={wide ? "Narrow the panel" : "Widen the panel"}
              className="icon-btn icon-btn-line hidden md:inline-flex"
            >
              {wide ? <CollapseIcon /> : <ExpandIcon />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
