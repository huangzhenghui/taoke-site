import type { Product as DbProduct } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import type { HotRankingWindow } from "@/modules/deal";

import type {
  Product,
  ProductPlatform,
  ProductSource,
  ProductStatus,
} from "./product.types";

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 24;
const eyeProtectionLampKeywords = ["护眼", "台灯", "学习灯", "LED台灯", "国AA"];

const productPlatforms = new Set<ProductPlatform>([
  "taobao",
  "tmall",
  "jd",
  "vip",
  "other",
]);
const productSources = new Set<ProductSource>([
  "manual",
  "qingtaoke",
  "alimama",
  "dataoke",
  "mock",
]);
const productStatuses = new Set<ProductStatus>([
  "draft",
  "active",
  "inactive",
  "expired",
]);

export type HomeProductsDbQuery = {
  categorySlug?: string;
  limit?: number;
  source?: string;
};

export type RelatedProductsDbQuery = {
  categorySlug?: string;
  excludeProductId?: string;
  limit?: number;
};

export type HotProductsDbQuery = {
  categorySlug?: string;
  limit?: number;
  source?: string;
  window?: HotRankingWindow;
};

export type BillionSubsidyProductsDbQuery = {
  limit?: number;
};

function normalizeLimit(limit: number | undefined) {
  if (!Number.isFinite(limit)) {
    return DEFAULT_LIMIT;
  }

  return Math.min(Math.max(Math.trunc(limit ?? DEFAULT_LIMIT), 1), MAX_LIMIT);
}

function toProductPlatform(value: string): ProductPlatform {
  return productPlatforms.has(value as ProductPlatform)
    ? (value as ProductPlatform)
    : "other";
}

function toProductSource(value: string): ProductSource {
  return productSources.has(value as ProductSource)
    ? (value as ProductSource)
    : "manual";
}

function toProductStatus(value: string): ProductStatus {
  return productStatuses.has(value as ProductStatus)
    ? (value as ProductStatus)
    : "active";
}

function getDisplayableProductWhere() {
  return {
    finalPrice: { not: null },
    isManualHidden: false,
    mainImage: { not: "" },
    outerItemId: { not: "" },
    status: "active",
    title: { not: "" },
  } as const;
}

/** Maps a persisted Product into the existing ProductCard-compatible shape. */
export function mapDbProductToProductCardItem(product: DbProduct): Product {
  return {
    brandName: product.brandName ?? undefined,
    categoryId: product.categoryId ?? "uncategorized",
    categoryName: product.categoryName ?? "未分类",
    categorySlug: product.categorySlug ?? "uncategorized",
    commissionRate: Number(product.commissionRate ?? 0),
    couponAmount: Number(product.couponAmount ?? 0),
    couponUrl: product.couponUrl ?? "",
    createdAt: product.createdAt.toISOString(),
    dailySales: product.dailySales ?? undefined,
    description: product.description ?? "",
    finalPrice: Number(product.finalPrice ?? 0),
    id: product.id,
    mainImage: product.mainImage ?? "",
    monthSales: product.monthSales ?? undefined,
    outerItemId: product.outerItemId,
    platform: toProductPlatform(product.platform),
    price: Number(product.price ?? 0),
    promotionUrl: product.promotionUrl ?? "",
    shopName: product.shopName ?? "第三方店铺",
    shortTitle: product.shortTitle ?? product.title,
    source: toProductSource(product.source),
    status: toProductStatus(product.status),
    title: product.title,
    twoHoursSales: product.twoHoursSales ?? undefined,
    updatedAt: product.updatedAt.toISOString(),
  };
}

/** Reads display-safe active products from the local database for the homepage. */
export async function getHomeProductsFromDb({
  categorySlug,
  limit,
  source,
}: HomeProductsDbQuery = {}): Promise<Product[]> {
  const normalizedLimit = normalizeLimit(limit);
  const normalizedSource = source?.trim();
  const normalizedCategorySlug = categorySlug?.trim();
  const products = await prisma.product.findMany({
    orderBy: { updatedAt: "desc" },
    take: normalizedLimit,
    where: {
      ...getDisplayableProductWhere(),
      ...(normalizedSource ? { source: normalizedSource } : {}),
      ...(normalizedCategorySlug ? { categorySlug: normalizedCategorySlug } : {}),
    },
  });

  return products.map(mapDbProductToProductCardItem);
}

/** Reads one publicly visible Product from the local database for its detail page. */
export async function getProductDetailFromDb(
  id: string,
): Promise<Product | null> {
  const product = await prisma.product.findFirst({
    where: {
      id,
      isManualHidden: false,
      status: "active",
    },
  });

  return product ? mapDbProductToProductCardItem(product) : null;
}

/** Reads related active products for public product detail recommendations. */
export async function getRelatedProductsFromDb({
  categorySlug,
  excludeProductId,
  limit,
}: RelatedProductsDbQuery = {}): Promise<Product[]> {
  const normalizedLimit = normalizeLimit(limit);
  const products = await prisma.product.findMany({
    orderBy: { updatedAt: "desc" },
    take: normalizedLimit,
    where: {
      ...getDisplayableProductWhere(),
      ...(excludeProductId ? { id: { not: excludeProductId } } : {}),
      ...(categorySlug ? { categorySlug } : {}),
    },
  });

  return products.map(mapDbProductToProductCardItem);
}

/** Reads Dataoke eye-protection desk lamp candidates for the first SEO/GEO topic. */
export async function getEyeProtectionLampProductsFromDb({
  limit,
}: {
  limit?: number;
} = {}): Promise<Product[]> {
  const normalizedLimit = normalizeLimit(limit);
  const products = await prisma.product.findMany({
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    take: normalizedLimit,
    where: {
      ...getDisplayableProductWhere(),
      source: "dataoke",
      OR: eyeProtectionLampKeywords.flatMap((keyword) => [
        { title: { contains: keyword } },
        { shortTitle: { contains: keyword } },
      ]),
    },
  });

  return products.map(mapDbProductToProductCardItem);
}

/** Reads active high-discount candidates for the local Billion Subsidy topic. */
export async function getBillionSubsidyProductsFromDb({
  limit,
}: BillionSubsidyProductsDbQuery = {}): Promise<Product[]> {
  const normalizedLimit = normalizeLimit(limit);
  const products = await prisma.product.findMany({
    orderBy: [
      { couponAmount: "desc" },
      { dailySales: "desc" },
      { updatedAt: "desc" },
    ],
    take: normalizedLimit,
    where: {
      ...getDisplayableProductWhere(),
      source: { in: ["dataoke", "alimama"] },
    },
  });

  return products.map(mapDbProductToProductCardItem);
}

/** Reads active products for homepage hot-deal ranking blocks. */
export async function getHotProductsFromDb({
  categorySlug,
  limit,
  source,
  window = "today",
}: HotProductsDbQuery = {}): Promise<Product[]> {
  const normalizedLimit = normalizeLimit(limit);
  const normalizedSource = source?.trim();
  const normalizedCategorySlug = categorySlug?.trim();
  const orderBy =
    window === "two_hours"
      ? [{ twoHoursSales: "desc" as const }, { dailySales: "desc" as const }, { updatedAt: "desc" as const }]
      : window === "week"
        ? [{ monthSales: "desc" as const }, { dailySales: "desc" as const }, { updatedAt: "desc" as const }]
        : [{ dailySales: "desc" as const }, { twoHoursSales: "desc" as const }, { updatedAt: "desc" as const }];
  const products = await prisma.product.findMany({
    orderBy,
    take: normalizedLimit,
    where: {
      ...getDisplayableProductWhere(),
      ...(normalizedSource ? { source: normalizedSource } : {}),
      ...(normalizedCategorySlug ? { categorySlug: normalizedCategorySlug } : {}),
    },
  });

  return products.map(mapDbProductToProductCardItem);
}

/** Reads public Product sitemap entries from the local database. */
export async function getPublicProductSitemapEntriesFromDb() {
  const products = await prisma.product.findMany({
    orderBy: { updatedAt: "desc" },
    select: { id: true, updatedAt: true },
    where: {
      isManualHidden: false,
      status: "active",
      title: { not: "" },
    },
  });

  return products.map((product) => ({
    id: product.id,
    updatedAt: product.updatedAt.toISOString(),
  }));
}
