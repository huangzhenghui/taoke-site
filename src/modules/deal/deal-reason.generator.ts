import type { Product } from "@/modules/product";

export type HotRankingWindow = "today" | "two_hours" | "week";

export type DealReasonSignal = {
  label: string;
  tone: "amber" | "emerald" | "red" | "zinc";
  value: string;
};

function hasPositiveNumber(value: number | undefined) {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function formatPrice(value: number | undefined) {
  return hasPositiveNumber(value) ? `¥${value}` : "";
}

function getSceneLabel(product: Product) {
  const text = [
    product.title,
    product.shortTitle,
    product.description,
    product.categoryName,
  ].join(" ");

  if (/护眼灯|台灯|学习灯|LED台灯|国AA|学生台灯|宿舍台灯/i.test(text)) {
    return "适合学习桌、宿舍或办公桌面照明";
  }

  if (/收纳|置物|整理|储物/.test(text)) {
    return "适合提升居家收纳和日常整理效率";
  }

  if (/防蚊|防晒|清凉|夏季|速干/.test(text)) {
    return "适合夏季通勤、居家或户外场景";
  }

  if (/厨房|锅|杯|壶|餐具|保鲜/.test(text)) {
    return "适合厨房、餐桌和日常饮食场景";
  }

  if (/办公|桌面|电脑|键盘|支架/.test(text)) {
    return "适合办公桌面和日常效率场景";
  }

  return product.categoryName
    ? `适合正在比较${product.categoryName}类商品的人`
    : "适合先作为优惠候选继续比较";
}

function getSalesSignal(product: Product): DealReasonSignal | null {
  if (hasPositiveNumber(product.twoHoursSales)) {
    return {
      label: "近 2 小时",
      tone: "red",
      value: `${product.twoHoursSales} 件热度`,
    };
  }

  if (hasPositiveNumber(product.dailySales)) {
    return {
      label: "今日销量",
      tone: "red",
      value: `${product.dailySales} 件`,
    };
  }

  if (hasPositiveNumber(product.monthSales)) {
    return {
      label: "月销量",
      tone: "zinc",
      value: `${product.monthSales} 件`,
    };
  }

  return null;
}

function getPriceAdvantageSignal(product: Product): DealReasonSignal | null {
  if (!hasPositiveNumber(product.price) || !hasPositiveNumber(product.finalPrice)) {
    return null;
  }

  const savedAmount = product.price - product.finalPrice;

  if (savedAmount <= 0) {
    return null;
  }

  return {
    label: "到手省",
    tone: "amber",
    value: formatPrice(savedAmount),
  };
}

export function getProductHotScore(product: Product) {
  const twoHoursSales = product.twoHoursSales ?? 0;
  const dailySales = product.dailySales ?? 0;
  const monthSales = product.monthSales ?? 0;
  const couponAmount = product.couponAmount ?? 0;
  const finalPrice = product.finalPrice ?? 0;
  const infoScore =
    (product.title ? 5 : 0) +
    (product.mainImage ? 5 : 0) +
    (product.outerItemId ? 4 : 0) +
    (product.shopName ? 2 : 0) +
    (product.categoryName ? 2 : 0);

  return (
    twoHoursSales * 5 +
    dailySales * 3 +
    monthSales * 0.2 +
    couponAmount * 2 +
    infoScore -
    (finalPrice <= 0 ? 20 : 0)
  );
}

export function getDealReasonSignals(product: Product): DealReasonSignal[] {
  const signals: DealReasonSignal[] = [];

  if (hasPositiveNumber(product.finalPrice)) {
    signals.push({
      label: "券后价",
      tone: "red",
      value: formatPrice(product.finalPrice),
    });
  }

  if (hasPositiveNumber(product.couponAmount)) {
    signals.push({
      label: "优惠券",
      tone: "amber",
      value: formatPrice(product.couponAmount),
    });
  }

  const priceAdvantageSignal = getPriceAdvantageSignal(product);

  if (priceAdvantageSignal) {
    signals.push(priceAdvantageSignal);
  }

  const salesSignal = getSalesSignal(product);

  if (salesSignal) {
    signals.push(salesSignal);
  }

  signals.push({
    label: "适用场景",
    tone: "emerald",
    value: getSceneLabel(product),
  });

  return signals.slice(0, 4);
}

export function generateDealReason(product: Product) {
  const parts: string[] = [];
  const finalPrice = formatPrice(product.finalPrice);

  if (finalPrice) {
    parts.push(`券后价约 ${finalPrice}`);
  }

  if (hasPositiveNumber(product.couponAmount)) {
    parts.push(`可关注约 ${formatPrice(product.couponAmount)} 优惠券`);
  }

  if (hasPositiveNumber(product.twoHoursSales)) {
    parts.push(`近 2 小时销量约 ${product.twoHoursSales}`);
  } else if (hasPositiveNumber(product.dailySales)) {
    parts.push(`日销量约 ${product.dailySales}`);
  } else if (hasPositiveNumber(product.monthSales)) {
    parts.push(`月销量约 ${product.monthSales}`);
  }

  parts.push(getSceneLabel(product));

  if (parts.length === 1) {
    return `${parts[0]}。建议进入详情页继续对比价格、优惠和店铺信息。`;
  }

  return `${parts.join("，")}。优惠和最终价格以跳转后平台页面为准。`;
}

export function getFreshnessLabel(product: Product) {
  const updatedAt = new Date(product.updatedAt);

  if (Number.isNaN(updatedAt.getTime())) {
    return "近期更新";
  }

  const diffMs = Date.now() - updatedAt.getTime();
  const diffHours = Math.max(Math.floor(diffMs / 3_600_000), 0);

  if (diffHours < 1) {
    return "刚刚更新";
  }

  if (diffHours < 24) {
    return `${diffHours} 小时前更新`;
  }

  const diffDays = Math.floor(diffHours / 24);

  return `${diffDays} 天前更新`;
}

export function getRankingWindowLabel(window: HotRankingWindow) {
  const labels: Record<HotRankingWindow, string> = {
    today: "今日热门",
    two_hours: "近 2 小时热卖",
    week: "本周热门",
  };

  return labels[window];
}

export function getRankingReason(
  product: Product,
  window: HotRankingWindow = "today",
) {
  if (window === "two_hours") {
    if (hasPositiveNumber(product.twoHoursSales)) {
      return `近 2 小时约 ${product.twoHoursSales} 件热度，适合优先查看`;
    }

    if (hasPositiveNumber(product.dailySales)) {
      return `今日约 ${product.dailySales} 件销量，近期热度较高`;
    }

    return "近期更新，暂无明确 2 小时销量";
  }

  if (window === "week") {
    if (hasPositiveNumber(product.monthSales)) {
      return `月销量约 ${product.monthSales} 件，属于稳定热卖款`;
    }

    if (hasPositiveNumber(product.dailySales)) {
      return `今日约 ${product.dailySales} 件销量，可继续观察`;
    }

    return "近期更新，适合作为本周候选继续比较";
  }

  if (hasPositiveNumber(product.dailySales)) {
    return `今日约 ${product.dailySales} 件销量，关注度靠前`;
  }

  if (hasPositiveNumber(product.twoHoursSales)) {
    return `近 2 小时约 ${product.twoHoursSales} 件热度，短时表现不错`;
  }

  return "今日更新或近期有优惠，建议结合价格继续判断";
}
