/*
  Warnings:

  - You are about to drop the column `provider` on the `socialLogin` table. All the data in the column will be lost.
  - Added the required column `social_provider` to the `socialLogin` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "social_provider" AS ENUM ('GOOGLE', 'NAVER', 'KAKAO', 'APPLE');

-- AlterTable
ALTER TABLE "socialLogin" DROP COLUMN "provider",
ADD COLUMN     "social_provider" "social_provider" NOT NULL;

-- DropEnum
DROP TYPE "provider";
