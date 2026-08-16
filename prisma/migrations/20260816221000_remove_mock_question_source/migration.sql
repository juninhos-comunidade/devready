ALTER TABLE "TrainingQuestion"
ALTER COLUMN "source" SET DEFAULT 'generated';

UPDATE "TrainingQuestion"
SET "source" = 'generated'
WHERE "source" = 'mock';
