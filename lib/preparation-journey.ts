import type { JobAnalysis, TrainingAttempt } from "@/lib/job-training";

export type EvidenceStatus = "demonstrated" | "developing" | "not-evidenced";

export type CompetencyEvidence = {
  competency: string;
  status: EvidenceStatus;
  confidence: "alta" | "média" | "baixa";
  score: number | null;
  evidence: string[];
  nextAction: string;
};

export type InterviewSnapshot = {
  score: number;
  strongest: string;
  priority: string;
  completedAt: string;
};

export type PreparationTask = {
  id: string;
  period: string;
  action: string;
  completed: boolean;
};

export type PreparationPlan = {
  id: string;
  priority: string;
  sourceScore: number;
  createdAt: string;
  tasks: PreparationTask[];
};

export type JourneyProgress = {
  trainingAttempts: TrainingAttempt[];
  interview?: InterviewSnapshot;
  plan?: PreparationPlan;
};

export type JourneyStage = "vaga" | "diagnostico" | "pratica" | "entrevista" | "plano";

export const journeyStages: Array<{
  id: JourneyStage;
  label: string;
  href: string;
}> = [
  { id: "vaga", label: "Vaga", href: "/dashboard/nova-sessao" },
  { id: "diagnostico", label: "Diagnóstico", href: "/dashboard/resultado" },
  { id: "pratica", label: "Prática", href: "/dashboard/treino-vaga" },
  { id: "entrevista", label: "Entrevista", href: "/dashboard/agente" },
  { id: "plano", label: "Plano", href: "/dashboard/trilha" },
];

function statusFromScore(score: number | null): EvidenceStatus {
  if (score === null) return "not-evidenced";
  if (score >= 75) return "demonstrated";
  if (score >= 50) return "developing";
  return "not-evidenced";
}

export function buildEvidenceMatrix(
  analysis: JobAnalysis,
  sourceLabel = "Perfil demonstrativo",
  progress?: JourneyProgress,
): CompetencyEvidence[] {
  const technologies = analysis.technologies.filter((item) => item.required);
  const technical = technologies.map((item) => {
    const relevantAttempts = progress?.trainingAttempts ?? [];
    const practiceScore = item.name === analysis.priority && relevantAttempts.length
      ? Math.round(relevantAttempts.reduce((total, attempt) => total + attempt.score, 0) / relevantAttempts.length)
      : null;
    const interviewScore = progress?.interview && [progress.interview.strongest, progress.interview.priority].includes(item.name)
      ? progress.interview.score
      : null;
    const bestScore = Math.max(item.profileScore ?? 0, practiceScore ?? 0, interviewScore ?? 0) || null;
    const status = bestScore === null && item.evidence?.length ? "developing" : statusFromScore(bestScore);
    const evidence = ["Requisito identificado na vaga"];
    if (item.profileScore !== null) evidence.push(`${sourceLabel}: registro de ${item.name}`);
    if (item.evidence?.length) evidence.push(...item.evidence.map((source) => `${source}: menção de ${item.name}`));
    if (practiceScore !== null) evidence.push(`Prática concluída: ${practiceScore}/100`);
    if (interviewScore !== null) evidence.push(`Entrevista concluída: ${interviewScore}/100`);
    return {
      competency: item.name,
      status,
      confidence: interviewScore !== null || practiceScore !== null ? "alta" : item.profileScore !== null || item.evidence?.length ? "média" : "baixa",
      score: bestScore,
      evidence: evidence.length === 1 ? [...evidence, "Nenhuma evidência disponível no perfil"] : evidence,
      nextAction: status === "demonstrated"
        ? "Preparar um exemplo de aplicação e decisões técnicas."
        : status === "developing"
          ? "Praticar uma questão e registrar um exemplo concreto."
          : "Começar pelos fundamentos e validar com um exercício curto.",
    } satisfies CompetencyEvidence;
  });

  const behavioral = analysis.softSkills.slice(0, 3).map((skill) => ({
    competency: skill,
    status: "not-evidenced" as const,
    confidence: "baixa" as const,
    score: null,
    evidence: ["Competência citada na vaga", "Ainda não avaliada em entrevista"],
    nextAction: "Responder a uma pergunta comportamental com contexto, ação e resultado.",
  }));

  return [...technical, ...behavioral];
}

export function getJourneyCompletion(progress?: JourneyProgress) {
  if (!progress) return 20;
  let completed = 2;
  if (progress.trainingAttempts.length > 0) completed += 1;
  if (progress.interview) completed += 1;
  if (progress.plan?.tasks.some((task) => task.completed)) completed += 1;
  return Math.min(100, completed * 20);
}

export function getNextJourneyAction(progress?: JourneyProgress) {
  if (!progress?.trainingAttempts.length) {
    return {
      label: "Praticar competência prioritária",
      description: "Comece com um treino curto orientado pelos requisitos da vaga.",
      href: "/dashboard/treino-vaga",
      stage: "pratica" as JourneyStage,
    };
  }
  if (!progress.interview) {
    return {
      label: "Simular entrevista",
      description: "Transforme o conhecimento praticado em uma resposta convincente.",
      href: "/dashboard/agente",
      stage: "entrevista" as JourneyStage,
    };
  }
  return {
    label: "Executar plano de preparação",
    description: "Consolide as lacunas encontradas e acompanhe a evolução.",
    href: "/dashboard/trilha",
    stage: "plano" as JourneyStage,
  };
}

export function getEvidenceSummary(matrix: CompetencyEvidence[]) {
  return matrix.reduce(
    (summary, item) => {
      summary[item.status] += 1;
      return summary;
    },
    { demonstrated: 0, developing: 0, "not-evidenced": 0 },
  );
}
