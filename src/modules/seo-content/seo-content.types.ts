import type { Product } from "@/modules/product";

export type ProductSeoContent = {
  summary: string;
  suitableFor: string[];
  highlights: string[];
  notSuitableFor: string[];
  buyingAdvice: string;
  faqs: Array<{ question: string; answer: string }>;
  riskFlags: string[];
};

export type ProductSeoContentInput = Product;
