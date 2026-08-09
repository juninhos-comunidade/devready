"use server";

// Server Actions do módulo de treino — rodam no servidor, então podem falar
// direto com o Prisma sem expor o banco pro navegador. É por aqui que a
// tela de Quiz grava "essa pessoa respondeu essa pergunta, e acertou ou
// errou" — e é só a partir desses registros que a Trilha de Estudo depois
// calcula o que recomendar (ver lib/training/trilha.ts).

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { TrainingQuestionDTO } from "./types";
import { withDbRetry } from "./with-retry";

// userId fica nulo em modo demo (não existe usuário real logado) e também
// se, por qualquer motivo, não conseguirmos ler a sessão — nunca deixamos
// isso quebrar o fluxo de treino
async function getCurrentUserId(): Promise<string | null> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}

export async function startTrainingSession(jobTitle?: string): Promise<string> {
  const userId = await getCurrentUserId();
  const session = await withDbRetry(() =>
    prisma.trainingSession.create({
      data: { userId, jobTitle: jobTitle ?? null },
    }),
  );
  return session.id;
}

export async function recordTrainingAnswer(params: {
  sessionId: string;
  question: TrainingQuestionDTO;
  selectedIndex: number;
}): Promise<{ wasCorrect: boolean }> {
  const userId = await getCurrentUserId();
  const wasCorrect = params.selectedIndex === params.question.correctIndex;

  // grava a pergunta junto da resposta — assim a Trilha consegue ler
  // competência/dificuldade/explicação sem precisar voltar na lista mocada
  // (importante pro dia em que as perguntas vierem de uma IA e não vão
  // mais existir numa lista fixa em arquivo)
  const savedQuestion = await withDbRetry(() =>
    prisma.trainingQuestion.create({
      data: {
        sessionId: params.sessionId,
        competency: params.question.competency,
        competencyLabel: params.question.competencyLabel,
        difficulty: params.question.difficulty,
        prompt: params.question.prompt,
        options: params.question.options,
        correctIndex: params.question.correctIndex,
        explanation: params.question.explanation,
        source: params.question.source,
      },
    }),
  );

  await withDbRetry(() =>
    prisma.trainingAnswer.create({
      data: {
        sessionId: params.sessionId,
        questionId: savedQuestion.id,
        userId,
        wasCorrect,
      },
    }),
  );

  return { wasCorrect };
}
