import type { Metadata } from "next";
import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getAdminSyncLogsFromDb } from "@/modules/sync-log";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "同步日志",
  robots: {
    follow: false,
    index: false,
  },
};

type SyncLogsPageProps = {
  searchParams: Promise<{
    page?: string | string[];
    pageSize?: string | string[];
    source?: string | string[];
    status?: string | string[];
    taskType?: string | string[];
  }>;
};

const dateTimeFormatter = new Intl.DateTimeFormat("zh-CN", {
  dateStyle: "medium",
  timeStyle: "short",
});

const sensitiveKeyPattern = /appkey|appsecret|authorization|password|pid|secret|signran|token|url/i;
const sensitiveValuePattern = /\b(appSecret|signRan|pid)\s*([=:])\s*[^,\s]+/gi;
const urlPattern = /https?:\/\/[^\s"'`]+/gi;

function getSearchParam(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

function getPageNumber(value: string) {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? Math.trunc(numberValue) : undefined;
}

function sanitizeText(value: string) {
  return value
    .replace(urlPattern, "[redacted-url]")
    .replace(sensitiveValuePattern, "$1$2[redacted]");
}

function sanitizeJsonValue(value: unknown): unknown {
  if (typeof value === "string") {
    return sanitizeText(value);
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeJsonValue);
  }

  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !sensitiveKeyPattern.test(key))
        .map(([key, childValue]) => [key, sanitizeJsonValue(childValue)]),
    );
  }

  return value;
}

function getSafeParamsSummary(params: unknown) {
  if (params === null || params === undefined) {
    return null;
  }

  return JSON.stringify(sanitizeJsonValue(params), null, 2);
}

function formatDate(value: Date) {
  return dateTimeFormatter.format(value);
}

function getShortId(id: string) {
  return `${id.slice(0, 8)}…`;
}

function createPageHref({
  page,
  pageSize,
  source,
  status,
  taskType,
}: {
  page: number;
  pageSize: number;
  source: string;
  status: string;
  taskType: string;
}) {
  const params = new URLSearchParams({ page: String(page) });

  if (pageSize !== 20) params.set("pageSize", String(pageSize));
  if (source && source !== "all") params.set("source", source);
  if (taskType && taskType !== "all") params.set("taskType", taskType);
  if (status && status !== "all") params.set("status", status);

  return `/admin/sync-logs?${params.toString()}`;
}

export default async function SyncLogsPage({ searchParams }: SyncLogsPageProps) {
  const params = await searchParams;
  const source = getSearchParam(params.source) || "all";
  const taskType = getSearchParam(params.taskType) || "all";
  const status = getSearchParam(params.status) || "all";
  const page = getPageNumber(getSearchParam(params.page));
  const pageSize = getPageNumber(getSearchParam(params.pageSize));
  const result = await getAdminSyncLogsFromDb({
    page,
    pageSize,
    source,
    status,
    taskType,
  });
  const previousPageHref = createPageHref({
    page: Math.max(1, result.page - 1),
    pageSize: result.pageSize,
    source,
    status,
    taskType,
  });
  const nextPageHref = createPageHref({
    page: Math.min(result.totalPages, result.page + 1),
    pageSize: result.pageSize,
    source,
    status,
    taskType,
  });

  return (
    <main className="px-5 py-8 text-zinc-950 sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <AdminPageHeader
          description="用于查看 Dataoke 等数据源的同步、导入和失败记录。"
          title="同步日志"
        />

        <form
          action="/admin/sync-logs"
          className="grid gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm md:grid-cols-3"
          method="get"
        >
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
            任务类型
            <select
              className="mt-2 h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-400"
              defaultValue={taskType}
              name="taskType"
            >
              <option value="all">全部任务</option>
              <option value="import_products">import_products</option>
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
              <option value="success">success</option>
              <option value="partial">partial</option>
              <option value="failed">failed</option>
            </select>
          </label>
          <div className="md:col-span-3">
            <button
              className="h-10 rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
              type="submit"
            >
              筛选日志
            </button>
          </div>
        </form>

        {result.items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 bg-white px-5 py-10 text-center text-sm text-zinc-600">
            <p>暂无同步日志。请先到 Dataoke 同步预览页面执行确认入库。</p>
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
                      "createdAt",
                      "id",
                      "source",
                      "taskType",
                      "status",
                      "totalCount",
                      "successCount",
                      "createdCount",
                      "updatedCount",
                      "skippedCount",
                      "failedCount",
                      "message",
                      "safe details",
                    ].map((label) => (
                      <th className="px-3 py-3 font-medium" key={label}>
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {result.items.map((log) => {
                    const paramsSummary = getSafeParamsSummary(log.params);
                    const errorSummary = log.errorSummary
                      ? sanitizeText(log.errorSummary)
                      : null;

                    return (
                      <tr key={log.id}>
                        <td className="whitespace-nowrap px-3 py-3 text-zinc-600">
                          {formatDate(log.createdAt)}
                        </td>
                        <td className="px-3 py-3 font-mono text-xs text-zinc-600" title={log.id}>
                          {getShortId(log.id)}
                        </td>
                        <td className="px-3 py-3 text-zinc-600">{log.source}</td>
                        <td className="px-3 py-3 text-zinc-600">{log.taskType}</td>
                        <td className="px-3 py-3 text-zinc-600">{log.status}</td>
                        <td className="px-3 py-3 text-zinc-600">{log.totalCount}</td>
                        <td className="px-3 py-3 text-zinc-600">{log.successCount}</td>
                        <td className="px-3 py-3 text-zinc-600">{log.createdCount}</td>
                        <td className="px-3 py-3 text-zinc-600">{log.updatedCount}</td>
                        <td className="px-3 py-3 text-zinc-600">{log.skippedCount}</td>
                        <td className="px-3 py-3 text-zinc-600">{log.failedCount}</td>
                        <td className="max-w-72 px-3 py-3 text-zinc-600">
                          {log.message ? sanitizeText(log.message) : "-"}
                        </td>
                        <td className="min-w-56 px-3 py-3 text-zinc-600">
                          {paramsSummary || errorSummary ? (
                            <details>
                              <summary className="cursor-pointer font-medium text-zinc-800">
                                查看安全摘要
                              </summary>
                              {paramsSummary ? (
                                <pre className="mt-2 max-w-80 overflow-auto whitespace-pre-wrap break-all rounded bg-zinc-950 p-2 text-xs text-zinc-50">
                                  {paramsSummary}
                                </pre>
                              ) : null}
                              {errorSummary ? (
                                <p className="mt-2 break-all text-xs text-red-700">
                                  {errorSummary}
                                </p>
                              ) : null}
                            </details>
                          ) : (
                            "-"
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <nav aria-label="同步日志分页" className="flex items-center justify-between text-sm">
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
