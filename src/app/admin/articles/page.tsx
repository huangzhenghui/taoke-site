import type { Metadata } from "next";
import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getAllArticles } from "@/modules/article";

export const metadata: Metadata = {
  title: "文章管理",
  robots: {
    follow: false,
    index: false,
  },
};

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export default function AdminArticlesPage() {
  const articles = getAllArticles();

  return (
    <main className="px-5 py-8 text-zinc-950 sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <AdminPageHeader
          actionHref="/admin/articles/new"
          actionLabel="新增文章"
          description="只读展示当前 mock 导购文章数据，并提供表单骨架入口。"
          title="文章管理"
        />

        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-zinc-200 text-sm">
            <thead className="bg-zinc-50 text-left text-zinc-500">
              <tr>
                <th className="px-4 py-3 font-medium">标题</th>
                <th className="px-4 py-3 font-medium">slug</th>
                <th className="px-4 py-3 font-medium">分类</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">发布时间</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {articles.map((article) => (
                <tr key={article.id}>
                  <td className="px-4 py-3 font-medium text-zinc-950">
                    {article.title}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">{article.slug}</td>
                  <td className="px-4 py-3 text-zinc-600">
                    {article.categoryName}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {article.status}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {dateFormatter.format(new Date(article.publishedAt))}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      className="font-medium text-zinc-950 underline underline-offset-4"
                      href={`/admin/articles/${article.slug}/edit`}
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
