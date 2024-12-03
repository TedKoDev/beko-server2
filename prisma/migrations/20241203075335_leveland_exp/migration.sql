-- AlterTable
ALTER TABLE "levelthreshold" ADD COLUMN     "min_experience" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "experience_points" INTEGER NOT NULL DEFAULT 0;
