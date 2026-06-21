import { mockProducts } from "@/modules/product";

import type { PromotionLink, PromotionLinkStatus } from "./promotion-link.types";

function getPromotionLinkStatus(productStatus: string): PromotionLinkStatus {
  if (productStatus === "expired") {
    return "expired";
  }

  if (productStatus === "active") {
    return "active";
  }

  return "inactive";
}

export const mockPromotionLinks: PromotionLink[] = mockProducts.map(
  (product, index) => ({
    id: `mock-promotion-link-${String(index + 1).padStart(3, "0")}`,
    productId: product.id,
    platform: product.platform,
    source: product.source,
    outerItemId: product.outerItemId,
    promotionUrl: product.promotionUrl,
    couponUrl: product.couponUrl,
    tpwd: `￥MOCK${String(index + 1).padStart(4, "0")}￥`,
    promotionPositionId: `mock-position-${String(index + 1).padStart(3, "0")}`,
    status: getPromotionLinkStatus(product.status),
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  }),
);
