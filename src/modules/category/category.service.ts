import { mockCategories } from "./category.mock";

export function getAllCategories() {
  return [...mockCategories].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getActiveCategories() {
  return getAllCategories().filter((category) => category.status === "active");
}

export function getCategoryBySlug(slug: string) {
  return mockCategories.find((category) => category.slug === slug);
}

export function getCategoryById(id: string) {
  return mockCategories.find((category) => category.id === id);
}

export function searchCategoriesByKeyword(keyword: string) {
  const normalizedKeyword = keyword.trim().toLowerCase();

  if (!normalizedKeyword) {
    return getAllCategories();
  }

  return getAllCategories().filter((category) =>
    [
      category.name,
      category.description,
      category.seoTitle,
      category.seoDescription,
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalizedKeyword),
  );
}
