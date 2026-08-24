"use client";

import L from "leaflet";
import {
  CircleMarker,
  MapContainer,
  TileLayer,
  Tooltip,
  ZoomControl,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import "leaflet/dist/leaflet.css";
import { LUX_CENTER, LUX_ZOOM } from "@/lib/luref";
import type { CounterSite } from "@/lib/types";

/**
 * Pin size encodes magnitude on one hue (sequential), never a rainbow.
 * sqrt so that area -- not radius -- tracks traffic, which is how people
 * actually read circle size.
 */
function radiusFor(perHour: number, max: number): number {
  const MIN_R = 4;
  const MAX_R = 15;
  return MIN_R + (MAX_R - MIN_R) * Math.sqrt(Math.max(perHour, 0) / max);
}

/**
 * Cluster bubbles sized by how many counters they hold. Built as a plain
 * divIcon so the styling lives in globals.css with the rest of the tokens
 * rather than in leaflet's own stylesheet.
 */
function clusterIcon(cluster: { getChildCount: () => number }) {
  const n = cluster.getChildCount();
  const size = n < 10 ? 34 : n < 40 ? 42 : 50;
  return L.divIcon({
    html: `<span>${n}</span>`,
    className: "counter-cluster",
    iconSize: L.point(size, size, true),
  });
}

export default function MapView({
  sites,
  selectedId,
  onSelect,
}: {
  sites: CounterSite[];
  selectedId: number | null;
  onSelect: (site: CounterSite) => void;
}) {
  const max = Math.max(...sites.map((s) => s.totalPerHour), 1);

  return (
    <MapContainer
      center={LUX_CENTER}
      zoom={LUX_ZOOM}
      scrollWheelZoom
      // Default zoom position is topleft, where the counters card sits.
      zoomControl={false}
      className="h-full w-full bg-[var(--viz-plane)]"
    >
      <ZoomControl position="topright" />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MarkerClusterGroup
        iconCreateFunction={clusterIcon}
        // Stop clustering early enough that individual roads stay distinguishable.
        disableClusteringAtZoom={12}
        maxClusterRadius={54}
        spiderfyOnMaxZoom={false}
        showCoverageOnHover={false}
        chunkedLoading
      >
        {sites.map((site) => {
          const isSelected = site.poste_id === selectedId;
          return (
            <CircleMarker
              key={site.poste_id}
              center={[site.lat, site.lon]}
              radius={radiusFor(site.totalPerHour, max)}
              pathOptions={{
                // 2px surface ring keeps overlapping pins readable.
                color: isSelected ? "var(--viz-actual)" : "#ffffff",
                weight: isSelected ? 3 : 2,
                fillColor: isSelected ? "var(--viz-actual)" : "var(--viz-series)",
                fillOpacity: isSelected ? 0.95 : 0.7,
                className: isSelected ? "counter-pin is-selected" : "counter-pin",
              }}
              eventHandlers={{ click: () => onSelect(site) }}
            >
              <Tooltip direction="top" offset={[0, -4]} opacity={1}>
                <div className="text-[11px]">
                  <div className="font-semibold text-[var(--viz-ink)]">
                    {site.route} — {site.localite}
                  </div>
                  <div className="text-[var(--viz-ink-2)]">
                    {Math.round(site.totalPerHour).toLocaleString("en-GB")} vehicles/h ·{" "}
                    {site.series.length} series
                  </div>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MarkerClusterGroup>
    </MapContainer>
  );
}
