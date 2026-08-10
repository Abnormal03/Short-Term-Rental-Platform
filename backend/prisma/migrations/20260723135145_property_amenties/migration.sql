-- DropForeignKey
ALTER TABLE "Dispute" DROP CONSTRAINT "Dispute_booking_id_fkey";

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "amenities" TEXT[];

-- CreateIndex
CREATE INDEX "Dispute_booking_id_idx" ON "Dispute"("booking_id");

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "Booking"("booking_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_raised_by_fkey" FOREIGN KEY ("raised_by") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
