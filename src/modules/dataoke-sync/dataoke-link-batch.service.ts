import {
  dataokeClient,
  dataokeConfig,
  dataokeEndpoints,
  mapDataokePrivilegeLinkToPromotionLink,
  type DataokePrivilegeLinkResult,
  type DataokePrivilegeLinkResponse,
} from "@/integrations/dataoke";
import { prisma } from "@/lib/prisma";

const MAX_BATCH_SIZE = 10;

export type DataokeLinkBatchFailure = {
  message: string;
  outerItemId: string;
  productId: string;
  title: string;
};

export type DataokeLinkBatchSkippedItem = {
  outerItemId: string;
  productId: string;
  reason:
    | "already_has_promotion_link"
    | "inactive_product"
    | "invalid_product_source"
    | "missing_outer_item_id"
    | "no_promotion_link_in_response"
    | "unknown_skip_reason";
  title: string;
};

export type DataokeLinkBatchExecutionSummary = {
  candidateCount: number;
  limit: number;
  onlyMissing: boolean;
  productsMissingPromotionLink: number;
  productsWithPromotionLink: number;
  selectedCount: number;
  totalDataokeActiveProducts: number;
};

export type DataokeLinkBatchResult = {
  createdCount: number;
  failedCount: number;
  failedItems: DataokeLinkBatchFailure[];
  message: string;
  processedCount: number;
  batchSummary: DataokeLinkBatchExecutionSummary;
  skippedCount: number;
  skippedItems: DataokeLinkBatchSkippedItem[];
  success: boolean;
  syncLogId: string | null;
  totalCount: number;
  updatedCount: number;
};

export type DataokeLinkBatchSummary = {
  linkedCount: number;
  missingCount: number;
  totalCount: number;
};

function normalizeLimit(limit: number | undefined) {
  if (!Number.isFinite(limit)) {
    return MAX_BATCH_SIZE;
  }

  return Math.min(Math.max(Math.trunc(limit ?? MAX_BATCH_SIZE), 1), MAX_BATCH_SIZE);
}

function asOptionalString(value: unknown) {
  if (value === null || value === undefined) {
    return null;
  }

  const result = String(value).trim();

  return result || null;
}

function asOptionalNumber(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const result = Number(value);

  return Number.isFinite(result) ? result : null;
}

function asOptionalInteger(value: unknown) {
  const result = asOptionalNumber(value);

  return result === null ? null : Math.trunc(result);
}

function asOptionalDate(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numericValue = Number(value);
  const date = Number.isFinite(numericValue)
    ? new Date(numericValue < 100_000_000_000 ? numericValue * 1000 : numericValue)
    : new Date(String(value));

  return Number.isNaN(date.getTime()) ? null : date;
}

function getResultMessage({
  createdCount,
  failedCount,
  skippedCount,
  updatedCount,
}: Pick<
  DataokeLinkBatchResult,
  "createdCount" | "failedCount" | "skippedCount" | "updatedCount"
>) {
  return `Batch link generation finished: ${createdCount} created, ${updatedCount} updated, ${skippedCount} skipped, ${failedCount} failed.`;
}

function getLogStatus({
  createdCount,
  failedCount,
  updatedCount,
}: Pick<DataokeLinkBatchResult, "createdCount" | "failedCount" | "updatedCount">) {
  if (failedCount === 0) {
    return "success";
  }

  return createdCount + updatedCount > 0 ? "partial" : "failed";
}

function toFailure(product: { id: string; outerItemId: string; title: string }, message: string) {
  return {
    message,
    outerItemId: product.outerItemId,
    productId: product.id,
    title: product.title,
  };
}

function toSkippedItem(
  product: { id: string; outerItemId: string; title: string },
  reason: DataokeLinkBatchSkippedItem["reason"],
): DataokeLinkBatchSkippedItem {
  return {
    outerItemId: product.outerItemId,
    productId: product.id,
    reason,
    title: product.title,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function extractPrivilegeLinkResult(response: unknown): DataokePrivilegeLinkResult {
  if (!isRecord(response) || !isRecord(response.data)) {
    return {};
  }

  return isRecord(response.data.data)
    ? (response.data.data as DataokePrivilegeLinkResult)
    : (response.data as DataokePrivilegeLinkResult);
}

function createEmptyBatchSummary({
  limit,
  onlyMissing,
}: {
  limit: number;
  onlyMissing: boolean;
}): DataokeLinkBatchExecutionSummary {
  return {
    candidateCount: 0,
    limit,
    onlyMissing,
    productsMissingPromotionLink: 0,
    productsWithPromotionLink: 0,
    selectedCount: 0,
    totalDataokeActiveProducts: 0,
  };
}

export async function getDataokeLinkBatchSummary(): Promise<DataokeLinkBatchSummary> {
  const where = { source: "dataoke" };
  const [totalCount, linkedCount] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.count({
      where: {
        ...where,
        promotionLinks: { some: {} },
      },
    }),
  ]);

  return {
    linkedCount,
    missingCount: totalCount - linkedCount,
    totalCount,
  };
}

/** Manually generates at most ten Dataoke promotion links on the server. */
export async function batchGenerateDataokePromotionLinks({
  limit,
  onlyMissing = true,
  source = "dataoke",
}: {
  limit?: number;
  onlyMissing?: boolean;
  source?: string;
} = {}): Promise<DataokeLinkBatchResult> {
  const normalizedLimit = normalizeLimit(limit);
  const normalizedSource = source.trim() || "dataoke";
  const startedAt = new Date();
  const syncLog = await prisma.syncLog.create({
    data: {
      message: "Dataoke batch promotion-link generation started.",
      params: { limit: normalizedLimit, onlyMissing, source: normalizedSource },
      source: "dataoke",
      startedAt,
      status: "partial",
      taskType: "batch_promotion_links",
    },
  });

  if (!dataokeConfig.enableRealApi) {
    const message = "Dataoke real API is disabled. Set DATAOKE_ENABLE_REAL_API=true to enable real requests.";

    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: { finishedAt: new Date(), message, status: "failed" },
    });

    return {
      createdCount: 0,
      batchSummary: createEmptyBatchSummary({
        limit: normalizedLimit,
        onlyMissing,
      }),
      failedCount: 0,
      failedItems: [],
      message,
      processedCount: 0,
      skippedCount: 0,
      skippedItems: [],
      success: false,
      syncLogId: syncLog.id,
      totalCount: 0,
      updatedCount: 0,
    };
  }

  if (normalizedSource !== "dataoke") {
    const message = "Only the dataoke source is supported for batch promotion-link generation.";

    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: { finishedAt: new Date(), message, status: "failed" },
    });

    return {
      createdCount: 0,
      batchSummary: createEmptyBatchSummary({
        limit: normalizedLimit,
        onlyMissing,
      }),
      failedCount: 0,
      failedItems: [],
      message,
      processedCount: 0,
      skippedCount: 0,
      skippedItems: [],
      success: false,
      syncLogId: syncLog.id,
      totalCount: 0,
      updatedCount: 0,
    };
  }

  const baseWhere = {
    outerItemId: { not: "" },
    source: normalizedSource,
    status: "active",
  };
  const candidateWhere = {
    ...baseWhere,
    ...(onlyMissing
      ? { promotionLinks: { none: { source: "dataoke" } } }
      : {}),
  };
  const [
    totalDataokeActiveProducts,
    productsWithPromotionLink,
    candidateCount,
    products,
  ] = await Promise.all([
    prisma.product.count({
      where: { source: "dataoke", status: "active" },
    }),
    prisma.product.count({
      where: {
        source: "dataoke",
        status: "active",
        promotionLinks: { some: { source: "dataoke" } },
      },
    }),
    prisma.product.count({ where: candidateWhere }),
    prisma.product.findMany({
    orderBy: { updatedAt: "desc" },
    take: normalizedLimit,
      where: candidateWhere,
    }),
  ]);
  const batchSummary: DataokeLinkBatchExecutionSummary = {
    candidateCount,
    limit: normalizedLimit,
    onlyMissing,
    productsMissingPromotionLink:
      totalDataokeActiveProducts - productsWithPromotionLink,
    productsWithPromotionLink,
    selectedCount: products.length,
    totalDataokeActiveProducts,
  };
  let createdCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;
  const failedItems: DataokeLinkBatchFailure[] = [];
  const skippedItems: DataokeLinkBatchSkippedItem[] = [];

  for (const product of products) {
    try {
      const response = await dataokeClient.request<DataokePrivilegeLinkResponse>(
        dataokeEndpoints.privilegeLink.path,
        dataokeConfig.privilegeLinkVersion,
        {
          goodsId: product.outerItemId,
          pid: dataokeConfig.pid || undefined,
        },
      );
      const privilegeLinkResult = extractPrivilegeLinkResult(response);
      const mappedLink = mapDataokePrivilegeLinkToPromotionLink(
        privilegeLinkResult,
        product.id,
        product.outerItemId,
      );

      if (!mappedLink.promotionUrl && !mappedLink.couponUrl) {
        skippedCount += 1;
        skippedItems.push(
          toSkippedItem(product, "no_promotion_link_in_response"),
        );
        continue;
      }

      const existing = await prisma.promotionLink.findUnique({
        where: {
          productId_source: { productId: product.id, source: "dataoke" },
        },
      });
      const couponEndTime = asOptionalDate(privilegeLinkResult.couponEndTime);
      const now = new Date();

      await prisma.promotionLink.upsert({
        where: {
          productId_source: { productId: product.id, source: "dataoke" },
        },
        create: {
          actualPrice: asOptionalNumber(privilegeLinkResult.actualPrice),
          couponEndTime,
          couponInfo: asOptionalString(privilegeLinkResult.couponInfo),
          couponRemainCount: asOptionalInteger(privilegeLinkResult.couponRemainCount),
          couponStartTime: asOptionalDate(privilegeLinkResult.couponStartTime),
          couponTotalCount: asOptionalInteger(privilegeLinkResult.couponTotalCount),
          couponUrl: asOptionalString(privilegeLinkResult.couponClickUrl),
          expiresAt: couponEndTime,
          lastGeneratedAt: now,
          longTpwd: asOptionalString(privilegeLinkResult.longTpwd),
          maxCommissionRate: asOptionalNumber(privilegeLinkResult.maxCommissionRate),
          minCommissionRate: asOptionalNumber(privilegeLinkResult.minCommissionRate),
          originalPrice: asOptionalNumber(privilegeLinkResult.originalPrice),
          outerItemId: product.outerItemId,
          platform: product.platform,
          productId: product.id,
          promotionUrl: asOptionalString(mappedLink.promotionUrl),
          shortUrl: asOptionalString(privilegeLinkResult.shortUrl),
          source: "dataoke",
          status: "active",
          tpwd: asOptionalString(privilegeLinkResult.tpwd),
        },
        update: {
          actualPrice: asOptionalNumber(privilegeLinkResult.actualPrice),
          couponEndTime,
          couponInfo: asOptionalString(privilegeLinkResult.couponInfo),
          couponRemainCount: asOptionalInteger(privilegeLinkResult.couponRemainCount),
          couponStartTime: asOptionalDate(privilegeLinkResult.couponStartTime),
          couponTotalCount: asOptionalInteger(privilegeLinkResult.couponTotalCount),
          couponUrl: asOptionalString(privilegeLinkResult.couponClickUrl),
          expiresAt: couponEndTime,
          lastGeneratedAt: now,
          longTpwd: asOptionalString(privilegeLinkResult.longTpwd),
          maxCommissionRate: asOptionalNumber(privilegeLinkResult.maxCommissionRate),
          minCommissionRate: asOptionalNumber(privilegeLinkResult.minCommissionRate),
          originalPrice: asOptionalNumber(privilegeLinkResult.originalPrice),
          outerItemId: product.outerItemId,
          platform: product.platform,
          promotionUrl: asOptionalString(mappedLink.promotionUrl),
          shortUrl: asOptionalString(privilegeLinkResult.shortUrl),
          status: "active",
          tpwd: asOptionalString(privilegeLinkResult.tpwd),
        },
      });

      if (existing) {
        updatedCount += 1;
      } else {
        createdCount += 1;
      }
    } catch {
      failedCount += 1;
      failedItems.push(toFailure(product, "Promotion link generation failed."));
    }
  }

  const message = getResultMessage({
    createdCount,
    failedCount,
    skippedCount,
    updatedCount,
  });
  const status = getLogStatus({ createdCount, failedCount, updatedCount });

  await prisma.syncLog.update({
    where: { id: syncLog.id },
    data: {
      createdCount,
      errorSummary:
        failedItems.length > 0
          ? `${failedItems.length} item(s) failed with safe error summaries.`
          : null,
      failedCount,
      finishedAt: new Date(),
      message,
      skippedCount,
      status,
      successCount: createdCount + updatedCount,
      totalCount: products.length,
      updatedCount,
    },
  });

  return {
    createdCount,
    batchSummary,
    failedCount,
    failedItems,
    message,
    processedCount: createdCount + updatedCount + skippedCount + failedCount,
    skippedCount,
    skippedItems,
    success: status === "success",
    syncLogId: syncLog.id,
    totalCount: products.length,
    updatedCount,
  };
}
