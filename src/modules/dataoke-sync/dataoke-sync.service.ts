import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { resolveCategoryMappingForSource } from "@/modules/category-mapping";

import type {
  DataokeImportPreview,
  DataokeImportResult,
  DataokeSyncParams,
} from "./dataoke-sync.types";

const MAX_IMPORT_PRODUCTS = 10;

const safeSyncParamKeys = [
  "cids",
  "commissionRateLowerLimit",
  "hasCoupon",
  "keyWords",
  "monthSalesLowerLimit",
  "pageId",
  "pageSize",
  "sort",
] as const;

function asTrimmedString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function asOptionalString(value: unknown) {
  const result = asTrimmedString(value);

  return result || null;
}

function asOptionalNumber(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const result = typeof value === "number" ? value : Number(value);

  return Number.isFinite(result) ? result : null;
}

function asOptionalInteger(value: unknown) {
  const result = asOptionalNumber(value);

  return result === null ? null : Math.trunc(result);
}

function asOptionalDate(value: unknown) {
  if (!value) {
    return null;
  }

  const result = new Date(String(value));

  return Number.isNaN(result.getTime()) ? null : result;
}

function toSafeSyncParams(syncParams?: DataokeSyncParams): Prisma.InputJsonValue {
  const params: Record<string, boolean | number | string> = {
    importLimit: MAX_IMPORT_PRODUCTS,
  };

  for (const key of safeSyncParamKeys) {
    const value = syncParams?.[key];

    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      params[key] = value;
    }
  }

  return params;
}

function toSafeFailure(item: DataokeImportPreview, message: string) {
  return {
    message,
    outerItemId: asTrimmedString(item.outerItemId) || "unknown",
    title: asTrimmedString(item.title) || "Untitled product",
  };
}

function getLogStatus({
  createdCount,
  failedCount,
  updatedCount,
}: Pick<
  DataokeImportResult,
  "createdCount" | "failedCount" | "updatedCount"
>) {
  if (failedCount === 0) {
    return "success";
  }

  return createdCount + updatedCount > 0 ? "partial" : "failed";
}

function getResultMessage({
  createdCount,
  failedCount,
  skippedCount,
  updatedCount,
}: Pick<
  DataokeImportResult,
  "createdCount" | "failedCount" | "skippedCount" | "updatedCount"
>) {
  return `Import finished: ${createdCount} created, ${updatedCount} updated, ${skippedCount} skipped, ${failedCount} failed.`;
}

function getProductData(item: DataokeImportPreview) {
  const mainImage = asOptionalString(item.mainImage);

  return {
    brandId: asOptionalString(item.brandId),
    brandName: asOptionalString(item.brandName),
    commissionRate: asOptionalNumber(item.commissionRate),
    couponAmount: asOptionalNumber(item.couponAmount),
    couponConditions: asOptionalString(item.couponConditions),
    couponEndTime: asOptionalDate(item.couponEndTime),
    couponReceiveNum: asOptionalInteger(item.couponReceiveNum),
    couponRemainCount: asOptionalInteger(item.couponRemainCount),
    couponStartTime: asOptionalDate(item.couponStartTime),
    couponTotalNum: asOptionalInteger(item.couponTotalNum),
    dailySales: asOptionalInteger(item.dailySales),
    description: asOptionalString(item.description),
    finalPrice: asOptionalNumber(item.finalPrice),
    images: (item.images ?? (mainImage ? [mainImage] : [])) as Prisma.InputJsonValue,
    mainImage,
    monthSales: asOptionalInteger(item.monthSales),
    platform: asTrimmedString(item.platform),
    price: asOptionalNumber(item.price),
    shopLogo: asOptionalString(item.shopLogo),
    shopName: asOptionalString(item.shopName),
    shortTitle: asOptionalString(item.shortTitle),
    sourceCid: asOptionalString(item.sourceCid),
    sourceSubcid: asOptionalString(item.sourceSubcid),
    status: asTrimmedString(item.status) || "active",
    title: asTrimmedString(item.title),
    twoHoursSales: asOptionalInteger(item.twoHoursSales),
  };
}

async function resolveProductCategory(
  item: DataokeImportPreview,
  source: string,
  existingCategoryName?: string | null,
) {
  const categoryId = asOptionalString(item.categoryId);
  const categorySlug = asOptionalString(item.categorySlug);
  const categoryName = asOptionalString(item.categoryName);

  if (source !== "dataoke") {
    return { categoryId, categoryName, categorySlug };
  }

  const sourceCid = asTrimmedString(item.sourceCid);
  const sourceSubcid = asOptionalString(item.sourceSubcid);
  const fallbackKey = sourceCid || asTrimmedString(item.categoryId);
  const fallbackCategory = {
    categoryId: fallbackKey ? `dataoke-${fallbackKey}` : categoryId,
    categoryName: categoryName ?? "大淘客分类",
    categorySlug: fallbackKey ? `dataoke-${fallbackKey}` : categorySlug,
  };
  const mapping = await resolveCategoryMappingForSource({
    source,
    sourceCid,
    sourceSubcid,
  });

  if (!mapping) {
    return fallbackCategory;
  }

  return {
    categoryId: mapping.categoryId,
    categoryName:
      mapping.sourceName ?? existingCategoryName ?? fallbackCategory.categoryName,
    categorySlug: mapping.categorySlug,
  };
}

/** Manually imports at most ten already-previewed Dataoke products. */
export async function importDataokeProducts({
  productsPreview,
  syncParams,
}: {
  productsPreview: DataokeImportPreview[];
  syncParams?: DataokeSyncParams;
}): Promise<DataokeImportResult> {
  const startedAt = new Date();
  const syncLog = await prisma.syncLog.create({
    data: {
      message: "Dataoke product import started.",
      params: toSafeSyncParams(syncParams),
      source: "dataoke",
      startedAt,
      status: "partial",
      taskType: "import_products",
      totalCount: productsPreview.length,
    },
  });

  if (productsPreview.length > MAX_IMPORT_PRODUCTS) {
    const message = "Cannot import more than 10 products at a time.";

    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: { finishedAt: new Date(), message, status: "failed" },
    });

    return {
      createdCount: 0,
      failedCount: 0,
      failedItems: [],
      message,
      skippedCount: 0,
      success: false,
      syncLogId: syncLog.id,
      updatedCount: 0,
    };
  }

  let createdCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;
  const failedItems: DataokeImportResult["failedItems"] = [];
  const seenProductKeys = new Set<string>();

  for (const item of productsPreview) {
    const source = asTrimmedString(item.source);
    const outerItemId = asTrimmedString(item.outerItemId);
    const title = asTrimmedString(item.title);
    const platform = asTrimmedString(item.platform);
    const productKey = `${source}:${outerItemId}`;

    if (!source || !outerItemId || !title || !platform) {
      failedCount += 1;
      failedItems.push(toSafeFailure(item, "Product preview is missing required fields."));
      continue;
    }

    if (seenProductKeys.has(productKey)) {
      skippedCount += 1;
      continue;
    }

    seenProductKeys.add(productKey);

    try {
      const existing = await prisma.product.findUnique({
        where: { source_outerItemId: { outerItemId, source } },
      });
      const data = getProductData(item);
      const category = await resolveProductCategory(
        item,
        source,
        existing?.categoryName,
      );
      const now = new Date();

      if (!existing) {
        await prisma.product.create({
          data: {
            ...data,
            categoryId: category.categoryId,
            categoryName: category.categoryName,
            categorySlug: category.categorySlug,
            lastSyncedAt: now,
            outerItemId,
            source,
          },
        });
        createdCount += 1;
        continue;
      }

      await prisma.product.update({
        where: { id: existing.id },
        data: {
          brandId: data.brandId,
          brandName: data.brandName,
          commissionRate: data.commissionRate,
          couponAmount: data.couponAmount,
          couponConditions: data.couponConditions,
          couponEndTime: data.couponEndTime,
          couponReceiveNum: data.couponReceiveNum,
          couponRemainCount: data.couponRemainCount,
          couponStartTime: data.couponStartTime,
          couponTotalNum: data.couponTotalNum,
          dailySales: data.dailySales,
          finalPrice: data.finalPrice,
          images: data.images,
          lastSyncedAt: now,
          mainImage: data.mainImage,
          monthSales: data.monthSales,
          platform: data.platform,
          price: data.price,
          shopLogo: data.shopLogo,
          shopName: data.shopName,
          sourceCid: data.sourceCid,
          sourceSubcid: data.sourceSubcid,
          twoHoursSales: data.twoHoursSales,
          ...(existing.isManualHidden ? {} : { status: data.status }),
          ...(existing.isManualEdited
            ? {}
            : {
                description: data.description,
                shortTitle: data.shortTitle,
                title: data.title,
              }),
          ...(existing.manualCategoryLocked
            ? {}
            : {
                categoryId: category.categoryId,
                categoryName: category.categoryName,
                categorySlug: category.categorySlug,
              }),
        },
      });
      updatedCount += 1;
    } catch {
      failedCount += 1;
      failedItems.push(toSafeFailure(item, "Database write failed."));
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
      updatedCount,
    },
  });

  return {
    createdCount,
    failedCount,
    failedItems,
    message,
    skippedCount,
    success: status === "success",
    syncLogId: syncLog.id,
    updatedCount,
  };
}
