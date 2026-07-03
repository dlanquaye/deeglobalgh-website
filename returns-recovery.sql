-- CreateEnum
CREATE TYPE "ReturnStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'INSPECTED', 'REFUNDED', 'EXCHANGED', 'COMPLETED');

CREATE TYPE "ReturnType" AS ENUM ('REFUND', 'EXCHANGE');

CREATE TYPE "ReturnCondition" AS ENUM ('GOOD', 'DAMAGED', 'DEFECTIVE', 'OPENED');

CREATE TABLE "ReturnRequest" (
    "id" TEXT NOT NULL,
    "returnNumber" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "requestedByStaffId" TEXT NOT NULL,
    "approvedByStaffId" TEXT,
    "type" "ReturnType" NOT NULL,
    "status" "ReturnStatus" NOT NULL DEFAULT 'PENDING',
    "customerReason" TEXT NOT NULL,
    "managerDecisionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    CONSTRAINT "ReturnRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ReturnItem" (
    "id" TEXT NOT NULL,
    "returnRequestId" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "condition" "ReturnCondition" NOT NULL,
    "itemReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReturnItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ReturnRequest_returnNumber_key"
ON "ReturnRequest"("returnNumber");

ALTER TABLE "ReturnRequest"
ADD CONSTRAINT "ReturnRequest_orderId_fkey"
FOREIGN KEY ("orderId") REFERENCES "Order"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ReturnRequest"
ADD CONSTRAINT "ReturnRequest_branchId_fkey"
FOREIGN KEY ("branchId") REFERENCES "Branch"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ReturnRequest"
ADD CONSTRAINT "ReturnRequest_requestedByStaffId_fkey"
FOREIGN KEY ("requestedByStaffId") REFERENCES "Staff"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ReturnRequest"
ADD CONSTRAINT "ReturnRequest_approvedByStaffId_fkey"
FOREIGN KEY ("approvedByStaffId") REFERENCES "Staff"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ReturnItem"
ADD CONSTRAINT "ReturnItem_returnRequestId_fkey"
FOREIGN KEY ("returnRequestId") REFERENCES "ReturnRequest"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ReturnItem"
ADD CONSTRAINT "ReturnItem_orderItemId_fkey"
FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ReturnItem"
ADD CONSTRAINT "ReturnItem_productId_fkey"
FOREIGN KEY ("productId") REFERENCES "Product"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;