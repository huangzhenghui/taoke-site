import Link from "next/link";

import type { SeoPage } from "@/modules/seo-page";

type SeoPageCardProps = {
  seoPage: SeoPage;
};

export function SeoPageCard({ seoPage }: SeoPageCardProps) {
  return (
    <article className="flex h-full flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-md bg-emerald-50 px-2 py-1 font-medium text-emerald-700">
          {seoPage.categoryName}
        </span>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold leading-7 text-zinc-950">
          {seoPage.h1 || seoPage.title}
        </h2>
        <p className="text-sm leading-6 text-zinc-600">
          {seoPage.description}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {seoPage.keywords.map((keyword) => (
          <span
            className="rounded-md border border-zinc-200 px-2 py-1 text-xs text-zinc-500"
            key={keyword}
          >
            {keyword}
          </span>
        ))}
      </div>

      <Link
        className="mt-auto inline-flex h-10 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
        href={`/topic/${seoPage.slug}`}
      >
        查看专题
      </Link>
    </article>
  );
}
