export const dataokeConfig = {
  apiBaseUrl:
    process.env.DATAOKE_API_BASE_URL ?? "https://openapi.dataoke.com/api",
  appKey: process.env.DATAOKE_APP_KEY ?? "",
  appSecret: process.env.DATAOKE_APP_SECRET ?? "",
  defaultVersion: process.env.DATAOKE_DEFAULT_VERSION ?? "v1.0.0",
  enableRealApi: process.env.DATAOKE_ENABLE_REAL_API === "true",
  pid: process.env.DATAOKE_PID ?? "",
} as const;
