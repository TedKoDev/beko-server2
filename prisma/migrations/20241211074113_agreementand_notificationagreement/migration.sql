/*
  Warnings:

  - You are about to drop the column `notification_updated_at` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "notification_updated_at",
ADD COLUMN     "notification_benefit_at" TIMESTAMP,
ADD COLUMN     "notification_community_at" TIMESTAMP;
