function normalizeSiteUrl(value: string | undefined) {
  const fallbackSiteUrl = "https://spendsmart.cn";
  const siteUrl = value?.trim() || fallbackSiteUrl;
  const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(
    siteUrl,
  );

  if (process.env.NODE_ENV === "production" && isLocalhost) {
    return fallbackSiteUrl;
  }

  return siteUrl.replace(/\/+$/, "");
}

export const siteConfig = {
  icpText: "备案号待备案通过后填写",
  siteDescription: "专注实用好物与优惠导购",
  siteName: "好物精选",
  siteUrl: normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
} as const;

export function getSiteUrl(path = "/") {
  return new URL(path, siteConfig.siteUrl).toString();
}
