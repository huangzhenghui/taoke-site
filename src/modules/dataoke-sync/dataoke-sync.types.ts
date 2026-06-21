import type { Product } from "@/modules/product";

export type DataokeImportPreviewItem = Pick<
  Product,
  | "categoryId"
  | "categoryName"
  | "categorySlug"
  | "commissionRate"
  | "couponAmount"
  | "finalPrice"
  | "id"
  | "mainImage"
  | "outerItemId"
  | "platform"
  | "price"
  | "shopName"
  | "shortTitle"
  | "source"
  | "status"
  | "title"
>;

export type DataokeSyncParams = Partial<{
  cids: string;
  commissionRateLowerLimit: number;
  hasCoupon: number;
  keyWords: string;
  monthSalesLowerLimit: number;
  pageId: string;
  pageSize: number;
  sort: string;
}>;

export type DataokeImportPreviewDetails = {
  brandId?: string;
  brandName?: string;
  couponConditions?: string;
  couponEndTime?: string;
  couponReceiveNum?: number;
  couponRemainCount?: number;
  couponStartTime?: string;
  couponTotalNum?: number;
  dailySales?: number;
  description?: string;
  images?: string[];
  monthSales?: number;
  shopLogo?: string;
  sourceCid?: string;
  sourceSubcid?: string;
  twoHoursSales?: number;
};

export type DataokeImportPreview = DataokeImportPreviewItem &
  DataokeImportPreviewDetails;

export type DataokeImportFailure = {
  message: string;
  outerItemId: string;
  title: string;
};

export type DataokeImportResult = {
  createdCount: number;
  failedCount: number;
  failedItems: DataokeImportFailure[];
  message: string;
  skippedCount: number;
  success: boolean;
  syncLogId: string | null;
  updatedCount: number;
};
