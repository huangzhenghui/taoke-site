export { mockProducts } from "./product.mock";
export {
  getActiveProducts,
  getAllProducts,
  getProductById,
  getProductsByCategorySlug,
  getProductsByIds,
  searchProductsByKeyword,
} from "./product.service";
export { getAdminProductsFromDb } from "./product-db.service";
export type { AdminProductsDbQuery } from "./product-db.service";
export type {
  AdminProductWithQualityIssues,
  ProductQualityIssue,
} from "./product-db.service";
export type {
  Product,
  ProductPlatform,
  ProductSource,
  ProductStatus,
} from "./product.types";
