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
  DataokeInnerResponse,
  DataokePrivilegeLinkResult,
  DataokeSearchGoodsResult,
  DataokeSuperCategory,
} from "@/integrations/dataoke";

type DataokeTestActionState = {
  status: "idle" | "success" | "error";
  message: string;
  raw: unknown;
  mapped: unknown;
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

function toErrorState(error: unknown): DataokeTestActionState {
  if (error instanceof DataokeClientError) {
    return {
      mapped: null,
      message: error.message,
      raw: null,
      status: "error",
    };
  }

  return {
    mapped: null,
    message: "Dataoke test action failed.",
    raw: null,
    status: "error",
  };
}

function unwrapDataokeData<T>(
  response: DataokeApiBaseResponse<DataokeInnerResponse<T>>,
) {
  return response.data?.data;
}

export async function testDataokeSearchAction(
  _previousState: DataokeTestActionState,
  formData: FormData,
): Promise<DataokeTestActionState> {
  try {
    const response = await dataokeClient.request<
      DataokeApiBaseResponse<DataokeInnerResponse<DataokeSearchGoodsResult>>
    >(dataokeEndpoints.searchGoods.path, dataokeConfig.searchVersion, {
      cids: getStringValue(formData, "cids"),
      hasCoupon: getNumberValue(formData, "hasCoupon"),
      keyWords: getStringValue(formData, "keyWords"),
      pageId: getStringValue(formData, "pageId"),
      pageSize: getNumberValue(formData, "pageSize"),
      sort: getStringValue(formData, "sort"),
    });

    const result = unwrapDataokeData(response);

    return {
      mapped: result?.list.map(mapDataokeProductToProduct) ?? [],
      message: "Dataoke search test completed.",
      raw: response,
      status: "success",
    };
  } catch (error) {
    return toErrorState(error);
  }
}

export async function testDataokeSuperCategoryAction(
  _previousState: DataokeTestActionState,
  _formData: FormData,
): Promise<DataokeTestActionState> {
  void _previousState;
  void _formData;

  try {
    const response = await dataokeClient.request<
      DataokeApiBaseResponse<DataokeInnerResponse<DataokeSuperCategory[]>>
    >(
      dataokeEndpoints.superCategory.path,
      dataokeConfig.superCategoryVersion,
      {},
    );

    const result = unwrapDataokeData(response);

    return {
      mapped: result?.map(mapDataokeSuperCategoryToCategory) ?? [],
      message: "Dataoke super category test completed.",
      raw: response,
      status: "success",
    };
  } catch (error) {
    return toErrorState(error);
  }
}

export async function testDataokePrivilegeLinkAction(
  _previousState: DataokeTestActionState,
  formData: FormData,
): Promise<DataokeTestActionState> {
  try {
    const goodsId = getStringValue(formData, "goodsId");
    const response = await dataokeClient.request<
      DataokeApiBaseResponse<DataokeInnerResponse<DataokePrivilegeLinkResult>>
    >(dataokeEndpoints.privilegeLink.path, dataokeConfig.privilegeLinkVersion, {
      couponId: getStringValue(formData, "couponId"),
      goodsId,
      pid: getStringValue(formData, "pid") ?? dataokeConfig.pid,
    });

    const result = unwrapDataokeData(response);

    return {
      mapped: result
        ? mapDataokePrivilegeLinkToPromotionLink(
            result,
            goodsId ? `dataoke-${goodsId}` : "dataoke-unknown",
            goodsId ?? "unknown",
          )
        : null,
      message: "Dataoke privilege link test completed.",
      raw: response,
      status: "success",
    };
  } catch (error) {
    return toErrorState(error);
  }
}
