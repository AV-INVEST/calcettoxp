-- AlterTable: add V2 trophy system fields to Achievement (ADDITIVE)
ALTER TABLE "Achievement" ADD COLUMN "category" TEXT;
ALTER TABLE "Achievement" ADD COLUMN "requirementMeta" JSONB;
ALTER TABLE "Achievement" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

-- Backfill isActive=true for existing rows just in case (idempotent)
UPDATE "Achievement" SET "isActive" = true WHERE "isActive" IS NULL;
