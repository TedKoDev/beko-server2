/*
  Warnings:

  - You are about to drop the `UserWord` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserWord" DROP CONSTRAINT "UserWord_user_id_fkey";

-- DropForeignKey
ALTER TABLE "UserWord" DROP CONSTRAINT "UserWord_word_id_fkey";

-- DropTable
DROP TABLE "UserWord";

-- CreateTable
CREATE TABLE "user_word" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "word_id" INTEGER NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,
    "deleted_at" TIMESTAMP,

    CONSTRAINT "user_word_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_word_user_id_idx" ON "user_word"("user_id");

-- CreateIndex
CREATE INDEX "user_word_word_id_idx" ON "user_word"("word_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_word_user_id_word_id_key" ON "user_word"("user_id", "word_id");

-- AddForeignKey
ALTER TABLE "user_word" ADD CONSTRAINT "user_word_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_word" ADD CONSTRAINT "user_word_word_id_fkey" FOREIGN KEY ("word_id") REFERENCES "wordlist"("word_id") ON DELETE RESTRICT ON UPDATE CASCADE;
