-- Normalize legacy order status values
UPDATE "Order"
SET "status" = 'in_behandeling'
WHERE "status" = 'RECEIVED';

-- Ensure default aligns with new status workflow
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "installerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'in_behandeling',
    "totalPrice" DECIMAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Order_installerId_fkey" FOREIGN KEY ("installerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "new_Order" ("id", "installerId", "status", "totalPrice", "createdAt")
SELECT "id", "installerId", "status", "totalPrice", "createdAt"
FROM "Order";

DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
