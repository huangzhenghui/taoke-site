"use client";

import { useActionState } from "react";

import {
  testDataokePrivilegeLinkAction,
  testDataokeSearchAction,
  testDataokeSuperCategoryAction,
  type DataokeTestActionState,
} from "./actions";

const initialState: DataokeTestActionState = {
  mappedCategories: [],
  mappedProducts: [],
  message: "尚未测试。",
  rawSummary: null,
  safeErrorSummary: null,
  safeRequestSummary: null,
  success: false,
};

function StatusPanel({ state }: { state: DataokeTestActionState }) {
  return (
    <div className="mt-4 grid gap-3 md:grid-cols-3">
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

function RawSummaryPanel({ state }: { state: DataokeTestActionState }) {
  return (
    <div className="mt-4 rounded-md border border-zinc-200 bg-white p-3">
      <p className="text-xs font-medium text-zinc-500">rawSummary</p>
      <pre className="mt-2 max-h-52 overflow-auto whitespace-pre-wrap break-all rounded bg-zinc-950 p-3 text-xs text-zinc-50">
        {JSON.stringify(state.rawSummary, null, 2)}
      </pre>
    </div>
  );
}

function DiagnosticPanel({
  label,
  value,
}: {
  label: string;
  value: unknown;
}) {
  return (
    <div className="mt-4 rounded-md border border-zinc-200 bg-white p-3">
      <p className="text-xs font-medium text-zinc-500">{label}</p>
      <pre className="mt-2 max-h-52 overflow-auto whitespace-pre-wrap break-all rounded bg-zinc-950 p-3 text-xs text-zinc-50">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

function MappedProductsPanel({ state }: { state: DataokeTestActionState }) {
  return (
    <div className="mt-4 overflow-x-auto rounded-md border border-zinc-200 bg-white">
      <table className="min-w-full divide-y divide-zinc-200 text-sm">
        <thead className="bg-zinc-50 text-left text-zinc-500">
          <tr>
            <th className="px-3 py-2 font-medium">title</th>
            <th className="px-3 py-2 font-medium">shortTitle</th>
            <th className="px-3 py-2 font-medium">outerItemId</th>
            <th className="px-3 py-2 font-medium">price</th>
            <th className="px-3 py-2 font-medium">finalPrice</th>
            <th className="px-3 py-2 font-medium">couponAmount</th>
            <th className="px-3 py-2 font-medium">commissionRate</th>
            <th className="px-3 py-2 font-medium">shopName</th>
            <th className="px-3 py-2 font-medium">categoryName</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200">
          {state.mappedProducts.length > 0 ? (
            state.mappedProducts.map((product) => (
              <tr key={product.outerItemId}>
                <td className="px-3 py-2 font-medium text-zinc-950">
                  {product.title}
                </td>
                <td className="px-3 py-2 text-zinc-600">
                  {product.shortTitle}
                </td>
                <td className="px-3 py-2 text-zinc-600">
                  {product.outerItemId}
                </td>
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
                  {product.categoryName}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="px-3 py-6 text-center text-zinc-500" colSpan={9}>
                暂无映射后的商品。
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function MappedCategoriesPanel({ state }: { state: DataokeTestActionState }) {
  return (
    <div className="mt-4 overflow-x-auto rounded-md border border-zinc-200 bg-white">
      <table className="min-w-full divide-y divide-zinc-200 text-sm">
        <thead className="bg-zinc-50 text-left text-zinc-500">
          <tr>
            <th className="px-3 py-2 font-medium">id</th>
            <th className="px-3 py-2 font-medium">slug</th>
            <th className="px-3 py-2 font-medium">name</th>
            <th className="px-3 py-2 font-medium">seoTitle</th>
            <th className="px-3 py-2 font-medium">sortOrder</th>
            <th className="px-3 py-2 font-medium">status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200">
          {state.mappedCategories.length > 0 ? (
            state.mappedCategories.map((category) => (
              <tr key={category.id}>
                <td className="px-3 py-2 font-medium text-zinc-950">
                  {category.id}
                </td>
                <td className="px-3 py-2 text-zinc-600">
                  {category.slug}
                </td>
                <td className="px-3 py-2 text-zinc-600">
                  {category.name}
                </td>
                <td className="px-3 py-2 text-zinc-600">
                  {category.seoTitle}
                </td>
                <td className="px-3 py-2 text-zinc-600">
                  {category.sortOrder}
                </td>
                <td className="px-3 py-2 text-zinc-600">
                  {category.status}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="px-3 py-6 text-center text-zinc-500" colSpan={6}>
                暂无映射后的分类。
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function TextInput({
  label,
  name,
  placeholder,
}: {
  label: string;
  name: string;
  placeholder?: string;
}) {
  return (
    <label className="block text-sm font-medium text-zinc-700">
      {label}
      <input
        className="mt-2 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400"
        name={name}
        placeholder={placeholder}
        type="text"
      />
    </label>
  );
}

function SubmitButton({ label }: { label: string }) {
  return (
    <button
      className="mt-4 h-10 rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
      type="submit"
    >
      {label}
    </button>
  );
}

export function DataokeSearchTestForm() {
  const [state, formAction] = useActionState(
    testDataokeSearchAction,
    initialState,
  );

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-zinc-950">大淘客搜索测试</h2>
      <p className="mt-2 text-sm text-zinc-600">
        本轮真实联调只优先支持搜索接口，pageSize 会被服务端限制为最大 10。
      </p>
      <form action={formAction} className="mt-4 grid gap-4 md:grid-cols-3">
        <TextInput label="keyWords" name="keyWords" placeholder="办公" />
        <TextInput label="pageId" name="pageId" placeholder="1" />
        <TextInput label="pageSize" name="pageSize" placeholder="10" />
        <TextInput label="cids" name="cids" placeholder="8" />
        <TextInput label="sort" name="sort" placeholder="total_sales_des" />
        <TextInput label="hasCoupon" name="hasCoupon" placeholder="1" />
        <div className="md:col-span-3">
          <SubmitButton label="测试搜索" />
        </div>
      </form>
      <StatusPanel state={state} />
      <DiagnosticPanel
        label="safeRequestSummary"
        value={state.safeRequestSummary}
      />
      <DiagnosticPanel
        label="safeErrorSummary"
        value={state.safeErrorSummary}
      />
      <RawSummaryPanel state={state} />
      <MappedProductsPanel state={state} />
    </section>
  );
}

export function DataokeSuperCategoryTestForm() {
  const [state, formAction] = useActionState(
    testDataokeSuperCategoryAction,
    initialState,
  );

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-zinc-950">超级分类测试</h2>
      <p className="mt-2 text-sm text-zinc-600">
        本轮暂不真实联调超级分类，搜索接口稳定后再开启。
      </p>
      <form action={formAction}>
        <SubmitButton label="查看当前状态" />
      </form>
      <StatusPanel state={state} />
      <DiagnosticPanel
        label="safeRequestSummary"
        value={state.safeRequestSummary}
      />
      <DiagnosticPanel
        label="safeErrorSummary"
        value={state.safeErrorSummary}
      />
      <RawSummaryPanel state={state} />
      <MappedCategoriesPanel state={state} />
    </section>
  );
}

export function DataokePrivilegeLinkTestForm() {
  const [state, formAction] = useActionState(
    testDataokePrivilegeLinkAction,
    initialState,
  );

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-zinc-950">高效转链测试</h2>
      <p className="mt-2 text-sm text-zinc-600">
        本轮暂不真实联调高效转链，避免在搜索字段未稳定前扩大外部接口范围。
      </p>
      <form action={formAction} className="mt-4 grid gap-4 md:grid-cols-3">
        <TextInput label="goodsId" name="goodsId" />
        <TextInput label="couponId" name="couponId" />
        <TextInput label="pid" name="pid" />
        <div className="md:col-span-3">
          <SubmitButton label="查看当前状态" />
        </div>
      </form>
      <StatusPanel state={state} />
      <RawSummaryPanel state={state} />
    </section>
  );
}
