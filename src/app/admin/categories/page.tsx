import type { Metadata } from "next";
import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
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
        <AdminPageHeader
          actionHref="/admin/categories/new"
          actionLabel="新增分类"
          description="只读展示当前 mock 分类数据，并提供表单骨架入口。"
          title="分类管理"
        />

        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-zinc-200 text-sm">
            <thead className="bg-zinc-50 text-left text-zinc-500">
              <tr>
                <th className="px-4 py-3 font-medium">分类名称</th>
                <th className="px-4 py-3 font-medium">slug</th>
                <th className="px-4 py-3 font-medium">SEO 标题</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">排序</th>
                <th className="px-4 py-3 font-medium">操作</th>
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
                  <td className="px-4 py-3">
                    <Link
                      className="font-medium text-zinc-950 underline underline-offset-4"
                      href={`/admin/categories/${category.slug}/edit`}
                    >
                      编辑
                    </Link>
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
