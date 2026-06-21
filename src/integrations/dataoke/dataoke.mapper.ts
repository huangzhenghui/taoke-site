import type { Product, ProductPlatform } from "@/modules/product";

import type { DataokeRawProduct } from "./dataoke.types";

function toStringValue(value: unknown, fallback = "") {
  if (value === null || value === undefined) {
    return fallback;
  }

  return String(value);
}

function toNumberValue(value: unknown, fallback = 0) {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function mapPlatform(raw: DataokeRawProduct): ProductPlatform {
  const platformValue = toStringValue(raw.platform ?? raw.sourceType).toLowerCase();

  if (platformValue.includes("tmall") || platformValue === "1") {
    return "tmall";
  }

  if (platformValue.includes("jd")) {
    return "jd";
  }

  if (platformValue.includes("vip")) {
    return "vip";
  }

  return "taobao";
}

export function mapDataokeProductToProduct(raw: DataokeRawProduct): Product {
  const outerItemId = toStringValue(raw.goodsId ?? raw.itemId ?? raw.id, "unknown");
  const title = toStringValue(raw.title ?? raw.dtitle ?? raw.shortTitle, "未命名商品");
  const shortTitle = toStringValue(raw.dtitle ?? raw.shortTitle ?? raw.title, title);
  const categoryId = toStringValue(raw.cid ?? raw.categoryId, "dataoke-unknown");
  const now = new Date().toISOString();

  // TODO: 等待真实大淘客接口字段确认后，补齐平台、分类、佣金、券链接等字段映射规则。
  return {
    categoryId,
    categoryName: toStringValue(raw.categoryName, "大淘客商品"),
    categorySlug: categoryId,
    commissionRate: toNumberValue(raw.commissionRate),
    couponAmount: toNumberValue(raw.couponAmount ?? raw.couponPrice),
    couponUrl: toStringValue(raw.couponLink),
    createdAt: now,
    description: toStringValue(raw.desc ?? raw.description, shortTitle),
    finalPrice: toNumberValue(raw.actualPrice ?? raw.price),
    id: `dataoke-${outerItemId}`,
    mainImage: toStringValue(raw.mainPic ?? raw.image, "https://placehold.co/800x800?text=Dataoke"),
    outerItemId,
    platform: mapPlatform(raw),
    price: toNumberValue(raw.originalPrice ?? raw.price ?? raw.actualPrice),
    promotionUrl: toStringValue(raw.itemLink),
    shopName: toStringValue(raw.shopName, "第三方店铺"),
    shortTitle,
    source: "dataoke",
    status: "draft",
    title,
    updatedAt: now,
  };
}
