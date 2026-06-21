import type { Metadata } from "next";

import { ArticleCard } from "@/components/article/ArticleCard";
import { ProductCard } from "@/components/product/ProductCard";
import { SeoPageCard } from "@/components/seo/SeoPageCard";
import { siteConfig } from "@/lib/site";
import { searchArticlesByKeyword } from "@/modules/article";
import { searchProductsByKeyword } from "@/modules/product";
import { searchSeoPagesByKeyword } from "@/modules/seo-page";

export const metadata: Metadata = {
  title: `站内搜索 - ${siteConfig.siteName}`,
  description: "搜索实用好物、导购文章和精选专题",
};

type SearchPageProps = {
  searchParams: Promise<{
    q?: string | string[];
  }>;
};

const hotKeywords = ["办公桌面", "小家电", "清洁用品", "数码配件"];

function getQueryValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }

  return value?.trim() ?? "";
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-dashed border-zinc-300 bg-white px-5 py-8 text-center text-sm text-zinc-500">
      暂无匹配的{label}，可以换一个关键词试试。
    </div>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = getQueryValue(params.q);

  const products = query ? searchProductsByKeyword(query) : [];
  const articles = query ? searchArticlesByKeyword(query) : [];
  const seoPages = query ? searchSeoPagesByKeyword(query) : [];

  return (
    <main className="min-h-screen bg-zinc-50 px-5 py-8 text-zinc-950 sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="flex flex-col gap-3 border-b border-zinc-200 pb-6">
          <p className="text-sm font-medium text-emerald-700">站内搜索</p>
          <div className="max-w-3xl space-y-3">
            <h1 className="text-3xl font-semibold tracking-normal text-zinc-950 sm:text-4xl">
              {query ? `搜索结果：${query}` : "搜索商品、文章和专题"}
            </h1>
            <p className="text-base leading-7 text-zinc-600">
              输入关键词后，可以同时检索当前 mock 数据中的商品、导购文章和 SEO 专题。
            </p>
          </div>
        </header>

        {!query ? (
          <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-zinc-950">热门关键词</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              这里先展示占位关键词，后续可以根据搜索日志或运营配置调整。
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {hotKeywords.map((keyword) => (
                <span
                  className="rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-600"
                  key={keyword}
                >
                  {keyword}
                </span>
              ))}
            </div>
          </section>
        ) : (
          <>
            <section className="space-y-4">
              <div>
                <h2 className="text-2xl font-semibold text-zinc-950">
                  商品结果（{products.length}）
                </h2>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  根据商品标题、短标题和描述匹配当前 mock 商品数据。
                </p>
              </div>
              {products.length > 0 ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <EmptyState label="商品" />
              )}
            </section>

            <section className="space-y-4">
              <div>
                <h2 className="text-2xl font-semibold text-zinc-950">
                  导购文章结果（{articles.length}）
                </h2>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  根据文章标题、摘要、正文和标签匹配当前 mock 文章数据。
                </p>
              </div>
              {articles.length > 0 ? (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {articles.map((article) => (
                    <ArticleCard article={article} key={article.id} />
                  ))}
                </div>
              ) : (
                <EmptyState label="导购文章" />
              )}
            </section>

            <section className="space-y-4">
              <div>
                <h2 className="text-2xl font-semibold text-zinc-950">
                  精选专题结果（{seoPages.length}）
                </h2>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  根据专题标题、描述、介绍和关键词匹配当前 mock 专题数据。
                </p>
              </div>
              {seoPages.length > 0 ? (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {seoPages.map((seoPage) => (
                    <SeoPageCard key={seoPage.id} seoPage={seoPage} />
                  ))}
                </div>
              ) : (
                <EmptyState label="精选专题" />
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
