import type { Metadata } from "next";

import { DataokeSyncPreviewForm } from "./DataokeSyncPreviewForm";

export const metadata: Metadata = {
  title: "Dataoke 同步预览",
  robots: {
    follow: false,
    index: false,
  },
};

export default function DataokeSyncPreviewPage() {
  return (
    <main className="px-5 py-8 text-zinc-950 sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-normal">
            Dataoke 同步预览
          </h1>
          <p className="text-sm leading-6 text-zinc-600">
            当前页面用于从大淘客搜索接口拉取商品，并预览映射后的内部
            Product 数据。本阶段只预览，不写入数据库。
          </p>
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            DATAOKE_ENABLE_REAL_API=false 时不会真实请求大淘客接口；预览结果只用于确认字段映射。
          </p>
        </header>

        <DataokeSyncPreviewForm />
      </div>
    </main>
  );
}
