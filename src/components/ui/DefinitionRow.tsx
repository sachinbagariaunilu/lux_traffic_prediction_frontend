/** Term on the left, value hard right. Rows hairline-divide themselves. */
export default function DefinitionRow({
  term,
  children,
}: {
  term: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline gap-3 border-t border-[var(--viz-grid)] py-2 first:border-t-0">
      <dt className="label-mono shrink-0">{term}</dt>
      <dd className="ml-auto min-w-0 truncate text-right font-medium text-[var(--viz-ink)]">
        {children}
      </dd>
    </div>
  );
}
