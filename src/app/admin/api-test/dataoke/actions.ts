"use server";

import {
  dataokeClient,
  DataokeClientError,
  dataokeConfig,
  dataokeEndpoints,
  mapDataokeProductToProduct,
} from "@/integrations/dataoke";
import type {
  DataokeApiBaseResponse,
  DataokeInnerResponse,
  DataokeSafeErrorSummary,
  DataokeSafeRequestSummary,
  DataokeSearchGoodsResult,
} from "@/integrations/dataoke";
import type { Product } from "@/modules/product";

type DataokeRawSummary = {
  status?: number;
  msg?: string;
  code?: number;
  innerMsg?: string;
  totalNum?: number;
  pageId?: string;
  listCount?: number;
};

type DataokeMappedProductSummary = Pick<
  Product,
  | "categoryName"
  | "commissionRate"
  | "couponAmount"
  | "finalPrice"
  | "outerItemId"
  | "price"
  | "shopName"
  | "shortTitle"
  | "title"
>;

export type DataokeTestActionState = {
  success: boolean;
  message: string;
  rawSummary: DataokeRawSummary | null;
  safeErrorSummary: DataokeSafeErrorSummary | null;
  safeRequestSummary: DataokeSafeRequestSummary | null;
  mappedProducts: DataokeMappedProductSummary[];
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getSafeDiagnostics(error: DataokeClientError) {
  const raw = error.details.raw;

  if (!isRecord(raw)) {
    return {
      safeErrorSummary: null,
      safeRequestSummary: null,
    };
  }

  return {
    safeErrorSummary: isRecord(raw.safeErrorSummary)
      ? (raw.safeErrorSummary as DataokeSafeErrorSummary)
      : null,
    safeRequestSummary: isRecord(raw.safeRequestSummary)
      ? (raw.safeRequestSummary as DataokeSafeRequestSummary)
      : null,
  };
}

function toErrorState(error: unknown): DataokeTestActionState {
  if (error instanceof DataokeClientError) {
    const diagnostics = getSafeDiagnostics(error);

    return {
      mappedProducts: [],
      message: error.message,
      rawSummary: null,
      safeErrorSummary: diagnostics.safeErrorSummary,
      safeRequestSummary: diagnostics.safeRequestSummary,
      success: false,
    };
  }

  return {
    mappedProducts: [],
    message: "Dataoke test action failed.",
    rawSummary: null,
    safeErrorSummary: null,
    safeRequestSummary: null,
    success: false,
  };
}

function getSearchResult(
  response: DataokeApiBaseResponse<
    DataokeInnerResponse<DataokeSearchGoodsResult>
  >,
) {
  return response.data?.data;
}

function getRawSummary(
  response: DataokeApiBaseResponse<
    DataokeInnerResponse<DataokeSearchGoodsResult>
  >,
): DataokeRawSummary {
  const result = getSearchResult(response);

  return {
    code: response.data?.code,
    innerMsg: response.data?.msg,
    listCount: result?.list.length,
    msg: response.msg,
    pageId: result?.pageId,
    status: response.status,
    totalNum: result?.totalNum,
  };
}

function toMappedProductSummary(
  product: Product,
): DataokeMappedProductSummary {
  return {
    categoryName: product.categoryName,
    commissionRate: product.commissionRate,
    couponAmount: product.couponAmount,
    finalPrice: product.finalPrice,
    outerItemId: product.outerItemId,
    price: product.price,
    shopName: product.shopName,
    shortTitle: product.shortTitle,
    title: product.title,
  };
}

export async function testDataokeSearchAction(
  _previousState: DataokeTestActionState,
  formData: FormData,
): Promise<DataokeTestActionState> {
  void _previousState;

  try {
    const response = await dataokeClient.request<
      DataokeApiBaseResponse<DataokeInnerResponse<DataokeSearchGoodsResult>>
    >(dataokeEndpoints.searchGoods.path, dataokeConfig.searchVersion, {
      cids: getStringValue(formData, "cids"),
      hasCoupon: getNumberValue(formData, "hasCoupon") ?? 1,
      keyWords: getStringValue(formData, "keyWords"),
      pageId: getStringValue(formData, "pageId") ?? "1",
      pageSize: getLimitedPageSize(formData),
      sort: getStringValue(formData, "sort"),
    });

    const result = getSearchResult(response);
    const mappedProducts =
      result?.list
        .map(mapDataokeProductToProduct)
        .map(toMappedProductSummary) ?? [];

    return {
      mappedProducts,
      message: "Dataoke search test completed.",
      rawSummary: getRawSummary(response),
      safeErrorSummary: null,
      safeRequestSummary: null,
      success: true,
    };
  } catch (error) {
    return toErrorState(error);
  }
}

export async function testDataokeSuperCategoryAction(): Promise<DataokeTestActionState> {
  return {
    mappedProducts: [],
    message:
      "超级分类真实联调暂未启用。本轮只优先联调大淘客搜索接口。",
    rawSummary: null,
    safeErrorSummary: null,
    safeRequestSummary: null,
    success: false,
  };
}

export async function testDataokePrivilegeLinkAction(): Promise<DataokeTestActionState> {
  return {
    mappedProducts: [],
    message:
      "高效转链真实联调暂未启用。请先完成搜索接口和超级分类联调。",
    rawSummary: null,
    safeErrorSummary: null,
    safeRequestSummary: null,
    success: false,
  };
}
