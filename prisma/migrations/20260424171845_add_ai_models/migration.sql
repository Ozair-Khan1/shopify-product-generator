-- CreateTable
CREATE TABLE "AiSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "tone" TEXT NOT NULL DEFAULT 'SEO-rich',
    "imageStyle" TEXT NOT NULL DEFAULT 'Studio',
    "imageCount" INTEGER NOT NULL DEFAULT 3,
    "pricingStrategy" TEXT NOT NULL DEFAULT 'Medium'
);

-- CreateTable
CREATE TABLE "GeneratedProduct" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "shopifyProductId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "aiPayload" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "AiSettings_shop_key" ON "AiSettings"("shop");
