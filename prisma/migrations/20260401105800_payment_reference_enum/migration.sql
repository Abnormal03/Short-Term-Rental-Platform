/*
  Warnings:

  - The `payment_preference` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "PaymentPreference" AS ENUM ('TELEBIRR', 'MPESA', 'CBEBIRR');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "payment_preference",
ADD COLUMN     "payment_preference" "PaymentPreference" NOT NULL DEFAULT 'TELEBIRR';
