export type TechnologyScore = {
  name: string;
  score: number | null;
  previousScore: number | null;
  lastTestedAt: string | null;
  jobSessionId: string | null;
};

export type HistoryPoint = { label: string; score: number };

export type TechnologyHistory = {
  name: string;
  color: string;
  points: HistoryPoint[];
};

export const dashboardData = {
  readiness: 76,
  previousReadiness: 70,
  technologies: [
    { name: "React", score: 86, previousScore: 79, lastTestedAt: "30 jul", jobSessionId: null },
    { name: "TypeScript", score: 78, previousScore: 73, lastTestedAt: "30 jul", jobSessionId: null },
    { name: "Testes", score: 61, previousScore: 52, lastTestedAt: "27 jul", jobSessionId: null },
    { name: "SQL", score: null, previousScore: null, lastTestedAt: null, jobSessionId: null },
    { name: "Node.js", score: null, previousScore: null, lastTestedAt: null, jobSessionId: null },
  ] satisfies TechnologyScore[],
  history: [
    { name: "React", color: "#7755e8", points: [{ label: "18 jul", score: 64 }, { label: "22 jul", score: 71 }, { label: "27 jul", score: 79 }, { label: "30 jul", score: 86 }] },
    { name: "TypeScript", color: "#e8641d", points: [{ label: "18 jul", score: 59 }, { label: "22 jul", score: 67 }, { label: "27 jul", score: 73 }, { label: "30 jul", score: 78 }] },
    { name: "Testes", color: "#1f9d73", points: [{ label: "18 jul", score: 38 }, { label: "22 jul", score: 45 }, { label: "27 jul", score: 52 }, { label: "30 jul", score: 61 }] },
  ] satisfies TechnologyHistory[],
};
