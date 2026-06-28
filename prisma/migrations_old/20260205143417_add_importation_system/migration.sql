-- CreateEnum
CREATE TYPE "ImportShipmentStatus" AS ENUM ('DRAFT', 'PAID', 'IN_TRANSIT', 'ARRIVED_GH', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ImportSourceApp" AS ENUM ('ALIBABA', 'APP_1688', 'TAOBAO', 'WECHAT', 'OTHER');

-- CreateEnum
CREATE TYPE "ShippingMode" AS ENUM ('AIR', 'SEA');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'BANK_TRANSFER', 'MOMO', 'ONLINE_CARD', 'OTHER');

-- CreateEnum
CREATE TYPE "ImportCostType" AS ENUM ('SUPPLIER', 'INTERNATIONAL_SHIPPING', 'CLEARING_FEES', 'FREIGHT_FORWARDER_FEES', 'LOCAL_TRANSPORT', 'OTHER');

-- CreateTable
CREATE TABLE "ImportShipment" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "supplierName" TEXT NOT NULL,
    "sourceApp" "ImportSourceApp" NOT NULL,
    "sourceAppOther" TEXT,
    "freightForwarderName" TEXT NOT NULL,
    "shippingMode" "ShippingMode" NOT NULL,
    "supplierTrackingId" TEXT,
    "supplierTrackingNotes" TEXT,
    "paymentFinalizedDate" TIMESTAMP(3),
    "currency" TEXT NOT NULL,
    "exchangeRateSnapshot" DECIMAL(65,30) NOT NULL,
    "status" "ImportShipmentStatus" NOT NULL DEFAULT 'DRAFT',
    "forwarderReceivedConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "forwarderReceivedDate" TIMESTAMP(3),
    "forwarderReceivedNotes" TEXT,
    "supplierDeclaredCbm" DECIMAL(65,30),
    "forwarderMeasuredCbm" DECIMAL(65,30),
    "agreedCbm" DECIMAL(65,30),
    "cbmDiscrepancyFlag" BOOLEAN NOT NULL DEFAULT false,
    "cbmConfirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImportShipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportCost" (
    "id" TEXT NOT NULL,
    "shipmentId" TEXT NOT NULL,
    "costType" "ImportCostType" NOT NULL,
    "description" TEXT,
    "amountGhs" DECIMAL(65,30) NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "paymentDate" TIMESTAMP(3),
    "receiptUrl" TEXT,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "cashApproved" BOOLEAN NOT NULL DEFAULT false,
    "cashApprovedAt" TIMESTAMP(3),
    "cashNotes" TEXT,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImportCost_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ImportCost" ADD CONSTRAINT "ImportCost_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "ImportShipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
