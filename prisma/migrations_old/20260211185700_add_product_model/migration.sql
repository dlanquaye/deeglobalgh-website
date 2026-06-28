-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "retailPrice" DOUBLE PRECISION NOT NULL,
    "wholesalePrice" DOUBLE PRECISION,
    "distributorPrice" DOUBLE PRECISION,
    "stockQty" INTEGER NOT NULL DEFAULT 0,
    "lowStockThreshold" INTEGER NOT NULL DEFAULT 3,
    "categorySlug" TEXT NOT NULL,
    "levelSlugs" TEXT[],
    "imageSrc" TEXT NOT NULL,
    "imageAlt" TEXT NOT NULL,
    "imageTitle" TEXT,
    "imageCaption" TEXT,
    "imageDescription" TEXT,
    "focusKeyphrase" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "socialTitle" TEXT,
    "socialDescription" TEXT,
    "shortSummary" TEXT,
    "fullDescription" TEXT,
    "brand" TEXT,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
