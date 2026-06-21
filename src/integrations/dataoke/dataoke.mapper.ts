import type { Category } from "@/modules/category";
import type { Product, ProductPlatform } from "@/modules/product";
import type { PromotionLink } from "@/modules/promotion-link";

import type {
  DataokePrivilegeLinkResult,
  DataokeRawProduct,
  DataokeSuperCategory,
} from "./dataoke.types";

const dataokeCategoryNameMap: Record<string, string> = {
  "1": "女装",
  "2": "母婴",
  "3": "美妆",
  "4": "居家日用",
  "5": "鞋品",
  "6": "美食",
  "7": "文娱车品",
  "8": "数码家电",
  "9": "男装",
  "10": "内衣",
  "11": "箱包",
  "12": "配饰",
  "13": "户外运动",
  "14": "家装家纺",
};

function toStringValue(value: unknown, fallback = "") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return String(value);
}

function toNumberValue(value: unknown, fallback = 0) {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function mapShopTypeToPlatform(shopType: DataokeRawProduct["shopType"]): ProductPlatform {
  const normalizedShopType = toStringValue(shopType);

  if (normalizedShopType === "1") {
    return "tmall";
  }

  return "taobao";
}

function getDataokeCategoryName(cid: string) {
  return dataokeCategoryNameMap[cid] ?? "大淘客分类";
}

export function normalizeDataokeImageUrl(url?: string) {
  if (!url) {
    return "";
  }

  if (url.startsWith("//")) {
    return `https:${url}`;
  }

  return url;
}

export function mapDataokeProductToProduct(raw: DataokeRawProduct): Product {
  const now = new Date().toISOString();
  const outerItemId = toStringValue(raw.goodsId, toStringValue(raw.id, "unknown"));
  const title = toStringValue(raw.title, "未命名商品");
  const cid = toStringValue(raw.cid, "unknown");

  return {
    categoryId: cid,
    categoryName: getDataokeCategoryName(cid),
    categorySlug: `dataoke-${cid}`,
    commissionRate: toNumberValue(raw.commissionRate),
    couponAmount: toNumberValue(raw.couponPrice),
    couponUrl: toStringValue(raw.couponLink),
    createdAt: now,
    description: toStringValue(raw.desc),
    finalPrice: toNumberValue(raw.actualPrice),
    id: `dataoke-${outerItemId}`,
    mainImage: normalizeDataokeImageUrl(raw.mainPic),
    outerItemId,
    platform: mapShopTypeToPlatform(raw.shopType),
    price: toNumberValue(raw.originalPrice),
    promotionUrl: toStringValue(raw.itemLink),
    shopName: toStringValue(raw.shopName, "第三方店铺"),
    shortTitle: toStringValue(raw.dtitle, title),
    source: "dataoke",
    status: "active",
    title,
    updatedAt: now,
  };
}

export function mapDataokePrivilegeLinkToPromotionLink(
  result: DataokePrivilegeLinkResult,
  productId: string,
  outerItemId: string | number,
): PromotionLink {
  const now = new Date().toISOString();

  return {
    couponUrl: toStringValue(result.couponClickUrl),
    createdAt: now,
    id: `dataoke-promotion-${productId}`,
    outerItemId: String(outerItemId),
    platform: "taobao",
    productId,
    promotionPositionId: "",
    promotionUrl: toStringValue(result.itemUrl || result.shortUrl),
    source: "dataoke",
    status: "active",
    tpwd: toStringValue(result.tpwd),
    updatedAt: now,
    // TODO: PromotionLink 类型后续如增加 raw 字段，可保留完整大淘客转链响应。
  };
}

export function mapDataokeSuperCategoryToCategory(
  raw: DataokeSuperCategory,
): Category {
  const now = new Date().toISOString();
  const cid = toStringValue(raw.cid, "unknown");
  const name = toStringValue(raw.cname, "大淘客分类");
  const sortOrder = toNumberValue(raw.cid);

  return {
    createdAt: now,
    description: `${name}相关优惠商品和导购内容`,
    id: `dataoke-${cid}`,
    name,
    seoDescription: `精选${name}相关实用好物、优惠券商品和导购内容`,
    seoTitle: `${name}优惠商品推荐`,
    slug: `dataoke-${cid}`,
    sortOrder,
    status: "active",
    updatedAt: now,
  };
}
