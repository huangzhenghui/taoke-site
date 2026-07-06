import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArticleCard } from "@/components/article/ArticleCard";
import { ProductCard } from "@/components/product/ProductCard";
import { getSiteUrl, siteConfig } from "@/lib/site";
import { getArticlesByIds } from "@/modules/article";
import {
  getBillionSubsidyProductsFromDb,
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

type FaqItem = {
  answer: string;
  question: string;
};

type LocalTopic = {
  conclusion: string;
  description: string;
  faq: FaqItem[];
  h1: string;
  label: string;
  slug: string;
  title: string;
  updatedAt: string;
};

const eyeLampTopic: LocalTopic = {
  conclusion:
    "儿童学习护眼台灯不要只看“护眼”两个字，优先核对照度、频闪、色温、显色指数和光照范围，再结合券后价与售后决定。",
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
      question: "国 AA 照度是不是必须？",
    },
    {
      answer:
        "不建议过冷或过暗。学习场景更适合稳定、舒适、可调节的光线，具体色温范围应以商品详情页参数为准。",
      question: "色温越高越好吗？",
    },
  ],
  h1: "儿童学习护眼台灯怎么选",
  label: "护眼台灯专题",
  slug: "eye-protection-desk-lamp",
  title: "儿童学习护眼台灯怎么选：照度、频闪、色温和选购误区",
  updatedAt: "2026-07-05T00:00:00.000+08:00",
};

const billionSubsidyTopic: LocalTopic = {
  conclusion:
    "百亿补贴频道第一版先做本地好价承接：优先展示数据库里优惠券力度、销量和更新时间更靠前的商品，最终补贴和价格以跳转后平台页面为准。",
  description:
    "SpendSmart 百亿补贴样板频道，用于承接高补贴、高优惠券和强价格感商品；第一版只读取本地数据库，不实时抓取阿里妈妈专题页。",
  faq: [
    {
      answer:
        "不是。当前页面是 SpendSmart 的本地频道样板，商品来自本地数据库。后续可以在后台接入阿里妈妈专题源，但前台仍不直接请求外部 API。",
      question: "这里是直接抓取阿里妈妈百亿补贴页面吗？",
    },
    {
      answer:
        "第一版优先看优惠券金额、销量和更新时间。后续可以加入平台补贴标识、价格历史、品牌热度和人工规则。",
      question: "百亿补贴商品按什么排序？",
    },
    {
      answer:
        "仍然需要核对跳转后平台页面。补贴、库存、优惠券和最终到手价都可能变化，本站只做导购判断和入口整理。",
      question: "页面上的优惠一定能领取吗？",
    },
  ],
  h1: "百亿补贴好价精选",
  label: "百亿补贴频道",
  slug: "billion-subsidy",
  title: "百亿补贴好价精选：高优惠券、高补贴商品先看这里",
  updatedAt: "2026-07-06T00:00:00.000+08:00",
};

const localTopics = [eyeLampTopic, billionSubsidyTopic];

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return [
    ...getAllSeoPages().map((topic) => ({
      slug: topic.slug,
    })),
    ...localTopics.map((topic) => ({ slug: topic.slug })),
  ];
}

export async function generateMetadata({
  params,
}: TopicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const localTopic = localTopics.find((topic) => topic.slug === slug);

  if (localTopic) {
    return {
      description: localTopic.description,
      title: localTopic.title,
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

async function getBillionSubsidyProductsSafely() {
  try {
    return await getBillionSubsidyProductsFromDb({ limit: 12 });
  } catch {
    return [];
  }
}

function buildArticleJsonLd(topic: LocalTopic) {
  const url = getSiteUrl(`/topic/${topic.slug}`);

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    author: {
      "@type": "Organization",
      name: siteConfig.siteName,
    },
    dateModified: topic.updatedAt,
    datePublished: topic.updatedAt,
    description: topic.description,
    headline: topic.title,
    mainEntityOfPage: url,
    url,
  };
}

function buildBreadcrumbJsonLd(topic: LocalTopic) {
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
        item: getSiteUrl(`/topic/${topic.slug}`),
        name: topic.h1,
        position: 2,
      },
    ],
  };
}

function buildFaqJsonLd(topic: LocalTopic) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: topic.faq.map((faq) => ({
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

export default async function TopicDetailPage({ params }: TopicPageProps) {
  const { slug } = await params;

  if (slug === eyeLampTopic.slug) {
    const products = await getEyeLampProductsSafely();

    return <EyeProtectionDeskLampTopicPage products={products} />;
  }

  if (slug === billionSubsidyTopic.slug) {
    const products = await getBillionSubsidyProductsSafely();

    return <BillionSubsidyTopicPage products={products} />;
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
              围绕专题关键词延展导购内容，用于增强专题页内链和搜索承接能力。
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
    <LocalTopicLayout
      emptyText="当前数据库中暂未筛到足够匹配的护眼台灯商品。你可以先导入相关商品，页面结构仍会保持正常展示。"
      introSections={[
        {
          items: [
            "孩子写作业、阅读、画画时需要稳定桌面照明的家庭。",
            "经常夜间办公、看纸质资料或做手工的人。",
            "想先通过本地数据库商品快速筛选优惠候选，再去平台核对参数的人。",
          ],
          title: "护眼台灯适合什么人",
        },
        {
          items: [
            "不要把“护眼”当成唯一依据。",
            "不要只看瓦数或亮度，忽略照度均匀度和眩光控制。",
            "不要只按价格最低选，售后、灯臂稳定性和参数透明度也很重要。",
          ],
          title: "常见误区",
        },
      ]}
      metrics={[
        {
          description:
            "学习桌面更应关注照度是否覆盖主要书写区域，以及中心和边缘亮度是否均匀。",
          title: "照度",
        },
        {
          description:
            "优先选择明确说明无可视频闪或有频闪控制方案的产品，避免只看营销词。",
          title: "频闪",
        },
        {
          description:
            "适合学习的光线应舒适稳定，是否支持色温调节也会影响不同时间段的使用体验。",
          title: "色温",
        },
        {
          description:
            "显色指数越明确，越方便判断文字、彩色绘本和手工作业场景下的颜色还原。",
          title: "显色指数",
        },
        {
          description:
            "台灯不只照亮一个点，还要覆盖书本、练习册和常用桌面区域。",
          title: "光照范围",
        },
        {
          description:
            "孩子写作业更重视稳定、均匀、少眩光和可调节，建议到平台详情页核对完整参数。",
          title: "是否适合孩子写作业",
        },
      ]}
      products={products}
      productSectionDescription="优先读取数据库中 source=dataoke、已上架，并且标题包含护眼、台灯、学习灯、LED 台灯或国 AA 的商品。"
      productSectionTitle="推荐商品列表"
      topic={eyeLampTopic}
    />
  );
}

function BillionSubsidyTopicPage({ products }: { products: Product[] }) {
  return (
    <LocalTopicLayout
      emptyText="当前数据库中暂未筛到百亿补贴候选商品。后续可以从阿里妈妈专题源入库，或先用 Dataoke 导入高优惠商品。"
      introSections={[
        {
          items: [
            "想先看大额优惠券、平台补贴、短期促销的人。",
            "不想在多个平台来回翻，希望先有一个本地好价入口的人。",
            "愿意跳转后再次核对价格、券状态和店铺信息的人。",
          ],
          title: "百亿补贴适合什么人",
        },
        {
          items: [
            "不要只看补贴字样，仍要看券后价、店铺、销量和更新时间。",
            "不要默认所有优惠都长期有效，券和库存可能随时变化。",
            "不要把本站展示价当成最终成交价，最终以平台页面为准。",
          ],
          title: "查看补贴商品时要注意",
        },
      ]}
      metrics={[
        {
          description:
            "优先展示优惠券金额更高的商品，但大券不等于一定划算，还要结合原价和券后价。",
          title: "优惠券力度",
        },
        {
          description:
            "销量用于判断近期关注度。短期销量高说明热度更强，但仍需核对评价和详情。",
          title: "销量热度",
        },
        {
          description:
            "更新时间越近，越适合作为第一屏候选；过旧商品需要重新核对优惠状态。",
          title: "更新时间",
        },
        {
          description:
            "第一版先读本地数据库中的 Dataoke / Alimama 来源商品，后续再接阿里妈妈专题入库。",
          title: "商品来源",
        },
        {
          description:
            "百亿补贴商品更适合用清晰标签解释：省多少、热不热、适合谁、哪里要谨慎。",
          title: "导购解释",
        },
        {
          description:
            "前台不直接请求外部 API。专题源应先进入后台入库，再由本地数据库展示。",
          title: "安全边界",
        },
      ]}
      products={products}
      productSectionDescription="第一版读取本地数据库中 Dataoke / Alimama 来源、已上架、信息完整的高优惠商品；不实时请求阿里妈妈网站。"
      productSectionTitle="补贴候选商品"
      topic={billionSubsidyTopic}
    />
  );
}

function LocalTopicLayout({
  emptyText,
  introSections,
  metrics,
  products,
  productSectionDescription,
  productSectionTitle,
  topic,
}: {
  emptyText: string;
  introSections: Array<{ items: string[]; title: string }>;
  metrics: Array<{ description: string; title: string }>;
  products: Product[];
  productSectionDescription: string;
  productSectionTitle: string;
  topic: LocalTopic;
}) {
  return (
    <main className="min-h-screen bg-zinc-50 px-5 py-8 text-zinc-950 sm:px-8 lg:px-12">
      <JsonLdScript data={buildArticleJsonLd(topic)} />
      <JsonLdScript data={buildBreadcrumbJsonLd(topic)} />
      <JsonLdScript data={buildFaqJsonLd(topic)} />

      <article className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <nav aria-label="面包屑" className="text-sm text-zinc-600">
          <Link className="font-medium hover:text-zinc-950" href="/">
            首页
          </Link>
          <span aria-hidden="true" className="mx-2">
            /
          </span>
          <span>{topic.h1}</span>
        </nav>

        <header className="space-y-5 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-medium text-red-600">{topic.label}</p>
          <div className="max-w-4xl space-y-4">
            <h1 className="text-3xl font-semibold leading-tight tracking-normal text-zinc-950 sm:text-4xl">
              {topic.h1}
            </h1>
            <p className="text-lg leading-8 text-zinc-700">
              先给结论：{topic.conclusion}
            </p>
          </div>
          <p className="text-sm text-zinc-500">
            更新时间：
            <time dateTime={topic.updatedAt}>
              {new Date(topic.updatedAt).toLocaleDateString("zh-CN")}
            </time>
          </p>
        </header>

        <section className="grid gap-5 lg:grid-cols-2">
          {introSections.map((section) => (
            <InfoCard
              items={section.items}
              key={section.title}
              title={section.title}
            />
          ))}
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold text-zinc-950">选购关键指标</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {metrics.map((metric) => (
              <MetricCard
                description={metric.description}
                key={metric.title}
                title={metric.title}
              />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold text-zinc-950">
              {productSectionTitle}
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              {productSectionDescription}
            </p>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  showDealSignals
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-zinc-300 bg-white px-6 py-10 text-center text-sm leading-7 text-zinc-600">
              {emptyText}
            </div>
          )}
        </section>

        <section
          aria-labelledby={`${topic.slug}-faq-title`}
          className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <h2
            className="text-2xl font-semibold text-zinc-950"
            id={`${topic.slug}-faq-title`}
          >
            FAQ
          </h2>
          <div className="mt-5 divide-y divide-zinc-200">
            {topic.faq.map((faq) => (
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
            <span
              aria-hidden="true"
              className="mt-2 h-1.5 w-1.5 rounded-full bg-red-500"
            />
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
