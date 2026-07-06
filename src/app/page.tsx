import Link from "next/link";

import { ArticleCard } from "@/components/article/ArticleCard";
import { ProductCard } from "@/components/product/ProductCard";
import { SeoPageCard } from "@/components/seo/SeoPageCard";
import {
  generateDealReason,
  getDealReasonSignals,
  getFreshnessLabel,
  getProductHotScore,
  getRankingReason,
  type HotRankingWindow,
} from "@/modules/deal";
import { getAllArticles } from "@/modules/article";
import { getActiveCategories } from "@/modules/category";
import {
  getActiveProducts,
  getHomeProductsFromDb,
  getHotProductsFromDb,
  type Product,
} from "@/modules/product";
import { getAllSeoPages } from "@/modules/seo-page";

export const dynamic = "force-dynamic";

const searchSuggestions = ["护眼台灯", "键盘", "眼镜", "饼干", "饮用水", "鼠标"];

const channelLinks = [
  { href: "#today-deals", label: "首页" },
  { href: "#today-deals", label: "好价" },
  { href: "#hot-rankings", label: "排行榜" },
  { href: "#scene-topics", label: "专题" },
  { href: "/topic/eye-protection-desk-lamp", label: "护眼台灯" },
  { href: "/topic/billion-subsidy", label: "百亿补贴" },
];

const mobileShortcutLinks = [
  { href: "#today-deals", label: "今日好价" },
  { href: "#hot-rankings", label: "时间榜单" },
  { href: "#hot-recommendations", label: "热门推荐" },
  { href: "#hot-brands", label: "热门品牌" },
  { href: "/topic/billion-subsidy", label: "百亿补贴" },
];

const fallbackCategoryGroups = [
  "热门推荐",
  "热门品牌",
  "电脑 手机 办公",
  "大家电 生活电器",
  "床垫 家纺 厨具 宠物",
  "服饰 运动",
  "个护美妆 配饰腕表",
  "母婴 玩模乐器",
  "生鲜 酒水 粮油",
  "图书 文娱 游戏",
];

type DiscoveryItem = {
  count: number;
  href: string;
  label: string;
  score: number;
  subtitle: string;
};

async function readProductsSafely(
  reader: () => Promise<Product[]>,
): Promise<Product[]> {
  try {
    return await reader();
  } catch {
    return [];
  }
}

function byHotScore(products: Product[]) {
  return [...products].sort(
    (left, right) =>
      getProductHotScore(right) - getProductHotScore(left) ||
      new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
  );
}

function uniqueProducts(products: Product[]) {
  const seen = new Set<string>();

  return products.filter((product) => {
    const key = product.outerItemId || product.id;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);

    return true;
  });
}

function pickFallbackProducts(limit: number) {
  return byHotScore(getActiveProducts()).slice(0, limit);
}

function getCategoryPanelHref(item: string, index: number) {
  if (item === "热门推荐") {
    return "#hot-recommendations";
  }

  if (item === "热门品牌") {
    return "#hot-brands";
  }

  if (index <= 3) {
    return "#today-deals";
  }

  return "#hot-rankings";
}

function buildCategoryDiscoveryItems(products: Product[]): DiscoveryItem[] {
  const categoryMap = new Map<
    string,
    {
      count: number;
      label: string;
      score: number;
      slug: string;
    }
  >();

  for (const product of products) {
    const slug = product.categorySlug || "uncategorized";
    const current = categoryMap.get(slug) ?? {
      count: 0,
      label: product.categoryName || "精选好物",
      score: 0,
      slug,
    };

    current.count += 1;
    current.score += getProductHotScore(product);
    categoryMap.set(slug, current);
  }

  return Array.from(categoryMap.values())
    .sort((left, right) => right.score - left.score || right.count - left.count)
    .slice(0, 6)
    .map((item) => ({
      count: item.count,
      href: item.slug === "uncategorized" ? "#today-deals" : `/category/${item.slug}`,
      label: item.label,
      score: item.score,
      subtitle: `${item.count} 个近期好价`,
    }));
}

function buildBrandDiscoveryItems(products: Product[]): DiscoveryItem[] {
  const brandMap = new Map<
    string,
    {
      count: number;
      label: string;
      score: number;
    }
  >();

  for (const product of products) {
    const label = product.brandName?.trim() || product.shopName?.trim();

    if (!label) {
      continue;
    }

    const current = brandMap.get(label) ?? {
      count: 0,
      label,
      score: 0,
    };

    current.count += 1;
    current.score += getProductHotScore(product);
    brandMap.set(label, current);
  }

  return Array.from(brandMap.values())
    .sort((left, right) => right.score - left.score || right.count - left.count)
    .slice(0, 6)
    .map((item) => ({
      count: item.count,
      href: `/search?q=${encodeURIComponent(item.label)}`,
      label: item.label,
      score: item.score,
      subtitle: `${item.count} 个相关商品`,
    }));
}

export default async function Home() {
  const articles = getAllArticles();
  const seoPages = getAllSeoPages();
  const activeCategories = getActiveCategories();
  const categoryGroups =
    activeCategories.length > 0
      ? [
          "热门推荐",
          "热门品牌",
          ...activeCategories.map((category) => category.name),
        ].slice(0, 10)
      : fallbackCategoryGroups;
  const [todayDealsFromDb, hotTodayFromDb, hotTwoHoursFromDb, hotWeekFromDb] =
    await Promise.all([
      readProductsSafely(() => getHomeProductsFromDb({ limit: 12 })),
      readProductsSafely(() =>
        getHotProductsFromDb({ limit: 10, window: "today" }),
      ),
      readProductsSafely(() =>
        getHotProductsFromDb({ limit: 10, window: "two_hours" }),
      ),
      readProductsSafely(() =>
        getHotProductsFromDb({ limit: 10, window: "week" }),
      ),
    ]);
  const todayDeals =
    todayDealsFromDb.length > 0
      ? uniqueProducts(todayDealsFromDb)
      : pickFallbackProducts(12);
  const hotToday =
    hotTodayFromDb.length > 0
      ? uniqueProducts(hotTodayFromDb)
      : pickFallbackProducts(10);
  const hotTwoHours =
    hotTwoHoursFromDb.length > 0
      ? uniqueProducts(hotTwoHoursFromDb)
      : pickFallbackProducts(10);
  const hotWeek =
    hotWeekFromDb.length > 0
      ? uniqueProducts(hotWeekFromDb)
      : pickFallbackProducts(10);
  const discoveryProducts = uniqueProducts([
    ...todayDeals,
    ...hotToday,
    ...hotTwoHours,
    ...hotWeek,
  ]);
  const categoryDiscoveryItems = buildCategoryDiscoveryItems(discoveryProducts);
  const brandDiscoveryItems = buildBrandDiscoveryItems(discoveryProducts);
  const featuredDeal = todayDeals[0];
  const secondaryDeals = todayDeals.slice(1, 7);

  return (
    <main className="min-h-screen bg-[#f6f6f6] text-zinc-950">
      <HomeSearchHeader />

      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-3 px-3 pb-10 pt-3 sm:gap-4 sm:px-4">
        <ChannelNav />
        <MobileShortcutNav />

        <section className="grid gap-4 lg:grid-cols-[240px_1fr_280px]">
          <CategoryPanel items={categoryGroups} />

          {featuredDeal ? (
            <HeroFeature product={featuredDeal} />
          ) : (
              <div className="min-h-[360px] rounded-xl border border-zinc-200 bg-white p-8 text-sm text-zinc-500 shadow-sm">
                暂无可展示的今日好价。导入商品后这里会自动展示主推商品。
              </div>
          )}

          <RightRail
            hotProducts={hotToday}
            todayCount={todayDeals.length}
            topicCount={seoPages.length + 1}
          />
        </section>

        <section className="scroll-mt-4 space-y-4" id="today-deals">
          <SectionHeader
            description="保留少量高质量商品，减少刷屏感。每张卡都给出可读的好价理由。"
            eyebrow="今日好价"
            title="先看这些值得关注"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {secondaryDeals.map((product) => (
              <ProductCard
                badgeLabel="今日好价"
                key={product.id}
                product={product}
                showDealSignals
              />
            ))}
          </div>
        </section>

        <section className="scroll-mt-4 space-y-4" id="hot-rankings">
          <SectionHeader
            description="近 2 小时看即时热度，今日看当天表现，本周看稳定热卖。后续可升级为独立排行榜页。"
            eyebrow="时间榜单"
            title="按时间窗口看热门商品"
          />
          <RankingSummary
            todayCount={hotToday.length}
            twoHoursCount={hotTwoHours.length}
            weekCount={hotWeek.length}
          />
          <div className="grid gap-4 lg:grid-cols-3">
            <RankingList
              description="优先看短时间热度，适合发现刚冒出来的好价。"
              products={hotTwoHours}
              title="近 2 小时热卖"
              window="two_hours"
            />
            <RankingList
              description="按今日销量和更新时间排序，适合快速扫当天好价。"
              products={hotToday}
              title="今日热门"
              window="today"
            />
            <RankingList
              description="更看重稳定销量，适合找不容易踩坑的长期热卖款。"
              products={hotWeek}
              title="本周热门"
              window="week"
            />
          </div>
        </section>

        <section className="scroll-mt-4 space-y-4" id="discovery">
          <SectionHeader
            description="用当前商品的热度、优惠和销量自动聚合，不需要人工每天维护。后续可以升级为独立频道。"
            eyebrow="热门入口"
            title="按热门推荐和品牌继续逛"
          />
          <div className="grid gap-4 lg:grid-cols-2">
            <DiscoveryPanel
              description="从近期好价商品里自动聚合，帮助用户快速进入高频类目。"
              emptyText="暂无可聚合的热门推荐。"
              id="hot-recommendations"
              items={categoryDiscoveryItems}
              title="热门推荐"
            />
            <DiscoveryPanel
              description="优先使用品牌名；没有品牌名时用店铺名兜底，先形成可点击入口。"
              emptyText="暂无可聚合的热门品牌。"
              id="hot-brands"
              items={brandDiscoveryItems}
              title="热门品牌"
            />
          </div>
        </section>

        <section className="scroll-mt-4 space-y-4" id="scene-topics">
          <SectionHeader
            description="场景专题更适合 SEO/GEO，也更接近 App 里的频道入口。"
            eyebrow="场景专题"
            title="从具体需求开始选"
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <article className="rounded-xl border border-red-100 bg-gradient-to-br from-red-50 to-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-red-600">
                SEO/GEO 样板专题
              </p>
              <h3 className="mt-3 text-xl font-semibold text-zinc-950">
                儿童学习护眼台灯怎么选
              </h3>
              <p className="mt-2 text-sm leading-7 text-zinc-600">
                从照度、频闪、色温、显色指数和光照范围判断，不只看“护眼”关键词。
              </p>
              <Link
                className="mt-4 inline-flex h-10 items-center rounded-xl bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700"
                href="/topic/eye-protection-desk-lamp"
              >
                查看专题
              </Link>
            </article>
            {seoPages.slice(0, 3).map((seoPage) => (
              <SeoPageCard key={seoPage.id} seoPage={seoPage} />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <SectionHeader
            description="文章放在首页后段，用来补充商品页没有讲完的购买判断。"
            eyebrow="导购文章"
            title="更多消费决策内容"
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {articles.slice(0, 4).map((article) => (
              <ArticleCard article={article} key={article.id} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function HomeSearchHeader() {
  return (
    <section className="border-b border-zinc-200 bg-white">
      <div className="mx-auto grid w-full max-w-[1200px] gap-4 px-3 py-4 sm:px-4 sm:py-6 lg:grid-cols-[260px_1fr_220px] lg:items-start">
        <Link className="flex items-center gap-3" href="/">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-red-600 text-2xl font-bold text-white sm:h-14 sm:w-14 sm:text-3xl">
            值
          </span>
          <span>
            <span className="block text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
              SpendSmart
            </span>
            <span className="mt-1 block text-[11px] tracking-[0.28em] text-zinc-500 sm:text-xs sm:tracking-[0.35em]">
              聪明买 少踩坑
            </span>
          </span>
        </Link>

        <div className="space-y-3">
          <form action="/search" className="flex" method="GET">
            <label className="sr-only" htmlFor="home-search-q">
              搜索商品、专题或导购文章
            </label>
            <input
              autoComplete="off"
              className="h-12 min-w-0 flex-1 rounded-l-xl border-2 border-red-600 bg-white px-3 text-sm text-zinc-950 outline-none placeholder:text-zinc-400 sm:h-14 sm:px-5 sm:text-base"
              id="home-search-q"
              name="q"
              placeholder="搜索护眼台灯、键盘、饼干、饮用水"
              type="search"
            />
            <button
              className="h-12 rounded-r-xl bg-red-600 px-5 text-base font-semibold text-white transition-colors hover:bg-red-700 sm:h-14 sm:px-9 sm:text-xl"
              type="submit"
            >
              搜索
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <span className="text-zinc-500">热门搜索：</span>
            {searchSuggestions.map((keyword) => (
              <Link
                className="text-zinc-600 hover:text-red-600"
                href={`/search?q=${encodeURIComponent(keyword)}`}
                key={keyword}
              >
                {keyword}
              </Link>
            ))}
          </div>
        </div>

        <div className="hidden justify-end gap-4 text-sm text-zinc-600 lg:flex">
          <Link className="hover:text-red-600" href="/about">
            推荐原则
          </Link>
          <Link className="hover:text-red-600" href="/contact">
            联系我们
          </Link>
        </div>
      </div>
    </section>
  );
}

function ChannelNav() {
  return (
    <nav
      aria-label="首页频道"
      className="flex items-center gap-6 overflow-x-auto rounded-xl border border-zinc-200 bg-white px-3 py-3 text-base font-semibold shadow-sm sm:gap-8 sm:px-4 sm:py-4 sm:text-lg"
    >
      {channelLinks.map((item, index) => (
        <Link
          className={`shrink-0 hover:text-red-600 ${
            index === 0 ? "text-red-600" : "text-zinc-800"
          }`}
          href={item.href}
          key={`${item.href}-${item.label}`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function MobileShortcutNav() {
  return (
    <nav
      aria-label="移动端快捷入口"
      className="flex gap-2 overflow-x-auto rounded-xl border border-zinc-200 bg-white p-2 shadow-sm lg:hidden"
    >
      {mobileShortcutLinks.map((item) => (
        <Link
          className="shrink-0 rounded-full bg-zinc-100 px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-red-50 hover:text-red-600"
          href={item.href}
          key={`${item.href}-${item.label}`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function CategoryPanel({ items }: { items: string[] }) {
  return (
      <aside className="hidden overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm lg:block">
      <ul className="divide-y divide-zinc-100">
        {items.map((item, index) => (
          <li key={`${item}-${index}`}>
            <Link
              className="flex items-center justify-between px-4 py-3 text-[15px] text-zinc-700 transition-colors hover:bg-red-50 hover:text-red-600"
                href={getCategoryPanelHref(item, index)}
              >
              <span>{item}</span>
              <span className="text-zinc-300">›</span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function HeroFeature({ product }: { product: Product }) {
  const dealSignals = getDealReasonSignals(product);

  return (
    <Link
      className="group relative min-h-[300px] overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm sm:min-h-[360px]"
      href={`/item/${product.id}`}
    >
      <div
        aria-label={product.title}
        className="absolute inset-0 bg-zinc-100 bg-cover bg-center transition-transform duration-300 group-hover:scale-[1.02]"
        role="img"
        style={{
          backgroundImage: product.mainImage
            ? `url(${product.mainImage})`
            : undefined,
        }}
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-4 text-white sm:p-6">
        <span className="rounded-sm bg-red-600 px-2.5 py-1 text-xs font-semibold sm:px-3 sm:text-sm">
          今日主推
        </span>
        <h1 className="mt-3 line-clamp-2 text-2xl font-semibold leading-tight sm:mt-4 sm:text-3xl">
          {product.title}
        </h1>
        <p className="mt-3 line-clamp-2 max-w-2xl text-sm leading-6 text-zinc-100">
          {generateDealReason(product)}
        </p>
        <div className="mt-4 grid max-w-2xl grid-cols-2 gap-2 sm:grid-cols-4">
          {dealSignals.map((signal) => (
            <span
              className="rounded-sm bg-white/90 px-3 py-2 text-xs font-semibold text-zinc-900"
              key={`${signal.label}-${signal.value}`}
            >
              <span className="block text-[10px] font-medium text-zinc-500">
                {signal.label}
              </span>
              <span className="mt-0.5 block truncate">{signal.value}</span>
            </span>
          ))}
        </div>
        <div className="mt-4 flex items-end justify-between gap-4 sm:mt-5">
          <p>
            <span className="block text-xs text-zinc-200">券后价</span>
            <span className="text-3xl font-semibold text-red-300 sm:text-4xl">
              ¥{product.finalPrice > 0 ? product.finalPrice : "暂无"}
            </span>
          </p>
          <span className="rounded-sm bg-white px-4 py-2 text-sm font-semibold text-zinc-950 sm:px-5">
            查看详情
          </span>
        </div>
      </div>
    </Link>
  );
}

function RightRail({
  hotProducts,
  todayCount,
  topicCount,
}: {
  hotProducts: Product[];
  todayCount: number;
  topicCount: number;
}) {
  return (
    <aside className="space-y-3 sm:space-y-4">
      <section className="rounded-xl border border-zinc-200 bg-white p-5 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-xl sm:h-16 sm:w-16 sm:text-2xl">
          👋
        </div>
        <p className="mt-3 text-sm font-semibold text-zinc-900">
          Hi~ 发现更多好价
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-lg bg-zinc-50 px-3 py-2">
            <p className="font-semibold text-red-600">{todayCount}</p>
            <p className="mt-1 text-zinc-500">今日好价</p>
          </div>
            <div className="rounded-lg bg-zinc-50 px-3 py-2">
            <p className="font-semibold text-red-600">{topicCount}</p>
            <p className="mt-1 text-zinc-500">精选专题</p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-950">好价快报</h2>
        <p className="mt-1 text-xs text-zinc-500">
          按今日热度和更新时间自动挑选，适合快速扫一眼。
        </p>
        <div className="mt-4 space-y-3">
          {hotProducts.slice(0, 4).map((product, index) => (
            <CompactDealRow
              index={index + 1}
              key={product.id}
              product={product}
              showFreshness
              window="today"
            />
          ))}
        </div>
      </section>
    </aside>
  );
}

function SectionHeader({
  description,
  eyebrow,
  title,
}: {
  description: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-red-600">{eyebrow}</p>
      <h2 className="mt-1 text-2xl font-semibold text-zinc-950">{title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">
        {description}
      </p>
    </div>
  );
}

function RankingSummary({
  todayCount,
  twoHoursCount,
  weekCount,
}: {
  todayCount: number;
  twoHoursCount: number;
  weekCount: number;
}) {
  const items = [
    {
      label: "近 2 小时",
      value: twoHoursCount,
      description: "看短时热度",
    },
    {
      label: "今日",
      value: todayCount,
      description: "看当天表现",
    },
    {
      label: "本周",
      value: weekCount,
      description: "看稳定热卖",
    },
  ];

  return (
    <div className="grid gap-3 rounded-xl border border-red-100 bg-white p-4 shadow-sm sm:grid-cols-3">
      {items.map((item) => (
        <div
            className="flex items-center justify-between rounded-lg bg-red-50/60 px-4 py-3"
          key={item.label}
        >
          <div>
            <p className="text-sm font-semibold text-zinc-950">{item.label}</p>
            <p className="mt-1 text-xs text-zinc-500">{item.description}</p>
          </div>
          <p className="text-2xl font-semibold text-red-600">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

function DiscoveryPanel({
  description,
  emptyText,
  id,
  items,
  title,
}: {
  description: string;
  emptyText: string;
  id: string;
  items: DiscoveryItem[];
  title: string;
}) {
  return (
    <section
      className="scroll-mt-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
      id={id}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-zinc-950">{title}</h3>
          <p className="mt-1 text-xs leading-5 text-zinc-500">{description}</p>
        </div>
        <span className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600">
          自动聚合
        </span>
      </div>

      {items.length > 0 ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {items.map((item, index) => (
            <Link
              className="group flex items-center justify-between gap-3 rounded-lg border border-zinc-100 bg-zinc-50 px-4 py-3 transition-colors hover:border-red-100 hover:bg-red-50"
              href={item.href}
              key={`${item.label}-${index}`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-red-600 shadow-sm">
                    {index + 1}
                  </span>
                  <p className="truncate text-sm font-semibold text-zinc-950 group-hover:text-red-600">
                    {item.label}
                  </p>
                </div>
                <p className="mt-1 pl-8 text-xs text-zinc-500">
                  {item.subtitle}
                </p>
              </div>
              <span className="text-zinc-300 group-hover:text-red-400">›</span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-sm border border-dashed border-zinc-200 px-4 py-8 text-center text-sm text-zinc-500">
          {emptyText}
        </div>
      )}
    </section>
  );
}

function CompactDealRow({
  index,
  product,
  showFreshness = false,
  window = "today",
}: {
  index: number;
  product: Product;
  showFreshness?: boolean;
  window?: HotRankingWindow;
}) {
  return (
    <Link
      className="flex gap-3 rounded-sm border border-zinc-100 p-2.5 transition-colors hover:bg-zinc-50"
      href={`/item/${product.id}`}
    >
      <div
        className="h-14 w-14 shrink-0 rounded-lg bg-zinc-100 bg-cover bg-center"
        style={{
          backgroundImage: product.mainImage
            ? `url(${product.mainImage})`
            : undefined,
        }}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-600 text-[11px] font-semibold text-white">
            {index}
          </span>
          <p className="truncate text-xs text-zinc-500">{product.categoryName}</p>
        </div>
        <p className="mt-1 line-clamp-2 text-sm font-medium leading-5 text-zinc-950">
          {product.title}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          <span className="font-semibold text-red-600">
            券后价 {product.finalPrice > 0 ? `¥${product.finalPrice}` : "暂无"}
          </span>
          {showFreshness ? (
            <span className="text-zinc-400">{getFreshnessLabel(product)}</span>
          ) : null}
        </div>
        <p className="mt-1 line-clamp-1 text-xs leading-5 text-zinc-500">
          {getRankingReason(product, window)}
        </p>
      </div>
    </Link>
  );
}

function RankingList({
  description,
  products,
  title,
  window,
}: {
  description: string;
  products: Product[];
  title: string;
  window: HotRankingWindow;
}) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-zinc-950">{title}</h3>
          <p className="mt-1 text-xs leading-5 text-zinc-500">{description}</p>
        </div>
        <span className="shrink-0 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
          自动榜
        </span>
      </div>
      <div className="mt-4 space-y-3">
        {products.slice(0, 5).map((product, index) => (
          <CompactDealRow
            index={index + 1}
            key={product.id}
            product={product}
            showFreshness
            window={window}
          />
        ))}
      </div>
    </section>
  );
}
