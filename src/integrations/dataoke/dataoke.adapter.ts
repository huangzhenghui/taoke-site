import type {
  ConvertLinkParams,
  ConvertLinkResult,
  GetProductDetailParams,
  ProductSearchResult,
  ProductSourceAdapter,
  SearchProductsParams,
} from "../shared";
import { dataokeClient } from "./dataoke.client";
import { mapDataokeProductToProduct } from "./dataoke.mapper";
import type {
  DataokePrivilegeLinkResponse,
  DataokeRawProduct,
  DataokeSearchResponse,
} from "./dataoke.types";

export class DataokeApiAdapter implements ProductSourceAdapter {
  sourceName = "dataoke";

  async searchProducts(
    params: SearchProductsParams,
  ): Promise<ProductSearchResult> {
    const response = await dataokeClient.request<DataokeSearchResponse>(
      "/goods/search",
      {
        keyword: params.keyword,
        pageId: params.page,
        pageSize: params.pageSize,
      },
    );

    const products = (response.list ?? []).map(mapDataokeProductToProduct);

    return {
      page: params.page,
      pageSize: params.pageSize,
      products,
      total: response.total ?? products.length,
    };
  }

  async getProductDetail({ outerItemId }: GetProductDetailParams) {
    const response = await dataokeClient.request<DataokeRawProduct>(
      "/goods/detail",
      {
        goodsId: outerItemId,
      },
    );

    return mapDataokeProductToProduct(response);
  }

  async convertLink({
    originalUrl,
    outerItemId,
    promotionPositionId,
  }: ConvertLinkParams): Promise<ConvertLinkResult> {
    const response = await dataokeClient.request<DataokePrivilegeLinkResponse>(
      "/tb-service/get-privilege-link",
      {
        goodsId: outerItemId,
        pid: promotionPositionId,
        url: originalUrl,
      },
    );

    return {
      couponUrl: response.couponClickUrl ?? "",
      promotionUrl: response.itemUrl ?? response.shortUrl ?? "",
      raw: response.raw ?? response,
      tpwd: response.tpwd ?? response.longTpwd ?? "",
    };
  }
}

export const dataokeApiAdapter = new DataokeApiAdapter();
