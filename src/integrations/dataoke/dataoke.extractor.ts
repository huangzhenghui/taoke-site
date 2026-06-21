import type { DataokeRawProduct } from "./dataoke.types";

export type ExtractedDataokeSearchResult = {
  detectedPath: string;
  list: DataokeRawProduct[];
  pageId?: string;
  totalNum?: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getPathValue(value: unknown, path: string[]) {
  return path.reduce<unknown>((currentValue, key) => {
    if (!isRecord(currentValue)) {
      return undefined;
    }

    return currentValue[key];
  }, value);
}

function getStringFieldValue(record: Record<string, unknown>, key: string) {
  const value = record[key];

  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  return String(value);
}

function getNumberFieldValue(record: Record<string, unknown>, key: string) {
  const value = Number(record[key]);

  return Number.isFinite(value) ? value : undefined;
}

function getSearchResultFromContainer(
  container: unknown,
): Omit<ExtractedDataokeSearchResult, "detectedPath"> | null {
  if (!isRecord(container) || !Array.isArray(container.list)) {
    return null;
  }

  return {
    list: container.list.filter(isRecord) as DataokeRawProduct[],
    pageId: getStringFieldValue(container, "pageId"),
    totalNum: getNumberFieldValue(container, "totalNum"),
  };
}

export function extractDataokeSearchResult(
  raw: unknown,
): ExtractedDataokeSearchResult {
  const candidates = [
    { path: ["data", "data"], detectedPath: "raw.data.data.list" },
    { path: ["data"], detectedPath: "raw.data.list" },
    {
      path: ["data", "data", "data"],
      detectedPath: "raw.data.data.data.list",
    },
    { path: ["result"], detectedPath: "raw.result.list" },
    { path: [], detectedPath: "raw.list" },
  ];

  for (const candidate of candidates) {
    const result = getSearchResultFromContainer(
      getPathValue(raw, candidate.path),
    );

    if (result) {
      return {
        ...result,
        detectedPath: candidate.detectedPath,
      };
    }
  }

  return {
    detectedPath: "not_found",
    list: [],
  };
}
