"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

type InitializeCategoryMappingsResult = {
  createdCount: number;
  message: string;
  success: boolean;
  updatedCount: number;
};

const dataokeBaseMappings = [
  {
    categoryId: "digital",
    categorySlug: "digital",
    sourceCid: "8",
    sourceName: "数码家电",
  },
  {
    categoryId: "home",
    categorySlug: "home",
    sourceCid: "4",
    sourceName: "居家日用",
  },
  {
    categoryId: "food",
    categorySlug: "food",
    sourceCid: "6",
    sourceName: "美食",
  },
  {
    categoryId: "home",
    categorySlug: "home",
    sourceCid: "14",
    sourceName: "家装家纺",
  },
] as const;

export async function initializeDataokeCategoryMappingsAction(): Promise<InitializeCategoryMappingsResult> {
  let createdCount = 0;
  let updatedCount = 0;

  try {
    for (const mapping of dataokeBaseMappings) {
      const where = {
        source_sourceCid_sourceSubcid: {
          source: "dataoke",
          sourceCid: mapping.sourceCid,
          sourceSubcid: "",
        },
      };
      const existing = await prisma.sourceCategoryMapping.findUnique({ where });

      await prisma.sourceCategoryMapping.upsert({
        where,
        create: {
          ...mapping,
          confidence: "manual",
          source: "dataoke",
          sourceSubcid: "",
          status: "active",
        },
        update: {
          categoryId: mapping.categoryId,
          categorySlug: mapping.categorySlug,
          confidence: "manual",
          sourceName: mapping.sourceName,
          sourceSubName: null,
          status: "active",
        },
      });

      if (existing) {
        updatedCount += 1;
      } else {
        createdCount += 1;
      }
    }

    revalidatePath("/admin/category-mappings");

    return {
      createdCount,
      message: `Dataoke base mappings initialized: ${createdCount} created, ${updatedCount} updated.`,
      success: true,
      updatedCount,
    };
  } catch {
    return {
      createdCount,
      message: "Dataoke base mapping initialization could not be completed.",
      success: false,
      updatedCount,
    };
  }
}
