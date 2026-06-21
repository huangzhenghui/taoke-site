import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type AdminSyncLogsDbQuery = {
  page?: number;
  pageSize?: number;
  source?: string;
  status?: string;
  taskType?: string;
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

/** Reads SyncLog rows for the internal admin list only. */
export async function getAdminSyncLogsFromDb({
  page,
  pageSize,
  source,
  status,
  taskType,
}: AdminSyncLogsDbQuery = {}) {
  const normalizedPageSize = Math.min(
    getPositiveInteger(pageSize, DEFAULT_PAGE_SIZE),
    MAX_PAGE_SIZE,
  );
  const normalizedPage = getPositiveInteger(page, 1);
  const normalizedSource = getOptionalFilter(source);
  const normalizedStatus = getOptionalFilter(status);
  const normalizedTaskType = getOptionalFilter(taskType);
  const where: Prisma.SyncLogWhereInput = {
    ...(normalizedSource ? { source: normalizedSource } : {}),
    ...(normalizedStatus ? { status: normalizedStatus } : {}),
    ...(normalizedTaskType ? { taskType: normalizedTaskType } : {}),
  };

  const totalCount = await prisma.syncLog.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalCount / normalizedPageSize));
  const currentPage = Math.min(normalizedPage, totalPages);
  const items = await prisma.syncLog.findMany({
    orderBy: { createdAt: "desc" },
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
