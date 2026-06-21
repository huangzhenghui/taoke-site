import type { ProductPlatform, ProductSource } from "@/modules/product";

export type PromotionLinkStatus = "active" | "inactive" | "expired";

export type PromotionLink = {
  id: string;
  productId: string;
  platform: ProductPlatform;
  source: ProductSource;
  outerItemId: string;
  promotionUrl: string;
  couponUrl: string;
  tpwd: string;
  promotionPositionId: string;
  status: PromotionLinkStatus;
  createdAt: string;
  updatedAt: string;
};
