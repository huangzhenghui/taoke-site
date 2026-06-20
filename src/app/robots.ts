import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        allow: ["/", "/item/", "/category/", "/article/"],
        userAgent: "*",
      },
    ],
    sitemap: getSiteUrl("/sitemap.xml"),
  };
}
