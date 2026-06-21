import type { Metadata } from "next";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getDataokeLinkBatchSummary } from "@/modules/dataoke-sync";

import { DataokeLinkBatchForm } from "./DataokeLinkBatchForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dataoke 批量转链",
  robots: {
    follow: false,
    index: false,
  },
};

export default async function DataokeLinkBatchPage() {
  const summary = await getDataokeLinkBatchSummary();

  return (
    <main className="px-5 py-8 text-zinc-950 sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <AdminPageHeader
          description="用于为已入库的 Dataoke 商品批量生成 PromotionLink。第一版每次最多处理 10 条。"
          title="Dataoke 批量转链"
        />

        <section className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-zinc-500">source=dataoke 商品总数</p>
            <p className="mt-2 text-2xl font-semibold">{summary.totalCount}</p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-zinc-500">已有 PromotionLink</p>
            <p className="mt-2 text-2xl font-semibold">{summary.linkedCount}</p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-zinc-500">缺少 PromotionLink</p>
            <p className="mt-2 text-2xl font-semibold">{summary.missingCount}</p>
          </div>
        </section>

        <DataokeLinkBatchForm />
      </div>
    </main>
  );
}
