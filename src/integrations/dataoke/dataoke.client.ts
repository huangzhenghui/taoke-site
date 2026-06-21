import { dataokeConfig } from "./dataoke.config";
import type { DataokeApiError } from "./dataoke.types";

type DataokeRequestParams = Record<
  string,
  boolean | number | string | undefined
>;

export class DataokeClientError extends Error {
  details: DataokeApiError;

  constructor(details: DataokeApiError) {
    super(details.message);
    this.name = "DataokeClientError";
    this.details = details;
  }
}

export class DataokeClient {
  async request<TResponse>(
    path: string,
    params: DataokeRequestParams = {},
  ): Promise<TResponse> {
    if (!dataokeConfig.enableRealApi) {
      throw new DataokeClientError({
        code: "DATAOKE_REAL_API_DISABLED",
        message:
          "大淘客真实接口未启用，请设置 DATAOKE_ENABLE_REAL_API=true 后再联调。",
      });
    }

    if (!dataokeConfig.appKey || !dataokeConfig.appSecret) {
      throw new DataokeClientError({
        code: "DATAOKE_CREDENTIALS_MISSING",
        message: "大淘客 appKey 或 appSecret 未配置。",
      });
    }

    const url = new URL(path, dataokeConfig.apiBaseUrl);
    const requestParams = {
      appKey: dataokeConfig.appKey,
      version: dataokeConfig.defaultVersion,
      ...params,
    };

    Object.entries(requestParams).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });

    // TODO: 接入大淘客签名算法。appSecret 只允许在服务端参与签名，不能传给浏览器。
    // TODO: 根据大淘客真实响应结构统一处理 code/message/data。
    const response = await fetch(url, {
      cache: "no-store",
      method: "GET",
    });

    if (!response.ok) {
      throw new DataokeClientError({
        code: "DATAOKE_HTTP_ERROR",
        message: `大淘客接口请求失败：${response.status}`,
      });
    }

    return (await response.json()) as TResponse;
  }
}

export const dataokeClient = new DataokeClient();
