-- CreateTable
CREATE TABLE "ConfigDraft" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "installerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ConfigDraft_installerId_fkey" FOREIGN KEY ("installerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
