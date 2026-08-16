export const TRAINING_HISTORY_KEY = "devready:job-training-history:v1";
export const SESSION_LIST_KEY = "devready:job-sessions:v1";
export const DEFAULT_SESSION_LIMIT = 5;

export function getSessionLimit() {
  const configured = Number(process.env.NEXT_PUBLIC_SESSION_LIMIT ?? DEFAULT_SESSION_LIMIT);
  return Number.isFinite(configured) ? Math.max(3, Math.min(5, Math.round(configured))) : DEFAULT_SESSION_LIMIT;
}

export type TrainingDifficulty = "iniciante" | "intermediaria" | "avancada";

export type TechnologyMatch = {
  name: string;
  required: boolean;
  profileScore: number | null;
  evidence?: string[];
};

export type JobAnalysis = {
  company: string;
  seniority: string;
  compatibility: number;
  strongest: string;
  priority: string;
  technologies: TechnologyMatch[];
  requirements: string[];
  softSkills: string[];
  summary: string;
  source: "groq" | "local";
  profileLabel?: string;
};

export type CandidateProfileSnapshot = {
  label: string;
  skillScores: Record<string, number>;
  skillEvidence?: Record<string, string[]>;
};

export type QuizQuestion = {
  id: string;
  topic: string;
  difficulty: TrainingDifficulty;
  prompt: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
};

export type CodeChallenge = {
  title: string;
  language: string;
  difficulty: TrainingDifficulty;
  statement: string;
  requirements: string[];
  starterCode: string;
};

export type TrainingContent = {
  questions: QuizQuestion[];
  behavioralQuestion: string;
  codeChallenge: CodeChallenge;
  source: "groq" | "local";
};

export type TrainingEvaluation = {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  nextDifficulty: TrainingDifficulty;
  source: "groq" | "local";
};

export type TrainingAttempt = {
  id: string;
  sessionId: string;
  sessionName: string;
  mode: "quiz" | "comportamental" | "codigo";
  score: number;
  difficulty: TrainingDifficulty;
  createdAt: string;
};

const technologyCatalog = [
  { name: "React", terms: ["react", "hooks", "frontend"] },
  { name: "TypeScript", terms: ["typescript", "tipagem"] },
  { name: "JavaScript", terms: ["javascript", "ecmascript"] },
  { name: "Testes", terms: ["teste", "jest", "vitest", "qa"] },
  { name: "SQL", terms: ["sql", "postgres", "banco de dados"] },
  { name: "Node.js", terms: ["node", "node.js", "backend"] },
  { name: "Python", terms: ["python", "django", "fastapi"] },
  { name: "APIs REST", terms: ["api", "rest", "http"] },
  { name: "Docker", terms: ["docker", "container"] },
  { name: "AWS", terms: ["aws", "cloud"] },
] as const;

const difficultyOrder: TrainingDifficulty[] = ["iniciante", "intermediaria", "avancada"];

export function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function nextDifficulty(score: number, current: TrainingDifficulty) {
  const index = difficultyOrder.indexOf(current);
  if (score >= 75) return difficultyOrder[Math.min(index + 1, difficultyOrder.length - 1)];
  if (score < 50) return difficultyOrder[Math.max(index - 1, 0)];
  return current;
}

export function analyzeJobLocally(
  description: string,
  company = "Empresa não informada",
  profile?: CandidateProfileSnapshot,
): JobAnalysis {
  const normalized = description.toLocaleLowerCase("pt-BR");
  const technologies = technologyCatalog
    .map((technology) => ({
      name: technology.name,
      required: technology.terms.some((term) => normalized.includes(term)),
      profileScore: technology.terms.some((term) => normalized.includes(term))
        ? profile?.skillScores[technology.name] ?? null
        : null,
      evidence: technology.terms.some((term) => normalized.includes(term))
        ? profile?.skillEvidence?.[technology.name] ?? []
        : [],
    }))
    .filter((technology) => technology.required);
  const selected: TechnologyMatch[] = technologies.length
    ? technologies
    : [{ name: "Fundamentos de tecnologia", required: true, profileScore: null, evidence: [] }];
  const scored = selected.filter((item) => item.profileScore !== null);
  const evidenced = selected.filter((item) => item.profileScore !== null || item.evidence?.length);
  const compatibility = scored.length
    ? clampScore(scored.reduce((total, item) => total + (item.profileScore ?? 0), 0) / selected.length)
    : clampScore((evidenced.length / selected.length) * 100);
  const sorted = [...selected].sort((a, b) => ((b.profileScore ?? 0) + (b.evidence?.length ? 1 : 0)) - ((a.profileScore ?? 0) + (a.evidence?.length ? 1 : 0)));
  const seniority = /s[eê]nior|senior/.test(normalized)
    ? "Sênior"
    : /pleno/.test(normalized)
      ? "Pleno"
      : /est[aá]gio|estagi/.test(normalized)
        ? "Estágio"
        : "Júnior";
  const softSkillRules: Array<{ name: string; terms: string[] }> = [
    { name: "comunicação", terms: ["comunica", "apresenta"] },
    { name: "colaboração", terms: ["equipe", "time", "colabora"] },
    { name: "organização", terms: ["organiza", "prioriza"] },
    { name: "aprendizado contínuo", terms: ["aprend", "curios"] },
  ];
  const softSkills = softSkillRules
    .filter(({ terms }) => terms.some((term) => normalized.includes(term)))
    .map(({ name }) => name);

  return {
    company,
    seniority,
    compatibility,
    strongest: sorted[0]?.name ?? "Fundamentos",
    priority: sorted.at(-1)?.name ?? "Mapear requisitos",
    technologies: selected,
    requirements: selected.map((technology) => technology.name),
    softSkills: softSkills.length ? softSkills : ["comunicação", "colaboração"],
    summary: `A vaga tem perfil ${seniority.toLocaleLowerCase("pt-BR")} e prioriza ${selected.slice(0, 4).map((item) => item.name).join(", ")}.`,
    source: "local",
    profileLabel: profile?.label ?? "Perfil sem evidências processadas",
  };
}

const quizTemplates = [
  ["Qual atitude demonstra melhor domínio de {topic}?", "Explicar a decisão, os riscos e como validaria o resultado", "Repetir uma definição sem contexto", "Evitar qualquer medição", "Escolher sempre a solução mais complexa"],
  ["Ao encontrar um problema relacionado a {topic}, qual é o melhor primeiro passo?", "Reproduzir o problema e reunir evidências antes de alterar a solução", "Trocar toda a tecnologia", "Ignorar os casos de erro", "Publicar sem testar"],
  ["Como apresentar uma decisão envolvendo {topic} em uma entrevista?", "Contextualizar, comparar alternativas e justificar o critério usado", "Citar apenas nomes de ferramentas", "Responder sem exemplo", "Omitir resultados"],
  ["Qual prática reduz riscos ao trabalhar com {topic}?", "Definir critérios de sucesso e validar casos normais e de falha", "Depender apenas de testes manuais informais", "Remover logs", "Evitar revisão"],
  ["O que torna uma resposta técnica sobre {topic} mais convincente?", "Um exemplo concreto com ação, decisão e impacto", "Uma resposta muito longa sem conclusão", "Apenas uma lista de palavras", "Não mencionar limitações"],
] as const;

export function buildLocalTraining(analysis: JobAnalysis): TrainingContent {
  const topics = analysis.requirements.length ? analysis.requirements : [analysis.priority];
  const questions: QuizQuestion[] = Array.from({ length: 15 }, (_, index) => {
    const topic = topics[index % topics.length];
    const template = quizTemplates[index % quizTemplates.length];
    const rotation = index % 4;
    const correct = template[1];
    const wrong = [template[2], template[3], template[4]];
    const options: string[] = [...wrong];
    options.splice(rotation, 0, correct);
    return {
      id: `local-${index + 1}-${topic.toLocaleLowerCase("pt-BR").replace(/[^a-z0-9]+/g, "-")}`,
      topic,
      difficulty: index < 5 ? "iniciante" : index < 10 ? "intermediaria" : "avancada",
      prompt: template[0].replace("{topic}", topic),
      options: options as [string, string, string, string],
      correctIndex: rotation,
      explanation: `A alternativa correta demonstra raciocínio aplicado, validação e comunicação clara sobre ${topic}.`,
    };
  });

  const language = analysis.requirements.find((item) => /python|javascript|typescript|java|c#|sql/i.test(item)) ?? "JavaScript";
  return {
    questions,
    behavioralQuestion: `Conte uma situação em que você precisou aprender ou aplicar ${analysis.priority}. Organize a resposta em Situação, Tarefa, Ação e Resultado.`,
    codeChallenge: {
      title: `Validação prática de ${analysis.priority}`,
      language,
      difficulty: "intermediaria",
      statement: `Implemente uma função que receba uma lista de requisitos e retorne somente os itens válidos, sem duplicidades e em ordem alfabética. Explique as decisões adotadas pensando no contexto da vaga.`,
      requirements: ["Tratar entradas vazias", "Remover duplicidades", "Não alterar a lista original", "Incluir ao menos dois casos de teste"],
      starterCode: "function normalizeRequirements(requirements) {\n}\n",
    },
    source: "local",
  };
}

export function evaluateAnswerLocally(
  mode: "comportamental" | "codigo",
  answer: string,
  difficulty: TrainingDifficulty,
): TrainingEvaluation {
  const normalized = answer.toLocaleLowerCase("pt-BR");
  const lengthScore = Math.min(35, Math.round(answer.trim().length / 12));
  const structureTerms = mode === "codigo"
    ? ["function", "return", "if", "map", "filter", "set", "test", "const"]
    : ["situação", "tarefa", "ação", "resultado", "impacto", "aprendi", "primeiro", "depois"];
  const matches = structureTerms.filter((term) => normalized.includes(term));
  const score = clampScore(30 + lengthScore + matches.length * 6);
  return {
    score,
    feedback: score >= 75
      ? "Resposta consistente, com estrutura e evidências suficientes para sustentar seu raciocínio."
      : "A resposta tem uma boa direção, mas precisa explicitar melhor suas decisões e o resultado obtido.",
    strengths: matches.length ? [`Uso de elementos relevantes: ${matches.slice(0, 3).join(", ")}`] : ["Iniciativa para estruturar uma resposta"],
    improvements: mode === "codigo"
      ? ["Explique a complexidade e acrescente casos de borda", "Inclua testes verificáveis"]
      : ["Separe claramente situação, ação e resultado", "Inclua um impacto concreto ou mensurável"],
    nextDifficulty: nextDifficulty(score, difficulty),
    source: "local",
  };
}
