/*
  Warnings:

  - You are about to drop the column `contact_number` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `last_login` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "contact_number",
DROP COLUMN "last_login",
ADD COLUMN     "email_verification_token" VARCHAR(255),
ADD COLUMN     "is_email_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "last_login_at" TIMESTAMP(3),
ADD COLUMN     "phone_number" VARCHAR(20);
