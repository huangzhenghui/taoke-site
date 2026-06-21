-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "outerItemId" TEXT NOT NULL,
    "dataokeId" TEXT,
    "goodsSign" TEXT,
    "title" TEXT NOT NULL,
    "shortTitle" TEXT,
    "description" TEXT,
    "mainImage" TEXT,
    "images" JSONB,
    "platform" TEXT NOT NULL,
    "shopName" TEXT,
    "shopLogo" TEXT,
    "brandName" TEXT,
    "brandId" TEXT,
    "price" DECIMAL(12,2),
    "finalPrice" DECIMAL(12,2),
    "couponAmount" DECIMAL(12,2),
    "couponConditions" TEXT,
    "commissionRate" DECIMAL(6,2),
    "monthSales" INTEGER,
    "dailySales" INTEGER,
    "twoHoursSales" INTEGER,
    "couponStartTime" TIMESTAMP(3),
    "couponEndTime" TIMESTAMP(3),
    "couponTotalNum" INTEGER,
    "couponReceiveNum" INTEGER,
    "couponRemainCount" INTEGER,
    "categoryId" TEXT,
    "categorySlug" TEXT,
    "categoryName" TEXT,
    "sourceCid" TEXT,
    "sourceSubcid" TEXT,
    "promotionUrl" TEXT,
    "couponUrl" TEXT,
    "status" TEXT NOT NULL,
    "isManualHidden" BOOLEAN NOT NULL DEFAULT false,
    "isManualEdited" BOOLEAN NOT NULL DEFAULT false,
    "manualCategoryLocked" BOOLEAN NOT NULL DEFAULT false,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "coverImage" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "categoryName" TEXT NOT NULL,
    "tags" JSONB NOT NULL,
    "relatedProductIds" JSONB NOT NULL,
    "status" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeoPage" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "h1" TEXT NOT NULL,
    "intro" TEXT NOT NULL,
    "keywords" JSONB NOT NULL,
    "categoryId" TEXT NOT NULL,
    "categoryName" TEXT NOT NULL,
    "relatedProductIds" JSONB NOT NULL,
    "relatedArticleIds" JSONB NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeoPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromotionLink" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "outerItemId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "promotionUrl" TEXT,
    "couponUrl" TEXT,
    "shortUrl" TEXT,
    "tpwd" TEXT,
    "longTpwd" TEXT,
    "maxCommissionRate" DECIMAL(6,2),
    "minCommissionRate" DECIMAL(6,2),
    "originalPrice" DECIMAL(12,2),
    "actualPrice" DECIMAL(12,2),
    "couponStartTime" TIMESTAMP(3),
    "couponEndTime" TIMESTAMP(3),
    "couponInfo" TEXT,
    "couponTotalCount" INTEGER,
    "couponRemainCount" INTEGER,
    "status" TEXT NOT NULL,
    "lastGeneratedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromotionLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SourceCategoryMapping" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sourceCid" TEXT NOT NULL,
    "sourceSubcid" TEXT,
    "sourceName" TEXT,
    "sourceSubName" TEXT,
    "categoryId" TEXT NOT NULL,
    "categorySlug" TEXT NOT NULL,
    "confidence" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SourceCategoryMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiSource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApiSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncLog" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "taskType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "params" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "finishedAt" TIMESTAMP(3),
    "totalCount" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "createdCount" INTEGER NOT NULL DEFAULT 0,
    "updatedCount" INTEGER NOT NULL DEFAULT 0,
    "skippedCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "message" TEXT,
    "errorSummary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SyncLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_status_idx" ON "Category"("status");

-- CreateIndex
CREATE INDEX "Category_sortOrder_idx" ON "Category"("sortOrder");

-- CreateIndex
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");

-- CreateIndex
CREATE INDEX "Product_categorySlug_idx" ON "Product"("categorySlug");

-- CreateIndex
CREATE INDEX "Product_status_idx" ON "Product"("status");

-- CreateIndex
CREATE INDEX "Product_source_idx" ON "Product"("source");

-- CreateIndex
CREATE INDEX "Product_sourceCid_idx" ON "Product"("sourceCid");

-- CreateIndex
CREATE INDEX "Product_lastSyncedAt_idx" ON "Product"("lastSyncedAt");

-- CreateIndex
CREATE INDEX "Product_couponEndTime_idx" ON "Product"("couponEndTime");

-- CreateIndex
CREATE UNIQUE INDEX "Product_source_outerItemId_key" ON "Product"("source", "outerItemId");

-- CreateIndex
CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");

-- CreateIndex
CREATE INDEX "Article_categoryId_idx" ON "Article"("categoryId");

-- CreateIndex
CREATE INDEX "Article_status_idx" ON "Article"("status");

-- CreateIndex
CREATE INDEX "Article_publishedAt_idx" ON "Article"("publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SeoPage_slug_key" ON "SeoPage"("slug");

-- CreateIndex
CREATE INDEX "SeoPage_categoryId_idx" ON "SeoPage"("categoryId");

-- CreateIndex
CREATE INDEX "SeoPage_status_idx" ON "SeoPage"("status");

-- CreateIndex
CREATE INDEX "PromotionLink_outerItemId_idx" ON "PromotionLink"("outerItemId");

-- CreateIndex
CREATE INDEX "PromotionLink_source_idx" ON "PromotionLink"("source");

-- CreateIndex
CREATE INDEX "PromotionLink_status_idx" ON "PromotionLink"("status");

-- CreateIndex
CREATE INDEX "PromotionLink_expiresAt_idx" ON "PromotionLink"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "PromotionLink_productId_source_key" ON "PromotionLink"("productId", "source");

-- CreateIndex
CREATE INDEX "SourceCategoryMapping_source_idx" ON "SourceCategoryMapping"("source");

-- CreateIndex
CREATE INDEX "SourceCategoryMapping_categorySlug_idx" ON "SourceCategoryMapping"("categorySlug");

-- CreateIndex
CREATE INDEX "SourceCategoryMapping_status_idx" ON "SourceCategoryMapping"("status");

-- CreateIndex
CREATE UNIQUE INDEX "SourceCategoryMapping_source_sourceCid_sourceSubcid_key" ON "SourceCategoryMapping"("source", "sourceCid", "sourceSubcid");

-- CreateIndex
CREATE UNIQUE INDEX "ApiSource_name_key" ON "ApiSource"("name");

-- CreateIndex
CREATE INDEX "ApiSource_type_idx" ON "ApiSource"("type");

-- CreateIndex
CREATE INDEX "ApiSource_status_idx" ON "ApiSource"("status");

-- CreateIndex
CREATE INDEX "SyncLog_source_idx" ON "SyncLog"("source");

-- CreateIndex
CREATE INDEX "SyncLog_taskType_idx" ON "SyncLog"("taskType");

-- CreateIndex
CREATE INDEX "SyncLog_status_idx" ON "SyncLog"("status");

-- CreateIndex
CREATE INDEX "SyncLog_startedAt_idx" ON "SyncLog"("startedAt");

-- AddForeignKey
ALTER TABLE "PromotionLink" ADD CONSTRAINT "PromotionLink_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
