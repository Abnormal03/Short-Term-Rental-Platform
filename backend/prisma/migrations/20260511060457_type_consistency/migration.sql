/*
  Warnings:

  - You are about to drop the column `bookingId` on the `Dispute` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Dispute` table. All the data in the column will be lost.
  - You are about to drop the column `raisedBy` on the `Dispute` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Dispute` table. All the data in the column will be lost.
  - Added the required column `booking_id` to the `Dispute` table without a default value. This is not possible if the table is not empty.
  - Added the required column `raised_by` to the `Dispute` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Dispute` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Dispute" DROP CONSTRAINT "Dispute_bookingId_fkey";

-- AlterTable
ALTER TABLE "Dispute" DROP COLUMN "bookingId",
DROP COLUMN "createdAt",
DROP COLUMN "raisedBy",
DROP COLUMN "updatedAt",
ADD COLUMN     "booking_id" TEXT NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "raised_by" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "Booking"("booking_id") ON DELETE RESTRICT ON UPDATE CASCADE;
