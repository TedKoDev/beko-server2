-- DropForeignKey
ALTER TABLE "Media" DROP CONSTRAINT "Media_post_id_fkey";

-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "comment_id" INTEGER,
ALTER COLUMN "post_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Post"("post_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "Comment"("comment_id") ON DELETE SET NULL ON UPDATE CASCADE;
