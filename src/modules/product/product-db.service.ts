import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type AdminProductsDbQuery = {
  page?: number;
  pageSize?: number;
  q?: string;
  source?: string;
  status?: string;
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

/** Reads Product rows for the internal admin list only. */
export async function getAdminProductsFromDb({
  page,
  pageSize,
  q,
  source,
  status,
}: AdminProductsDbQuery = {}) {
  const normalizedPageSize = Math.min(
    getPositiveInteger(pageSize, DEFAULT_PAGE_SIZE),
    MAX_PAGE_SIZE,
  );
  const normalizedPage = getPositiveInteger(page, 1);
  const normalizedQuery = q?.trim();
  const normalizedSource = getOptionalFilter(source);
  const normalizedStatus = getOptionalFilter(status);
  const where: Prisma.ProductWhereInput = {
    ...(normalizedQuery
      ? {
          OR: [
            { title: { contains: normalizedQuery, mode: "insensitive" } },
            { shortTitle: { contains: normalizedQuery, mode: "insensitive" } },
            { outerItemId: { contains: normalizedQuery, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(normalizedSource ? { source: normalizedSource } : {}),
    ...(normalizedStatus ? { status: normalizedStatus } : {}),
  };

  const totalCount = await prisma.product.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalCount / normalizedPageSize));
  const currentPage = Math.min(normalizedPage, totalPages);
  const items = await prisma.product.findMany({
    orderBy: { updatedAt: "desc" },
    skip: (currentPage - 1) * normalizedPageSize,
    take: normalizedPageSize,
    where,
  });

  return {
    items,
    page: currentPage,
    pageSize: normalizedPageSize,
    totalCount,
    totalPages,
  };
}
