"use server";

import {
  dataokeClient,
  dataokeConfig,
  dataokeEndpoints,
  extractDataokeSearchResult,
  mapDataokeProductToProduct,
} from "@/integrations/dataoke";
import type { Product } from "@/modules/product";

type DataokeSyncSummary = {
  detectedListPath: string;
  listCount: number;
  mappedCount: number;
  pageId?: string;
  totalNum?: number;
};

type DataokeProductPreview = Pick<
  Product,
  | "categoryId"
  | "categoryName"
  | "categorySlug"
  | "commissionRate"
  | "couponAmount"
  | "finalPrice"
  | "id"
  | "mainImage"
  | "outerItemId"
  | "platform"
  | "price"
  | "shopName"
  | "shortTitle"
  | "source"
  | "status"
  | "title"
>;

export type DataokeSyncPreviewState = {
  message: string;
  productsPreview: DataokeProductPreview[];
  success: boolean;
  summary: DataokeSyncSummary | null;
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

function toProductPreview(product: Product): DataokeProductPreview {
  return {
    categoryId: product.categoryId,
    categoryName: product.categoryName,
    categorySlug: product.categorySlug,
    commissionRate: product.commissionRate,
    couponAmount: product.couponAmount,
    finalPrice: product.finalPrice,
    id: product.id,
    mainImage: product.mainImage,
    outerItemId: product.outerItemId,
    platform: product.platform,
    price: product.price,
    shopName: product.shopName,
    shortTitle: product.shortTitle,
    source: product.source,
    status: product.status,
    title: product.title,
  };
}

function toErrorState(message: string): DataokeSyncPreviewState {
  return {
    message,
    productsPreview: [],
    success: false,
    summary: null,
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
    const result = extractDataokeSearchResult(response);
    const productsPreview = result.list
      .map(mapDataokeProductToProduct)
      .map(toProductPreview);

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
    };
  } catch (error) {
    return toErrorState(
      error instanceof Error
        ? error.message
        : "Dataoke product sync preview failed.",
    );
  }
}
