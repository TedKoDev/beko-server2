/*
  Warnings:

  - The values [EDITOR] on the enum `postType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "postType_new" AS ENUM ('GENERAL', 'COLUMN', 'QUESTION');
ALTER TABLE "Post" ALTER COLUMN "type" TYPE "postType_new" USING ("type"::text::"postType_new");
ALTER TYPE "postType" RENAME TO "postType_old";
ALTER TYPE "postType_new" RENAME TO "postType";
DROP TYPE "postType_old";
COMMIT;
