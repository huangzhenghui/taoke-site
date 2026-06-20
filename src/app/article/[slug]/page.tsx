import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/product/ProductCard";
import { getAllArticles, getArticleBySlug } from "@/modules/article";
import { getProductsByIds } from "@/modules/product";

type ArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export async function generateStaticParams() {
  return getAllArticles().map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return {
      title: "文章不存在",
    };
  }

  return {
    description: article.summary,
    title: article.title,
  };
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const relatedProducts = getProductsByIds(article.relatedProductIds);

  return (
    <main className="min-h-screen bg-zinc-50 px-5 py-8 text-zinc-950 sm:px-8 lg:px-12">
      <article className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <Link className="text-sm font-medium text-zinc-600 hover:text-zinc-950" href="/">
          返回首页
        </Link>

        <header className="space-y-5 border-b border-zinc-200 pb-8">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Link
              className="rounded-md bg-emerald-50 px-2 py-1 font-medium text-emerald-700"
              href={`/category/${article.categoryId}`}
            >
              {article.categoryName}
            </Link>
            <time className="text-zinc-500" dateTime={article.publishedAt}>
              {dateFormatter.format(new Date(article.publishedAt))}
            </time>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl font-semibold leading-tight tracking-normal text-zinc-950 sm:text-4xl">
              {article.title}
            </h1>
            <p className="text-lg leading-8 text-zinc-600">{article.summary}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span
                className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm text-zinc-600"
                key={tag}
              >
                {tag}
              </span>
            ))}
          </div>
        </header>

        <div
          aria-label={article.title}
          className="aspect-[1200/630] rounded-lg bg-zinc-100 bg-cover bg-center"
          role="img"
          style={{ backgroundImage: `url(${article.coverImage})` }}
        />

        <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm sm:p-8">
          <p className="text-base leading-8 text-zinc-700">{article.content}</p>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold text-zinc-950">关联商品</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              根据文章内容关联的 mock 商品，后续可替换为后台配置或接口数据。
            </p>
          </div>

          {relatedProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-zinc-300 bg-white px-6 py-10 text-center text-sm text-zinc-600">
              当前文章暂无关联商品。
            </div>
          )}
        </section>
      </article>
    </main>
  );
}
