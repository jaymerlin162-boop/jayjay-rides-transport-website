ALTER TABLE "drivers"
ADD COLUMN IF NOT EXISTS "number_plate" varchar(20);

UPDATE "drivers"
SET "name" = 'Omar Njoroge',
    "number_plate" = 'KDA 123A',
    "vehicle_type" = 'Tuk-tuk'
WHERE "name" IN ('KDA 123A', 'Omar Tuk-tuk', 'Omar Njoroge');

UPDATE "drivers"
SET "name" = 'Daniel Mwangi',
    "number_plate" = 'KDB 234B',
    "vehicle_type" = 'Taxi'
WHERE "name" IN ('KDB 234B', 'Asha Taxi', 'Daniel Mwangi');

UPDATE "drivers"
SET "name" = 'Kevin Otieno',
    "number_plate" = 'KDC 345C',
    "vehicle_type" = 'Tuk-tuk'
WHERE "name" IN ('KDC 345C', 'Kevo Tuk-tuk', 'Kevo Otieno', 'Kevin Otieno');
