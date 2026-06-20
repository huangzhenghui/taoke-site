export const siteConfig = {
  icpText: "备案号待备案通过后填写",
  siteDescription: "专注实用好物与优惠导购",
  siteName: "好物精选",
  siteUrl: "http://localhost:3000",
} as const;

export function getSiteUrl(path = "/") {
  return new URL(path, siteConfig.siteUrl).toString();
}
