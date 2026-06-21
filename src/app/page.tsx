import { ArticleCard } from "@/components/article/ArticleCard";
import { ProductCard } from "@/components/product/ProductCard";
import { SeoPageCard } from "@/components/seo/SeoPageCard";
import { getAllArticles } from "@/modules/article";
import { getAllProducts, getHomeProductsFromDb } from "@/modules/product";
import { getAllSeoPages } from "@/modules/seo-page";

export const dynamic = "force-dynamic";

export default async function Home() {
  const articles = getAllArticles();
  const databaseProducts = await getHomeProductsFromDb();
  const products = databaseProducts.length > 0 ? databaseProducts : getAllProducts();
  const seoPages = getAllSeoPages();

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
                首页商品优先读取本地数据库；文章与专题仍使用现有内容数据源。
              </p>
            </div>
            <div className="rounded-md border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-600">
              {seoPages.length} 个专题 / {articles.length} 篇文章 /{" "}
              {products.length} 个商品
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
            {articles.map((article) => (
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
            {seoPages.map((seoPage) => (
              <SeoPageCard key={seoPage.id} seoPage={seoPage} />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold text-zinc-950">精选优惠商品</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              展示本地数据库中已审核的优惠商品；数据库暂无商品时使用开发期备选数据。
            </p>
          </div>
          <div
            aria-label="商品列表"
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
          >
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
