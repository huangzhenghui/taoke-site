import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type AdminCategoryMappingsDbQuery = {
  page?: number;
  pageSize?: number;
  q?: string;
  source?: string;
  status?: string;
};

export type SourceCategoryMappingResolution = {
  categoryId: string;
  categorySlug: string;
  confidence: string;
  sourceName: string | null;
  sourceSubName: string | null;
  status: string;
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

/**
 * Resolves an active external category mapping. A specific subcategory wins;
 * an empty or null subcategory mapping is the source-category fallback.
 */
export async function resolveCategoryMappingForSource({
  source,
  sourceCid,
  sourceSubcid,
}: {
  source: string;
  sourceCid: string;
  sourceSubcid?: string | null;
}): Promise<SourceCategoryMappingResolution | null> {
  const normalizedSource = source.trim();
  const normalizedSourceCid = sourceCid.trim();
  const normalizedSourceSubcid = sourceSubcid?.trim();
  const select = {
    categoryId: true,
    categorySlug: true,
    confidence: true,
    sourceName: true,
    sourceSubName: true,
    status: true,
  } as const;

  if (!normalizedSource || !normalizedSourceCid) {
    return null;
  }

  if (normalizedSourceSubcid) {
    const exactMapping = await prisma.sourceCategoryMapping.findFirst({
      select,
      where: {
        source: normalizedSource,
        sourceCid: normalizedSourceCid,
        sourceSubcid: normalizedSourceSubcid,
        status: "active",
      },
    });

    if (exactMapping) {
      return exactMapping;
    }
  }

  return prisma.sourceCategoryMapping.findFirst({
    select,
    where: {
      source: normalizedSource,
      sourceCid: normalizedSourceCid,
      status: "active",
      OR: [{ sourceSubcid: "" }, { sourceSubcid: null }],
    },
    orderBy: { updatedAt: "desc" },
  });
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
