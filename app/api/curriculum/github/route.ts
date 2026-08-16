import { NextResponse } from "next/server";
import { headers } from "next/headers";
import type { Prisma } from "@/app/generated/prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { analyzeGithubProfile, extractGithubUsername } from "@/lib/github";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST() {
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

    const githubProfile = await prisma.$transaction(async (tx) => {
      await tx.githubProfile.deleteMany({ where: { curriculumId: curriculum.id } });
      return tx.githubProfile.create({
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
    });

    return NextResponse.json(githubProfile);
  } catch (error) {
    console.error(`Falha ao analisar GitHub do currículo ${curriculum.id}.`, error);

    const existingProfile = await prisma.githubProfile.findUnique({
      where: { curriculumId: curriculum.id },
      select: { id: true },
    });
    if (!existingProfile) {
      await prisma.githubProfile.create({
        data: {
          curriculumId: curriculum.id,
          username: safeExtractUsername(curriculum.githubUrl),
          status: "FAILED",
        },
      }).catch(() => undefined);
    }

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
