-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "completedSmsSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deliverySmsSent" BOOLEAN NOT NULL DEFAULT false;
