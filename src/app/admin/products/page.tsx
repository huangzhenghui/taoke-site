import type { Metadata } from "next";
import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  getAdminProductsFromDb,
  type ProductQualityIssue,
} from "@/modules/product";

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
    categorySlug?: string | string[];
    hasCoupon?: string | string[];
    hasFinalPrice?: string | string[];
    hasImage?: string | string[];
    page?: string | string[];
    pageSize?: string | string[];
    platform?: string | string[];
    q?: string | string[];
    qualityIssue?: string | string[];
    source?: string | string[];
    status?: string | string[];
  }>;
};

const qualityIssueLabels: Record<ProductQualityIssue, string> = {
  inactive: "非 active",
  missing_coupon_amount: "缺券金额",
  missing_final_price: "缺券后价",
  missing_main_image: "缺主图",
  missing_outer_item_id: "缺商品ID",
  missing_promotion_link: "缺推广链接",
  missing_title: "缺标题",
  unmapped_category: "未映射分类",
};

const qualityIssueValues = Object.keys(
  qualityIssueLabels,
) as ProductQualityIssue[];

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

function getOptionalBoolean(value: string) {
  if (value === "true") return true;
  if (value === "false") return false;

  return undefined;
}

function getQualityIssue(value: string): ProductQualityIssue | undefined {
  return qualityIssueValues.includes(value as ProductQualityIssue)
    ? (value as ProductQualityIssue)
    : undefined;
}

function formatCurrency(value: { toString(): string } | null) {
  return value === null ? "-" : currencyFormatter.format(Number(value));
}

function formatDate(value: Date | null) {
  return value ? dateTimeFormatter.format(value) : "-";
}

function getBooleanFilterValue(value: boolean | undefined) {
  return value === undefined ? "all" : String(value);
}

function createPageHref({
  categorySlug,
  hasCoupon,
  hasFinalPrice,
  hasImage,
  page,
  pageSize,
  platform,
  q,
  qualityIssue,
  source,
  status,
}: {
  categorySlug: string;
  hasCoupon: boolean | undefined;
  hasFinalPrice: boolean | undefined;
  hasImage: boolean | undefined;
  page: number;
  pageSize: number;
  platform: string;
  q: string;
  qualityIssue: ProductQualityIssue | undefined;
  source: string;
  status: string;
}) {
  const params = new URLSearchParams({ page: String(page) });

  if (pageSize !== 20) params.set("pageSize", String(pageSize));
  if (q) params.set("q", q);
  if (source && source !== "all") params.set("source", source);
  if (status && status !== "all") params.set("status", status);
  if (categorySlug) params.set("categorySlug", categorySlug);
  if (platform && platform !== "all") params.set("platform", platform);
  if (qualityIssue) params.set("qualityIssue", qualityIssue);
  if (hasImage !== undefined) params.set("hasImage", String(hasImage));
  if (hasCoupon !== undefined) params.set("hasCoupon", String(hasCoupon));
  if (hasFinalPrice !== undefined) {
    params.set("hasFinalPrice", String(hasFinalPrice));
  }

  return `/admin/products?${params.toString()}`;
}

function QualityTags({ issues }: { issues: ProductQualityIssue[] }) {
  if (issues.length === 0) {
    return <span className="rounded bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">OK</span>;
  }

  return (
    <div className="flex min-w-40 flex-wrap gap-1">
      {issues.map((issue) => (
        <span
          className="rounded bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800"
          key={issue}
        >
          {qualityIssueLabels[issue]}
        </span>
      ))}
    </div>
  );
}

export default async function AdminProductsPage({
  searchParams,
}: AdminProductsPageProps) {
  const params = await searchParams;
  const q = getSearchParam(params.q);
  const source = getSearchParam(params.source) || "all";
  const status = getSearchParam(params.status) || "all";
  const categorySlug = getSearchParam(params.categorySlug);
  const platform = getSearchParam(params.platform) || "all";
  const qualityIssue = getQualityIssue(getSearchParam(params.qualityIssue));
  const hasImage = getOptionalBoolean(getSearchParam(params.hasImage));
  const hasCoupon = getOptionalBoolean(getSearchParam(params.hasCoupon));
  const hasFinalPrice = getOptionalBoolean(
    getSearchParam(params.hasFinalPrice),
  );
  const pageSize = getPageNumber(getSearchParam(params.pageSize));
  const page = getPageNumber(getSearchParam(params.page));
  const result = await getAdminProductsFromDb({
    categorySlug,
    hasCoupon,
    hasFinalPrice,
    hasImage,
    page,
    pageSize,
    platform,
    q,
    qualityIssue,
    source,
    status,
  });
  const activeFilters = [
    q ? `q=${q}` : null,
    source !== "all" ? `source=${source}` : null,
    status !== "all" ? `status=${status}` : null,
    categorySlug ? `categorySlug=${categorySlug}` : null,
    platform !== "all" ? `platform=${platform}` : null,
    qualityIssue ? `qualityIssue=${qualityIssue}` : null,
    hasImage !== undefined ? `hasImage=${hasImage}` : null,
    hasCoupon !== undefined ? `hasCoupon=${hasCoupon}` : null,
    hasFinalPrice !== undefined ? `hasFinalPrice=${hasFinalPrice}` : null,
  ].filter((value): value is string => Boolean(value));
  const okCount = result.items.filter(
    (product) => product.qualityIssues.length === 0,
  ).length;
  const previousPageHref = createPageHref({
    categorySlug,
    hasCoupon,
    hasFinalPrice,
    hasImage,
    page: Math.max(1, result.page - 1),
    pageSize: result.pageSize,
    platform,
    q,
    qualityIssue,
    source,
    status,
  });
  const nextPageHref = createPageHref({
    categorySlug,
    hasCoupon,
    hasFinalPrice,
    hasImage,
    page: Math.min(result.totalPages, result.page + 1),
    pageSize: result.pageSize,
    platform,
    q,
    qualityIssue,
    source,
    status,
  });

  return (
    <main className="px-5 py-8 text-zinc-950 sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <AdminPageHeader
          description="读取 PostgreSQL Product 表中的已入库商品，并检查常见数据质量问题。"
          title="商品管理"
        />

        <form
          action="/admin/products"
          className="grid gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm md:grid-cols-3 xl:grid-cols-4"
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
            <select className="mt-2 h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-400" defaultValue={source} name="source">
              <option value="all">全部来源</option>
              <option value="dataoke">dataoke</option>
            </select>
          </label>
          <label className="block text-sm font-medium text-zinc-700">
            状态
            <select className="mt-2 h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-400" defaultValue={status} name="status">
              <option value="all">全部状态</option>
              <option value="active">active</option>
              <option value="inactive">inactive</option>
              <option value="draft">draft</option>
              <option value="expired">expired</option>
            </select>
          </label>
          <label className="block text-sm font-medium text-zinc-700">
            分类 slug
            <input className="mt-2 h-10 w-full rounded-md border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-400" defaultValue={categorySlug} name="categorySlug" placeholder="例如 digital" type="text" />
          </label>
          <label className="block text-sm font-medium text-zinc-700">
            平台
            <select className="mt-2 h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-400" defaultValue={platform} name="platform">
              <option value="all">全部平台</option>
              <option value="taobao">taobao</option>
              <option value="tmall">tmall</option>
              <option value="jd">jd</option>
              <option value="vip">vip</option>
              <option value="other">other</option>
            </select>
          </label>
          <label className="block text-sm font-medium text-zinc-700">
            数据检查
            <select className="mt-2 h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-400" defaultValue={qualityIssue ?? "all"} name="qualityIssue">
              <option value="all">全部</option>
              {qualityIssueValues.map((issue) => <option key={issue} value={issue}>{qualityIssueLabels[issue]}</option>)}
            </select>
          </label>
          <label className="block text-sm font-medium text-zinc-700">
            主图
            <select className="mt-2 h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-400" defaultValue={getBooleanFilterValue(hasImage)} name="hasImage">
              <option value="all">全部</option>
              <option value="true">有主图</option>
              <option value="false">缺主图</option>
            </select>
          </label>
          <label className="block text-sm font-medium text-zinc-700">
            优惠券
            <select className="mt-2 h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-400" defaultValue={getBooleanFilterValue(hasCoupon)} name="hasCoupon">
              <option value="all">全部</option>
              <option value="true">有券金额</option>
              <option value="false">缺券金额</option>
            </select>
          </label>
          <label className="block text-sm font-medium text-zinc-700">
            券后价
            <select className="mt-2 h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-400" defaultValue={getBooleanFilterValue(hasFinalPrice)} name="hasFinalPrice">
              <option value="all">全部</option>
              <option value="true">有券后价</option>
              <option value="false">缺券后价</option>
            </select>
          </label>
          <div className="md:col-span-3 xl:col-span-4">
            <button className="h-10 rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800" type="submit">
              查询商品
            </button>
          </div>
        </form>

        <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-600 shadow-sm">
          <p>共 {result.totalCount} 条，当前第 {result.page} / {result.totalPages} 页；当前页 OK {okCount} 条，有问题 {result.items.length - okCount} 条。</p>
          <p className="mt-1 break-all text-xs text-zinc-500">当前筛选：{activeFilters.length > 0 ? activeFilters.join(" · ") : "全部"}</p>
        </div>

        {result.items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 bg-white px-5 py-10 text-center text-sm text-zinc-600">
            <p>没有符合条件的商品。可以调整筛选条件，或到 Dataoke 同步预览页导入商品。</p>
            <Link className="mt-3 inline-block font-medium text-zinc-950 underline underline-offset-4" href="/admin/dataoke-sync">
              前往 Dataoke 同步预览
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-sm">
              <table className="min-w-full divide-y divide-zinc-200 text-sm">
                <thead className="bg-zinc-50 text-left text-zinc-500">
                  <tr>
                    {["title", "shortTitle", "source", "outerItemId", "platform", "price", "finalPrice", "couponAmount", "commissionRate", "shopName", "categoryName", "status", "数据检查", "lastSyncedAt", "updatedAt"].map((label) => (
                      <th className="px-3 py-3 font-medium" key={label}>{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {result.items.map((product) => (
                    <tr key={product.id}>
                      <td className="max-w-72 px-3 py-3 font-medium text-zinc-950">{product.title}</td>
                      <td className="max-w-56 px-3 py-3 text-zinc-600">{product.shortTitle ?? "-"}</td>
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
                      <td className="px-3 py-3"><QualityTags issues={product.qualityIssues} /></td>
                      <td className="whitespace-nowrap px-3 py-3 text-zinc-600">{formatDate(product.lastSyncedAt)}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-zinc-600">{formatDate(product.updatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <nav aria-label="商品分页" className="flex items-center justify-between text-sm">
              <Link aria-disabled={result.page <= 1} className="rounded-md border border-zinc-200 px-3 py-2 text-zinc-700 aria-disabled:pointer-events-none aria-disabled:opacity-50" href={previousPageHref}>上一页</Link>
              <Link aria-disabled={result.page >= result.totalPages} className="rounded-md border border-zinc-200 px-3 py-2 text-zinc-700 aria-disabled:pointer-events-none aria-disabled:opacity-50" href={nextPageHref}>下一页</Link>
            </nav>
          </>
        )}
      </div>
    </main>
  );
}
