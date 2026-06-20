export type SeoPageStatus = "draft" | "published" | "archived";

export type SeoPage = {
  id: string;
  slug: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  keywords: string[];
  categoryId: string;
  categoryName: string;
  relatedProductIds: string[];
  relatedArticleIds: string[];
  status: SeoPageStatus;
  createdAt: string;
  updatedAt: string;
};
