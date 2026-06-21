import type { Product as DbProduct } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import type { Product, ProductPlatform, ProductSource, ProductStatus } from "./product.types";

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 24;

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

/** Maps a persisted Product into the existing ProductCard-compatible shape. */
export function mapDbProductToProductCardItem(product: DbProduct): Product {
  return {
    categoryId: product.categoryId ?? "uncategorized",
    categoryName: product.categoryName ?? "未分类",
    categorySlug: product.categorySlug ?? "uncategorized",
    commissionRate: Number(product.commissionRate ?? 0),
    couponAmount: Number(product.couponAmount ?? 0),
    couponUrl: product.couponUrl ?? "",
    createdAt: product.createdAt.toISOString(),
    description: product.description ?? "",
    finalPrice: Number(product.finalPrice ?? 0),
    id: product.id,
    mainImage: product.mainImage ?? "",
    outerItemId: product.outerItemId,
    platform: toProductPlatform(product.platform),
    price: Number(product.price ?? 0),
    promotionUrl: product.promotionUrl ?? "",
    shopName: product.shopName ?? "第三方店铺",
    shortTitle: product.shortTitle ?? product.title,
    source: toProductSource(product.source),
    status: toProductStatus(product.status),
    title: product.title,
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
      finalPrice: { not: null },
      isManualHidden: false,
      mainImage: { not: "" },
      outerItemId: { not: "" },
      status: "active",
      title: { not: "" },
      ...(normalizedSource ? { source: normalizedSource } : {}),
      ...(normalizedCategorySlug ? { categorySlug: normalizedCategorySlug } : {}),
    },
  });

  return products.map(mapDbProductToProductCardItem);
}
