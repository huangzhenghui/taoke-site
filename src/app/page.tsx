import { ArticleCard } from "@/components/article/ArticleCard";
import { ProductCard } from "@/components/product/ProductCard";
import { SeoPageCard } from "@/components/seo/SeoPageCard";
import { mockArticles } from "@/modules/article";
import { mockProducts } from "@/modules/product";
import { mockSeoPages } from "@/modules/seo-page";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50 px-5 py-8 text-zinc-950 sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="flex flex-col gap-3 border-b border-zinc-200 pb-6">
          <p className="text-sm font-medium text-emerald-700">淘客导购精选</p>
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div className="max-w-3xl space-y-3">
              <h1 className="text-3xl font-semibold tracking-normal text-zinc-950 sm:text-4xl">
                今日值得关注的导购内容
              </h1>
              <p className="text-base leading-7 text-zinc-600">
                当前页面读取本地 mock 文章和商品数据，用于验证导购内容站首页骨架。
              </p>
            </div>
            <div className="rounded-md border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-600">
              {mockSeoPages.length} 个专题 / {mockArticles.length} 篇文章 /{" "}
              {mockProducts.length} 个商品
            </div>
          </div>
        </header>

        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold text-zinc-950">导购文章</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              围绕选购指南、场景清单和实用好物整理内容，后续可作为百度 SEO 承接入口。
            </p>
          </div>
          <div
            aria-label="导购文章列表"
            className="grid grid-cols-1 gap-5 md:grid-cols-2"
          >
            {mockArticles.map((article) => (
              <ArticleCard article={article} key={article.id} />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold text-zinc-950">精选专题</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              按场景和关键词组织专题页，适合后续承接百度长尾搜索流量。
            </p>
          </div>
          <div
            aria-label="精选专题列表"
            className="grid grid-cols-1 gap-5 md:grid-cols-2"
          >
            {mockSeoPages.map((seoPage) => (
              <SeoPageCard key={seoPage.id} seoPage={seoPage} />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold text-zinc-950">优惠商品</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              展示当前 mock 商品池中的优惠信息，后续可接入后台配置和淘客接口数据。
            </p>
          </div>
          <div
            aria-label="商品列表"
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
          >
            {mockProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
