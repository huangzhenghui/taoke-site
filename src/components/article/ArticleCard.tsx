import Link from "next/link";

import type { Article } from "@/modules/article";

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

type ArticleCardProps = {
  article: Article;
};

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <article className="flex h-full flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-md bg-emerald-50 px-2 py-1 font-medium text-emerald-700">
          {article.categoryName}
        </span>
        <time className="text-zinc-500" dateTime={article.publishedAt}>
          {dateFormatter.format(new Date(article.publishedAt))}
        </time>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold leading-7 text-zinc-950">
          {article.title}
        </h2>
        <p className="text-sm leading-6 text-zinc-600">{article.summary}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {article.tags.map((tag) => (
          <span
            className="rounded-md border border-zinc-200 px-2 py-1 text-xs text-zinc-500"
            key={tag}
          >
            {tag}
          </span>
        ))}
      </div>

      <Link
        className="mt-auto inline-flex h-10 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
        href={`/article/${article.slug}`}
      >
        查看文章
      </Link>
    </article>
  );
}
