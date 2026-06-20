import { mockProducts } from "./product.mock";

export function getAllProducts() {
  return [...mockProducts];
}

export function getActiveProducts() {
  return mockProducts.filter((product) => product.status === "active");
}

export function getProductById(id: string) {
  return mockProducts.find((product) => product.id === id);
}

export function getProductsByIds(ids: string[]) {
  return ids
    .map((id) => getProductById(id))
    .filter((product) => product !== undefined);
}

export function getProductsByCategorySlug(categorySlug: string) {
  return mockProducts.filter((product) => product.categorySlug === categorySlug);
}

export function searchProductsByKeyword(keyword: string) {
  const normalizedKeyword = keyword.trim().toLowerCase();

  if (!normalizedKeyword) {
    return getAllProducts();
  }

  return mockProducts.filter((product) =>
    [product.title, product.shortTitle, product.description]
      .join(" ")
      .toLowerCase()
      .includes(normalizedKeyword),
  );
}
