/*
  Warnings:

  - A unique constraint covering the columns `[social_provider,provider_user_id]` on the table `socialLogin` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[social_provider,email]` on the table `socialLogin` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email,encrypted_password]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `socialLogin` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "users_email_key";

-- AlterTable
ALTER TABLE "socialLogin" ADD COLUMN     "email" VARCHAR(100) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "socialLogin_social_provider_provider_user_id_key" ON "socialLogin"("social_provider", "provider_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "socialLogin_social_provider_email_key" ON "socialLogin"("social_provider", "email");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_encrypted_password_key" ON "users"("email", "encrypted_password");
