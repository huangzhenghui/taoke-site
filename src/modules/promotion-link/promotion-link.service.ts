import { mockPromotionLinks } from "./promotion-link.mock";

export function getAllPromotionLinks() {
  return [...mockPromotionLinks];
}

export function getPromotionLinkByProductId(productId: string) {
  return mockPromotionLinks.find((promotionLink) => promotionLink.productId === productId);
}

export function getActivePromotionLinkByProductId(productId: string) {
  const promotionLink = getPromotionLinkByProductId(productId);

  if (promotionLink?.status !== "active") {
    return undefined;
  }

  return promotionLink;
}
