"use server";

import { prisma } from "@/lib/prisma";
import { withDbRetry } from "./with-retry";
import { demoModeEnabled } from "@/lib/demo-mode";

export type TrilhaStatus = "ausente" | "parcial" | "dominado";

export type TrilhaItem = {
  competency: string;
  competencyLabel: string;
  status: TrilhaStatus;
  correct: number;
  total: number;
  accuracy: number;
  materials: { title: string; url: string; contentType: string; level: string }[];
};

function statusFor(correct: number, total: number): TrilhaStatus {
  const accuracy = correct / total;
  if (accuracy < 0.5) return "ausente";
  if (accuracy < 0.8) return "parcial";
  return "dominado";
}

function wasGoodAnswer(answer: { wasCorrect: boolean | null; score: number | null }): boolean {
  if (answer.wasCorrect !== null) return answer.wasCorrect;
  return answer.score !== null && answer.score >= 70;
}

export async function getTrilhaForVaga(jobSessionId: string): Promise<TrilhaItem[]> {
  if (demoModeEnabled) {
    return [
      { competency: "testes", competencyLabel: "Testes automatizados", status: "ausente", correct: 1, total: 4, accuracy: 0.25, materials: [{ title: "Testing Library: primeiros testes", url: "https://testing-library.com/docs/react-testing-library/intro/", contentType: "Artigo", level: "iniciante" }] },
      { competency: "typescript", competencyLabel: "TypeScript", status: "parcial", correct: 3, total: 5, accuracy: 0.6, materials: [{ title: "TypeScript para quem já usa JavaScript", url: "https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html", contentType: "Artigo", level: "intermediário" }] },
    ];
  }
  const sessions = await withDbRetry(() =>
    prisma.trainingSession.findMany({ where: { jobSessionId }, select: { id: true } }),
  );
  if (sessions.length === 0) return [];

  const answers = await withDbRetry(() =>
    prisma.trainingAnswer.findMany({
      where: { sessionId: { in: sessions.map((item) => item.id) } },
      include: { question: true },
    }),
  );
  if (answers.length === 0) return [];

  const byCompetency = new Map<string, { label: string; correct: number; total: number }>();
  for (const answer of answers) {
    const key = answer.question.competency;
    const entry = byCompetency.get(key) ?? { label: answer.question.competencyLabel, correct: 0, total: 0 };
    entry.total += 1;
    if (wasGoodAnswer(answer)) entry.correct += 1;
    byCompetency.set(key, entry);
  }

  const competencies = [...byCompetency.keys()];
  const materials = await withDbRetry(() =>
    prisma.studyMaterial.findMany({ where: { competency: { in: competencies } } }),
  );

  const items: TrilhaItem[] = [];
  for (const [competency, stats] of byCompetency) {
    const status = statusFor(stats.correct, stats.total);
    if (status === "dominado") continue;

    items.push({
      competency,
      competencyLabel: stats.label,
      status,
      correct: stats.correct,
      total: stats.total,
      accuracy: stats.correct / stats.total,
      materials: materials
        .filter((material) => material.competency === competency)
        .map((material) => ({
          title: material.title,
          url: material.url,
          contentType: material.contentType,
          level: material.level,
        })),
    });
  }

  items.sort((a, b) => a.accuracy - b.accuracy);
  return items;
}
