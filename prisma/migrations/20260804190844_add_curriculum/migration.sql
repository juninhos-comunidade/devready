/*
  Warnings:

  - You are about to drop the column `curriculum_URL` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `githubUrl` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `skills` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "CurriculumStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "curriculum_URL",
DROP COLUMN "githubUrl",
DROP COLUMN "skills";

-- CreateTable
CREATE TABLE "Curriculum" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "bruteData" TEXT,
    "extractedData" JSONB,
    "status" "CurriculumStatus" NOT NULL DEFAULT 'PENDING',
    "githubUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Curriculum_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Curriculum_userId_key" ON "Curriculum"("userId");

-- AddForeignKey
ALTER TABLE "Curriculum" ADD CONSTRAINT "Curriculum_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
