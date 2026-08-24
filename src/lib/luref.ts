import proj4 from "proj4";

/**
 * The API hands back coord_x / coord_y in LUREF (EPSG:2169) metres, straight
 * from the source CSV -- e.g. (76264, 64753) for the A3 at Bettembourg. Those
 * are NOT degrees; plotting them raw drops every pin in the Atlantic.
 *
 * Definition is EPSG:2169 (Luxembourg TM) on the International 1924 ellipsoid
 * with the 7-parameter shift to WGS84. Two details are easy to get wrong and
 * both cost ~230 m if you do:
 *
 *   k=1, not 0.9999 -- the official Luxembourg TM scale factor.
 *   Rotations are NEGATED against the EPSG values. EPSG publishes this shift
 *   in coordinate_frame convention; proj4's +towgs84 reads position_vector,
 *   and the two differ by the sign of rx/ry/rz.
 *
 * Verified against PROJ ("LUREF to WGS 84 (3)", 1 m accuracy) over all 270
 * counter locations: max error 0.00 m.
 */
const LUREF =
  "+proj=tmerc +lat_0=49.8333333333333 +lon_0=6.16666666666667 " +
  "+k=1 +x_0=80000 +y_0=100000 +ellps=intl " +
  "+towgs84=-189.6806,18.3463,-42.7695,-0.33746,-3.09264,2.53861,0.4598 " +
  "+units=m +no_defs";

proj4.defs("EPSG:2169", LUREF);

const toWgs84 = proj4("EPSG:2169", "WGS84");

/** LUREF metres -> { lat, lon } in WGS84 degrees. */
export function lurefToLatLon(x: number, y: number): { lat: number; lon: number } {
  const [lon, lat] = toWgs84.forward([x, y]);
  return { lat, lon };
}

/** Rough Luxembourg envelope, used to catch a bad reprojection early. */
export function isInLuxembourg(lat: number, lon: number): boolean {
  return lat > 49.4 && lat < 50.25 && lon > 5.7 && lon < 6.6;
}

/** Map centre and zoom that frame the whole country. */
export const LUX_CENTER: [number, number] = [49.815, 6.13];
export const LUX_ZOOM = 9;
