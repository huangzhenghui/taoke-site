import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArticleCard } from "@/components/article/ArticleCard";
import { ProductCard } from "@/components/product/ProductCard";
import { getArticlesByIds } from "@/modules/article";
import { getProductsByIds } from "@/modules/product";
import { mockSeoPages } from "@/modules/seo-page";

type TopicPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function findTopicBySlug(slug: string) {
  return mockSeoPages.find((topic) => topic.slug === slug);
}

export async function generateStaticParams() {
  return mockSeoPages.map((topic) => ({
    slug: topic.slug,
  }));
}

export async function generateMetadata({
  params,
}: TopicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const topic = findTopicBySlug(slug);

  if (!topic) {
    return {
      title: "专题不存在",
    };
  }

  return {
    description: topic.description,
    title: topic.title,
  };
}

export default async function TopicDetailPage({ params }: TopicPageProps) {
  const { slug } = await params;
  const topic = findTopicBySlug(slug);

  if (!topic) {
    notFound();
  }

  const relatedProducts = getProductsByIds(topic.relatedProductIds);
  const relatedArticles = getArticlesByIds(topic.relatedArticleIds);

  return (
    <main className="min-h-screen bg-zinc-50 px-5 py-8 text-zinc-950 sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <Link className="text-sm font-medium text-zinc-600 hover:text-zinc-950" href="/">
          返回首页
        </Link>

        <header className="space-y-5 border-b border-zinc-200 pb-8">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Link
              className="rounded-md bg-emerald-50 px-2 py-1 font-medium text-emerald-700"
              href={`/category/${topic.categoryId}`}
            >
              {topic.categoryName}
            </Link>
          </div>

          <div className="max-w-4xl space-y-4">
            <h1 className="text-3xl font-semibold leading-tight tracking-normal text-zinc-950 sm:text-4xl">
              {topic.h1}
            </h1>
            <p className="text-lg leading-8 text-zinc-600">
              {topic.description}
            </p>
            <p className="text-base leading-7 text-zinc-600">{topic.intro}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {topic.keywords.map((keyword) => (
              <span
                className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm text-zinc-600"
                key={keyword}
              >
                {keyword}
              </span>
            ))}
          </div>
        </header>

        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold text-zinc-950">关联商品</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              根据专题配置关联的 mock 商品，后续可替换为后台维护或接口同步数据。
            </p>
          </div>

          {relatedProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-zinc-300 bg-white px-6 py-10 text-center text-sm text-zinc-600">
              当前专题暂无关联商品。
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold text-zinc-950">关联文章</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              围绕专题关键词延展的导购内容，可用于增强专题页内链和搜索承接能力。
            </p>
          </div>

          {relatedArticles.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {relatedArticles.map((article) => (
                <ArticleCard article={article} key={article.id} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-zinc-300 bg-white px-6 py-10 text-center text-sm text-zinc-600">
              当前专题暂无关联文章。
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
