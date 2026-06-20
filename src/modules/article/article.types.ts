export type ArticleStatus = "draft" | "published" | "archived";

export type Article = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  coverImage: string;
  categoryId: string;
  categoryName: string;
  tags: string[];
  relatedProductIds: string[];
  status: ArticleStatus;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
};
