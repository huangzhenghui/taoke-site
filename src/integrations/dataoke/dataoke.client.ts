import {
  dataokeConfig,
  getDataokeCredentialError,
} from "./dataoke.config";
import {
  createDataokeNonce,
  createDataokeSignRan,
  createDataokeTimer,
} from "./dataoke.sign";
import type { DataokeApiError } from "./dataoke.types";

export type DataokeRequestParams = Record<
  string,
  boolean | number | string | undefined
>;

export type DataokeSignedParams = DataokeRequestParams & {
  appKey: string;
  nonce: string;
  signRan: string;
  timer: string;
  version: string;
};

export class DataokeClientError extends Error {
  details: DataokeApiError;

  constructor(details: DataokeApiError) {
    super(details.message);
    this.name = "DataokeClientError";
    this.details = details;
  }
}

export class DataokeClient {
  buildSignedParams(
    endpointVersion: string,
    businessParams: DataokeRequestParams = {},
  ): DataokeSignedParams {
    const credentialError = getDataokeCredentialError();

    if (credentialError) {
      throw new DataokeClientError({
        code: "DATAOKE_CREDENTIALS_MISSING",
        message: credentialError,
      });
    }

    const nonce = createDataokeNonce();
    const timer = createDataokeTimer();
    const signRan = createDataokeSignRan({
      appKey: dataokeConfig.appKey,
      appSecret: dataokeConfig.appSecret,
      nonce,
      timer,
    });

    return {
      ...businessParams,
      appKey: dataokeConfig.appKey,
      nonce,
      signRan,
      timer,
      version: endpointVersion,
    };
  }

  buildRequestUrl(path: string, params: DataokeRequestParams) {
    const url = new URL(path, dataokeConfig.apiBaseUrl);

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });

    return url.toString();
  }

  async request<TResponse>(
    path: string,
    version: string,
    businessParams: DataokeRequestParams = {},
  ): Promise<TResponse> {
    if (!dataokeConfig.enableRealApi) {
      throw new DataokeClientError({
        code: "DATAOKE_REAL_API_DISABLED",
        message:
          "Dataoke real API is disabled. Set DATAOKE_ENABLE_REAL_API=true to enable real requests.",
      });
    }

    const signedParams = this.buildSignedParams(version, businessParams);
    this.buildRequestUrl(path, signedParams);

    // TODO: 下一阶段再接入 fetch 逻辑，统一处理大淘客 code/message/data 响应结构。
    // appSecret 只允许在服务端签名，不能传给浏览器端。
    throw new DataokeClientError({
      code: "DATAOKE_REAL_REQUEST_NOT_IMPLEMENTED",
      message: "Dataoke real request is not implemented in this stage.",
    });
  }
}

export const dataokeClient = new DataokeClient();
