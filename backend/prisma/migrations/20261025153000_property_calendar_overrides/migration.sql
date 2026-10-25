CREATE TABLE "AvailabilityOverride" (
    "availability_override_id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "price_per_night" DOUBLE PRECISION,
    "min_stay_duration" INTEGER,

    CONSTRAINT "AvailabilityOverride_pkey" PRIMARY KEY ("availability_override_id")
);

CREATE UNIQUE INDEX "AvailabilityOverride_property_id_date_key"
ON "AvailabilityOverride"("property_id", "date");

CREATE INDEX "AvailabilityOverride_property_id_date_idx"
ON "AvailabilityOverride"("property_id", "date");

ALTER TABLE "AvailabilityOverride"
ADD CONSTRAINT "AvailabilityOverride_property_id_fkey"
FOREIGN KEY ("property_id") REFERENCES "Property"("property_id")
ON DELETE CASCADE ON UPDATE CASCADE;
