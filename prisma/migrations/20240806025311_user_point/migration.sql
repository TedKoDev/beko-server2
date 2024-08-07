/*
  Warnings:

  - You are about to drop the column `point` on the `Users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Users" DROP COLUMN "point",
ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 2000;
