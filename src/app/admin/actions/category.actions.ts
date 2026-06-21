"use server";

import type { AdminActionState } from "./admin-action.types";

export async function createCategoryAction(
  formData: FormData,
): Promise<AdminActionState> {
  void formData;

  // TODO: 后续接入 Prisma Category 写入。
  return {
    success: false,
    message: "分类保存功能待接入数据库",
  };
}

export async function updateCategoryAction(
  formData: FormData,
): Promise<AdminActionState> {
  void formData;

  // TODO: 后续接入 Prisma Category 写入。
  return {
    success: false,
    message: "分类保存功能待接入数据库",
  };
}
