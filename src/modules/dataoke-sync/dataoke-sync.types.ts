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

export type DataokeImportFailure = {
  message: string;
  outerItemId: string;
  safeCode?: string;
};

export type DataokeImportSummary = {
  createdCount: number;
  failedCount: number;
  skippedCount: number;
  totalCount: number;
  updatedCount: number;
};

export type DataokeImportResult = {
  failures: DataokeImportFailure[];
  message: string;
  success: boolean;
  summary: DataokeImportSummary;
};
