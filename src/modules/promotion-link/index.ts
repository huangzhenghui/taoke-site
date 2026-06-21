export { mockPromotionLinks } from "./promotion-link.mock";
export {
  getActivePromotionLinkByProductId,
  getAllPromotionLinks,
  getPromotionLinkByProductId,
} from "./promotion-link.service";
export { getPromotionLinkForRedirect } from "./promotion-link-db.service";
export type { PromotionLinkRedirectTarget } from "./promotion-link-db.service";
export type {
  PromotionLink,
  PromotionLinkStatus,
} from "./promotion-link.types";
