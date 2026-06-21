"use server";

import {
  dataokeClient,
  DataokeClientError,
  dataokeConfig,
  dataokeEndpoints,
  mapDataokePrivilegeLinkToPromotionLink,
  mapDataokeProductToProduct,
  mapDataokeSuperCategoryToCategory,
} from "@/integrations/dataoke";
import type {
  DataokeApiBaseResponse,
  DataokeCategoryResponse,
  DataokeInnerResponse,
  DataokePrivilegeLinkResult,
  DataokeRawProduct,
  DataokeSafeErrorSummary,
  DataokeSafeRequestSummary,
  DataokeSuperCategory,
} from "@/integrations/dataoke";
import type { Category } from "@/modules/category";
import type { Product } from "@/modules/product";
import type { PromotionLink } from "@/modules/promotion-link";

type DataokeRawSummary = {
  status?: number;
  msg?: string;
  code?: number;
  innerMsg?: string;
  totalNum?: number;
  pageId?: string;
  listCount?: number;
  couponEndTime?: string;
  couponStartTime?: string;
  hasActualPrice?: boolean;
  hasCouponClickUrl?: boolean;
  hasItemUrl?: boolean;
  hasMaxCommissionRate?: boolean;
  hasOriginalPrice?: boolean;
  hasShortUrl?: boolean;
  hasTpwd?: boolean;
  itemId?: string | number;
  dataKeys?: string[];
  detectedListPath?: string;
  candidateCount?: number;
  firstCandidateHasCouponId?: boolean;
  firstCandidateHasGoodsId?: boolean;
  firstItemKeys?: string[];
  innerDataKeys?: string[];
  topLevelKeys?: string[];
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

type DataokeMappedCategorySummary = Pick<
  Category,
  "id" | "name" | "seoTitle" | "slug" | "sortOrder" | "status"
>;

type DataokeMappedPromotionLinkSummary = Pick<
  PromotionLink,
  | "couponUrl"
  | "outerItemId"
  | "platform"
  | "productId"
  | "promotionUrl"
  | "source"
  | "status"
  | "tpwd"
>;

type DataokeSearchCandidate = {
  actualPrice: string;
  commissionRate: string;
  couponEndTime: string;
  couponId: string;
  couponPrice: string;
  dtitle: string;
  goodsId: string;
  hasCouponLink: boolean;
  hasItemLink: boolean;
  hasQuanMLink: boolean;
  mainPicPreview: string;
  originalPrice: string;
  outerItemId: string;
  shopName: string;
  title: string;
};

type ExtractedDataokeSearchResult = {
  detectedPath: string;
  list: DataokeRawProduct[];
  pageId?: string;
  totalNum?: number;
};

export type DataokeTestActionState = {
  success: boolean;
  message: string;
  rawSummary: DataokeRawSummary | null;
  safeErrorSummary: DataokeSafeErrorSummary | null;
  safeRequestSummary: DataokeSafeRequestSummary | null;
  mappedCategories: DataokeMappedCategorySummary[];
  mappedPromotionLink: DataokeMappedPromotionLinkSummary | null;
  mappedProducts: DataokeMappedProductSummary[];
  searchCandidates: DataokeSearchCandidate[];
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
      mappedCategories: [],
      mappedPromotionLink: null,
      mappedProducts: [],
      message: error.message,
      rawSummary: null,
      safeErrorSummary: diagnostics.safeErrorSummary,
      safeRequestSummary: diagnostics.safeRequestSummary,
      searchCandidates: [],
      success: false,
    };
  }

  return {
    mappedCategories: [],
    mappedPromotionLink: null,
    mappedProducts: [],
    message: "Dataoke test action failed.",
    rawSummary: null,
    safeErrorSummary: null,
    safeRequestSummary: null,
    searchCandidates: [],
    success: false,
  };
}

function getRecordKeys(value: unknown) {
  return isRecord(value) ? Object.keys(value).sort() : undefined;
}

function getPathValue(value: unknown, path: string[]) {
  return path.reduce<unknown>((currentValue, key) => {
    if (!isRecord(currentValue)) {
      return undefined;
    }

    return currentValue[key];
  }, value);
}

function getStringFieldValue(record: Record<string, unknown>, key: string) {
  const value = record[key];

  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  return String(value);
}

function getNumberFieldValue(record: Record<string, unknown>, key: string) {
  const value = Number(record[key]);

  return Number.isFinite(value) ? value : undefined;
}

function getFirstStringAtPaths(raw: unknown, paths: string[][]) {
  for (const path of paths) {
    const value = getPathValue(raw, path);

    if (value !== undefined && value !== null && value !== "") {
      return String(value);
    }
  }

  return undefined;
}

function getFirstNumberAtPaths(raw: unknown, paths: string[][]) {
  for (const path of paths) {
    const value = Number(getPathValue(raw, path));

    if (Number.isFinite(value)) {
      return value;
    }
  }

  return undefined;
}

function getSearchResultFromContainer(
  container: unknown,
): Omit<ExtractedDataokeSearchResult, "detectedPath"> | null {
  if (!isRecord(container) || !Array.isArray(container.list)) {
    return null;
  }

  return {
    list: container.list.filter(isRecord) as DataokeRawProduct[],
    pageId: getStringFieldValue(container, "pageId"),
    totalNum: getNumberFieldValue(container, "totalNum"),
  };
}

function extractDataokeSearchResult(raw: unknown): ExtractedDataokeSearchResult {
  const candidates = [
    { path: ["data", "data"], detectedPath: "raw.data.data.list" },
    { path: ["data"], detectedPath: "raw.data.list" },
    {
      path: ["data", "data", "data"],
      detectedPath: "raw.data.data.data.list",
    },
    { path: ["result"], detectedPath: "raw.result.list" },
    { path: [], detectedPath: "raw.list" },
  ];

  for (const candidate of candidates) {
    const result = getSearchResultFromContainer(
      getPathValue(raw, candidate.path),
    );

    if (result) {
      return {
        ...result,
        detectedPath: candidate.detectedPath,
      };
    }
  }

  return {
    detectedPath: "not_found",
    list: [],
  };
}

function toCandidateString(value: unknown) {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value);
}

function toMainPicPreview(value: unknown) {
  const mainPic = toCandidateString(value);

  return mainPic ? mainPic.slice(0, 48) : "";
}

function toDataokeSearchCandidate(
  raw: DataokeRawProduct,
): DataokeSearchCandidate {
  const goodsId = toCandidateString(raw.goodsId);

  return {
    actualPrice: toCandidateString(raw.actualPrice),
    commissionRate: toCandidateString(raw.commissionRate),
    couponEndTime: toCandidateString(raw.couponEndTime),
    couponId: toCandidateString(raw.couponId),
    couponPrice: toCandidateString(raw.couponPrice),
    dtitle: toCandidateString(raw.dtitle),
    goodsId,
    hasCouponLink: Boolean(raw.couponLink),
    hasItemLink: Boolean(raw.itemLink),
    hasQuanMLink: Boolean(raw.quanMLink),
    mainPicPreview: toMainPicPreview(raw.mainPic),
    originalPrice: toCandidateString(raw.originalPrice),
    outerItemId: goodsId,
    shopName: toCandidateString(raw.shopName),
    title: toCandidateString(raw.title),
  };
}

function getSearchRawSummary(
  response: unknown,
  result: ExtractedDataokeSearchResult,
  searchCandidates: DataokeSearchCandidate[],
): DataokeRawSummary {
  const dataRecord = getPathValue(response, ["data"]);
  const innerDataRecord = getPathValue(response, ["data", "data"]);
  const firstItem = result.list[0];

  return {
    code: getFirstNumberAtPaths(response, [
      ["code"],
      ["data", "code"],
      ["data", "data", "code"],
    ]),
    candidateCount: searchCandidates.length,
    dataKeys: getRecordKeys(dataRecord),
    detectedListPath: result.detectedPath,
    firstCandidateHasCouponId: Boolean(searchCandidates[0]?.couponId),
    firstCandidateHasGoodsId: Boolean(searchCandidates[0]?.goodsId),
    firstItemKeys: getRecordKeys(firstItem),
    innerDataKeys: getRecordKeys(innerDataRecord),
    listCount: result.list.length,
    msg: getFirstStringAtPaths(response, [
      ["msg"],
      ["data", "msg"],
      ["data", "data", "msg"],
    ]),
    pageId: result.pageId,
    status: getFirstNumberAtPaths(response, [
      ["status"],
      ["data", "status"],
      ["data", "data", "status"],
    ]),
    topLevelKeys: getRecordKeys(response),
    totalNum: result.totalNum,
  };
}

function getSuperCategoryList(
  response: DataokeApiBaseResponse<
    DataokeCategoryResponse | DataokeInnerResponse<DataokeCategoryResponse>
  >,
): DataokeSuperCategory[] {
  const data = response.data;

  if (Array.isArray(data)) {
    return data;
  }

  if (isRecord(data) && Array.isArray(data.data)) {
    return data.data;
  }

  return [];
}

function getSuperCategoryRawSummary(
  response: DataokeApiBaseResponse<
    DataokeCategoryResponse | DataokeInnerResponse<DataokeCategoryResponse>
  >,
): DataokeRawSummary {
  const data = response.data;
  const innerResponse = isRecord(data) && !Array.isArray(data) ? data : null;
  const categoryList = getSuperCategoryList(response);

  return {
    code:
      typeof innerResponse?.code === "number" ? innerResponse.code : undefined,
    innerMsg:
      typeof innerResponse?.msg === "string" ? innerResponse.msg : undefined,
    listCount: categoryList.length,
    msg: response.msg,
    status: response.status,
  };
}

function getPrivilegeLinkResult(
  response: DataokeApiBaseResponse<
    DataokeInnerResponse<DataokePrivilegeLinkResult> | DataokePrivilegeLinkResult
  >,
): DataokePrivilegeLinkResult {
  const data = response.data;
  const dataRecord: Record<string, unknown> | null = isRecord(data)
    ? data
    : null;

  if (dataRecord && isRecord(dataRecord.data)) {
    return dataRecord.data as DataokePrivilegeLinkResult;
  }

  if (dataRecord) {
    return dataRecord as DataokePrivilegeLinkResult;
  }

  return {};
}

function getPrivilegeLinkRawSummary(
  response: DataokeApiBaseResponse<
    DataokeInnerResponse<DataokePrivilegeLinkResult> | DataokePrivilegeLinkResult
  >,
): DataokeRawSummary {
  const data = response.data;
  const dataRecord: Record<string, unknown> | null = isRecord(data)
    ? data
    : null;
  const innerResponse =
    dataRecord && isRecord(dataRecord.data) ? dataRecord : null;
  const result = getPrivilegeLinkResult(response);

  return {
    code:
      typeof innerResponse?.code === "number"
        ? innerResponse.code
        : undefined,
    couponEndTime: result.couponEndTime,
    couponStartTime: result.couponStartTime,
    hasActualPrice: result.actualPrice !== undefined,
    hasCouponClickUrl: Boolean(result.couponClickUrl),
    hasItemUrl: Boolean(result.itemUrl),
    hasMaxCommissionRate: result.maxCommissionRate !== undefined,
    hasOriginalPrice: result.originalPrice !== undefined,
    hasShortUrl: Boolean(result.shortUrl),
    hasTpwd: Boolean(result.tpwd),
    innerMsg:
      typeof innerResponse?.msg === "string" ? innerResponse.msg : undefined,
    itemId: result.itemId,
    msg: response.msg,
    status: response.status,
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

function toMappedPromotionLinkSummary(
  promotionLink: PromotionLink,
): DataokeMappedPromotionLinkSummary {
  return {
    couponUrl: promotionLink.couponUrl,
    outerItemId: promotionLink.outerItemId,
    platform: promotionLink.platform,
    productId: promotionLink.productId,
    promotionUrl: promotionLink.promotionUrl,
    source: promotionLink.source,
    status: promotionLink.status,
    tpwd: promotionLink.tpwd,
  };
}

function toMappedCategorySummary(
  category: Category,
): DataokeMappedCategorySummary {
  return {
    id: category.id,
    name: category.name,
    seoTitle: category.seoTitle,
    slug: category.slug,
    sortOrder: category.sortOrder,
    status: category.status,
  };
}

export async function testDataokeSearchAction(
  _previousState: DataokeTestActionState,
  formData: FormData,
): Promise<DataokeTestActionState> {
  void _previousState;

  try {
    const response = await dataokeClient.request<unknown>(
      dataokeEndpoints.searchGoods.path,
      dataokeConfig.searchVersion,
      {
      cids: getStringValue(formData, "cids"),
      hasCoupon: getNumberValue(formData, "hasCoupon") ?? 1,
      keyWords: getStringValue(formData, "keyWords"),
      pageId: getStringValue(formData, "pageId") ?? "1",
      pageSize: getLimitedPageSize(formData),
      sort: getStringValue(formData, "sort"),
      },
    );

    const result = extractDataokeSearchResult(response);
    const searchCandidates = result.list.map(toDataokeSearchCandidate);
    const mappedProducts =
      result.list.map(mapDataokeProductToProduct).map(toMappedProductSummary);

    return {
      mappedCategories: [],
      mappedPromotionLink: null,
      mappedProducts,
      message: "Dataoke search test completed.",
      rawSummary: getSearchRawSummary(response, result, searchCandidates),
      safeErrorSummary: null,
      safeRequestSummary: null,
      searchCandidates,
      success: true,
    };
  } catch (error) {
    return toErrorState(error);
  }
}

export async function testDataokeSuperCategoryAction(): Promise<DataokeTestActionState> {
  try {
    const response = await dataokeClient.request<
      DataokeApiBaseResponse<
        DataokeCategoryResponse | DataokeInnerResponse<DataokeCategoryResponse>
      >
    >(
      dataokeEndpoints.superCategory.path,
      dataokeEndpoints.superCategory.defaultVersion,
      {},
    );
    const mappedCategories = getSuperCategoryList(response)
      .map(mapDataokeSuperCategoryToCategory)
      .map(toMappedCategorySummary);

    return {
      mappedCategories,
      mappedPromotionLink: null,
      mappedProducts: [],
      message: "Dataoke super category test completed.",
      rawSummary: getSuperCategoryRawSummary(response),
      safeErrorSummary: null,
      safeRequestSummary: null,
      searchCandidates: [],
      success: true,
    };
  } catch (error) {
    return toErrorState(error);
  }
}

export async function testDataokePrivilegeLinkAction(
  _previousState: DataokeTestActionState,
  formData: FormData,
): Promise<DataokeTestActionState> {
  void _previousState;

  const goodsId = getStringValue(formData, "goodsId");

  if (!goodsId) {
    return {
      mappedCategories: [],
      mappedProducts: [],
      mappedPromotionLink: null,
      message: "goodsId is required.",
      rawSummary: null,
      safeErrorSummary: null,
      safeRequestSummary: null,
      searchCandidates: [],
      success: false,
    };
  }

  try {
    const response = await dataokeClient.request<
      DataokeApiBaseResponse<
        DataokeInnerResponse<DataokePrivilegeLinkResult> | DataokePrivilegeLinkResult
      >
    >(dataokeEndpoints.privilegeLink.path, dataokeConfig.privilegeLinkVersion, {
      authId: getStringValue(formData, "authId"),
      bybtqdyh: getNumberValue(formData, "bybtqdyh"),
      channelId: getStringValue(formData, "channelId"),
      couponId: getStringValue(formData, "couponId"),
      externalId: getStringValue(formData, "externalId"),
      getTopnRate: getNumberValue(formData, "getTopnRate"),
      goodsId,
      leftSymbol: getStringValue(formData, "leftSymbol"),
      pid: (getStringValue(formData, "pid") ?? dataokeConfig.pid) || undefined,
      promtionType: getNumberValue(formData, "promtionType"),
      rebateType: getNumberValue(formData, "rebateType"),
      rightSymbol: getStringValue(formData, "rightSymbol"),
      specialId: getStringValue(formData, "specialId"),
      xid: getStringValue(formData, "xid"),
    });
    const result = getPrivilegeLinkResult(response);
    const mappedPromotionLink = toMappedPromotionLinkSummary(
      mapDataokePrivilegeLinkToPromotionLink(
        result,
        `dataoke-${goodsId}`,
        goodsId,
      ),
    );

    return {
      mappedCategories: [],
      mappedProducts: [],
      mappedPromotionLink,
      message: "Dataoke privilege link test completed.",
      rawSummary: getPrivilegeLinkRawSummary(response),
      safeErrorSummary: null,
      safeRequestSummary: null,
      searchCandidates: [],
      success: true,
    };
  } catch (error) {
    return toErrorState(error);
  }
}
