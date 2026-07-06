import type {
  ProductSeoContent,
  ProductSeoContentInput,
} from "./seo-content.types";

const eyeProtectionLampKeywords = [
  "护眼灯",
  "台灯",
  "学习灯",
  "LED台灯",
  "led台灯",
  "国AA",
  "国a",
  "AA级",
];

function hasPositiveNumber(value: number | undefined) {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function formatCurrency(value: number | undefined) {
  return hasPositiveNumber(value) ? `约 ¥${value}` : "";
}

export function isEyeProtectionLampProduct(product: ProductSeoContentInput) {
  const searchableText = [
    product.title,
    product.shortTitle,
    product.categoryName,
    product.description,
  ].join(" ");

  return eyeProtectionLampKeywords.some((keyword) =>
    searchableText.includes(keyword),
  );
}

export function buildEyeProtectionLampSeoContent(
  product: ProductSeoContentInput,
  riskFlags: string[],
): ProductSeoContent {
  const title = product.shortTitle || product.title;
  const finalPriceText = formatCurrency(product.finalPrice);
  const hasCoupon = hasPositiveNumber(product.couponAmount);
  const hasNationalAa = /国AA|国a|AA级/i.test(product.title);
  const hasLed = /LED|led/.test(product.title);
  const hasStudyKeyword = /学习|写作业|儿童|学生/.test(product.title);
  const hasSales = hasPositiveNumber(product.monthSales);
  const highlights = [
    finalPriceText ? `当前展示券后参考价为 ${finalPriceText}，适合先按预算筛选。` : "",
    hasCoupon ? `页面显示有约 ¥${product.couponAmount} 优惠券，下单前建议确认平台券是否仍可领取。` : "",
    product.shopName ? `商品来自「${product.shopName}」，可进一步查看店铺评分和售后规则。` : "",
    hasNationalAa ? "标题中提到国AA或AA级照度，适合重点关注桌面照明均匀度的人群继续比对参数。" : "",
    hasLed ? "标题中提到 LED 台灯，购买时建议继续核对频闪、色温和显色指数等信息。" : "",
    hasSales ? `页面记录月销量约 ${product.monthSales}，可作为热度参考，但不等同于真实测评结论。` : "",
  ].filter(Boolean);

  return {
    buyingAdvice:
      "护眼台灯优先看照度等级、频闪说明、色温范围、显色指数和照射范围；价格合适只是第一步，最终仍建议到平台详情页核对完整参数、售后和券状态。",
    faqs: [
      {
        answer: hasStudyKeyword
          ? "标题中出现学习、儿童或学生等场景词，说明它面向学习桌面使用；但是否适合长期写作业，还要看平台详情页中的照度、频闪、色温和显色指数参数。"
          : "当前商品可作为桌面照明候选，但页面资料不足以直接判断是否专为孩子写作业设计，建议继续核对照度等级和频闪说明。",
        question: "这款台灯适合孩子写作业吗？",
      },
      {
        answer: hasNationalAa
          ? "标题中提到国AA或AA级，通常说明卖点与照度等级有关；仍建议以平台详情页标注的执行标准和检测信息为准。"
          : "当前站内资料没有明确看到国AA信息，如果你特别在意学习照明标准，建议优先选择明确标注照度等级的款式。",
        question: "需要优先看国AA照度吗？",
      },
      {
        answer:
          "建议关注是否说明无可视频闪、色温是否适合夜间学习、显色指数是否明确，以及灯头和灯臂能否覆盖常用书写区域。",
        question: "护眼台灯还要看哪些参数？",
      },
    ],
    highlights:
      highlights.length > 0
        ? highlights
        : ["当前商品信息较少，建议先查看平台详情页确认核心照明参数。"],
    notSuitableFor: [
      "需要明确实测频闪、照度曲线或专业测评数据的人。",
      "只想买装饰氛围灯、对学习桌照明没有要求的人。",
      "需要落地灯、床头灯或大范围空间照明的人。",
    ],
    riskFlags,
    summary: `${title} 更适合作为学习或办公桌面照明候选，重点应继续核对照度、频闪、色温和显色指数，不建议只看“护眼”关键词就下单。`,
    suitableFor: [
      "需要给儿童学习桌、书桌或办公桌补充局部照明的人。",
      "希望先从券后价、店铺和标题参数中筛选台灯候选的人。",
      "愿意在跳转到平台后继续核对照明参数和售后政策的人。",
    ],
  };
}
