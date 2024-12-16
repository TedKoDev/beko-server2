-- CreateTable
CREATE TABLE "UserWord" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "word_id" INTEGER NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,
    "deleted_at" TIMESTAMP,

    CONSTRAINT "UserWord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserWord_user_id_idx" ON "UserWord"("user_id");

-- CreateIndex
CREATE INDEX "UserWord_word_id_idx" ON "UserWord"("word_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserWord_user_id_word_id_key" ON "UserWord"("user_id", "word_id");

-- AddForeignKey
ALTER TABLE "UserWord" ADD CONSTRAINT "UserWord_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWord" ADD CONSTRAINT "UserWord_word_id_fkey" FOREIGN KEY ("word_id") REFERENCES "wordlist"("word_id") ON DELETE RESTRICT ON UPDATE CASCADE;
