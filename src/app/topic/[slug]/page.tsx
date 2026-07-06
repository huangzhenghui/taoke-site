import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArticleCard } from "@/components/article/ArticleCard";
import { ProductCard } from "@/components/product/ProductCard";
import { getSiteUrl, siteConfig } from "@/lib/site";
import { getArticlesByIds } from "@/modules/article";
import {
  getEyeProtectionLampProductsFromDb,
  getProductsByIds,
  type Product,
} from "@/modules/product";
import { getAllSeoPages, getSeoPageBySlug } from "@/modules/seo-page";

type TopicPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type JsonLdValue =
  | Array<JsonLdValue>
  | boolean
  | null
  | number
  | string
  | { [key: string]: JsonLdValue | undefined };

const eyeLampTopic = {
  description:
    "围绕儿童学习护眼台灯的照度、频闪、色温、显色指数和光照范围，整理一套适合家长快速筛选的选购样板。",
  faq: [
    {
      answer:
        "不是。护眼台灯要看照度、频闪、色温、显色指数和光照范围，不能只看标题里的护眼字样。",
      question: "写着护眼的台灯就一定适合孩子吗？",
    },
    {
      answer:
        "如果主要用于孩子写作业，建议优先关注是否明确标注照度等级，并继续核对平台详情页中的执行标准和检测信息。",
      question: "国AA照度是不是必须？",
    },
    {
      answer:
        "不建议过冷或过暗。学习场景更适合稳定、舒适、可调节的光线，具体色温范围应以商品详情页参数为准。",
      question: "色温越高越好吗？",
    },
  ],
  h1: "儿童学习护眼台灯怎么选",
  slug: "eye-protection-desk-lamp",
  title: "儿童学习护眼台灯怎么选：照度、频闪、色温和选购误区",
  updatedAt: "2026-07-05T00:00:00.000+08:00",
};

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return [
    ...getAllSeoPages().map((topic) => ({
      slug: topic.slug,
    })),
    { slug: eyeLampTopic.slug },
  ];
}

export async function generateMetadata({
  params,
}: TopicPageProps): Promise<Metadata> {
  const { slug } = await params;

  if (slug === eyeLampTopic.slug) {
    return {
      description: eyeLampTopic.description,
      title: eyeLampTopic.title,
    };
  }

  const topic = getSeoPageBySlug(slug);

  if (!topic) {
    return {
      title: "专题不存在",
    };
  }

  return {
    description: topic.description,
    title: topic.title,
  };
}

async function getEyeLampProductsSafely() {
  try {
    return await getEyeProtectionLampProductsFromDb({ limit: 12 });
  } catch {
    return [];
  }
}

function buildArticleJsonLd() {
  const url = getSiteUrl(`/topic/${eyeLampTopic.slug}`);

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    author: {
      "@type": "Organization",
      name: siteConfig.siteName,
    },
    dateModified: eyeLampTopic.updatedAt,
    datePublished: eyeLampTopic.updatedAt,
    description: eyeLampTopic.description,
    headline: eyeLampTopic.title,
    mainEntityOfPage: url,
    url,
  };
}

function buildBreadcrumbJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        item: getSiteUrl("/"),
        name: "首页",
        position: 1,
      },
      {
        "@type": "ListItem",
        item: getSiteUrl(`/topic/${eyeLampTopic.slug}`),
        name: eyeLampTopic.h1,
        position: 2,
      },
    ],
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

export default async function TopicDetailPage({ params }: TopicPageProps) {
  const { slug } = await params;

  if (slug === eyeLampTopic.slug) {
    const products = await getEyeLampProductsSafely();

    return <EyeProtectionDeskLampTopicPage products={products} />;
  }

  const topic = getSeoPageBySlug(slug);

  if (!topic) {
    notFound();
  }

  const relatedProducts = getProductsByIds(topic.relatedProductIds);
  const relatedArticles = getArticlesByIds(topic.relatedArticleIds);

  return (
    <main className="min-h-screen bg-zinc-50 px-5 py-8 text-zinc-950 sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <Link
          className="text-sm font-medium text-zinc-600 hover:text-zinc-950"
          href="/"
        >
          返回首页
        </Link>

        <header className="space-y-5 border-b border-zinc-200 pb-8">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Link
              className="rounded-md bg-emerald-50 px-2 py-1 font-medium text-emerald-700"
              href={`/category/${topic.categoryId}`}
            >
              {topic.categoryName}
            </Link>
          </div>

          <div className="max-w-4xl space-y-4">
            <h1 className="text-3xl font-semibold leading-tight tracking-normal text-zinc-950 sm:text-4xl">
              {topic.h1}
            </h1>
            <p className="text-lg leading-8 text-zinc-600">
              {topic.description}
            </p>
            <p className="text-base leading-7 text-zinc-600">{topic.intro}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {topic.keywords.map((keyword) => (
              <span
                className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm text-zinc-600"
                key={keyword}
              >
                {keyword}
              </span>
            ))}
          </div>
        </header>

        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold text-zinc-950">关联商品</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              根据专题配置展示关联商品，后续可继续扩展为后台维护。
            </p>
          </div>

          {relatedProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-zinc-300 bg-white px-6 py-10 text-center text-sm text-zinc-600">
              当前专题暂无关联商品。
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold text-zinc-950">相关文章</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              围绕专题关键词延展的导购内容，可用于增强专题页内链和搜索承接能力。
            </p>
          </div>

          {relatedArticles.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {relatedArticles.map((article) => (
                <ArticleCard article={article} key={article.id} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-zinc-300 bg-white px-6 py-10 text-center text-sm text-zinc-600">
              当前专题暂无相关文章。
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function EyeProtectionDeskLampTopicPage({ products }: { products: Product[] }) {
  return (
    <main className="min-h-screen bg-zinc-50 px-5 py-8 text-zinc-950 sm:px-8 lg:px-12">
      <JsonLdScript data={buildArticleJsonLd()} />
      <JsonLdScript data={buildBreadcrumbJsonLd()} />

      <article className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <nav aria-label="面包屑" className="text-sm text-zinc-600">
          <Link className="font-medium hover:text-zinc-950" href="/">
            首页
          </Link>
          <span aria-hidden="true" className="mx-2">
            /
          </span>
          <span>{eyeLampTopic.h1}</span>
        </nav>

        <header className="space-y-5 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-medium text-emerald-700">护眼台灯专题</p>
          <div className="max-w-4xl space-y-4">
            <h1 className="text-3xl font-semibold leading-tight tracking-normal text-zinc-950 sm:text-4xl">
              {eyeLampTopic.h1}
            </h1>
            <p className="text-lg leading-8 text-zinc-700">
              先给结论：儿童学习护眼台灯不要只看“护眼”两个字，优先核对照度、频闪、色温、显色指数和光照范围，再结合券后价与售后决定。
            </p>
          </div>
          <p className="text-sm text-zinc-500">
            更新时间：
            <time dateTime={eyeLampTopic.updatedAt}>2026-07-05</time>
          </p>
        </header>

        <section className="grid gap-5 lg:grid-cols-2">
          <InfoCard
            items={[
              "孩子写作业、阅读、画画时需要稳定桌面照明的家庭。",
              "经常夜间办公、看纸质资料或做手工的人。",
              "想先通过本地数据库商品快速筛选优惠候选，再去平台核对参数的人。",
            ]}
            title="护眼台灯适合什么人"
          />
          <InfoCard
            items={[
              "不要把“护眼”当成唯一依据。",
              "不要只看瓦数或亮度，忽略照度均匀度和眩光控制。",
              "不要只按价格最低选，售后、灯臂稳定性和参数透明度也很重要。",
            ]}
            title="常见误区"
          />
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold text-zinc-950">选购关键指标</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <MetricCard
              description="学习桌面更应关注照度是否覆盖主要书写区域，以及中心和边缘亮度是否均匀。"
              title="照度"
            />
            <MetricCard
              description="优先选择明确说明无可视频闪或有频闪控制方案的产品，避免只看营销词。"
              title="频闪"
            />
            <MetricCard
              description="适合学习的光线应舒适稳定，是否支持色温调节也会影响不同时间段的使用体验。"
              title="色温"
            />
            <MetricCard
              description="显色指数越明确，越方便判断文字、彩色绘本和手工作业场景下的颜色还原。"
              title="显色指数"
            />
            <MetricCard
              description="台灯不只照亮一个点，还要覆盖书本、练习册和常用桌面区域。"
              title="光照范围"
            />
            <MetricCard
              description="孩子写作业更重视稳定、均匀、少眩光和可调节，建议到平台详情页核对完整参数。"
              title="是否适合孩子写作业"
            />
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold text-zinc-950">
              推荐商品列表
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              优先读取数据库中 source=dataoke、已上架，并且标题包含护眼、台灯、学习灯、LED台灯或国AA的商品。
            </p>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-zinc-300 bg-white px-6 py-10 text-center text-sm leading-7 text-zinc-600">
              当前数据库中暂未筛到足够匹配的护眼台灯商品。你可以先导入相关商品，页面结构仍会保持正常展示。
            </div>
          )}
        </section>

        <section
          aria-labelledby="eye-lamp-faq-title"
          className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <h2
            className="text-2xl font-semibold text-zinc-950"
            id="eye-lamp-faq-title"
          >
            FAQ
          </h2>
          <div className="mt-5 divide-y divide-zinc-200">
            {eyeLampTopic.faq.map((faq) => (
              <div className="py-5" key={faq.question}>
                <h3 className="font-semibold text-zinc-950">{faq.question}</h3>
                <p className="mt-2 text-sm leading-7 text-zinc-600">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>
      </article>
    </main>
  );
}

function InfoCard({ items, title }: { items: string[]; title: string }) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-zinc-950">{title}</h2>
      <ul className="mt-4 space-y-2 text-sm leading-7 text-zinc-600">
        {items.map((item) => (
          <li className="flex gap-2" key={item}>
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function MetricCard({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
      <h3 className="font-semibold text-zinc-950">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-zinc-600">{description}</p>
    </div>
  );
}
