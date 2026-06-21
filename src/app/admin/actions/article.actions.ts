"use server";

import type { AdminActionState } from "./admin-action.types";

export async function createArticleAction(
  formData: FormData,
): Promise<AdminActionState> {
  void formData;

  // TODO: 后续接入 Prisma Article 写入。
  return {
    success: false,
    message: "文章保存功能待接入数据库",
  };
}

export async function updateArticleAction(
  formData: FormData,
): Promise<AdminActionState> {
  void formData;

  // TODO: 后续接入 Prisma Article 写入。
  return {
    success: false,
    message: "文章保存功能待接入数据库",
  };
}
