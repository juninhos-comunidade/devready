import { NextResponse } from "next/server";
import { headers } from "next/headers";
import type { Prisma } from "@/app/generated/prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { analyzeGithubProfile, extractGithubUsername } from "@/lib/github";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST() {
  if (!process.env.GITHUB_TOKEN?.trim()) {
    return NextResponse.json(
      { error: "A análise do GitHub ainda não foi configurada neste ambiente." },
      { status: 503 },
    );
  }

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const curriculum = await prisma.curriculum.findUnique({
    where: { userId: session.user.id },
  });

  if (!curriculum) {
    return NextResponse.json({ error: "Curriculo não encontrado" }, { status: 404 });
  }

  if (!curriculum.githubUrl) {
    return NextResponse.json(
      { error: "Nenhum GitHub informado no perfil" },
      { status: 400 }
    );
  }

  try {
    const { profile, repos } = await analyzeGithubProfile(curriculum.githubUrl);

    await prisma.githubProfile.deleteMany({ where: { curriculumId: curriculum.id } });

    const githubProfile = await prisma.githubProfile.create({
      data: {
        curriculumId: curriculum.id,
        username: profile.username,
        bio: profile.bio,
        publicReposCount: profile.publicReposCount,
        followers: profile.followers,
        topLanguages: profile.topLanguages as unknown as Prisma.InputJsonValue,
        contributionData: profile.contributionData as unknown as Prisma.InputJsonValue,
        status: "COMPLETED",
        repos: {
          create: repos.map((repo) => ({
            name: repo.name,
            description: repo.description,
            stars: repo.stars,
            forks: repo.forks,
            languages: repo.languages as unknown as Prisma.InputJsonValue,
            url: repo.url,
          })),
        },
      },
      include: { repos: true },
    });

    return NextResponse.json(githubProfile);
  } catch (error) {
    console.error(`Falha ao analisar GitHub do currículo ${curriculum.id}.`, error);

    const fallbackUsername = safeExtractUsername(curriculum.githubUrl);

    await prisma.githubProfile.deleteMany({ where: { curriculumId: curriculum.id } });
    await prisma.githubProfile.create({
      data: {
        curriculumId: curriculum.id,
        username: fallbackUsername,
        bio: null,
        publicReposCount: null,
        followers: null,
        topLanguages: undefined,
        contributionData: undefined,
        status: "FAILED",
      },
    });

    return NextResponse.json(
      { error: "Não foi possível analisar o GitHub. Tente novamente." },
      { status: 500 }
    );
  }
}

function safeExtractUsername(githubUrl: string): string {
  try {
    return extractGithubUsername(githubUrl);
  } catch {
    return githubUrl;
  }
}
