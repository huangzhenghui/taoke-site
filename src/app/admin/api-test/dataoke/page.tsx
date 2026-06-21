import type { Metadata } from "next";

import {
  DataokePrivilegeLinkTestForm,
  DataokeSearchTestForm,
  DataokeSuperCategoryTestForm,
} from "./DataokeTestForms";

export const metadata: Metadata = {
  title: "Dataoke API 测试",
  robots: {
    follow: false,
    index: false,
  },
};

export default function DataokeApiTestPage() {
  return (
    <main className="px-5 py-8 text-zinc-950 sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-normal">
            Dataoke API 测试
          </h1>
          <p className="text-sm leading-6 text-zinc-600">
            当前页面用于测试大淘客接口签名、请求参数、字段映射和返回结果；
            不会影响前台页面。
          </p>
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            默认 DATAOKE_ENABLE_REAL_API=false 时不会真实请求大淘客接口。
          </p>
        </header>

        <DataokeSearchTestForm />
        <DataokeSuperCategoryTestForm />
        <DataokePrivilegeLinkTestForm />
      </div>
    </main>
  );
}
