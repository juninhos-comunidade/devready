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

export type InterviewCriteria = {
  content: number;
  clarity: number;
  evidence: number;
  structure: number;
};

export type InterviewSnapshot = {
  score: number;
  strongest: string;
  priority: string;
  completedAt: string;
  track: string;
  criteria: InterviewCriteria;
};

export type JourneyProgress = {
  trainingAttempts: TrainingAttempt[];
  interviewHistory?: InterviewSnapshot[];
};

export function getLatestInterview(progress?: JourneyProgress): InterviewSnapshot | undefined {
  return progress?.interviewHistory?.at(-1);
}

export type InterviewComparison = {
  first: InterviewSnapshot;
  latest: InterviewSnapshot;
};

export function getInterviewComparison(progress?: JourneyProgress): InterviewComparison | null {
  const history = progress?.interviewHistory ?? [];
  if (!history.length) return null;
  const track = history.at(-1)!.track;
  const sameTrack = history.filter((item) => item.track === track);
  if (sameTrack.length < 2) return null;
  return { first: sameTrack[0], latest: sameTrack.at(-1)! };
}

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
  { id: "plano", label: "Trilha", href: "/dashboard/trilha" },
];

function statusFromScore(score: number | null): EvidenceStatus {
  if (score === null) return "not-evidenced";
  if (score >= 75) return "demonstrated";
  if (score >= 50) return "developing";
  return "not-evidenced";
}

function averageScore(attempts: TrainingAttempt[]): number | null {
  if (!attempts.length) return null;
  return Math.round(attempts.reduce((total, attempt) => total + attempt.score, 0) / attempts.length);
}

function firstWord(text: string): string {
  return text.toLocaleLowerCase("pt-BR").split(" ")[0];
}

export function buildEvidenceMatrix(
  analysis: JobAnalysis,
  sourceLabel = "Perfil demonstrativo",
  progress?: JourneyProgress,
): CompetencyEvidence[] {
  const quizScore = averageScore((progress?.trainingAttempts ?? []).filter((attempt) => attempt.mode === "quiz"));
  const latestInterview = getLatestInterview(progress);
  const technologies = analysis.technologies.filter((item) => item.required);
  const technical = technologies.map((item) => {
    const practiceScore = quizScore;
    const interviewScore = latestInterview && [latestInterview.strongest, latestInterview.priority].includes(item.name)
      ? latestInterview.score
      : null;
    const bestScore = Math.max(item.profileScore ?? 0, practiceScore ?? 0, interviewScore ?? 0) || null;
    const status = bestScore === null && item.evidence?.length ? "developing" : statusFromScore(bestScore);
    const evidence = ["Requisito identificado na vaga"];
    if (item.profileScore !== null) evidence.push(`${sourceLabel}: registro de ${item.name}`);
    if (item.evidence?.length) evidence.push(...item.evidence.map((source) => `${source}: menção de ${item.name}`));
    if (practiceScore !== null) evidence.push(`Quiz técnico concluído: ${practiceScore}/100`);
    if (interviewScore !== null) evidence.push(`Entrevista concluída: ${interviewScore}/100`);
    return {
      competency: item.name,
      status,
      confidence: interviewScore !== null ? "alta" : practiceScore !== null ? "média" : item.profileScore !== null || item.evidence?.length ? "média" : "baixa",
      score: bestScore,
      evidence: evidence.length === 1 ? [...evidence, "Nenhuma evidência disponível no perfil"] : evidence,
      nextAction: status === "demonstrated"
        ? "Preparar um exemplo de aplicação e decisões técnicas."
        : status === "developing"
          ? "Praticar uma questão e registrar um exemplo concreto."
          : "Começar pelos fundamentos e validar com um exercício curto.",
    } satisfies CompetencyEvidence;
  });

  const starScore = averageScore((progress?.trainingAttempts ?? []).filter((attempt) => attempt.mode === "comportamental"));
  const behavioral = analysis.softSkills.slice(0, 3).map((skill) => {
    const interviewMatch = latestInterview
      ? [latestInterview.strongest, latestInterview.priority].find(
          (name) => firstWord(name) === firstWord(skill) || name.toLocaleLowerCase("pt-BR").includes(skill.toLocaleLowerCase("pt-BR")),
        )
      : undefined;
    const interviewScore = interviewMatch ? latestInterview!.score : null;
    const bestScore = Math.max(starScore ?? 0, interviewScore ?? 0) || null;
    const status = statusFromScore(bestScore);
    const evidence = ["Competência citada na vaga"];
    if (starScore !== null) evidence.push(`Resposta STAR concluída: ${starScore}/100`);
    if (interviewScore !== null) evidence.push(`Entrevista concluída: ${interviewScore}/100`);
    return {
      competency: skill,
      status,
      confidence: starScore !== null || interviewScore !== null ? "média" : "baixa",
      score: bestScore,
      evidence: evidence.length === 1 ? [...evidence, "Ainda não avaliada em entrevista ou treino"] : evidence,
      nextAction: status === "demonstrated"
        ? "Preparar um exemplo de aplicação e decisões concretas."
        : status === "developing"
          ? "Responder mais uma pergunta comportamental com contexto, ação e resultado."
          : "Responder a uma pergunta comportamental com contexto, ação e resultado.",
    } satisfies CompetencyEvidence;
  });

  return [...technical, ...behavioral];
}

export function getJourneyCompletion(progress?: JourneyProgress, trilhaComplete?: boolean) {
  if (!progress) return 20;
  let completed = 2;
  if (progress.trainingAttempts.length > 0) completed += 1;
  if (getLatestInterview(progress)) completed += 1;
  if (trilhaComplete) completed += 1;
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
  if (!getLatestInterview(progress)) {
    return {
      label: "Simular entrevista",
      description: "Transforme o conhecimento praticado em uma resposta convincente.",
      href: "/dashboard/agente",
      stage: "entrevista" as JourneyStage,
    };
  }
  return {
    label: "Seguir a trilha de preparação",
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
