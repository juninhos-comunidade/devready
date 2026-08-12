-- AlterTable
ALTER TABLE "TrainingAnswer" ADD COLUMN     "answerText" TEXT,
ADD COLUMN     "criteria" JSONB,
ADD COLUMN     "score" INTEGER,
ALTER COLUMN "wasCorrect" DROP NOT NULL;

-- AlterTable
ALTER TABLE "TrainingQuestion" ADD COLUMN     "mode" TEXT NOT NULL DEFAULT 'quiz',
ALTER COLUMN "options" DROP NOT NULL,
ALTER COLUMN "correctIndex" DROP NOT NULL;

-- AlterTable
ALTER TABLE "TrainingSession" ADD COLUMN     "jobSessionId" TEXT;
