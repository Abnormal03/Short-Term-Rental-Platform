-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Refund" (
    "refund_id" TEXT NOT NULL,
    "payment_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "reason" TEXT,
    "refund_status" "RefundStatus" NOT NULL DEFAULT 'PENDING',
    "transaction_reference" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Refund_pkey" PRIMARY KEY ("refund_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Refund_payment_id_key" ON "Refund"("payment_id");

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "Payment"("payment_id") ON DELETE RESTRICT ON UPDATE CASCADE;
