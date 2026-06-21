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
import { dataokeConfig } from "./dataoke.config";
import { dataokeEndpoints } from "./dataoke.endpoints";

export class DataokeApiAdapter implements ProductSourceAdapter {
  sourceName = "dataoke";

  async searchProducts(
    params: SearchProductsParams,
  ): Promise<ProductSearchResult> {
    const response = await dataokeClient.request<DataokeSearchResponse>(
      dataokeEndpoints.searchGoods.path,
      dataokeConfig.searchVersion,
      {
        keyWords: params.keyword,
        pageId: params.page,
        pageSize: params.pageSize,
      },
    );

    const products = (response.list ?? []).map(mapDataokeProductToProduct);

    return {
      page: params.page,
      pageSize: params.pageSize,
      products,
      total: response.totalNum ?? products.length,
    };
  }

  async getProductDetail({ outerItemId }: GetProductDetailParams) {
    const response = await dataokeClient.request<DataokeRawProduct>(
      dataokeEndpoints.goodsList.path,
      dataokeConfig.goodsListVersion,
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
      dataokeEndpoints.privilegeLink.path,
      dataokeConfig.privilegeLinkVersion,
      {
        goodsId: outerItemId,
        pid: promotionPositionId ?? dataokeConfig.pid,
        url: originalUrl,
      },
    );

    return {
      couponUrl: response.couponClickUrl ?? "",
      promotionUrl: response.itemUrl ?? response.shortUrl ?? "",
      raw: response,
      tpwd: response.tpwd ?? response.longTpwd ?? "",
    };
  }
}

export const dataokeApiAdapter = new DataokeApiAdapter();
