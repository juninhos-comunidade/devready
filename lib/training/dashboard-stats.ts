"use server";

import { prisma } from "@/lib/prisma";
import { withDbRetry } from "./with-retry";

export type TechnologyScore = {
  name: string;
  score: number | null;
  previousScore: number | null;
  lastTestedAt: string | null;
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

export async function getDashboardTrainingStats(userId: string): Promise<{
  technologies: TechnologyScore[];
  history: TechnologyHistory[];
}> {
  const answers = await withDbRetry(() =>
    prisma.trainingAnswer.findMany({
      where: { userId },
      include: { question: true },
      orderBy: { answeredAt: "asc" },
    }),
  );
  if (!answers.length) return { technologies: [], history: [] };

  const byCompetency = new Map<string, { label: string; scores: { value: number; at: Date }[] }>();
  for (const answer of answers) {
    const value = scoreFor(answer);
    if (value === null) continue;
    const key = answer.question.competency;
    const entry = byCompetency.get(key) ?? { label: answer.question.competencyLabel, scores: [] };
    entry.scores.push({ value, at: answer.answeredAt });
    byCompetency.set(key, entry);
  }

  const ranked = [...byCompetency.entries()].sort((a, b) => b[1].scores.length - a[1].scores.length);

  const minSampleForTrend = 4;
  const technologies: TechnologyScore[] = ranked.map(([, entry]) => {
    const half = Math.floor(entry.scores.length / 2);
    const previousScore = entry.scores.length >= minSampleForTrend
      ? average(entry.scores.slice(0, half).map((item) => item.value))
      : null;
    const currentScores = entry.scores.slice(entry.scores.length >= minSampleForTrend ? half : 0).map((item) => item.value);
    return {
      name: entry.label,
      score: average(currentScores),
      previousScore,
      lastTestedAt: formatDate(entry.scores[entry.scores.length - 1].at),
    };
  });

  const history: TechnologyHistory[] = ranked.slice(0, 3).map(([, entry], index) => {
    const points: HistoryPoint[] = [];
    const running: number[] = [];
    for (const item of entry.scores.slice(-6)) {
      running.push(item.value);
      points.push({ label: formatDate(item.at), score: average(running) ?? item.value });
    }
    return { name: entry.label, color: chartColors[index % chartColors.length], points };
  });

  return { technologies, history };
}
