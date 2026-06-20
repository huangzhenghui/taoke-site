import { mockArticles } from "./article.mock";

export function getAllArticles() {
  return [...mockArticles];
}

export function getPublishedArticles() {
  return mockArticles.filter((article) => article.status === "published");
}

export function getArticleBySlug(slug: string) {
  return mockArticles.find((article) => article.slug === slug);
}

export function getArticlesByIds(ids: string[]) {
  return ids
    .map((id) => mockArticles.find((article) => article.id === id))
    .filter((article) => article !== undefined);
}

export function getArticlesByCategoryId(categoryId: string) {
  return mockArticles.filter((article) => article.categoryId === categoryId);
}

export function searchArticlesByKeyword(keyword: string) {
  const normalizedKeyword = keyword.trim().toLowerCase();

  if (!normalizedKeyword) {
    return getAllArticles();
  }

  return mockArticles.filter((article) =>
    [article.title, article.summary, article.content, ...article.tags]
      .join(" ")
      .toLowerCase()
      .includes(normalizedKeyword),
  );
}
