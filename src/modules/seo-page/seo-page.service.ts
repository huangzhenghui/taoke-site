import { mockSeoPages } from "./seo-page.mock";

export function getAllSeoPages() {
  return [...mockSeoPages];
}

export function getPublishedSeoPages() {
  return mockSeoPages.filter((seoPage) => seoPage.status === "published");
}

export function getSeoPageBySlug(slug: string) {
  return mockSeoPages.find((seoPage) => seoPage.slug === slug);
}

export function getSeoPagesByIds(ids: string[]) {
  return ids
    .map((id) => mockSeoPages.find((seoPage) => seoPage.id === id))
    .filter((seoPage) => seoPage !== undefined);
}

export function getSeoPagesByCategoryId(categoryId: string) {
  return mockSeoPages.filter((seoPage) => seoPage.categoryId === categoryId);
}

export function searchSeoPagesByKeyword(keyword: string) {
  const normalizedKeyword = keyword.trim().toLowerCase();

  if (!normalizedKeyword) {
    return getAllSeoPages();
  }

  return mockSeoPages.filter((seoPage) =>
    [
      seoPage.title,
      seoPage.description,
      seoPage.h1,
      seoPage.intro,
      ...seoPage.keywords,
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalizedKeyword),
  );
}
