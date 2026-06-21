export type DataokeApiBaseResponse<T> = {
  status?: number;
  msg?: string;
  data?: T;
};

export type DataokeInnerResponse<T> = {
  time?: number;
  code?: number;
  msg?: string;
  data?: T;
};

export type DataokeRawProduct = {
  id?: string | number;
  goodsId?: string | number;
  goodsSign?: string;
  title?: string;
  dtitle?: string;
  originalPrice?: string | number;
  actualPrice?: string | number;
  shopType?: string | number;
  monthSales?: string | number;
  twoHoursSales?: string | number;
  dailySales?: string | number;
  commissionType?: string | number;
  desc?: string;
  couponReceiveNum?: string | number;
  couponLink?: string;
  couponEndTime?: string;
  couponStartTime?: string;
  couponPrice?: string | number;
  couponConditions?: string;
  activityType?: string | number;
  createTime?: string;
  mainPic?: string;
  marketingMainPic?: string;
  sellerId?: string | number;
  cid?: string | number;
  subcid?: string | number;
  tbcid?: string | number;
  discounts?: string | number;
  commissionRate?: string | number;
  couponTotalNum?: string | number;
  activityStartTime?: string;
  activityEndTime?: string;
  shopName?: string;
  shopLevel?: string | number;
  descScore?: string | number;
  dsrScore?: string | number;
  shipScore?: string | number;
  serviceScore?: string | number;
  brand?: string | number;
  brandId?: string | number;
  brandName?: string;
  hotPush?: string | number;
  teamName?: string;
  itemLink?: string;
  yunfeixian?: string | number;
  freeshipRemoteDistrict?: string | number;
  shopLogo?: string;
};

export type DataokeSearchGoodsParams = {
  pageSize?: number;
  pageId?: string | number;
  keyWords?: string;
  cids?: string;
  subcid?: string | number;
  juHuaSuan?: number;
  taoQiangGou?: number;
  tmall?: number;
  tchaoshi?: number;
  goldSeller?: number;
  haitao?: number;
  brand?: number;
  brandIds?: string;
  priceLowerLimit?: number;
  priceUpperLimit?: number;
  couponPriceLowerLimit?: number;
  commissionRateLowerLimit?: number;
  monthSalesLowerLimit?: number;
  sort?: string;
  freeshipRemoteDistrict?: number;
  hasCoupon?: number;
  inspectedGoods?: number;
};

export type DataokeSearchGoodsResult = {
  list: DataokeRawProduct[];
  totalNum?: number;
  pageId?: string;
};

export type DataokeGoodsListParams = {
  pageId?: string | number;
  pageSize?: number;
  cids?: string;
  sort?: string;
  subcid?: string | number;
  juHuaSuan?: number;
  taoQiangGou?: number;
  tmall?: number;
  tchaoshi?: number;
  goldSeller?: number;
  haitao?: number;
  pre?: number;
  preSale?: number;
  brand?: number;
  brandIds?: string;
  priceLowerLimit?: number;
  priceUpperLimit?: number;
  couponPriceLowerLimit?: number;
  commissionRateLowerLimit?: number;
  monthSalesLowerLimit?: number;
  freeshipRemoteDistrict?: number;
  directCommissionType?: number;
  choice?: number;
};

export type DataokePrivilegeLinkParams = {
  goodsId?: string | number;
  couponId?: string;
  pid?: string;
  channelId?: string;
  promtionType?: number;
  rebateType?: number;
  specialId?: string;
  externalId?: string;
  xid?: string;
  leftSymbol?: string;
  rightSymbol?: string;
  authId?: string;
  bybtqdyh?: number;
  getTopnRate?: number;
};

export type DataokePrivilegeLinkResult = {
  couponClickUrl?: string;
  couponEndTime?: string;
  couponInfo?: string;
  couponStartTime?: string;
  itemId?: string | number;
  couponTotalCount?: string | number;
  couponRemainCount?: string | number;
  itemUrl?: string;
  tpwd?: string;
  longTpwd?: string;
  maxCommissionRate?: string | number;
  shortUrl?: string;
  minCommissionRate?: string | number;
  kuaiZhanUrl?: string;
  originalPrice?: string | number;
  actualPrice?: string | number;
  topnEndTime?: string;
  topnStartTime?: string;
  topnQuantity?: string | number;
  topnTotalCount?: string | number;
};

export type DataokeSuperCategory = {
  cid?: string | number;
  cname?: string;
  cpic?: string;
  subcategories?: DataokeSubCategory[];
};

export type DataokeSubCategory = {
  subcid?: string | number;
  subcname?: string;
  scname?: string;
  scpic?: string;
};

export type DataokeApiError = {
  code: string;
  message: string;
  raw?: unknown;
};

export type DataokeSearchResponse = DataokeSearchGoodsResult;
export type DataokePrivilegeLinkResponse = DataokePrivilegeLinkResult;
export type DataokeCategoryResponse = DataokeSuperCategory;
