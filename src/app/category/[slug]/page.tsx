import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/product/ProductCard";
import { mockCategories } from "@/modules/category";
import { mockProducts } from "@/modules/product";

type CategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function getProductsByCategorySlug(slug: string) {
  return mockProducts.filter((product) => product.categorySlug === slug);
}

function findCategoryBySlug(slug: string) {
  return mockCategories.find((category) => category.slug === slug);
}

export async function generateStaticParams() {
  return mockCategories
    .filter((category) => category.status === "active")
    .map((category) => ({
      slug: category.slug,
    }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = findCategoryBySlug(slug);

  if (!category) {
    return {
      title: "分类不存在",
    };
  }

  return {
    description: category.seoDescription,
    title: category.seoTitle,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = findCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const products = getProductsByCategorySlug(slug);

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
                {category.name}好物推荐
              </h1>
              <p className="text-base leading-7 text-zinc-600">
                {category.description}
              </p>
              <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm leading-6 text-zinc-600">
                <p className="font-medium text-zinc-950">{category.seoTitle}</p>
                <p className="mt-2">{category.seoDescription}</p>
              </div>
            </div>
            <div className="rounded-md border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-600">
              共 {products.length} 个商品
            </div>
          </div>
        </header>

        {products.length > 0 ? (
          <section
            aria-label={`${category.name}商品列表`}
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
