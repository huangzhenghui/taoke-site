import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  getActivePromotionLinkByProductId,
  getPromotionLinkForRedirect,
} from "@/modules/promotion-link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false,
  },
  title: "领取优惠",
};

type GoPageProps = {
  params: Promise<{
    productId: string;
  }>;
};

function getMockRedirectUrl(productId: string) {
  const promotionLink = getActivePromotionLinkByProductId(productId);

  return promotionLink?.couponUrl || promotionLink?.promotionUrl || null;
}

export default async function GoPage({ params }: GoPageProps) {
  const { productId } = await params;
  const databaseTarget = await getPromotionLinkForRedirect(productId);

  if (databaseTarget) {
    redirect(databaseTarget.targetUrl);
  }

  const mockTarget = getMockRedirectUrl(productId);

  if (mockTarget) {
    redirect(mockTarget);
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-5 py-8 text-zinc-950 sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-5 rounded-lg border border-zinc-200 bg-white px-6 py-12 text-center shadow-sm">
        <h1 className="text-2xl font-semibold">当前商品优惠链接暂不可用</h1>
        <p className="text-sm leading-6 text-zinc-600">
          请稍后再试，或返回首页浏览其他优惠商品。
        </p>
        <Link
          className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
          href="/"
        >
          返回首页
        </Link>
      </div>
    </main>
  );
}
