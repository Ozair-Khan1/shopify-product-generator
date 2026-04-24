-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AiSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "tone" TEXT NOT NULL DEFAULT 'SEO-rich',
    "imageStyle" TEXT NOT NULL DEFAULT 'Studio',
    "imageCount" INTEGER NOT NULL DEFAULT 1,
    "pricingStrategy" TEXT NOT NULL DEFAULT 'Medium'
);
INSERT INTO "new_AiSettings" ("id", "imageCount", "imageStyle", "pricingStrategy", "shop", "tone") SELECT "id", "imageCount", "imageStyle", "pricingStrategy", "shop", "tone" FROM "AiSettings";
DROP TABLE "AiSettings";
ALTER TABLE "new_AiSettings" RENAME TO "AiSettings";
CREATE UNIQUE INDEX "AiSettings_shop_key" ON "AiSettings"("shop");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
