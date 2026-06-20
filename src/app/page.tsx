import { ProductCard } from "@/components/product/ProductCard";
import { mockProducts } from "@/modules/product";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50 px-5 py-8 text-zinc-950 sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="flex flex-col gap-3 border-b border-zinc-200 pb-6">
          <p className="text-sm font-medium text-emerald-700">淘客导购精选</p>
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div className="max-w-3xl space-y-3">
              <h1 className="text-3xl font-semibold tracking-normal text-zinc-950 sm:text-4xl">
                今日值得关注的优惠商品
              </h1>
              <p className="text-base leading-7 text-zinc-600">
                当前页面读取本地 mock 商品数据，用于验证商品展示结构和导购内容站首页骨架。
              </p>
            </div>
            <div className="rounded-md border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-600">
              共 {mockProducts.length} 个商品
            </div>
          </div>
        </header>

        <section
          aria-label="商品列表"
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
        >
          {mockProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </section>
      </div>
    </main>
  );
}
