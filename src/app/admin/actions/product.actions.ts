"use server";

import type { AdminActionState } from "./admin-action.types";

export async function createProductAction(
  formData: FormData,
): Promise<AdminActionState> {
  void formData;

  // TODO: 后续接入 Prisma Product 写入。
  return {
    success: false,
    message: "商品保存功能待接入数据库",
  };
}

export async function updateProductAction(
  formData: FormData,
): Promise<AdminActionState> {
  void formData;

  // TODO: 后续接入 Prisma Product 写入。
  return {
    success: false,
    message: "商品保存功能待接入数据库",
  };
}
