"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { initializeDataokeCategoryMappingsAction } from "./actions";

type InitializationResult = Awaited<
  ReturnType<typeof initializeDataokeCategoryMappingsAction>
>;

export function CategoryMappingInitializer() {
  const router = useRouter();
  const [isInitializing, startInitialization] = useTransition();
  const [result, setResult] = useState<InitializationResult | null>(null);

  function initializeMappings() {
    startInitialization(async () => {
      const actionResult = await initializeDataokeCategoryMappingsAction();

      setResult(actionResult);

      if (actionResult.success) {
        router.refresh();
      }
    });
  }

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <button
          className="h-10 rounded-md bg-emerald-700 px-4 text-sm font-medium text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-zinc-400"
          disabled={isInitializing}
          onClick={initializeMappings}
          type="button"
        >
          {isInitializing ? "正在初始化..." : "初始化 Dataoke 基础映射"}
        </button>
        <p className="text-sm text-zinc-600">
          第一版只初始化少量基础映射，后续可以从 Dataoke 超级分类接口同步完整分类。
        </p>
      </div>
      {result ? (
        <p
          className={`mt-3 text-sm ${result.success ? "text-emerald-700" : "text-red-700"}`}
        >
          {result.message}
        </p>
      ) : null}
    </section>
  );
}
