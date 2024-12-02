-- CreateTable
CREATE TABLE "koreanSchool" (
    "school_id" SERIAL NOT NULL,
    "country_code" VARCHAR(2) NOT NULL,
    "region" VARCHAR(100) NOT NULL,
    "name_ko" VARCHAR(100) NOT NULL,
    "name_en" VARCHAR(100) NOT NULL,
    "website_url" VARCHAR(255),
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,
    "deleted_at" TIMESTAMP,

    CONSTRAINT "koreanSchool_pkey" PRIMARY KEY ("school_id")
);

-- CreateIndex
CREATE INDEX "koreanSchool_country_code_idx" ON "koreanSchool"("country_code");

-- CreateIndex
CREATE INDEX "koreanSchool_region_idx" ON "koreanSchool"("region");
