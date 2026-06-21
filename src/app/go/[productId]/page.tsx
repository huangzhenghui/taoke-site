import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getAllProducts,
  getProductById,
  type Product,
} from "@/modules/product";
import { getActivePromotionLinkByProductId } from "@/modules/promotion-link";

const currencyFormatter = new Intl.NumberFormat("zh-CN", {
  currency: "CNY",
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
  style: "currency",
});

type GoPageProps = {
  params: Promise<{
    productId: string;
  }>;
};

export async function generateStaticParams() {
  return getAllProducts().map((product) => ({
    productId: product.id,
  }));
}

export async function generateMetadata({
  params,
}: GoPageProps): Promise<Metadata> {
  const { productId } = await params;
  const product = getProductById(productId);

  if (!product) {
    return {
      title: "领取优惠",
    };
  }

  return {
    title: `领取优惠 - ${product.title}`,
    description: "前往第三方平台领取优惠，本站不直接销售商品",
  };
}

export default async function GoPage({ params }: GoPageProps) {
  const { productId } = await params;
  const product = getProductById(productId);

  if (!product) {
    notFound();
  }

  const promotionLink = getActivePromotionLinkByProductId(product.id);

  return (
    <main className="min-h-screen bg-zinc-50 px-5 py-8 text-zinc-950 sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <Link
          className="text-sm font-medium text-zinc-600 hover:text-zinc-950"
          href={`/item/${product.id}`}
        >
          返回商品详情页
        </Link>

        <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm lg:p-8">
          <header className="space-y-3 border-b border-zinc-200 pb-6">
            <p className="text-sm font-medium text-emerald-700">优惠跳转确认</p>
            <h1 className="text-3xl font-semibold leading-tight tracking-normal text-zinc-950">
              {product.title}
            </h1>
            <p className="text-sm text-zinc-600">{product.shopName}</p>
          </header>

          <section className="grid gap-3 py-6 sm:grid-cols-2">
            <SummaryItem
              label="券后价"
              value={currencyFormatter.format(product.finalPrice)}
            />
            <SummaryItem
              label="优惠券金额"
              value={currencyFormatter.format(product.couponAmount)}
            />
          </section>

          <section className="space-y-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm leading-6 text-amber-900">
              即将前往第三方平台，本站不直接销售商品，不参与下单、支付和售后。
              请在第三方平台确认商品价格、优惠券有效期和店铺信息。
            </p>
          </section>

          {promotionLink ? (
            <PromotionLinkPanel
              product={product}
              promotionLink={promotionLink}
            />
          ) : (
            <div className="mt-6 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-5 py-8 text-center text-sm text-zinc-500">
              当前商品暂无可用优惠链接。
            </div>
          )}
        </article>
      </div>
    </main>
  );
}

type SummaryItemProps = {
  label: string;
  value: string;
};

function SummaryItem({ label, value }: SummaryItemProps) {
  return (
    <div className="rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-zinc-950">{value}</p>
    </div>
  );
}

type PromotionLinkPanelProps = {
  product: Product;
  promotionLink: NonNullable<
    ReturnType<typeof getActivePromotionLinkByProductId>
  >;
};

function PromotionLinkPanel({
  product,
  promotionLink,
}: PromotionLinkPanelProps) {
  return (
    <section className="mt-6 space-y-4">
      <div className="grid gap-3 text-sm sm:grid-cols-2">
        <SummaryItem label="平台" value={promotionLink.platform} />
        <SummaryItem label="来源" value={promotionLink.source} />
        <SummaryItem label="外部商品 ID" value={promotionLink.outerItemId} />
        <SummaryItem
          label="推广位"
          value={promotionLink.promotionPositionId}
        />
      </div>

      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
        <p className="text-xs text-zinc-500">推广链接占位信息</p>
        <p className="mt-2 break-all text-sm text-zinc-700">
          {promotionLink.promotionUrl}
        </p>
      </div>

      {promotionLink.tpwd ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-xs text-zinc-500">淘口令</p>
          <p className="mt-2 break-all text-lg font-semibold text-zinc-950">
            {promotionLink.tpwd}
          </p>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <a
          className="flex h-11 items-center justify-center rounded-md bg-amber-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
          href={promotionLink.promotionUrl}
          rel="nofollow sponsored noopener noreferrer"
          target="_blank"
        >
          前往领取优惠
        </a>
        <Link
          className="flex h-11 items-center justify-center rounded-md border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
          href={`/item/${product.id}`}
        >
          返回商品详情
        </Link>
      </div>
    </section>
  );
}
