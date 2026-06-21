import { prisma } from "@/lib/prisma";

export type PromotionLinkRedirectTarget = {
  productId: string;
  targetUrl: string;
};

function getSafeRedirectUrl(...urls: Array<string | null>) {
  for (const value of urls) {
    if (!value) {
      continue;
    }

    try {
      const url = new URL(value);

      if (url.protocol === "https:" || url.protocol === "http:") {
        return url.toString();
      }
    } catch {
      // Invalid persisted URLs are treated as unavailable rather than exposed.
    }
  }

  return null;
}

/** Resolves an active local promotion link for a publicly visible Product. */
export async function getPromotionLinkForRedirect(
  productId: string,
): Promise<PromotionLinkRedirectTarget | null> {
  const promotionLink = await prisma.promotionLink.findFirst({
    orderBy: { updatedAt: "desc" },
    select: {
      couponUrl: true,
      productId: true,
      promotionUrl: true,
      shortUrl: true,
    },
    where: {
      productId,
      status: "active",
      product: {
        is: {
          isManualHidden: false,
          status: "active",
        },
      },
    },
  });

  if (!promotionLink) {
    return null;
  }

  const targetUrl = getSafeRedirectUrl(
    promotionLink.couponUrl,
    promotionLink.promotionUrl,
    promotionLink.shortUrl,
  );

  return targetUrl ? { productId: promotionLink.productId, targetUrl } : null;
}
