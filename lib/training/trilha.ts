"use server";

import { prisma } from "@/lib/prisma";
import { withDbRetry } from "./with-retry";

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

export async function getTrilhaForSessions(sessionIds: string[]): Promise<TrilhaItem[]> {
  if (sessionIds.length === 0) return [];

  const answers = await withDbRetry(() =>
    prisma.trainingAnswer.findMany({
      where: { sessionId: { in: sessionIds } },
      include: { question: true },
    }),
  );
  if (answers.length === 0) return [];

  const byCompetency = new Map<string, { label: string; correct: number; total: number }>();
  for (const answer of answers) {
    const key = answer.question.competency;
    const entry = byCompetency.get(key) ?? { label: answer.question.competencyLabel, correct: 0, total: 0 };
    entry.total += 1;
    if (answer.wasCorrect) entry.correct += 1;
    byCompetency.set(key, entry);
  }

  const competencies = [...byCompetency.keys()];
  const materials = await withDbRetry(() =>
    prisma.studyMaterial.findMany({
      where: { competency: { in: competencies } },
    }),
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
