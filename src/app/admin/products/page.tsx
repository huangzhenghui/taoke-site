import type { Metadata } from "next";
import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getAdminProductsFromDb } from "@/modules/product";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "商品管理",
  robots: {
    follow: false,
    index: false,
  },
};

type AdminProductsPageProps = {
  searchParams: Promise<{
    page?: string | string[];
    pageSize?: string | string[];
    q?: string | string[];
    source?: string | string[];
    status?: string | string[];
  }>;
};

const currencyFormatter = new Intl.NumberFormat("zh-CN", {
  currency: "CNY",
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
  style: "currency",
});

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

function formatCurrency(value: { toString(): string } | null) {
  return value === null ? "-" : currencyFormatter.format(Number(value));
}

function formatDate(value: Date | null) {
  return value ? dateTimeFormatter.format(value) : "-";
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

  return `/admin/products?${params.toString()}`;
}

export default async function AdminProductsPage({
  searchParams,
}: AdminProductsPageProps) {
  const params = await searchParams;
  const q = getSearchParam(params.q);
  const source = getSearchParam(params.source) || "all";
  const status = getSearchParam(params.status) || "all";
  const pageSize = getPageNumber(getSearchParam(params.pageSize));
  const page = getPageNumber(getSearchParam(params.page));
  const result = await getAdminProductsFromDb({
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
          description="读取 PostgreSQL Product 表中的已入库商品，仅用于后台检查。"
          title="商品管理"
        />

        <form
          action="/admin/products"
          className="grid gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm md:grid-cols-4"
          method="get"
        >
          <label className="block text-sm font-medium text-zinc-700 md:col-span-2">
            搜索
            <input
              className="mt-2 h-10 w-full rounded-md border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-400"
              defaultValue={q}
              name="q"
              placeholder="标题、短标题或外部商品 ID"
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
              <option value="draft">draft</option>
              <option value="expired">expired</option>
            </select>
          </label>
          <div className="md:col-span-4">
            <button
              className="h-10 rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
              type="submit"
            >
              查询商品
            </button>
          </div>
        </form>

        {result.items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 bg-white px-5 py-10 text-center text-sm text-zinc-600">
            <p>暂无数据库商品。请先到 Dataoke 同步预览页面导入商品。</p>
            <Link
              className="mt-3 inline-block font-medium text-zinc-950 underline underline-offset-4"
              href="/admin/dataoke-sync"
            >
              前往 Dataoke 同步预览
            </Link>
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
                      "title",
                      "shortTitle",
                      "source",
                      "outerItemId",
                      "platform",
                      "price",
                      "finalPrice",
                      "couponAmount",
                      "commissionRate",
                      "shopName",
                      "categoryName",
                      "status",
                      "lastSyncedAt",
                      "updatedAt",
                    ].map((label) => (
                      <th className="px-3 py-3 font-medium" key={label}>
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {result.items.map((product) => (
                    <tr key={product.id}>
                      <td className="max-w-72 px-3 py-3 font-medium text-zinc-950">
                        {product.title}
                      </td>
                      <td className="max-w-56 px-3 py-3 text-zinc-600">
                        {product.shortTitle ?? "-"}
                      </td>
                      <td className="px-3 py-3 text-zinc-600">{product.source}</td>
                      <td className="px-3 py-3 text-zinc-600">{product.outerItemId}</td>
                      <td className="px-3 py-3 text-zinc-600">{product.platform}</td>
                      <td className="px-3 py-3 text-zinc-600">{formatCurrency(product.price)}</td>
                      <td className="px-3 py-3 font-medium text-red-600">{formatCurrency(product.finalPrice)}</td>
                      <td className="px-3 py-3 text-zinc-600">{formatCurrency(product.couponAmount)}</td>
                      <td className="px-3 py-3 text-zinc-600">{product.commissionRate?.toString() ?? "-"}</td>
                      <td className="px-3 py-3 text-zinc-600">{product.shopName ?? "-"}</td>
                      <td className="px-3 py-3 text-zinc-600">{product.categoryName ?? "-"}</td>
                      <td className="px-3 py-3 text-zinc-600">{product.status}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-zinc-600">{formatDate(product.lastSyncedAt)}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-zinc-600">{formatDate(product.updatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <nav className="flex items-center justify-between text-sm" aria-label="商品分页">
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
