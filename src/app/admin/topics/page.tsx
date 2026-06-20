import { getAllSeoPages } from "@/modules/seo-page";

export default function AdminTopicsPage() {
  const topics = getAllSeoPages();

  return (
    <main className="px-5 py-8 text-zinc-950 sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header>
          <h1 className="text-3xl font-semibold tracking-normal">专题管理</h1>
          <p className="mt-2 text-sm text-zinc-600">
            只读展示当前 mock SEO 专题数据。
          </p>
        </header>

        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-zinc-200 text-sm">
            <thead className="bg-zinc-50 text-left text-zinc-500">
              <tr>
                <th className="px-4 py-3 font-medium">标题</th>
                <th className="px-4 py-3 font-medium">slug</th>
                <th className="px-4 py-3 font-medium">分类</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">keywords</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {topics.map((topic) => (
                <tr key={topic.id}>
                  <td className="px-4 py-3 font-medium text-zinc-950">
                    {topic.title}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">{topic.slug}</td>
                  <td className="px-4 py-3 text-zinc-600">
                    {topic.categoryName}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">{topic.status}</td>
                  <td className="px-4 py-3 text-zinc-600">
                    {topic.keywords.join("、")}
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
