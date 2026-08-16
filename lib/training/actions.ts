"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resolveCompetency } from "./competency";
import { withDbRetry } from "./with-retry";

async function getCurrentUserId(): Promise<string | null> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}

export async function startTrainingSession(params: { jobTitle?: string; jobSessionId?: string }): Promise<string> {
  const userId = await getCurrentUserId();
  const session = await withDbRetry(() =>
    prisma.trainingSession.create({
      data: { userId, jobTitle: params.jobTitle ?? null, jobSessionId: params.jobSessionId ?? null },
    }),
  );
  return session.id;
}

export async function recordQuizAnswer(params: {
  sessionId: string;
  topic: string;
  difficulty: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  selectedIndex: number;
}): Promise<{ wasCorrect: boolean }> {
  const wasCorrect = params.selectedIndex === params.correctIndex;
  const { key, label } = resolveCompetency(params.topic);
  const userId = await getCurrentUserId();

  const question = await withDbRetry(() =>
    prisma.trainingQuestion.create({
      data: {
        sessionId: params.sessionId,
        mode: "quiz",
        competency: key,
        competencyLabel: label,
        difficulty: params.difficulty,
        prompt: params.prompt,
        options: params.options,
        correctIndex: params.correctIndex,
        explanation: params.explanation,
      },
    }),
  );

  await withDbRetry(() =>
    prisma.trainingAnswer.create({
      data: {
        sessionId: params.sessionId,
        questionId: question.id,
        userId,
        wasCorrect,
      },
    }),
  );

  return { wasCorrect };
}

export async function recordOpenAnswer(params: {
  sessionId: string;
  mode: "comportamental" | "codigo" | "entrevista";
  competencyText: string;
  difficulty: string;
  prompt: string;
  answerText: string;
  score: number;
  criteria?: Record<string, number>;
}): Promise<void> {
  const { key, label } = resolveCompetency(params.competencyText);
  const userId = await getCurrentUserId();

  const question = await withDbRetry(() =>
    prisma.trainingQuestion.create({
      data: {
        sessionId: params.sessionId,
        mode: params.mode,
        competency: key,
        competencyLabel: label,
        difficulty: params.difficulty,
        prompt: params.prompt,
        explanation: "",
      },
    }),
  );

  await withDbRetry(() =>
    prisma.trainingAnswer.create({
      data: {
        sessionId: params.sessionId,
        questionId: question.id,
        userId,
        score: params.score,
        answerText: params.answerText,
        criteria: params.criteria ?? undefined,
      },
    }),
  );
}

export async function getTrilhaCompletionSignal(jobSessionId: string): Promise<boolean> {
  const sessions = await withDbRetry(() =>
    prisma.trainingSession.findMany({ where: { jobSessionId }, select: { id: true } }),
  );
  if (!sessions.length) return false;

  const answers = await withDbRetry(() =>
    prisma.trainingAnswer.findMany({
      where: { sessionId: { in: sessions.map((item) => item.id) } },
      include: { question: true },
    }),
  );
  if (!answers.length) return false;

  const byCompetency = new Map<string, { correct: number; total: number }>();
  for (const answer of answers) {
    const key = answer.question.competency;
    const entry = byCompetency.get(key) ?? { correct: 0, total: 0 };
    entry.total += 1;
    const isGood = answer.wasCorrect === true || (answer.score !== null && answer.score >= 70);
    if (isGood) entry.correct += 1;
    byCompetency.set(key, entry);
  }

  const competencies = [...byCompetency.values()];
  return competencies.length > 0 && competencies.every((item) => item.correct / item.total >= 0.8);
}

export async function deleteVagaTrainingData(jobSessionId: string): Promise<void> {
  const userId = await getCurrentUserId();
  await withDbRetry(() =>
    prisma.trainingSession.deleteMany({
      where: userId ? { jobSessionId, userId } : { jobSessionId },
    }),
  );
}
