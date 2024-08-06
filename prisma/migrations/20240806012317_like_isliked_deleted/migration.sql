/*
  Warnings:

  - You are about to drop the `Column` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `General` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Question` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Column" DROP CONSTRAINT "Column_post_id_fkey";

-- DropForeignKey
ALTER TABLE "General" DROP CONSTRAINT "General_post_id_fkey";

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_post_id_fkey";

-- DropTable
DROP TABLE "Column";

-- DropTable
DROP TABLE "General";

-- DropTable
DROP TABLE "Question";

-- CreateTable
CREATE TABLE "Post_General" (
    "general_id" SERIAL NOT NULL,
    "post_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,
    "deleted_at" TIMESTAMP,

    CONSTRAINT "Post_General_pkey" PRIMARY KEY ("general_id")
);

-- CreateTable
CREATE TABLE "Post_Column" (
    "column_id" SERIAL NOT NULL,
    "post_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,
    "deleted_at" TIMESTAMP,

    CONSTRAINT "Post_Column_pkey" PRIMARY KEY ("column_id")
);

-- CreateTable
CREATE TABLE "Post_Question" (
    "question_id" SERIAL NOT NULL,
    "post_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,
    "deleted_at" TIMESTAMP,

    CONSTRAINT "Post_Question_pkey" PRIMARY KEY ("question_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Post_General_post_id_key" ON "Post_General"("post_id");

-- CreateIndex
CREATE UNIQUE INDEX "Post_Column_post_id_key" ON "Post_Column"("post_id");

-- CreateIndex
CREATE UNIQUE INDEX "Post_Question_post_id_key" ON "Post_Question"("post_id");

-- AddForeignKey
ALTER TABLE "Post_General" ADD CONSTRAINT "Post_General_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Post"("post_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post_Column" ADD CONSTRAINT "Post_Column_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Post"("post_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post_Question" ADD CONSTRAINT "Post_Question_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Post"("post_id") ON DELETE RESTRICT ON UPDATE CASCADE;
