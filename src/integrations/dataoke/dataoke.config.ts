import { dataokeEndpoints } from "./dataoke.endpoints";

export const dataokeConfig = {
  apiBaseUrl:
    process.env.DATAOKE_API_BASE_URL ?? "https://openapi.dataoke.com",
  appKey: process.env.DATAOKE_APP_KEY ?? "",
  appSecret: process.env.DATAOKE_APP_SECRET ?? "",
  enableRealApi: process.env.DATAOKE_ENABLE_REAL_API === "true",
  goodsListVersion:
    process.env.DATAOKE_GOODS_LIST_VERSION ??
    dataokeEndpoints.goodsList.defaultVersion,
  pid: process.env.DATAOKE_PID ?? "",
  privilegeLinkVersion:
    process.env.DATAOKE_PRIVILEGE_LINK_VERSION ??
    dataokeEndpoints.privilegeLink.defaultVersion,
  searchVersion:
    process.env.DATAOKE_SEARCH_VERSION ??
    dataokeEndpoints.searchGoods.defaultVersion,
  signMode: process.env.DATAOKE_SIGN_MODE ?? "new",
  superCategoryVersion:
    process.env.DATAOKE_SUPER_CATEGORY_VERSION ??
    dataokeEndpoints.superCategory.defaultVersion,
} as const;

export function getDataokeCredentialError() {
  if (!dataokeConfig.appKey) {
    return "Dataoke appKey is missing. Set DATAOKE_APP_KEY in local .env.";
  }

  if (!dataokeConfig.appSecret) {
    return "Dataoke appSecret is missing. Set DATAOKE_APP_SECRET in local .env.";
  }

  return null;
}
