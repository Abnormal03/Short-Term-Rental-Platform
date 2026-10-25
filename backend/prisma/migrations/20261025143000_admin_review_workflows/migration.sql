CREATE TYPE "AccountStatus" AS ENUM ('PENDING', 'ACTIVE', 'REJECTED', 'SUSPENDED');
CREATE TYPE "HostReviewStatus" AS ENUM ('PENDING', 'VERIFIED', 'NEEDS_CHANGES', 'REJECTED');

ALTER TABLE "User"
ADD COLUMN "account_status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN "host_review_status" "HostReviewStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN "admin_review_note" TEXT,
ADD COLUMN "review_message" TEXT;

UPDATE "User"
SET "host_review_status" = 'VERIFIED'
WHERE "is_verified_host" = true;

ALTER TABLE "Property"
ADD COLUMN "admin_review_note" TEXT,
ADD COLUMN "review_message" TEXT;
