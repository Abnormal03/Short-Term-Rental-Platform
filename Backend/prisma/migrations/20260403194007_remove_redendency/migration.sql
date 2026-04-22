/*
  Warnings:

  - You are about to drop the column `owner_id` on the `Property` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Property" DROP CONSTRAINT "Property_owner_id_fkey";

-- AlterTable
ALTER TABLE "Property" DROP COLUMN "owner_id";

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
