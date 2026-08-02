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

export type RecentSession = {
  id: string;
  title: string;
  company: string;
  date: string;
  score: number;
  delta: number | null;
};

// Contrato temporário da tela. Quando os modelos de treino forem adicionados ao
// Prisma, somente a origem deste objeto precisa mudar; os componentes continuam
// recebendo o mesmo formato e não ficam acoplados ao banco.
export const dashboardData = {
  readiness: 76,
  previousReadiness: 70,
  sessionsCount: 4,
  jobsCount: 3,
  technologies: [
    { name: "React", score: 86, previousScore: 79, lastTestedAt: "30 jul" },
    { name: "TypeScript", score: 78, previousScore: 73, lastTestedAt: "30 jul" },
    { name: "Testes", score: 61, previousScore: 52, lastTestedAt: "27 jul" },
    { name: "SQL", score: null, previousScore: null, lastTestedAt: null },
    { name: "Node.js", score: null, previousScore: null, lastTestedAt: null },
  ] satisfies TechnologyScore[],
  history: [
    {
      name: "React",
      color: "#7755e8",
      points: [
        { label: "18 jul", score: 64 },
        { label: "22 jul", score: 71 },
        { label: "27 jul", score: 79 },
        { label: "30 jul", score: 86 },
      ],
    },
    {
      name: "TypeScript",
      color: "#e8641d",
      points: [
        { label: "18 jul", score: 59 },
        { label: "22 jul", score: 67 },
        { label: "27 jul", score: 73 },
        { label: "30 jul", score: 78 },
      ],
    },
    {
      name: "Testes",
      color: "#1f9d73",
      points: [
        { label: "18 jul", score: 38 },
        { label: "22 jul", score: 45 },
        { label: "27 jul", score: 52 },
        { label: "30 jul", score: 61 },
      ],
    },
  ] satisfies TechnologyHistory[],
  github: {
    score: 82,
    updatedAt: "Atualizado há 2 dias",
    strengths: ["READMEs claros", "Boa organização"],
    improvement: "Aumentar a frequência de commits",
  },
  recentSessions: [
    {
      id: "frontend-fintech",
      title: "Frontend Júnior",
      company: "Fintech Aurora",
      date: "30 jul",
      score: 84,
      delta: 7,
    },
    {
      id: "react-ecommerce",
      title: "Desenvolvedor React",
      company: "Loja Horizonte",
      date: "27 jul",
      score: 72,
      delta: 5,
    },
    {
      id: "estagio-web",
      title: "Estágio em Desenvolvimento Web",
      company: "Studio Norte",
      date: "22 jul",
      score: 65,
      delta: null,
    },
  ] satisfies RecentSession[],
};
