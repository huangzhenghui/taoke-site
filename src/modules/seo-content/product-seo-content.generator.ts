import {
  buildEyeProtectionLampSeoContent,
  isEyeProtectionLampProduct,
} from "./eye-protection-lamp.template";
import type {
  ProductSeoContent,
  ProductSeoContentInput,
} from "./seo-content.types";

function hasPositiveNumber(value: number | undefined) {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function collectRiskFlags(product: ProductSeoContentInput) {
  const riskFlags: string[] = [];

  if (!product.title?.trim()) {
    riskFlags.push("missing_title");
  }

  if (!product.outerItemId?.trim()) {
    riskFlags.push("missing_outer_item_id");
  }

  if (!hasPositiveNumber(product.finalPrice)) {
    riskFlags.push("missing_final_price");
  }

  if (!product.mainImage?.trim()) {
    riskFlags.push("missing_main_image");
  }

  if (!product.description?.trim()) {
    riskFlags.push("missing_description");
  }

  if (!product.shopName?.trim()) {
    riskFlags.push("missing_shop_name");
  }

  return riskFlags;
}

function buildGenericProductSeoContent(
  product: ProductSeoContentInput,
  riskFlags: string[],
): ProductSeoContent {
  const title = product.shortTitle || product.title || "当前商品";
  const highlights = [
    hasPositiveNumber(product.finalPrice)
      ? `当前展示券后参考价约 ¥${product.finalPrice}，适合先判断是否符合预算。`
      : "",
    hasPositiveNumber(product.couponAmount)
      ? `页面显示有约 ¥${product.couponAmount} 优惠券，建议跳转后确认券是否仍可领取。`
      : "",
    product.shopName ? `商品来自「${product.shopName}」，可进一步查看店铺评分和售后。` : "",
    product.categoryName ? `归属类目为「${product.categoryName}」，适合和同类商品横向比较。` : "",
    hasPositiveNumber(product.monthSales)
      ? `页面记录月销量约 ${product.monthSales}，可作为热度参考，不等同于真实体验。`
      : "",
  ].filter(Boolean);

  return {
    buyingAdvice:
      "建议先确认价格、优惠券、店铺和核心参数是否符合需求，再跳转到平台详情页核对规格、售后、券状态和最终到手价。",
    faqs: [
      {
        answer:
          "本站只根据已入库的商品标题、价格、优惠券、店铺和类目信息生成导购提示，不替代平台详情页和实际售后说明。",
        question: "这个推荐依据是什么？",
      },
      {
        answer: hasPositiveNumber(product.couponAmount)
          ? "页面显示当前商品有优惠券信息，但优惠券可能随平台活动变化，下单前请以跳转后的平台页面为准。"
          : "当前站内资料未显示明确优惠券金额，下单前建议以平台页面的实时价格和活动为准。",
        question: "优惠券一定能领取吗？",
      },
      {
        answer:
          "可以重点比较券后价、店铺、品牌或类目参数；如果关键字段缺失，建议先不要只凭标题做决定。",
        question: "同类商品怎么比较？",
      },
    ],
    highlights:
      highlights.length > 0
        ? highlights
        : ["当前商品信息较少，建议跳转到平台详情页核对完整参数。"],
    notSuitableFor: [
      "需要真实测评、长期使用体验或专业实验数据的人。",
      "不愿意到平台详情页再次核对价格和券状态的人。",
    ],
    riskFlags,
    summary: `${title} 可以作为当前类目的优惠候选，建议结合券后价、店铺信息和平台详情页参数再决定是否下单。`,
    suitableFor: [
      "希望快速筛选优惠商品的人。",
      "愿意在下单前继续核对平台详情和售后的人。",
      product.categoryName ? `正在比较「${product.categoryName}」类商品的人。` : "正在比较同类商品的人。",
    ],
  };
}

export function generateProductSeoContent(
  product: ProductSeoContentInput,
): ProductSeoContent {
  const riskFlags = collectRiskFlags(product);

  if (isEyeProtectionLampProduct(product)) {
    return buildEyeProtectionLampSeoContent(product, riskFlags);
  }

  return buildGenericProductSeoContent(product, riskFlags);
}
