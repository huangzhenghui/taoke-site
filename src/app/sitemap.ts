import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site";
import { mockProducts } from "@/modules/product";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const categorySlugs = Array.from(
    new Set(mockProducts.map((product) => product.categoryId)),
  );

  return [
    {
      changeFrequency: "daily",
      lastModified: now,
      priority: 1,
      url: getSiteUrl("/"),
    },
    ...mockProducts.map((product) => ({
      changeFrequency: "weekly" as const,
      lastModified: new Date(product.updatedAt),
      priority: 0.8,
      url: getSiteUrl(`/item/${product.id}`),
    })),
    ...categorySlugs.map((slug) => ({
      changeFrequency: "daily" as const,
      lastModified: now,
      priority: 0.7,
      url: getSiteUrl(`/category/${slug}`),
    })),
  ];
}
