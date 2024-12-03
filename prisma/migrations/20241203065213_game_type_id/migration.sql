/*
  Warnings:

  - The primary key for the `GameType` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `GameType` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "GameQuestion" DROP CONSTRAINT "GameQuestion_game_type_id_fkey";

-- DropForeignKey
ALTER TABLE "UserGameProgress" DROP CONSTRAINT "UserGameProgress_game_type_id_fkey";

-- AlterTable
ALTER TABLE "GameType" DROP CONSTRAINT "GameType_pkey",
DROP COLUMN "id",
ADD COLUMN     "game_type_id" SERIAL NOT NULL,
ADD CONSTRAINT "GameType_pkey" PRIMARY KEY ("game_type_id");

-- AddForeignKey
ALTER TABLE "GameQuestion" ADD CONSTRAINT "GameQuestion_game_type_id_fkey" FOREIGN KEY ("game_type_id") REFERENCES "GameType"("game_type_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGameProgress" ADD CONSTRAINT "UserGameProgress_game_type_id_fkey" FOREIGN KEY ("game_type_id") REFERENCES "GameType"("game_type_id") ON DELETE RESTRICT ON UPDATE CASCADE;
