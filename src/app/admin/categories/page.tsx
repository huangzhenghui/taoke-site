import type { Metadata } from "next";

import { getAllCategories } from "@/modules/category";

export const metadata: Metadata = {
  title: "分类管理",
  robots: {
    follow: false,
    index: false,
  },
};

export default function AdminCategoriesPage() {
  const categories = getAllCategories();

  return (
    <main className="px-5 py-8 text-zinc-950 sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header>
          <h1 className="text-3xl font-semibold tracking-normal">分类管理</h1>
          <p className="mt-2 text-sm text-zinc-600">
            只读展示当前 mock 分类数据。
          </p>
        </header>

        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-zinc-200 text-sm">
            <thead className="bg-zinc-50 text-left text-zinc-500">
              <tr>
                <th className="px-4 py-3 font-medium">分类名称</th>
                <th className="px-4 py-3 font-medium">slug</th>
                <th className="px-4 py-3 font-medium">SEO 标题</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">排序</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {categories.map((category) => (
                <tr key={category.id}>
                  <td className="px-4 py-3 font-medium text-zinc-950">
                    {category.name}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">{category.slug}</td>
                  <td className="px-4 py-3 text-zinc-600">
                    {category.seoTitle}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {category.status}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {category.sortOrder}
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
