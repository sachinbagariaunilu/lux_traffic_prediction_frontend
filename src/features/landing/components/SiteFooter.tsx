import { LinkedInIcon } from "@/components/ui/icons";
import { AUTHOR_URL, DATASET_NAME, DATASET_URL } from "../content";

export default function SiteFooter() {
  return (
    <footer className="relative border-t border-[var(--viz-hairline)]">
      <div className="mx-auto flex max-w-[82rem] flex-wrap items-center gap-x-8 gap-y-3 px-6 py-8 sm:px-10">
        <span className="label-mono">
          Counts:{" "}
          <a
            href={DATASET_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="underline underline-offset-2 transition hover:text-[var(--viz-ink)]"
          >
            {DATASET_NAME}
          </a>{" "}
          · CC0
        </span>
        <span className="label-mono">Trained through 2024-12-31</span>

        <a
          href={AUTHOR_URL}
          target="_blank"
          rel="noreferrer noopener"
          className="pill-quiet group label-mono ml-auto py-2 pl-3 pr-4 text-[var(--viz-ink-2)]"
        >
          <LinkedInIcon className="transition group-hover:text-[var(--lux-blue)]" />
          Built by Sachin Bagaria
        </a>
      </div>
    </footer>
  );
}
