"use client";

/** Labelled radio group drawn as one pill. Styling lives in `.segment`. */
export default function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string; hint?: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div>
      <span className="label-mono mb-2 block">{label}</span>
      <div className="segment" role="group" aria-label={label}>
        {options.map((o) => (
          <button
            key={String(o.value)}
            type="button"
            data-on={o.value === value}
            aria-pressed={o.value === value}
            onClick={() => onChange(o.value)}
            title={o.hint}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
