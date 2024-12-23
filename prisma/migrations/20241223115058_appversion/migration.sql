-- CreateTable
CREATE TABLE "AppVersion" (
    "id" SERIAL NOT NULL,
    "platform" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "build" INTEGER NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "AppVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AppVersion_platform_idx" ON "AppVersion"("platform");
