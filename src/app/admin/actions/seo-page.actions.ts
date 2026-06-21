"use server";

import type { AdminActionState } from "./admin-action.types";

export async function createSeoPageAction(
  formData: FormData,
): Promise<AdminActionState> {
  void formData;

  // TODO: 后续接入 Prisma SeoPage 写入。
  return {
    success: false,
    message: "专题保存功能待接入数据库",
  };
}

export async function updateSeoPageAction(
  formData: FormData,
): Promise<AdminActionState> {
  void formData;

  // TODO: 后续接入 Prisma SeoPage 写入。
  return {
    success: false,
    message: "专题保存功能待接入数据库",
  };
}
