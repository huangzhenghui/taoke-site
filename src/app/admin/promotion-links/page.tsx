import type { Metadata } from "next";

import { getAllPromotionLinks } from "@/modules/promotion-link";

export const metadata: Metadata = {
  title: "推广链接管理",
  robots: {
    follow: false,
    index: false,
  },
};

export default function AdminPromotionLinksPage() {
  const promotionLinks = getAllPromotionLinks();

  return (
    <main className="px-5 py-8 text-zinc-950 sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header>
          <h1 className="text-3xl font-semibold tracking-normal">推广链接</h1>
          <p className="mt-2 text-sm text-zinc-600">
            只读展示当前 mock 推广链接数据，暂不做点击统计和真实转链。
          </p>
        </header>

        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-zinc-200 text-sm">
            <thead className="bg-zinc-50 text-left text-zinc-500">
              <tr>
                <th className="px-4 py-3 font-medium">productId</th>
                <th className="px-4 py-3 font-medium">platform</th>
                <th className="px-4 py-3 font-medium">source</th>
                <th className="px-4 py-3 font-medium">outerItemId</th>
                <th className="px-4 py-3 font-medium">status</th>
                <th className="px-4 py-3 font-medium">promotionPositionId</th>
                <th className="px-4 py-3 font-medium">tpwd</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {promotionLinks.map((promotionLink) => (
                <tr key={promotionLink.id}>
                  <td className="px-4 py-3 font-medium text-zinc-950">
                    {promotionLink.productId}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {promotionLink.platform}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {promotionLink.source}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {promotionLink.outerItemId}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {promotionLink.status}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {promotionLink.promotionPositionId}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {promotionLink.tpwd}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
