import type { Metadata } from "next";
import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getAdminCategoryMappingsFromDb } from "@/modules/category-mapping";

import { CategoryMappingInitializer } from "./CategoryMappingInitializer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "分类映射",
  robots: {
    follow: false,
    index: false,
  },
};

type CategoryMappingsPageProps = {
  searchParams: Promise<{
    page?: string | string[];
    pageSize?: string | string[];
    q?: string | string[];
    source?: string | string[];
    status?: string | string[];
  }>;
};

const dateTimeFormatter = new Intl.DateTimeFormat("zh-CN", {
  dateStyle: "medium",
  timeStyle: "short",
});

function getSearchParam(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

function getPageNumber(value: string) {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? Math.trunc(numberValue) : undefined;
}

function createPageHref({
  page,
  pageSize,
  q,
  source,
  status,
}: {
  page: number;
  pageSize: number;
  q: string;
  source: string;
  status: string;
}) {
  const params = new URLSearchParams({ page: String(page) });

  if (pageSize !== 20) params.set("pageSize", String(pageSize));
  if (q) params.set("q", q);
  if (source && source !== "all") params.set("source", source);
  if (status && status !== "all") params.set("status", status);

  return `/admin/category-mappings?${params.toString()}`;
}

export default async function CategoryMappingsPage({
  searchParams,
}: CategoryMappingsPageProps) {
  const params = await searchParams;
  const q = getSearchParam(params.q);
  const source = getSearchParam(params.source) || "all";
  const status = getSearchParam(params.status) || "all";
  const page = getPageNumber(getSearchParam(params.page));
  const pageSize = getPageNumber(getSearchParam(params.pageSize));
  const result = await getAdminCategoryMappingsFromDb({
    page,
    pageSize,
    q,
    source,
    status,
  });
  const previousPageHref = createPageHref({
    page: Math.max(1, result.page - 1),
    pageSize: result.pageSize,
    q,
    source,
    status,
  });
  const nextPageHref = createPageHref({
    page: Math.min(result.totalPages, result.page + 1),
    pageSize: result.pageSize,
    q,
    source,
    status,
  });

  return (
    <main className="px-5 py-8 text-zinc-950 sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <AdminPageHeader
          description="用于管理外部数据源分类到站内分类的映射关系。Dataoke 商品入库时，可根据该映射将 cid / subcid 转成站内 categorySlug。"
          title="分类映射"
        />

        <CategoryMappingInitializer />

        <form
          action="/admin/category-mappings"
          className="grid gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm md:grid-cols-4"
          method="get"
        >
          <label className="block text-sm font-medium text-zinc-700 md:col-span-2">
            搜索
            <input
              className="mt-2 h-10 w-full rounded-md border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-400"
              defaultValue={q}
              name="q"
              placeholder="来源分类 ID、名称或站内分类"
              type="search"
            />
          </label>
          <label className="block text-sm font-medium text-zinc-700">
            来源
            <select
              className="mt-2 h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-400"
              defaultValue={source}
              name="source"
            >
              <option value="all">全部来源</option>
              <option value="dataoke">dataoke</option>
            </select>
          </label>
          <label className="block text-sm font-medium text-zinc-700">
            状态
            <select
              className="mt-2 h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-400"
              defaultValue={status}
              name="status"
            >
              <option value="all">全部状态</option>
              <option value="active">active</option>
              <option value="inactive">inactive</option>
            </select>
          </label>
          <div className="md:col-span-4">
            <button
              className="h-10 rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
              type="submit"
            >
              筛选映射
            </button>
          </div>
        </form>

        {result.items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 bg-white px-5 py-10 text-center text-sm text-zinc-600">
            暂无分类映射。可使用上方按钮初始化 Dataoke 基础映射。
          </div>
        ) : (
          <>
            <p className="text-sm text-zinc-600">
              共 {result.totalCount} 条，当前第 {result.page} / {result.totalPages} 页
            </p>
            <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-sm">
              <table className="min-w-full divide-y divide-zinc-200 text-sm">
                <thead className="bg-zinc-50 text-left text-zinc-500">
                  <tr>
                    {[
                      "source",
                      "sourceCid",
                      "sourceSubcid",
                      "sourceName",
                      "sourceSubName",
                      "categoryId",
                      "categorySlug",
                      "confidence",
                      "status",
                      "updatedAt",
                    ].map((label) => (
                      <th className="px-3 py-3 font-medium" key={label}>
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {result.items.map((mapping) => (
                    <tr key={mapping.id}>
                      <td className="px-3 py-3 text-zinc-600">{mapping.source}</td>
                      <td className="px-3 py-3 text-zinc-600">{mapping.sourceCid}</td>
                      <td className="px-3 py-3 text-zinc-600">{mapping.sourceSubcid || "-"}</td>
                      <td className="px-3 py-3 text-zinc-600">{mapping.sourceName ?? "-"}</td>
                      <td className="px-3 py-3 text-zinc-600">{mapping.sourceSubName ?? "-"}</td>
                      <td className="px-3 py-3 text-zinc-600">{mapping.categoryId}</td>
                      <td className="px-3 py-3 text-zinc-600">{mapping.categorySlug}</td>
                      <td className="px-3 py-3 text-zinc-600">{mapping.confidence}</td>
                      <td className="px-3 py-3 text-zinc-600">{mapping.status}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-zinc-600">
                        {dateTimeFormatter.format(mapping.updatedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <nav aria-label="分类映射分页" className="flex items-center justify-between text-sm">
              <Link
                aria-disabled={result.page <= 1}
                className="rounded-md border border-zinc-200 px-3 py-2 text-zinc-700 aria-disabled:pointer-events-none aria-disabled:opacity-50"
                href={previousPageHref}
              >
                上一页
              </Link>
              <Link
                aria-disabled={result.page >= result.totalPages}
                className="rounded-md border border-zinc-200 px-3 py-2 text-zinc-700 aria-disabled:pointer-events-none aria-disabled:opacity-50"
                href={nextPageHref}
              >
                下一页
              </Link>
            </nav>
          </>
        )}
      </div>
    </main>
  );
}
