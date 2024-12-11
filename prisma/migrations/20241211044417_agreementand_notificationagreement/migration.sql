-- AlterTable
ALTER TABLE "users" ADD COLUMN     "marketing_agreed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "marketing_agreed_at" TIMESTAMP,
ADD COLUMN     "notification_benefit" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notification_community" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notification_updated_at" TIMESTAMP,
ADD COLUMN     "privacy_agreed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "privacy_agreed_at" TIMESTAMP,
ADD COLUMN     "terms_agreed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "terms_agreed_at" TIMESTAMP;
