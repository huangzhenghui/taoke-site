import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type AdminProductsDbQuery = {
  categorySlug?: string;
  hasCoupon?: boolean;
  hasFinalPrice?: boolean;
  hasImage?: boolean;
  page?: number;
  pageSize?: number;
  platform?: string;
  q?: string;
  qualityIssue?: ProductQualityIssue;
  source?: string;
  status?: string;
};

export type ProductQualityIssue =
  | "missing_title"
  | "missing_outer_item_id"
  | "missing_final_price"
  | "missing_coupon_amount"
  | "missing_main_image"
  | "unmapped_category"
  | "inactive"
  | "missing_promotion_link";

export type AdminProductWithQualityIssues = Prisma.ProductGetPayload<{
  include: { promotionLinks: { select: { id: true } } };
}> & {
  qualityIssues: ProductQualityIssue[];
};

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;

function getPositiveInteger(value: number | undefined, fallback: number) {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(1, Math.trunc(value ?? fallback));
}

function getOptionalFilter(value: string | undefined) {
  const normalizedValue = value?.trim();

  return normalizedValue && normalizedValue !== "all" ? normalizedValue : undefined;
}

function getImageMissingFilter(): Prisma.ProductWhereInput {
  return {
    OR: [{ mainImage: null }, { mainImage: "" }],
  };
}

function getQualityIssueFilter(
  qualityIssue: ProductQualityIssue,
): Prisma.ProductWhereInput {
  switch (qualityIssue) {
    case "missing_title":
      return { title: "" };
    case "missing_outer_item_id":
      return { outerItemId: "" };
    case "missing_final_price":
      return { finalPrice: null };
    case "missing_coupon_amount":
      return { couponAmount: null };
    case "missing_main_image":
      return getImageMissingFilter();
    case "unmapped_category":
      return { categorySlug: { startsWith: "dataoke-" } };
    case "inactive":
      return { status: { not: "active" } };
    case "missing_promotion_link":
      return { promotionLinks: { none: {} } };
  }
}

function getProductQualityIssues(product: {
  categorySlug: string | null;
  couponAmount: unknown;
  finalPrice: unknown;
  mainImage: string | null;
  outerItemId: string;
  promotionLinks: { id: string }[];
  status: string;
  title: string;
}): ProductQualityIssue[] {
  const issues: ProductQualityIssue[] = [];

  if (!product.title.trim()) issues.push("missing_title");
  if (!product.outerItemId.trim()) issues.push("missing_outer_item_id");
  if (product.finalPrice === null) issues.push("missing_final_price");
  if (product.couponAmount === null) issues.push("missing_coupon_amount");
  if (!product.mainImage?.trim()) issues.push("missing_main_image");
  if (product.categorySlug?.startsWith("dataoke-")) {
    issues.push("unmapped_category");
  }
  if (product.status !== "active") issues.push("inactive");
  if (product.promotionLinks.length === 0) {
    issues.push("missing_promotion_link");
  }

  return issues;
}

/** Reads Product rows for the internal admin list only. */
export async function getAdminProductsFromDb({
  categorySlug,
  hasCoupon,
  hasFinalPrice,
  hasImage,
  page,
  pageSize,
  platform,
  q,
  qualityIssue,
  source,
  status,
}: AdminProductsDbQuery = {}) {
  const normalizedPageSize = Math.min(
    getPositiveInteger(pageSize, DEFAULT_PAGE_SIZE),
    MAX_PAGE_SIZE,
  );
  const normalizedPage = getPositiveInteger(page, 1);
  const normalizedQuery = q?.trim();
  const normalizedCategorySlug = getOptionalFilter(categorySlug);
  const normalizedPlatform = getOptionalFilter(platform);
  const normalizedSource = getOptionalFilter(source);
  const normalizedStatus = getOptionalFilter(status);
  const filters: Prisma.ProductWhereInput[] = [];

  if (normalizedQuery) {
    filters.push({
      OR: [
        { title: { contains: normalizedQuery, mode: "insensitive" } },
        { shortTitle: { contains: normalizedQuery, mode: "insensitive" } },
        { outerItemId: { contains: normalizedQuery, mode: "insensitive" } },
      ],
    });
  }

  if (normalizedCategorySlug) filters.push({ categorySlug: normalizedCategorySlug });
  if (normalizedPlatform) filters.push({ platform: normalizedPlatform });
  if (normalizedSource) filters.push({ source: normalizedSource });
  if (normalizedStatus) filters.push({ status: normalizedStatus });
  if (hasImage !== undefined) {
    filters.push(hasImage ? { NOT: getImageMissingFilter() } : getImageMissingFilter());
  }
  if (hasCoupon !== undefined) {
    filters.push({ couponAmount: hasCoupon ? { not: null } : null });
  }
  if (hasFinalPrice !== undefined) {
    filters.push({ finalPrice: hasFinalPrice ? { not: null } : null });
  }
  if (qualityIssue) filters.push(getQualityIssueFilter(qualityIssue));
  const where: Prisma.ProductWhereInput = filters.length > 0 ? { AND: filters } : {};

  const totalCount = await prisma.product.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalCount / normalizedPageSize));
  const currentPage = Math.min(normalizedPage, totalPages);
  const products = await prisma.product.findMany({
    include: { promotionLinks: { select: { id: true } } },
    orderBy: { updatedAt: "desc" },
    skip: (currentPage - 1) * normalizedPageSize,
    take: normalizedPageSize,
    where,
  });

  const items: AdminProductWithQualityIssues[] = products.map((product) => ({
    ...product,
    qualityIssues: getProductQualityIssues(product),
  }));

  return {
    items,
    page: currentPage,
    pageSize: normalizedPageSize,
    totalCount,
    totalPages,
  };
}
