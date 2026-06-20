export type CategoryStatus = "active" | "inactive";

export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  sortOrder: number;
  status: CategoryStatus;
  createdAt: string;
  updatedAt: string;
};
