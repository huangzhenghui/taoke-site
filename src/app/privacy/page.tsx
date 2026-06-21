import type { Metadata } from "next";

import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: `隐私说明 - ${siteConfig.siteName}`,
  description: "好物精选当前阶段的隐私与数据使用说明。",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-zinc-50 px-5 py-8 text-zinc-950 sm:px-8 lg:px-12">
      <article className="mx-auto w-full max-w-4xl rounded-lg border border-zinc-200 bg-white p-6 shadow-sm lg:p-8">
        <header className="border-b border-zinc-200 pb-5">
          <p className="text-sm font-medium text-emerald-700">隐私说明</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">
            当前阶段的隐私说明
          </h1>
        </header>

        <div className="mt-6 space-y-5 text-sm leading-7 text-zinc-600">
          <p>
            当前阶段本站不提供用户注册、登录、评论、收藏、返利或站内交易功能。
          </p>
          <p>
            当前阶段本站不主动收集身份证号、支付信息、精确地址等敏感个人信息。
          </p>
          <p>
            后续如接入访问统计、搜索日志、评论、登录、消息通知等功能，本站会同步更新隐私说明，
            并说明相关数据的使用目的和保存方式。
          </p>
          <p>
            用户通过本站链接前往第三方平台购买商品时，相关账号、交易、支付、物流和售后信息
            适用第三方平台自身的隐私规则。
          </p>
        </div>
      </article>
    </main>
  );
}
