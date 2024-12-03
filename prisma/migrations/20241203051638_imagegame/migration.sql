/*
  Warnings:

  - You are about to drop the `picturewordquestion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "picturewordquestion";

-- CreateTable
CREATE TABLE "GameType" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,
    "deleted_at" TIMESTAMP,

    CONSTRAINT "GameType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameQuestion" (
    "question_id" SERIAL NOT NULL,
    "game_type_id" INTEGER NOT NULL,
    "image_url" VARCHAR(255) NOT NULL,
    "answer" VARCHAR(100) NOT NULL,
    "options" TEXT[],
    "level" INTEGER NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,
    "deleted_at" TIMESTAMP,

    CONSTRAINT "GameQuestion_pkey" PRIMARY KEY ("question_id")
);

-- CreateTable
CREATE TABLE "UserGameProgress" (
    "progress_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "game_type_id" INTEGER NOT NULL,
    "current_level" INTEGER NOT NULL DEFAULT 1,
    "max_level" INTEGER NOT NULL DEFAULT 1,
    "total_correct" INTEGER NOT NULL DEFAULT 0,
    "total_attempts" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,
    "last_played_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserGameProgress_pkey" PRIMARY KEY ("progress_id")
);

-- CreateTable
CREATE TABLE "ImageMatchingAnswer" (
    "answer_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,
    "answer" VARCHAR(100) NOT NULL,
    "is_correct" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImageMatchingAnswer_pkey" PRIMARY KEY ("answer_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GameQuestion_image_url_key" ON "GameQuestion"("image_url");

-- CreateIndex
CREATE INDEX "GameQuestion_level_idx" ON "GameQuestion"("level");

-- CreateIndex
CREATE INDEX "GameQuestion_game_type_id_idx" ON "GameQuestion"("game_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserGameProgress_user_id_game_type_id_key" ON "UserGameProgress"("user_id", "game_type_id");

-- AddForeignKey
ALTER TABLE "GameQuestion" ADD CONSTRAINT "GameQuestion_game_type_id_fkey" FOREIGN KEY ("game_type_id") REFERENCES "GameType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGameProgress" ADD CONSTRAINT "UserGameProgress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGameProgress" ADD CONSTRAINT "UserGameProgress_game_type_id_fkey" FOREIGN KEY ("game_type_id") REFERENCES "GameType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImageMatchingAnswer" ADD CONSTRAINT "ImageMatchingAnswer_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImageMatchingAnswer" ADD CONSTRAINT "ImageMatchingAnswer_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "GameQuestion"("question_id") ON DELETE RESTRICT ON UPDATE CASCADE;
