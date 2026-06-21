"use client";

import { useActionState } from "react";

import { batchGenerateDataokePromotionLinksAction } from "./actions";
import type { DataokeLinkBatchResult } from "@/modules/dataoke-sync";

const initialState: DataokeLinkBatchResult = {
  batchSummary: {
    candidateCount: 0,
    limit: 10,
    onlyMissing: true,
    productsMissingPromotionLink: 0,
    productsWithPromotionLink: 0,
    selectedCount: 0,
    totalDataokeActiveProducts: 0,
  },
  createdCount: 0,
  failedCount: 0,
  failedItems: [],
  message: "尚未开始批量转链。",
  processedCount: 0,
  skippedCount: 0,
  skippedItems: [],
  success: false,
  syncLogId: null,
  totalCount: 0,
  updatedCount: 0,
};

export function DataokeLinkBatchForm() {
  const [state, formAction, isPending] = useActionState(
    batchGenerateDataokePromotionLinksAction,
    initialState,
  );

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <form action={formAction} className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-medium text-zinc-700">
          limit
          <input
            className="mt-2 h-10 w-full rounded-md border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-400"
            defaultValue="10"
            max="10"
            min="1"
            name="limit"
            type="number"
          />
        </label>
        <label className="block text-sm font-medium text-zinc-700">
          onlyMissing
          <select
            className="mt-2 h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-400"
            defaultValue="true"
            name="onlyMissing"
          >
            <option value="true">true（仅缺少 PromotionLink）</option>
            <option value="false">false（允许更新已有 PromotionLink）</option>
          </select>
        </label>
        <div className="md:col-span-2">
          <button
            className="h-10 rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
            disabled={isPending}
            type="submit"
          >
            {isPending ? "正在转链..." : "开始批量转链"}
          </button>
        </div>
      </form>

      <div className="mt-5 rounded-md border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-700">
        <p>{state.message}</p>
        <dl className="mt-3 grid gap-3 sm:grid-cols-4">
          <div><dt className="text-xs text-zinc-500">success</dt><dd>{state.success ? "true" : "false"}</dd></div>
          <div><dt className="text-xs text-zinc-500">totalCount</dt><dd>{state.totalCount}</dd></div>
          <div><dt className="text-xs text-zinc-500">processedCount</dt><dd>{state.processedCount}</dd></div>
          <div><dt className="text-xs text-zinc-500">createdCount</dt><dd>{state.createdCount}</dd></div>
          <div><dt className="text-xs text-zinc-500">updatedCount</dt><dd>{state.updatedCount}</dd></div>
          <div><dt className="text-xs text-zinc-500">skippedCount</dt><dd>{state.skippedCount}</dd></div>
          <div><dt className="text-xs text-zinc-500">failedCount</dt><dd>{state.failedCount}</dd></div>
          <div><dt className="text-xs text-zinc-500">syncLogId</dt><dd className="break-all">{state.syncLogId ?? "-"}</dd></div>
        </dl>
        <div className="mt-4 rounded border border-zinc-200 bg-white p-3">
          <p className="text-xs font-medium text-zinc-500">batchSummary</p>
          <dl className="mt-2 grid gap-3 text-sm sm:grid-cols-4">
            <div><dt className="text-xs text-zinc-500">totalDataokeActiveProducts</dt><dd>{state.batchSummary.totalDataokeActiveProducts}</dd></div>
            <div><dt className="text-xs text-zinc-500">productsWithPromotionLink</dt><dd>{state.batchSummary.productsWithPromotionLink}</dd></div>
            <div><dt className="text-xs text-zinc-500">productsMissingPromotionLink</dt><dd>{state.batchSummary.productsMissingPromotionLink}</dd></div>
            <div><dt className="text-xs text-zinc-500">candidateCount</dt><dd>{state.batchSummary.candidateCount}</dd></div>
            <div><dt className="text-xs text-zinc-500">selectedCount</dt><dd>{state.batchSummary.selectedCount}</dd></div>
            <div><dt className="text-xs text-zinc-500">onlyMissing</dt><dd>{String(state.batchSummary.onlyMissing)}</dd></div>
            <div><dt className="text-xs text-zinc-500">limit</dt><dd>{state.batchSummary.limit}</dd></div>
          </dl>
        </div>
        {state.skippedItems.length > 0 ? (
          <div className="mt-4 overflow-x-auto rounded border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs font-medium text-amber-900">skippedItems</p>
            <table className="mt-2 min-w-full text-left text-sm text-amber-950">
              <thead><tr><th className="pr-4">title</th><th className="pr-4">outerItemId</th><th>reason</th></tr></thead>
              <tbody>
                {state.skippedItems.map((item) => (
                  <tr key={`${item.productId}-${item.outerItemId}`}>
                    <td className="pr-4 py-1">{item.title}</td>
                    <td className="pr-4 py-1">{item.outerItemId}</td>
                    <td className="py-1">{item.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
        {state.failedItems.length > 0 ? (
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-red-700">
            {state.failedItems.map((item) => (
              <li key={`${item.productId}-${item.outerItemId}`}>
                {item.title} ({item.outerItemId}): {item.message}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
