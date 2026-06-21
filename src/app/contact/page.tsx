import type { Metadata } from "next";

import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: `联系我们 - ${siteConfig.siteName}`,
  description: "联系好物精选，反馈内容纠错、商务合作和站点建议。",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-zinc-50 px-5 py-8 text-zinc-950 sm:px-8 lg:px-12">
      <article className="mx-auto w-full max-w-4xl rounded-lg border border-zinc-200 bg-white p-6 shadow-sm lg:p-8">
        <header className="border-b border-zinc-200 pb-5">
          <p className="text-sm font-medium text-emerald-700">联系我们</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">
            联系方式与反馈
          </h1>
        </header>

        <div className="mt-6 space-y-5 text-sm leading-7 text-zinc-600">
          <section>
            <h2 className="text-lg font-semibold text-zinc-950">联系方式</h2>
            <p className="mt-2">
              邮箱占位：
              <a
                className="font-medium text-zinc-950 underline underline-offset-4"
                href="mailto:contact@example.com"
              >
                contact@example.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-950">商务合作</h2>
            <p className="mt-2">
              商务合作入口暂未正式开放，后续可用于品牌合作、内容合作和商品信息沟通。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-950">
              内容纠错反馈
            </h2>
            <p className="mt-2">
              如果发现商品价格、优惠券、库存、描述或链接信息存在错误，可以通过邮箱反馈。
              反馈时建议附上页面地址、问题描述和对应第三方平台页面截图或链接。
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
