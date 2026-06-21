"use client";

import { useActionState } from "react";

import {
  testDataokePrivilegeLinkAction,
  testDataokeSearchAction,
  testDataokeSuperCategoryAction,
} from "./actions";

type DataokeTestState = {
  status: "idle" | "success" | "error";
  message: string;
  raw: unknown;
  mapped: unknown;
};

const initialState: DataokeTestState = {
  mapped: null,
  message: "尚未测试。",
  raw: null,
  status: "idle",
};

function ResultPanel({ state }: { state: DataokeTestState }) {
  return (
    <div className="mt-4 grid gap-3 md:grid-cols-3">
      <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
        <p className="text-xs font-medium text-zinc-500">当前测试状态</p>
        <p className="mt-2 text-sm text-zinc-950">{state.status}</p>
      </div>
      <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3 md:col-span-2">
        <p className="text-xs font-medium text-zinc-500">错误信息</p>
        <p className="mt-2 text-sm text-zinc-950">{state.message}</p>
      </div>
      <div className="rounded-md border border-zinc-200 bg-white p-3 md:col-span-3">
        <p className="text-xs font-medium text-zinc-500">原始返回 raw</p>
        <pre className="mt-2 max-h-52 overflow-auto whitespace-pre-wrap break-all rounded bg-zinc-950 p-3 text-xs text-zinc-50">
          {JSON.stringify(state.raw, null, 2)}
        </pre>
      </div>
      <div className="rounded-md border border-zinc-200 bg-white p-3 md:col-span-3">
        <p className="text-xs font-medium text-zinc-500">映射后的数据</p>
        <pre className="mt-2 max-h-52 overflow-auto whitespace-pre-wrap break-all rounded bg-zinc-950 p-3 text-xs text-zinc-50">
          {JSON.stringify(state.mapped, null, 2)}
        </pre>
      </div>
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
      <form action={formAction} className="mt-4 grid gap-4 md:grid-cols-3">
        <TextInput label="keyWords" name="keyWords" placeholder="办公" />
        <TextInput label="pageId" name="pageId" placeholder="1" />
        <TextInput label="pageSize" name="pageSize" placeholder="20" />
        <TextInput label="cids" name="cids" placeholder="8" />
        <TextInput label="sort" name="sort" placeholder="total_sales_des" />
        <TextInput label="hasCoupon" name="hasCoupon" placeholder="1" />
        <div className="md:col-span-3">
          <SubmitButton label="测试搜索" />
        </div>
      </form>
      <ResultPanel state={state} />
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
      <p className="mt-2 text-sm text-zinc-600">无业务参数，只测试分类接口。</p>
      <form action={formAction}>
        <SubmitButton label="测试超级分类" />
      </form>
      <ResultPanel state={state} />
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
      <form action={formAction} className="mt-4 grid gap-4 md:grid-cols-3">
        <TextInput label="goodsId" name="goodsId" />
        <TextInput label="couponId" name="couponId" />
        <TextInput label="pid" name="pid" />
        <div className="md:col-span-3">
          <SubmitButton label="测试转链" />
        </div>
      </form>
      <ResultPanel state={state} />
    </section>
  );
}
