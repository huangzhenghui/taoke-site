export type DataokeRawProduct = {
  id?: string | number;
  goodsId?: string | number;
  itemId?: string | number;
  title?: string;
  dtitle?: string;
  shortTitle?: string;
  desc?: string;
  description?: string;
  mainPic?: string;
  image?: string;
  originalPrice?: string | number;
  actualPrice?: string | number;
  price?: string | number;
  couponPrice?: string | number;
  couponAmount?: string | number;
  commissionRate?: string | number;
  shopName?: string;
  cid?: string | number;
  categoryId?: string | number;
  categoryName?: string;
  itemLink?: string;
  couponLink?: string;
  platform?: string | number;
  sourceType?: string | number;
  [key: string]: unknown;
};

export type DataokeSearchResponse = {
  list?: DataokeRawProduct[];
  total?: number;
  pageId?: string | number;
  pageSize?: string | number;
  raw?: unknown;
};

export type DataokePrivilegeLinkResponse = {
  couponClickUrl?: string;
  itemUrl?: string;
  tpwd?: string;
  longTpwd?: string;
  shortUrl?: string;
  raw?: unknown;
};

export type DataokeCategoryResponse = {
  cid?: string | number;
  cname?: string;
  cpic?: string;
  subcategories?: DataokeCategoryResponse[];
  raw?: unknown;
};

export type DataokeApiError = {
  code: string;
  message: string;
  raw?: unknown;
};
