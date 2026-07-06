import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/product/ProductCard";
import { getSiteUrl } from "@/lib/site";
import {
  getProductById,
  getProductDetailFromDb,
  getProductsByCategorySlug,
  getRelatedProductsFromDb,
  type Product,
  type ProductStatus,
} from "@/modules/product";
import { generateProductSeoContent } from "@/modules/seo-content";

const currencyFormatter = new Intl.NumberFormat("zh-CN", {
  currency: "CNY",
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
  style: "currency",
});

export const dynamic = "force-dynamic";

const platformLabels: Record<Product["platform"], string> = {
  jd: "京东",
  other: "其他平台",
  taobao: "淘宝",
  tmall: "天猫",
  vip: "唯品会",
};

const sourceLabels: Record<Product["source"], string> = {
  alimama: "阿里妈妈",
  dataoke: "大淘客",
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

type JsonLdValue =
  | Array<JsonLdValue>
  | boolean
  | null
  | number
  | string
  | { [key: string]: JsonLdValue | undefined };

async function getProductForDetail(id: string) {
  return (await getProductDetailFromDb(id)) ?? getProductById(id);
}

async function getRelatedProductsForDetail(product: Product) {
  const dbProducts = await getRelatedProductsFromDb({
    categorySlug: product.categorySlug,
    excludeProductId: product.id,
    limit: 3,
  });

  if (dbProducts.length > 0) {
    return dbProducts;
  }

  return getProductsByCategorySlug(product.categorySlug)
    .filter((item) => item.id !== product.id && item.status === "active")
    .slice(0, 3);
}

function hasPositivePrice(value: number | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function formatPrice(value: number | undefined) {
  return hasPositivePrice(value) ? currencyFormatter.format(value) : "暂无";
}

function cleanJsonLd<T extends Record<string, JsonLdValue | undefined>>(
  value: T,
) {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== undefined),
  );
}

function buildProductJsonLd(product: Product) {
  const url = getSiteUrl(`/item/${product.id}`);

  return cleanJsonLd({
    "@context": "https://schema.org",
    "@type": "Product",
    brand: product.brandName
      ? {
          "@type": "Brand",
          name: product.brandName,
        }
      : undefined,
    description: product.description || product.shortTitle || product.title,
    image: product.mainImage ? [product.mainImage] : undefined,
    name: product.title,
    offers: hasPositivePrice(product.finalPrice)
      ? {
          "@type": "Offer",
          availability: "https://schema.org/InStock",
          price: product.finalPrice.toFixed(2),
          priceCurrency: "CNY",
          url,
        }
      : undefined,
    url,
  });
}

function buildFaqJsonLd(
  faqs: Array<{ answer: string; question: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
      name: faq.question,
    })),
  };
}

function JsonLdScript({ data }: { data: JsonLdValue }) {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
      type="application/ld+json"
    />
  );
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductForDetail(id);

  if (!product) {
    return {
      title: "商品不存在",
    };
  }

  return {
    description: product.shortTitle || product.description,
    title: product.title,
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProductForDetail(id);

  if (!product) {
    notFound();
  }

  const seoContent = generateProductSeoContent(product);
  const relatedProducts = await getRelatedProductsForDetail(product);

  return (
    <main className="min-h-screen bg-zinc-50 px-5 py-8 text-zinc-950 sm:px-8 lg:px-12">
      <JsonLdScript data={buildProductJsonLd(product)} />
      {seoContent.faqs.length > 0 ? (
        <JsonLdScript data={buildFaqJsonLd(seoContent.faqs)} />
      ) : null}

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
            style={{
              backgroundImage: product.mainImage
                ? `url(${product.mainImage})`
                : undefined,
            }}
          />

          <div className="flex flex-col gap-6">
            <header className="space-y-3">
              <div className="flex flex-wrap gap-2 text-xs font-medium">
                <span className="rounded-md bg-emerald-50 px-2 py-1 text-emerald-700">
                  {product.categoryName || "未分类"}
                </span>
                <span className="rounded-md bg-zinc-100 px-2 py-1 text-zinc-600">
                  {statusLabels[product.status]}
                </span>
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl font-semibold leading-tight tracking-normal text-zinc-950">
                  {product.title}
                </h1>
                {product.shortTitle ? (
                  <p className="text-lg text-zinc-600">{product.shortTitle}</p>
                ) : null}
              </div>

              {product.description ? (
                <p className="text-base leading-7 text-zinc-600">
                  {product.description}
                </p>
              ) : null}
            </header>

            <section className="grid gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-zinc-500">券后价</p>
                <p className="text-3xl font-semibold text-red-600">
                  {formatPrice(product.finalPrice)}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">原价</p>
                <p className="text-lg text-zinc-400 line-through">
                  {formatPrice(product.price)}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">优惠券</p>
                <p className="text-lg font-semibold text-amber-700">
                  {formatPrice(product.couponAmount)}
                </p>
              </div>
            </section>

            <section className="grid gap-3 text-sm sm:grid-cols-2">
              <DetailItem label="店铺名称" value={product.shopName} />
              <DetailItem label="分类名称" value={product.categoryName} />
              <DetailItem
                label="佣金比例"
                value={
                  hasPositivePrice(product.commissionRate)
                    ? `${product.commissionRate}%`
                    : "暂无"
                }
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

        <section
          aria-labelledby="product-guide-title"
          className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm sm:p-8"
        >
          <div className="space-y-3">
            <p className="text-sm font-medium text-emerald-700">
              SEO/GEO 导购摘要
            </p>
            <h2
              className="text-2xl font-semibold text-zinc-950"
              id="product-guide-title"
            >
              这件商品值不值得看？
            </h2>
            <p className="text-base leading-8 text-zinc-700">
              {seoContent.summary}
            </p>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <GuideList title="适合谁买" items={seoContent.suitableFor} />
            <GuideList title="核心卖点" items={seoContent.highlights} />
            <GuideList title="不适合人群" items={seoContent.notSuitableFor} />
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <h3 className="font-semibold text-zinc-950">购买建议</h3>
              <p className="mt-3 text-sm leading-7 text-zinc-600">
                {seoContent.buyingAdvice}
              </p>
            </div>
          </div>

          {seoContent.riskFlags.length > 0 ? (
            <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <h3 className="font-semibold text-amber-900">信息完整度提醒</h3>
              <p className="mt-2 text-sm leading-7 text-amber-900">
                当前商品存在部分字段缺失：{seoContent.riskFlags.join("、")}。
                建议跳转到平台详情页核对完整参数后再下单。
              </p>
            </div>
          ) : null}
        </section>

        {seoContent.faqs.length > 0 ? (
          <section
            aria-labelledby="product-faq-title"
            className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm sm:p-8"
          >
            <h2
              className="text-2xl font-semibold text-zinc-950"
              id="product-faq-title"
            >
              常见问题
            </h2>
            <div className="mt-5 divide-y divide-zinc-200">
              {seoContent.faqs.map((faq) => (
                <div className="py-5" key={faq.question}>
                  <h3 className="text-base font-semibold text-zinc-950">
                    {faq.question}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-zinc-600">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold text-zinc-950">
              相关商品推荐
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              优先展示同类目、已上架且信息完整的本地数据库商品；不足时页面会保持可用。
            </p>
          </div>

          {relatedProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-zinc-300 bg-white px-6 py-10 text-center text-sm text-zinc-600">
              暂无可展示的相关商品。
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

type DetailItemProps = {
  label: string;
  value?: number | string;
};

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <div className="rounded-md border border-zinc-200 px-3 py-2">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 font-medium text-zinc-950">
        {value || value === 0 ? value : "暂无"}
      </p>
    </div>
  );
}

function GuideList({ items, title }: { items: string[]; title: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
      <h3 className="font-semibold text-zinc-950">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm leading-7 text-zinc-600">
        {items.map((item) => (
          <li className="flex gap-2" key={item}>
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
