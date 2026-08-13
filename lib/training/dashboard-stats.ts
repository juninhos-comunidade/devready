"use server";

import { prisma } from "@/lib/prisma";
import { withDbRetry } from "./with-retry";

export type TechnologyScore = {
  name: string;
  score: number | null;
  previousScore: number | null;
  lastTestedAt: string | null;
  jobSessionId: string | null;
};

export type HistoryPoint = {
  label: string;
  score: number;
};

export type TechnologyHistory = {
  name: string;
  color: string;
  points: HistoryPoint[];
};

const chartColors = ["#7755e8", "#e8641d", "#1f9d73"];

function scoreFor(answer: { wasCorrect: boolean | null; score: number | null }): number | null {
  if (answer.wasCorrect !== null) return answer.wasCorrect ? 100 : 0;
  return answer.score;
}

function average(values: number[]): number | null {
  if (!values.length) return null;
  return Math.round(values.reduce((total, value) => total + value, 0) / values.length);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(date);
}

type CompetencyAnswer = {
  value: number;
  at: Date;
  sessionId: string;
  sessionCreatedAt: Date;
  jobSessionId: string | null;
};

export async function getDashboardTrainingStats(userId: string): Promise<{
  technologies: TechnologyScore[];
  history: TechnologyHistory[];
}> {
  const answers = await withDbRetry(() =>
    prisma.trainingAnswer.findMany({
      where: { userId },
      include: { question: true, session: true },
      orderBy: { answeredAt: "asc" },
    }),
  );
  if (!answers.length) return { technologies: [], history: [] };

  const byCompetency = new Map<string, { label: string; answers: CompetencyAnswer[] }>();
  for (const answer of answers) {
    const value = scoreFor(answer);
    if (value === null) continue;
    const key = answer.question.competency;
    const entry = byCompetency.get(key) ?? { label: answer.question.competencyLabel, answers: [] };
    entry.answers.push({
      value,
      at: answer.answeredAt,
      sessionId: answer.sessionId,
      sessionCreatedAt: answer.session.createdAt,
      jobSessionId: answer.session.jobSessionId,
    });
    byCompetency.set(key, entry);
  }

  const ranked = [...byCompetency.entries()].sort((a, b) => b[1].answers.length - a[1].answers.length);

  const technologies: TechnologyScore[] = ranked.map(([, entry]) => {
    const latestSessionId = entry.answers.reduce((latest, item) =>
      item.sessionCreatedAt > latest.sessionCreatedAt ? item : latest,
    ).sessionId;
    const latestAnswers = entry.answers.filter((item) => item.sessionId === latestSessionId);
    const priorAnswers = entry.answers.filter((item) => item.sessionId !== latestSessionId);
    const lastAnswer = entry.answers[entry.answers.length - 1];

    return {
      name: entry.label,
      score: average(latestAnswers.map((item) => item.value)),
      previousScore: priorAnswers.length ? average(priorAnswers.map((item) => item.value)) : null,
      lastTestedAt: formatDate(lastAnswer.at),
      jobSessionId: latestAnswers[0]?.jobSessionId ?? null,
    };
  });

  const history: TechnologyHistory[] = ranked.slice(0, 3).map(([, entry], index) => {
    const points: HistoryPoint[] = [];
    const running: number[] = [];
    for (const item of entry.answers.slice(-6)) {
      running.push(item.value);
      points.push({ label: formatDate(item.at), score: average(running) ?? item.value });
    }
    return { name: entry.label, color: chartColors[index % chartColors.length], points };
  });

  return { technologies, history };
}
