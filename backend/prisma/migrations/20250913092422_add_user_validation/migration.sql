-- AlterTable
ALTER TABLE "users" ADD COLUMN     "validated" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "users_validated_idx" ON "users"("validated");

-- CreateIndex
CREATE INDEX "users_role_validated_idx" ON "users"("role", "validated");
