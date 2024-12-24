-- DropForeignKey
ALTER TABLE "comment" DROP CONSTRAINT "comment_post_id_fkey";

-- AlterTable
ALTER TABLE "comment" ADD COLUMN     "school_id" INTEGER,
ALTER COLUMN "post_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "koreanSchool" ADD COLUMN     "description" TEXT;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "post"("post_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "koreanSchool"("school_id") ON DELETE SET NULL ON UPDATE CASCADE;
