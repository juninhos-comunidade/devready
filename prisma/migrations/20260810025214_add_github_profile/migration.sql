-- CreateEnum
CREATE TYPE "GithubAnalysisStatus" AS ENUM ('COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "GithubProfile" (
    "id" SERIAL NOT NULL,
    "curriculumId" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "bio" TEXT,
    "publicReposCount" INTEGER,
    "followers" INTEGER,
    "topLanguages" JSONB,
    "contributionData" JSONB,
    "status" "GithubAnalysisStatus" NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GithubProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GithubRepo" (
    "id" SERIAL NOT NULL,
    "githubProfileId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "stars" INTEGER NOT NULL,
    "forks" INTEGER NOT NULL,
    "languages" JSONB,
    "url" TEXT NOT NULL,

    CONSTRAINT "GithubRepo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GithubProfile_curriculumId_key" ON "GithubProfile"("curriculumId");

-- AddForeignKey
ALTER TABLE "GithubProfile" ADD CONSTRAINT "GithubProfile_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES "Curriculum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GithubRepo" ADD CONSTRAINT "GithubRepo_githubProfileId_fkey" FOREIGN KEY ("githubProfileId") REFERENCES "GithubProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
