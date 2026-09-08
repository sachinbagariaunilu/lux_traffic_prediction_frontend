import DefinitionRow from "@/components/ui/DefinitionRow";
import { formatCount } from "@/lib/format";
import { lurefToLatLon } from "@/lib/luref";
import type { CounterSeries, ForecastResponse } from "@/lib/types";
import { DAYS_IN_YEAR, vehicleLabel } from "../lib/constants";
import type { Product } from "../lib/products";

/**
 * Every field /counters carries for the chosen series, plus what the model says
 * about itself -- nothing withheld. `expected_error` is labelled "stated error"
 * deliberately: it is one global constant across all 1,054 series, not this
 * counter's measured accuracy.
 */
export default function CounterDetails({
  product,
  series,
  meta,
}: {
  product: Product;
  series: CounterSeries;
  meta: ForecastResponse;
}) {
  const { lat, lon } = lurefToLatLon(series.coord_x, series.coord_y);
  return (
    <dl className="text-[11px]">
      <DefinitionRow term="Counter id">{series.poste_id}</DefinitionRow>
      <DefinitionRow term="Route">{series.route}</DefinitionRow>
      <DefinitionRow term="Locality">{series.localite}</DefinitionRow>
      <DefinitionRow term="Direction">{series.direction}</DefinitionRow>
      <DefinitionRow term="Heading">{series.sens}</DefinitionRow>
      <DefinitionRow term="Vehicle">
        {vehicleLabel(series.vehicule)} ({series.vehicule})
      </DefinitionRow>
      <DefinitionRow term="Avg per hour">
        <span className="tabular-nums">{formatCount(series.avg_per_hour)}</span> veh/h
      </DefinitionRow>
      <DefinitionRow term="Days reported">
        <span className="tabular-nums">{series.days_reported}</span> of {DAYS_IN_YEAR}
      </DefinitionRow>
      <DefinitionRow term="First day">
        <span className="tabular-nums">{series.first_day}</span>
      </DefinitionRow>
      <DefinitionRow term="Last day">
        <span className="tabular-nums">{series.last_day}</span>
      </DefinitionRow>
      <DefinitionRow term="LUREF x, y">
        <span className="tabular-nums">
          {Math.round(series.coord_x)}, {Math.round(series.coord_y)}
        </span>
      </DefinitionRow>
      <DefinitionRow term="Lat, lon">
        <span className="tabular-nums">
          {lat.toFixed(5)}, {lon.toFixed(5)}
        </span>
      </DefinitionRow>
      {/* Named from the API's own answer (`meta.model`), not from the product,
          so a mismatch between the page and what actually replied would be
          visible here rather than papered over by the page's own label. */}
      <DefinitionRow term="Model">
        {product.modelLabel} <span className="text-[var(--viz-muted)]">({meta.model})</span>
      </DefinitionRow>
      <DefinitionRow term="Trained on">
        <span className="tabular-nums">{product.trainedOn}</span>
      </DefinitionRow>
      <DefinitionRow term="Trained through">
        <span className="tabular-nums">{product.trainedThrough}</span>
      </DefinitionRow>
      {/* Only the validation model has one. The forecasting model trained on
          every year we hold recorded counts for, so there is no unseen year to
          quote -- and a blank ± figure would read as a missing number rather
          than an absent measurement. One decimal, because formatCount rounds
          to whole vehicles and would print ±13 where the rest of the site
          says ±13.0. */}
      <DefinitionRow term="Stated error">
        {meta.expected_error === null ? (
          <span className="text-[var(--viz-muted)]">
            none — no unseen year to measure on
          </span>
        ) : (
          <>
            <span className="tabular-nums">±{meta.expected_error.toFixed(1)}</span> veh/h
          </>
        )}
      </DefinitionRow>
      <DefinitionRow term="Holiday period">
        {meta.is_holiday_period ? "yes" : "no"}
      </DefinitionRow>
    </dl>
  );
}
