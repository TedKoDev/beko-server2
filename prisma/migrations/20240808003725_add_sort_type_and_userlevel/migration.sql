-- CreateEnum
CREATE TYPE "SortType" AS ENUM ('LATEST', 'POPULAR');

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 1;
