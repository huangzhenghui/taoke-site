import type { Metadata } from "next";

import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: `免责声明 - ${siteConfig.siteName}`,
  description: "好物精选导购内容、优惠信息和第三方平台跳转说明。",
};

export default function DisclaimerPage() {
  return (
    <main className="min-h-screen bg-zinc-50 px-5 py-8 text-zinc-950 sm:px-8 lg:px-12">
      <article className="mx-auto w-full max-w-4xl rounded-lg border border-zinc-200 bg-white p-6 shadow-sm lg:p-8">
        <header className="border-b border-zinc-200 pb-5">
          <p className="text-sm font-medium text-emerald-700">免责声明</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">
            导购内容与第三方交易说明
          </h1>
        </header>

        <div className="mt-6 space-y-5 text-sm leading-7 text-zinc-600">
          <p>
            本站为导购内容站，不直接销售商品，不提供站内下单、支付、物流和售后服务。
          </p>
          <p>
            商品价格、优惠券、库存、佣金比例、活动时间等信息可能随第三方平台实时变化。
            实际交易信息以第三方平台页面展示为准。
          </p>
          <p>
            用户通过本站链接跳转至第三方平台后，交易、售后、物流、发票和隐私处理等事项
            由对应第三方平台及商家负责。
          </p>
          <p>
            本站会尽量保持内容准确，但不承诺所有商品信息、优惠信息和页面内容具备实时性。
            用户购买前应自行核对商品详情、价格、优惠券规则和售后政策。
          </p>
        </div>
      </article>
    </main>
  );
}
