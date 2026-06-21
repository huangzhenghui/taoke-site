import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type AdminCategoryMappingsDbQuery = {
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

/** Reads external-to-internal category mappings for the admin list only. */
export async function getAdminCategoryMappingsFromDb({
  page,
  pageSize,
  q,
  source,
  status,
}: AdminCategoryMappingsDbQuery = {}) {
  const normalizedPageSize = Math.min(
    getPositiveInteger(pageSize, DEFAULT_PAGE_SIZE),
    MAX_PAGE_SIZE,
  );
  const normalizedPage = getPositiveInteger(page, 1);
  const normalizedQuery = q?.trim();
  const normalizedSource = getOptionalFilter(source);
  const normalizedStatus = getOptionalFilter(status);
  const where: Prisma.SourceCategoryMappingWhereInput = {
    ...(normalizedQuery
      ? {
          OR: [
            { sourceCid: { contains: normalizedQuery, mode: "insensitive" } },
            { sourceName: { contains: normalizedQuery, mode: "insensitive" } },
            { categorySlug: { contains: normalizedQuery, mode: "insensitive" } },
            { categoryId: { contains: normalizedQuery, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(normalizedSource ? { source: normalizedSource } : {}),
    ...(normalizedStatus ? { status: normalizedStatus } : {}),
  };

  const totalCount = await prisma.sourceCategoryMapping.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalCount / normalizedPageSize));
  const currentPage = Math.min(normalizedPage, totalPages);
  const items = await prisma.sourceCategoryMapping.findMany({
    orderBy: [
      { source: "asc" },
      { sourceCid: "asc" },
      { sourceSubcid: "asc" },
    ],
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
