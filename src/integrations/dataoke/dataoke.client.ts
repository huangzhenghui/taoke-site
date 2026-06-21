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

export type DataokeSafeRequestSummary = {
  businessParamKeys: string[];
  businessParamsPreview: Partial<
    Pick<
      DataokeRequestParams,
      "cids" | "hasCoupon" | "keyWords" | "pageId" | "pageSize" | "sort"
    >
  >;
  endpointPath: string;
  endpointVersion: string;
  hasAppKey: boolean;
  hasAppSecret: boolean;
  hasSignRan: boolean;
  nonceLength: number;
  signRanLength: number;
  signRanPrefix: string;
  timerLength: number;
};

export type DataokeSafeErrorSummary = {
  contentType?: string;
  endpointPath: string;
  endpointVersion: string;
  httpStatus?: number;
  method: "GET";
  responseTextPreview?: string;
};

export class DataokeClientError extends Error {
  details: DataokeApiError;

  constructor(details: DataokeApiError) {
    super(details.message);
    this.name = "DataokeClientError";
    this.details = details;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getNumberField(record: Record<string, unknown>, key: string) {
  const value = record[key];

  return typeof value === "number" ? value : undefined;
}

function getStringField(record: Record<string, unknown>, key: string) {
  const value = record[key];

  return typeof value === "string" ? value : undefined;
}

function createSafeErrorSummary(
  endpointPath: string,
  endpointVersion: string,
  extra: Partial<DataokeSafeErrorSummary> = {},
): DataokeSafeErrorSummary {
  return {
    endpointPath,
    endpointVersion,
    method: "GET",
    ...extra,
  };
}

function getBusinessParamsPreview(businessParams: DataokeRequestParams) {
  const previewKeys = [
    "pageId",
    "pageSize",
    "keyWords",
    "cids",
    "sort",
    "hasCoupon",
  ] as const;
  const preview: DataokeSafeRequestSummary["businessParamsPreview"] = {};

  previewKeys.forEach((key) => {
    const value = businessParams[key];

    if (value !== undefined) {
      preview[key] = value;
    }
  });

  return preview;
}

function createSafeRequestSummary(
  endpointPath: string,
  endpointVersion: string,
  businessParams: DataokeRequestParams,
  signedParams: DataokeSignedParams,
): DataokeSafeRequestSummary {
  return {
    businessParamKeys: Object.keys(businessParams)
      .filter((key) => businessParams[key] !== undefined)
      .sort(),
    businessParamsPreview: getBusinessParamsPreview(businessParams),
    endpointPath,
    endpointVersion,
    hasAppKey: Boolean(signedParams.appKey),
    hasAppSecret: Boolean(dataokeConfig.appSecret),
    hasSignRan: Boolean(signedParams.signRan),
    nonceLength: signedParams.nonce.length,
    signRanLength: signedParams.signRan.length,
    signRanPrefix: signedParams.signRan.slice(0, 6),
    timerLength: signedParams.timer.length,
  };
}

function createDiagnosticRaw(
  safeRequestSummary: DataokeSafeRequestSummary,
  safeErrorSummary: DataokeSafeErrorSummary,
) {
  return {
    safeErrorSummary,
    safeRequestSummary,
  };
}

function validateDataokeResponse(
  json: unknown,
  safeRequestSummary: DataokeSafeRequestSummary,
  endpointPath: string,
  endpointVersion: string,
) {
  if (!isRecord(json)) {
    throw new DataokeClientError({
      code: "DATAOKE_INVALID_JSON",
      message: "Dataoke API returned an invalid JSON structure.",
      raw: createDiagnosticRaw(
        safeRequestSummary,
        createSafeErrorSummary(endpointPath, endpointVersion),
      ),
    });
  }

  const status = getNumberField(json, "status");
  const topLevelCode = getNumberField(json, "code");
  const message = getStringField(json, "msg") ?? "Dataoke API request failed.";

  if (status !== undefined && status !== 0 && status !== 200) {
    throw new DataokeClientError({
      code: "DATAOKE_API_STATUS_ERROR",
      message: `Dataoke API returned status ${status}: ${message}`,
      raw: createDiagnosticRaw(
        safeRequestSummary,
        createSafeErrorSummary(endpointPath, endpointVersion),
      ),
    });
  }

  if (topLevelCode !== undefined && topLevelCode !== 0) {
    throw new DataokeClientError({
      code: "DATAOKE_API_CODE_ERROR",
      message: `Dataoke API returned code ${topLevelCode}: ${message}`,
      raw: createDiagnosticRaw(
        safeRequestSummary,
        createSafeErrorSummary(endpointPath, endpointVersion),
      ),
    });
  }

  const data = json.data;

  if (isRecord(data)) {
    const innerCode = getNumberField(data, "code");
    const innerMessage =
      getStringField(data, "msg") ?? "Dataoke API request failed.";

    if (innerCode !== undefined && innerCode !== 0) {
      throw new DataokeClientError({
        code: "DATAOKE_API_INNER_CODE_ERROR",
        message: `Dataoke API returned code ${innerCode}: ${innerMessage}`,
        raw: createDiagnosticRaw(
          safeRequestSummary,
          createSafeErrorSummary(endpointPath, endpointVersion),
        ),
      });
    }
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
    const safeRequestSummary = createSafeRequestSummary(
      path,
      version,
      businessParams,
      signedParams,
    );
    const requestUrl = this.buildRequestUrl(path, signedParams);

    const response = await fetch(requestUrl, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "User-Agent": "taoke-site-dataoke-client/1.0",
      },
      method: "GET",
    });

    if (!response.ok) {
      const responseText = await response.text().catch(() => "");
      const safeErrorSummary = createSafeErrorSummary(path, version, {
        contentType: response.headers.get("content-type") ?? undefined,
        httpStatus: response.status,
        responseTextPreview: responseText.slice(0, 300),
      });

      throw new DataokeClientError({
        code: "DATAOKE_HTTP_ERROR",
        message: `Dataoke API HTTP request failed with status ${response.status}.`,
        raw: createDiagnosticRaw(safeRequestSummary, safeErrorSummary),
      });
    }

    let json: unknown;

    try {
      json = await response.json();
    } catch {
      throw new DataokeClientError({
        code: "DATAOKE_JSON_PARSE_ERROR",
        message: "Dataoke API returned a response that could not be parsed.",
        raw: createDiagnosticRaw(
          safeRequestSummary,
          createSafeErrorSummary(path, version),
        ),
      });
    }

    validateDataokeResponse(json, safeRequestSummary, path, version);

    return json as TResponse;
  }
}

export const dataokeClient = new DataokeClient();
