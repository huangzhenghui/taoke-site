"use server";

import {
  dataokeClient,
  dataokeConfig,
  dataokeEndpoints,
  extractDataokeSearchResult,
  mapDataokeProductToProduct,
  normalizeDataokeImageUrl,
} from "@/integrations/dataoke";
import type { DataokeRawProduct } from "@/integrations/dataoke";
import { resolveCategoryMappingForSource } from "@/modules/category-mapping";
import {
  importDataokeProducts,
  type DataokeImportPreview,
  type DataokeImportResult,
  type DataokeSyncParams,
} from "@/modules/dataoke-sync";
import type { Product } from "@/modules/product";

type DataokeSyncSummary = {
  detectedListPath: string;
  listCount: number;
  mappedCount: number;
  pageId?: string;
  totalNum?: number;
};

type DataokeProductPreview = DataokeImportPreview;

export type DataokeSyncPreviewState = {
  message: string;
  productsPreview: DataokeProductPreview[];
  success: boolean;
  summary: DataokeSyncSummary | null;
  syncParams: DataokeSyncParams | null;
};

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return undefined;
  }

  const trimmedValue = value.trim();

  return trimmedValue ? trimmedValue : undefined;
}

function getNumberValue(formData: FormData, key: string) {
  const value = getStringValue(formData, key);

  if (!value) {
    return undefined;
  }

  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function getLimitedPageSize(formData: FormData) {
  const pageSize = getNumberValue(formData, "pageSize") ?? 10;

  return Math.min(Math.max(Math.trunc(pageSize), 1), 10);
}

function toNumberValue(value: string | number | undefined) {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function toStringValue(value: string | number | undefined) {
  return value === undefined || value === null ? undefined : String(value);
}

async function toProductPreview(
  product: Product,
  raw: DataokeRawProduct,
): Promise<DataokeProductPreview> {
  const sourceCid = toStringValue(raw.cid);
  const sourceSubcid = toStringValue(raw.subcid);
  const couponTotalNum = toNumberValue(raw.couponTotalNum);
  const couponReceiveNum = toNumberValue(raw.couponReceiveNum);
  const fallbackKey = sourceCid || product.categoryId;
  const mapping = await resolveCategoryMappingForSource({
    source: product.source,
    sourceCid: sourceCid ?? "",
    sourceSubcid,
  });

  return {
    brandId: toStringValue(raw.brandId),
    brandName: raw.brandName,
    categoryId: mapping?.categoryId ?? `dataoke-${fallbackKey}`,
    categoryName: mapping?.sourceName ?? product.categoryName ?? "大淘客分类",
    categorySlug: mapping?.categorySlug ?? `dataoke-${fallbackKey}`,
    commissionRate: product.commissionRate,
    couponAmount: product.couponAmount,
    couponConditions: raw.couponConditions,
    couponEndTime: raw.couponEndTime,
    couponReceiveNum,
    couponRemainCount: couponTotalNum !== undefined
      ? Math.max(
          couponTotalNum - (couponReceiveNum ?? 0),
          0,
        )
      : undefined,
    couponStartTime: raw.couponStartTime,
    couponTotalNum,
    dailySales: toNumberValue(raw.dailySales),
    description: product.description,
    finalPrice: product.finalPrice,
    id: product.id,
    images: product.mainImage ? [product.mainImage] : [],
    mainImage: product.mainImage,
    monthSales: toNumberValue(raw.monthSales),
    outerItemId: product.outerItemId,
    platform: product.platform,
    price: product.price,
    shopLogo: normalizeDataokeImageUrl(raw.shopLogo),
    shopName: product.shopName,
    shortTitle: product.shortTitle,
    source: product.source,
    sourceCid,
    sourceSubcid,
    status: product.status,
    title: product.title,
    twoHoursSales: toNumberValue(raw.twoHoursSales),
  };
}

function toErrorState(message: string): DataokeSyncPreviewState {
  return {
    message,
    productsPreview: [],
    success: false,
    summary: null,
    syncParams: null,
  };
}

export async function previewDataokeProductsAction(
  _previousState: DataokeSyncPreviewState,
  formData: FormData,
): Promise<DataokeSyncPreviewState> {
  void _previousState;

  if (!dataokeConfig.enableRealApi) {
    return toErrorState(
      "Dataoke real API is disabled. Set DATAOKE_ENABLE_REAL_API=true to enable real requests.",
    );
  }

  try {
    const response = await dataokeClient.request<unknown>(
      dataokeEndpoints.searchGoods.path,
      dataokeConfig.searchVersion,
      {
        cids: getStringValue(formData, "cids"),
        commissionRateLowerLimit:
          getNumberValue(formData, "commissionRateLowerLimit") ?? 5,
        hasCoupon: getNumberValue(formData, "hasCoupon") ?? 1,
        keyWords: getStringValue(formData, "keyWords") ?? "数码",
        monthSalesLowerLimit:
          getNumberValue(formData, "monthSalesLowerLimit") ?? 100,
        pageId: getStringValue(formData, "pageId") ?? "1",
        pageSize: getLimitedPageSize(formData),
        sort: getStringValue(formData, "sort") ?? "0",
      },
    );
    const syncParams: DataokeSyncParams = {
      cids: getStringValue(formData, "cids"),
      commissionRateLowerLimit:
        getNumberValue(formData, "commissionRateLowerLimit") ?? 5,
      hasCoupon: getNumberValue(formData, "hasCoupon") ?? 1,
      keyWords: getStringValue(formData, "keyWords") ?? "digital",
      monthSalesLowerLimit:
        getNumberValue(formData, "monthSalesLowerLimit") ?? 100,
      pageId: getStringValue(formData, "pageId") ?? "1",
      pageSize: getLimitedPageSize(formData),
      sort: getStringValue(formData, "sort") ?? "0",
    };
    const result = extractDataokeSearchResult(response);
    const productsPreview = await Promise.all(
      result.list.map((raw) =>
        toProductPreview(mapDataokeProductToProduct(raw), raw),
      ),
    );

    return {
      message: "Dataoke product sync preview completed.",
      productsPreview,
      success: true,
      summary: {
        detectedListPath: result.detectedPath,
        listCount: result.list.length,
        mappedCount: productsPreview.length,
        pageId: result.pageId,
        totalNum: result.totalNum,
      },
      syncParams,
    };
  } catch (error) {
    return toErrorState(
      error instanceof Error
        ? error.message
        : "Dataoke product sync preview failed.",
    );
  }
}

export async function confirmDataokeProductsImportAction(
  productsPreview: DataokeImportPreview[],
  syncParams?: DataokeSyncParams | null,
): Promise<DataokeImportResult> {
  try {
    return await importDataokeProducts({
      productsPreview,
      syncParams: syncParams ?? undefined,
    });
  } catch {
    return {
      createdCount: 0,
      failedCount: 0,
      failedItems: [],
      message: "Dataoke product import could not be completed.",
      skippedCount: 0,
      success: false,
      syncLogId: null,
      updatedCount: 0,
    };
  }
}
