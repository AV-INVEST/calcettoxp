-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN "currentPeriodStart" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN "canceledAt" TIMESTAMP(3);
