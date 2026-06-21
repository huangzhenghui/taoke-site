"use server";

import { dataokeConfig } from "@/integrations/dataoke";
import { revalidatePath } from "next/cache";
import {
  batchGenerateDataokePromotionLinks,
  type DataokeLinkBatchResult,
} from "@/modules/dataoke-sync";

function getLimit(formData: FormData) {
  const value = formData.get("limit");
  const numberValue = typeof value === "string" ? Number(value) : NaN;

  return Number.isFinite(numberValue) ? numberValue : 10;
}

function getOnlyMissing(formData: FormData) {
  return formData.get("onlyMissing") !== "false";
}

export async function batchGenerateDataokePromotionLinksAction(
  _previousState: DataokeLinkBatchResult,
  formData: FormData,
): Promise<DataokeLinkBatchResult> {
  void _previousState;

  const result = await batchGenerateDataokePromotionLinks({
    limit: getLimit(formData),
    onlyMissing: getOnlyMissing(formData),
    source: "dataoke",
  });

  if (result.createdCount > 0 || result.updatedCount > 0) {
    revalidatePath("/admin/dataoke-link-batch");
    revalidatePath("/admin/products");
  }

  if (!dataokeConfig.enableRealApi) {
    return result;
  }

  return result;
}
