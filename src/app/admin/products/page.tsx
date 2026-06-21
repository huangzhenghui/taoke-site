import type { Metadata } from "next";

import { getAllProducts } from "@/modules/product";

export const metadata: Metadata = {
  title: "商品管理",
  robots: {
    follow: false,
    index: false,
  },
};

const currencyFormatter = new Intl.NumberFormat("zh-CN", {
  currency: "CNY",
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
  style: "currency",
});

export default function AdminProductsPage() {
  const products = getAllProducts();

  return (
    <main className="px-5 py-8 text-zinc-950 sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header>
          <h1 className="text-3xl font-semibold tracking-normal">商品管理</h1>
          <p className="mt-2 text-sm text-zinc-600">
            只读展示当前 mock 商品数据。
          </p>
        </header>

        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-zinc-200 text-sm">
            <thead className="bg-zinc-50 text-left text-zinc-500">
              <tr>
                <th className="px-4 py-3 font-medium">商品标题</th>
                <th className="px-4 py-3 font-medium">分类</th>
                <th className="px-4 py-3 font-medium">平台</th>
                <th className="px-4 py-3 font-medium">来源</th>
                <th className="px-4 py-3 font-medium">原价</th>
                <th className="px-4 py-3 font-medium">券后价</th>
                <th className="px-4 py-3 font-medium">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-4 py-3 font-medium text-zinc-950">
                    {product.title}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {product.categoryName}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {product.platform}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {product.source}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {currencyFormatter.format(product.price)}
                  </td>
                  <td className="px-4 py-3 font-medium text-red-600">
                    {currencyFormatter.format(product.finalPrice)}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {product.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
