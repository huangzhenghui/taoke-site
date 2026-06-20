export { mockProducts } from "./product.mock";
export {
  getActiveProducts,
  getAllProducts,
  getProductById,
  getProductsByCategorySlug,
  getProductsByIds,
  searchProductsByKeyword,
} from "./product.service";
export type {
  Product,
  ProductPlatform,
  ProductSource,
  ProductStatus,
} from "./product.types";
