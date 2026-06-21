import type { Metadata } from "next";

import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: `关于我们 - ${siteConfig.siteName}`,
  description: "了解好物精选的网站定位、内容来源和导购说明。",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-zinc-50 px-5 py-8 text-zinc-950 sm:px-8 lg:px-12">
      <article className="mx-auto w-full max-w-4xl rounded-lg border border-zinc-200 bg-white p-6 shadow-sm lg:p-8">
        <header className="border-b border-zinc-200 pb-5">
          <p className="text-sm font-medium text-emerald-700">关于我们</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">
            实用好物与优惠导购内容站
          </h1>
        </header>

        <div className="mt-6 space-y-5 text-sm leading-7 text-zinc-600">
          <p>
            {siteConfig.siteName}
            是一个面向日常消费场景的导购内容站，主要整理实用好物、优惠信息、
            选购建议和专题内容，帮助用户更高效地了解商品。
          </p>
          <p>
            本站不直接销售商品，不提供站内交易、支付、返利、用户分销或商城服务。
            用户如需购买商品，应以前往的第三方平台页面为准。
          </p>
          <p>
            当前阶段的商品信息主要来自人工整理和本地 mock 数据。后续如接入轻淘客、
            淘宝联盟、阿里妈妈等第三方数据源，也会通过统一适配层接入。
          </p>
          <p>
            商品价格、优惠券、库存、活动时间和售后规则可能随第三方平台实时变化。
            用户购买前应以第三方平台展示的实际信息为准。
          </p>
        </div>
      </article>
    </main>
  );
}
