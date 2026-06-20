import type { Metadata } from "next";
import Link from "next/link";

import { ProductCard } from "@/components/product/ProductCard";
import { mockProducts } from "@/modules/product";

type CategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function getProductsByCategorySlug(slug: string) {
  return mockProducts.filter((product) => product.categoryId === slug);
}

function getCategoryName(slug: string) {
  return (
    mockProducts.find((product) => product.categoryId === slug)?.categoryName ??
    "未知分类"
  );
}

export async function generateStaticParams() {
  return Array.from(
    new Set(mockProducts.map((product) => product.categoryId)),
  ).map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const categoryName = getCategoryName(slug);

  return {
    description: `展示${categoryName}下值得关注的优惠商品和导购信息。`,
    title: `${categoryName}好物推荐`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const products = getProductsByCategorySlug(slug);
  const categoryName = getCategoryName(slug);

  return (
    <main className="min-h-screen bg-zinc-50 px-5 py-8 text-zinc-950 sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <Link className="text-sm font-medium text-zinc-600 hover:text-zinc-950" href="/">
          返回首页
        </Link>

        <header className="flex flex-col gap-3 border-b border-zinc-200 pb-6">
          <p className="text-sm font-medium text-emerald-700">分类导购</p>
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div className="max-w-3xl space-y-3">
              <h1 className="text-3xl font-semibold tracking-normal text-zinc-950 sm:text-4xl">
                {categoryName}好物推荐
              </h1>
              <p className="text-base leading-7 text-zinc-600">
                汇总当前分类下值得关注的优惠商品，后续可承接分类关键词、选购指南和活动导购内容。
              </p>
            </div>
            <div className="rounded-md border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-600">
              共 {products.length} 个商品
            </div>
          </div>
        </header>

        {products.length > 0 ? (
          <section
            aria-label={`${categoryName}商品列表`}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
          >
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </section>
        ) : (
          <section className="rounded-lg border border-dashed border-zinc-300 bg-white px-6 py-12 text-center">
            <h2 className="text-xl font-semibold text-zinc-950">
              当前分类暂无商品
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              这个分类还没有匹配到 mock 商品。后续接入后台和商品数据后，可以在这里展示对应分类的导购内容。
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
