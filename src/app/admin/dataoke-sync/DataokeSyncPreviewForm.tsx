"use client";

import { useActionState, useState, useTransition } from "react";

import {
  confirmDataokeProductsImportAction,
  previewDataokeProductsAction,
  type DataokeSyncPreviewState,
} from "./actions";
import type { DataokeImportResult } from "@/modules/dataoke-sync";

const initialState: DataokeSyncPreviewState = {
  message: "尚未预览。",
  productsPreview: [],
  success: false,
  summary: null,
  syncParams: null,
};

function TextInput({
  defaultValue,
  label,
  name,
  placeholder,
}: {
  defaultValue?: string;
  label: string;
  name: string;
  placeholder?: string;
}) {
  return (
    <label className="block text-sm font-medium text-zinc-700">
      {label}
      <input
        className="mt-2 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400"
        defaultValue={defaultValue}
        name={name}
        placeholder={placeholder}
        type="text"
      />
    </label>
  );
}

function StatusPanel({ state }: { state: DataokeSyncPreviewState }) {
  return (
    <div className="mt-5 grid gap-3 md:grid-cols-3">
      <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
        <p className="text-xs font-medium text-zinc-500">success</p>
        <p className="mt-2 text-sm text-zinc-950">
          {state.success ? "true" : "false"}
        </p>
      </div>
      <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3 md:col-span-2">
        <p className="text-xs font-medium text-zinc-500">message</p>
        <p className="mt-2 text-sm text-zinc-950">{state.message}</p>
      </div>
    </div>
  );
}

function SummaryPanel({ state }: { state: DataokeSyncPreviewState }) {
  return (
    <div className="mt-4 rounded-md border border-zinc-200 bg-white p-3">
      <p className="text-xs font-medium text-zinc-500">summary</p>
      <pre className="mt-2 max-h-52 overflow-auto whitespace-pre-wrap break-all rounded bg-zinc-950 p-3 text-xs text-zinc-50">
        {JSON.stringify(state.summary, null, 2)}
      </pre>
    </div>
  );
}

function ProductsPreviewTable({ state }: { state: DataokeSyncPreviewState }) {
  return (
    <div className="mt-4 overflow-x-auto rounded-md border border-zinc-200 bg-white">
      <table className="min-w-full divide-y divide-zinc-200 text-sm">
        <thead className="bg-zinc-50 text-left text-zinc-500">
          <tr>
            <th className="px-3 py-2 font-medium">id</th>
            <th className="px-3 py-2 font-medium">title</th>
            <th className="px-3 py-2 font-medium">shortTitle</th>
            <th className="px-3 py-2 font-medium">outerItemId</th>
            <th className="px-3 py-2 font-medium">platform</th>
            <th className="px-3 py-2 font-medium">source</th>
            <th className="px-3 py-2 font-medium">price</th>
            <th className="px-3 py-2 font-medium">finalPrice</th>
            <th className="px-3 py-2 font-medium">couponAmount</th>
            <th className="px-3 py-2 font-medium">commissionRate</th>
            <th className="px-3 py-2 font-medium">shopName</th>
            <th className="px-3 py-2 font-medium">categoryId</th>
            <th className="px-3 py-2 font-medium">categoryName</th>
            <th className="px-3 py-2 font-medium">categorySlug</th>
            <th className="px-3 py-2 font-medium">mainImage</th>
            <th className="px-3 py-2 font-medium">status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200">
          {state.productsPreview.length > 0 ? (
            state.productsPreview.map((product) => (
              <tr key={product.id}>
                <td className="px-3 py-2 font-medium text-zinc-950">
                  {product.id}
                </td>
                <td className="max-w-72 px-3 py-2 text-zinc-600">
                  {product.title}
                </td>
                <td className="max-w-72 px-3 py-2 text-zinc-600">
                  {product.shortTitle}
                </td>
                <td className="px-3 py-2 text-zinc-600">
                  {product.outerItemId}
                </td>
                <td className="px-3 py-2 text-zinc-600">
                  {product.platform}
                </td>
                <td className="px-3 py-2 text-zinc-600">{product.source}</td>
                <td className="px-3 py-2 text-zinc-600">{product.price}</td>
                <td className="px-3 py-2 text-zinc-600">
                  {product.finalPrice}
                </td>
                <td className="px-3 py-2 text-zinc-600">
                  {product.couponAmount}
                </td>
                <td className="px-3 py-2 text-zinc-600">
                  {product.commissionRate}
                </td>
                <td className="px-3 py-2 text-zinc-600">
                  {product.shopName}
                </td>
                <td className="px-3 py-2 text-zinc-600">
                  {product.categoryId}
                </td>
                <td className="px-3 py-2 text-zinc-600">
                  {product.categoryName}
                </td>
                <td className="px-3 py-2 text-zinc-600">
                  {product.categorySlug}
                </td>
                <td className="max-w-80 break-all px-3 py-2 text-zinc-600">
                  {product.mainImage}
                </td>
                <td className="px-3 py-2 text-zinc-600">{product.status}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="px-3 py-6 text-center text-zinc-500" colSpan={16}>
                暂无同步预览商品。
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function ImportResultPanel({ result }: { result: DataokeImportResult }) {
  return (
    <div className="mt-4 rounded-md border border-zinc-200 bg-white p-3">
      <p className="text-xs font-medium text-zinc-500">import result</p>
      <p className="mt-2 text-sm text-zinc-950">{result.message}</p>
      <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-5">
        <div><dt className="text-zinc-500">created</dt><dd>{result.createdCount}</dd></div>
        <div><dt className="text-zinc-500">updated</dt><dd>{result.updatedCount}</dd></div>
        <div><dt className="text-zinc-500">skipped</dt><dd>{result.skippedCount}</dd></div>
        <div><dt className="text-zinc-500">failed</dt><dd>{result.failedCount}</dd></div>
        <div><dt className="text-zinc-500">syncLogId</dt><dd className="break-all">{result.syncLogId ?? "-"}</dd></div>
      </dl>
      {result.failedItems.length > 0 ? (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-red-700">
          {result.failedItems.map((item) => (
            <li key={`${item.outerItemId}-${item.title}`}>
              {item.outerItemId} · {item.title}: {item.message}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function DataokeSyncPreviewForm() {
  const [state, formAction] = useActionState(
    previewDataokeProductsAction,
    initialState,
  );
  const [importResult, setImportResult] = useState<DataokeImportResult | null>(
    null,
  );
  const [isImporting, startImport] = useTransition();

  function confirmImport() {
    startImport(async () => {
      const result = await confirmDataokeProductsImportAction(
        state.productsPreview,
        state.syncParams,
      );

      setImportResult(result);
    });
  }

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <form action={formAction} className="grid gap-4 md:grid-cols-4">
        <TextInput defaultValue="数码" label="keyWords" name="keyWords" />
        <TextInput defaultValue="1" label="pageId" name="pageId" />
        <TextInput defaultValue="10" label="pageSize" name="pageSize" />
        <TextInput label="cids" name="cids" placeholder="可选" />
        <TextInput defaultValue="0" label="sort" name="sort" />
        <TextInput defaultValue="1" label="hasCoupon" name="hasCoupon" />
        <TextInput
          defaultValue="5"
          label="commissionRateLowerLimit"
          name="commissionRateLowerLimit"
        />
        <TextInput
          defaultValue="100"
          label="monthSalesLowerLimit"
          name="monthSalesLowerLimit"
        />
        <div className="md:col-span-4">
          <button
            className="h-10 rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
            type="submit"
          >
            生成同步预览
          </button>
        </div>
      </form>

      <StatusPanel state={state} />
      <SummaryPanel state={state} />
      <p className="mt-4 rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-900">
        分类会优先使用 /admin/category-mappings 中的 SourceCategoryMapping；未配置映射时 fallback 为 dataoke-{'{'}cid{'}'}。
      </p>
      {state.productsPreview.length > 0 ? (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            className="h-10 rounded-md bg-emerald-700 px-4 text-sm font-medium text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-zinc-400"
            disabled={isImporting}
            onClick={confirmImport}
            type="button"
          >
            {isImporting ? "正在入库..." : "确认入库"}
          </button>
          <p className="text-sm text-zinc-600">第一版每次最多导入 10 条</p>
        </div>
      ) : null}
      {importResult ? <ImportResultPanel result={importResult} /> : null}
      <ProductsPreviewTable state={state} />
    </section>
  );
}
