import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getAllProducts,
  getProductById,
  type Product,
  type ProductStatus,
} from "@/modules/product";

const currencyFormatter = new Intl.NumberFormat("zh-CN", {
  currency: "CNY",
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
  style: "currency",
});

const platformLabels: Record<Product["platform"], string> = {
  jd: "京东",
  other: "其他平台",
  taobao: "淘宝",
  tmall: "天猫",
  vip: "唯品会",
};

const sourceLabels: Record<Product["source"], string> = {
  alimama: "阿里妈妈",
  manual: "手动录入",
  mock: "Mock 数据",
  qingtaoke: "轻淘客",
};

const statusLabels: Record<ProductStatus, string> = {
  active: "已上架",
  draft: "草稿",
  expired: "已过期",
  inactive: "已下线",
};

type ProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateStaticParams() {
  return getAllProducts().map((product) => ({
    id: product.id,
  }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    return {
      title: "商品不存在",
    };
  }

  return {
    description: product.description || product.shortTitle,
    title: product.title,
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-5 py-8 text-zinc-950 sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <Link
          className="text-sm font-medium text-zinc-600 hover:text-zinc-950"
          href="/"
        >
          返回首页
        </Link>

        <article className="grid gap-8 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm lg:grid-cols-[minmax(0,420px)_1fr] lg:p-8">
          <div
            aria-label={product.title}
            className="aspect-square rounded-lg bg-zinc-100 bg-cover bg-center"
            role="img"
            style={{ backgroundImage: `url(${product.mainImage})` }}
          />

          <div className="flex flex-col gap-6">
            <header className="space-y-3">
              <div className="flex flex-wrap gap-2 text-xs font-medium">
                <span className="rounded-md bg-emerald-50 px-2 py-1 text-emerald-700">
                  {product.categoryName}
                </span>
                <span className="rounded-md bg-zinc-100 px-2 py-1 text-zinc-600">
                  {statusLabels[product.status]}
                </span>
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl font-semibold leading-tight tracking-normal text-zinc-950">
                  {product.title}
                </h1>
                <p className="text-lg text-zinc-600">{product.shortTitle}</p>
              </div>

              <p className="text-base leading-7 text-zinc-600">
                {product.description}
              </p>
            </header>

            <section className="grid gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-zinc-500">券后价</p>
                <p className="text-3xl font-semibold text-red-600">
                  {currencyFormatter.format(product.finalPrice)}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">原价</p>
                <p className="text-lg text-zinc-400 line-through">
                  {currencyFormatter.format(product.price)}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">优惠券</p>
                <p className="text-lg font-semibold text-amber-700">
                  {currencyFormatter.format(product.couponAmount)}
                </p>
              </div>
            </section>

            <section className="grid gap-3 text-sm sm:grid-cols-2">
              <DetailItem label="店铺名称" value={product.shopName} />
              <DetailItem label="分类名称" value={product.categoryName} />
              <DetailItem
                label="佣金比例"
                value={`${product.commissionRate}%`}
              />
              <DetailItem
                label="商品平台"
                value={platformLabels[product.platform]}
              />
              <DetailItem
                label="商品来源"
                value={sourceLabels[product.source]}
              />
              <DetailItem
                label="商品状态"
                value={statusLabels[product.status]}
              />
            </section>

            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                className="flex h-11 items-center justify-center rounded-md bg-amber-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
                href={`/go/${product.id}`}
              >
                领取优惠券
              </Link>
              <Link
                className="flex h-11 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
                href={`/go/${product.id}`}
              >
                去购买
              </Link>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}

type DetailItemProps = {
  label: string;
  value: string;
};

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <div className="rounded-md border border-zinc-200 px-3 py-2">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 font-medium text-zinc-950">{value}</p>
    </div>
  );
}
