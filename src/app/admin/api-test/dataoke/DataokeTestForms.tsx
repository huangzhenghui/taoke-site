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
  mappedPromotionLink: null,
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

function SearchResultSummaryPanel({
  state,
}: {
  state: DataokeTestActionState;
}) {
  const listCount = state.rawSummary?.listCount ?? 0;
  const mappedCount = state.mappedProducts.length;
  const firstItemKeys = state.rawSummary?.firstItemKeys ?? [];

  return (
    <div className="mt-4 rounded-md border border-zinc-200 bg-white p-3">
      <p className="text-xs font-medium text-zinc-500">
        searchResultSummary
      </p>
      <dl className="mt-3 grid gap-3 text-sm md:grid-cols-3">
        <div>
          <dt className="text-xs font-medium text-zinc-500">listCount</dt>
          <dd className="mt-1 text-zinc-950">{listCount}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-zinc-500">
            detectedListPath
          </dt>
          <dd className="mt-1 break-all text-zinc-950">
            {state.rawSummary?.detectedListPath ?? "not_tested"}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-zinc-500">mappedCount</dt>
          <dd className="mt-1 text-zinc-950">{mappedCount}</dd>
        </div>
        <div className="md:col-span-3">
          <dt className="text-xs font-medium text-zinc-500">firstItemKeys</dt>
          <dd className="mt-1 break-all text-zinc-950">
            {firstItemKeys.length > 0 ? firstItemKeys.join(", ") : "-"}
          </dd>
        </div>
      </dl>
      {state.success && mappedCount === 0 && listCount > 0 ? (
        <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          已找到原始商品列表，但映射结果为空，请检查 mapper 字段。
        </p>
      ) : null}
      {state.success && listCount === 0 ? (
        <p className="mt-3 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
          接口成功，但本次搜索没有返回商品，请更换关键词或分类。
        </p>
      ) : null}
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

function MappedPromotionLinkPanel({
  state,
}: {
  state: DataokeTestActionState;
}) {
  const promotionLink = state.mappedPromotionLink;

  return (
    <div className="mt-4 rounded-md border border-zinc-200 bg-white p-3">
      <p className="text-xs font-medium text-zinc-500">
        mappedPromotionLink
      </p>
      {promotionLink ? (
        <dl className="mt-3 grid gap-3 text-sm md:grid-cols-2">
          <div>
            <dt className="text-xs font-medium text-zinc-500">productId</dt>
            <dd className="mt-1 break-all text-zinc-950">
              {promotionLink.productId}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-zinc-500">outerItemId</dt>
            <dd className="mt-1 break-all text-zinc-950">
              {promotionLink.outerItemId}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-zinc-500">platform</dt>
            <dd className="mt-1 break-all text-zinc-950">
              {promotionLink.platform}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-zinc-500">source</dt>
            <dd className="mt-1 break-all text-zinc-950">
              {promotionLink.source}
            </dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-xs font-medium text-zinc-500">
              promotionUrl
            </dt>
            <dd className="mt-1 break-all text-zinc-950">
              {promotionLink.promotionUrl}
            </dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-xs font-medium text-zinc-500">couponUrl</dt>
            <dd className="mt-1 break-all text-zinc-950">
              {promotionLink.couponUrl}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-zinc-500">tpwd</dt>
            <dd className="mt-1 break-all text-zinc-950">
              {promotionLink.tpwd}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-zinc-500">status</dt>
            <dd className="mt-1 break-all text-zinc-950">
              {promotionLink.status}
            </dd>
          </div>
        </dl>
      ) : (
        <p className="mt-3 text-sm text-zinc-500">暂无映射后的转链结果。</p>
      )}
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
      <SearchResultSummaryPanel state={state} />
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
        本轮只在后台测试高效转链接口，结果不会写入数据库，也不会影响前台页面。
      </p>
      <form action={formAction} className="mt-4 grid gap-4 md:grid-cols-3">
        <TextInput label="goodsId" name="goodsId" />
        <TextInput label="couponId" name="couponId" />
        <div>
          <TextInput label="pid" name="pid" />
          <p className="mt-2 text-xs text-zinc-500">
            留空则使用服务端 .env 中的 DATAOKE_PID。
          </p>
        </div>
        <div className="md:col-span-3">
          <SubmitButton label="测试高效转链" />
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
      <MappedPromotionLinkPanel state={state} />
    </section>
  );
}
