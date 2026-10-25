ALTER TYPE "PaymentPreference" ADD VALUE IF NOT EXISTS 'AWASH';

ALTER TABLE "User"
ADD COLUMN "booking_updates_enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "host_messages_enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "offers_enabled" BOOLEAN NOT NULL DEFAULT false;
