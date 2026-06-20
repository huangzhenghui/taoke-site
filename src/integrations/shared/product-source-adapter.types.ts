import type { Product, ProductPlatform } from "@/modules/product";

export type SearchProductsParams = {
  keyword?: string;
  categoryId?: string;
  page: number;
  pageSize: number;
};

export type GetProductDetailParams = {
  outerItemId: string;
  platform: ProductPlatform;
};

export type ConvertLinkParams = {
  outerItemId: string;
  platform: ProductPlatform;
  originalUrl: string;
  promotionPositionId?: string;
};

export type ProductSearchResult = {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
};

export type ConvertLinkResult = {
  promotionUrl: string;
  couponUrl: string;
  tpwd: string;
  raw: unknown;
};

export type ProductSourceAdapter = {
  sourceName: string;
  searchProducts(
    params: SearchProductsParams,
  ): Promise<ProductSearchResult>;
  getProductDetail(params: GetProductDetailParams): Promise<Product | null>;
  convertLink(params: ConvertLinkParams): Promise<ConvertLinkResult>;
};
