"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { QuizQuestion, TrainingDifficulty } from "@/lib/job-training";
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

export async function startTrainingSession(jobTitle?: string): Promise<string> {
  const userId = await getCurrentUserId();
  const session = await withDbRetry(() =>
    prisma.trainingSession.create({
      data: { userId, jobTitle: jobTitle ?? null },
    }),
  );
  return session.id;
}

export async function recordQuizAnswer(params: {
  sessionId: string;
  question: QuizQuestion;
  selectedIndex: number;
}): Promise<{ wasCorrect: boolean }> {
  const { key, label } = resolveCompetency(params.question.topic);
  const wasCorrect = params.selectedIndex === params.question.correctIndex;
  const userId = await getCurrentUserId();

  const savedQuestion = await withDbRetry(() =>
    prisma.trainingQuestion.create({
      data: {
        sessionId: params.sessionId,
        competency: key,
        competencyLabel: label,
        difficulty: params.question.difficulty,
        prompt: params.question.prompt,
        options: params.question.options,
        correctIndex: params.question.correctIndex,
        explanation: params.question.explanation,
        source: "groq-quiz",
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

const OPEN_ANSWER_PASS_THRESHOLD = 70;

export async function recordOpenAnswer(params: {
  sessionId: string;
  mode: "comportamental" | "codigo";
  competencySource: string;
  difficulty: TrainingDifficulty;
  prompt: string;
  score: number;
}): Promise<void> {
  const { key, label } = resolveCompetency(
    params.mode === "comportamental" ? "comportamental" : params.competencySource,
  );
  const wasCorrect = params.score >= OPEN_ANSWER_PASS_THRESHOLD;
  const userId = await getCurrentUserId();

  const savedQuestion = await withDbRetry(() =>
    prisma.trainingQuestion.create({
      data: {
        sessionId: params.sessionId,
        competency: key,
        competencyLabel: label,
        difficulty: params.difficulty,
        prompt: params.prompt,
        options: [],
        correctIndex: 0,
        explanation: `Nota recebida: ${params.score}/100.`,
        source: params.mode === "comportamental" ? "groq-star" : "groq-codigo",
      },
    }),
  );

  await withDbRetry(() =>
    prisma.trainingAnswer.create({
      data: {
        sessionId: savedQuestion.sessionId,
        questionId: savedQuestion.id,
        userId,
        wasCorrect,
      },
    }),
  );
}
