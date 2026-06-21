export type ProductPlatform = "taobao" | "tmall" | "jd" | "vip" | "other";

export type ProductSource =
  | "manual"
  | "qingtaoke"
  | "alimama"
  | "dataoke"
  | "mock";

export type ProductStatus = "draft" | "active" | "inactive" | "expired";

export type Product = {
  id: string;
  platform: ProductPlatform;
  source: ProductSource;
  outerItemId: string;
  title: string;
  shortTitle: string;
  description: string;
  mainImage: string;
  price: number;
  finalPrice: number;
  couponAmount: number;
  commissionRate: number;
  shopName: string;
  categoryId: string;
  categorySlug: string;
  categoryName: string;
  promotionUrl: string;
  couponUrl: string;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
};
