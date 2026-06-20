import { mockProducts } from "@/modules/product";

import type {
  ConvertLinkParams,
  ConvertLinkResult,
  GetProductDetailParams,
  ProductSearchResult,
  ProductSourceAdapter,
  SearchProductsParams,
} from "../shared";

function filterProducts(params: SearchProductsParams) {
  const keyword = params.keyword?.trim().toLowerCase();

  return mockProducts.filter((product) => {
    const matchesKeyword = keyword
      ? [
          product.title,
          product.shortTitle,
          product.description,
          product.shopName,
          product.categoryName,
        ]
          .join(" ")
          .toLowerCase()
          .includes(keyword)
      : true;

    const matchesCategory = params.categoryId
      ? product.categoryId === params.categoryId
      : true;

    return matchesKeyword && matchesCategory;
  });
}

function paginateProducts(
  products: typeof mockProducts,
  page: number,
  pageSize: number,
) {
  const start = (page - 1) * pageSize;

  return products.slice(start, start + pageSize);
}

export class AlimamaMockAdapter implements ProductSourceAdapter {
  sourceName = "alimama-mock";

  async searchProducts(
    params: SearchProductsParams,
  ): Promise<ProductSearchResult> {
    const products = filterProducts(params);

    return {
      page: params.page,
      pageSize: params.pageSize,
      products: paginateProducts(products, params.page, params.pageSize),
      total: products.length,
    };
  }

  async getProductDetail({ outerItemId, platform }: GetProductDetailParams) {
    return (
      mockProducts.find(
        (product) =>
          product.outerItemId === outerItemId && product.platform === platform,
      ) ?? null
    );
  }

  async convertLink({
    outerItemId,
    platform,
    promotionPositionId,
  }: ConvertLinkParams): Promise<ConvertLinkResult> {
    return {
      couponUrl: `https://example.com/alimama/coupon/${platform}/${outerItemId}`,
      promotionUrl: `https://example.com/alimama/promotion/${platform}/${outerItemId}`,
      raw: {
        adapter: this.sourceName,
        outerItemId,
        platform,
        promotionPositionId,
      },
      tpwd: `￥ALM${outerItemId.slice(-6)}￥`,
    };
  }
}

export const alimamaMockAdapter = new AlimamaMockAdapter();
