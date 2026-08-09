"use server";

// Aqui é onde a Trilha de Estudo vira realidade: em vez de uma lista fixa
// no código, ela é montada a partir das respostas de treino que essa
// pessoa já deu (TrainingAnswer), agrupadas por competência, cruzadas com
// os materiais de estudo curados (StudyMaterial). Sem respostas, não tem
// recomendação — é isso que "dinâmico" significa aqui.

import { prisma } from "@/lib/prisma";
import { withDbRetry } from "./with-retry";

export type TrilhaStatus = "ausente" | "parcial" | "dominado";

export type TrilhaItem = {
  competency: string;
  competencyLabel: string;
  status: TrilhaStatus;
  correct: number;
  total: number;
  accuracy: number; // 0 a 1, só pra facilitar de exibir/ordenar
  materials: { title: string; url: string; contentType: string; level: string }[];
};

// abaixo de 50% de acerto = ainda não domina o assunto (recomendação
// principal); entre 50% e 80% = já entende mas erra o suficiente pra
// valer reforçar; acima disso não entra na trilha, porque já está bem
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
    if (status === "dominado") continue; // só recomenda o que ainda precisa de reforço

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

  // pior desempenho primeiro — é a recomendação mais urgente
  items.sort((a, b) => a.accuracy - b.accuracy);
  return items;
}
