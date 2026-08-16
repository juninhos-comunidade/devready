import "server-only";

import {
  clampScore,
  type CandidateProfileSnapshot,
  type JobAnalysis,
  type TrainingContent,
  type TrainingDifficulty,
  type TrainingEvaluation,
} from "@/lib/job-training";
import { canonicalCandidateSkill } from "@/lib/candidate-profile";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_TEXT_MODEL = "openai/gpt-oss-20b";
const DEFAULT_VISION_MODEL = "qwen/qwen3.6-27b";
const REQUEST_TIMEOUT_MS = 30_000;

type GroqMessage = {
  role: "system" | "user";
  content: string | Array<
    | { type: "text"; text: string }
    | { type: "image_url"; image_url: { url: string } }
  >;
};

type GroqResponse = {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message?: string };
};

export class GroqConfigurationError extends Error {}

function getApiKey() {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) throw new GroqConfigurationError("GROQ_API_KEY não configurada.");
  return apiKey;
}

async function requestJson<T>(messages: GroqMessage[], model: string): Promise<T> {
  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.2,
      response_format: { type: "json_object" },
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    cache: "no-store",
  });
  const payload = await response.json().catch(() => ({})) as GroqResponse;
  if (!response.ok) {
    throw new Error(`Groq ${response.status}: ${payload.error?.message ?? "falha na solicitação"}`);
  }
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error("A Groq não retornou conteúdo.");
  return JSON.parse(content) as T;
}

function asStringArray(value: unknown, limit = 12) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0).slice(0, limit)
    : [];
}

function parseAnalysis(value: unknown): JobAnalysis {
  if (!value || typeof value !== "object") throw new Error("Análise inválida.");
  const data = value as Record<string, unknown>;
  const technologies = Array.isArray(data.technologies)
    ? data.technologies.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const technology = item as Record<string, unknown>;
      if (typeof technology.name !== "string") return [];
      return [{
        name: technology.name,
        required: true,
        profileScore: typeof technology.profileScore === "number" ? clampScore(technology.profileScore) : null,
        evidence: [],
      }];
    }).slice(0, 12)
    : [];
  if (!technologies.length) throw new Error("A análise não identificou tecnologias.");

  return {
    company: typeof data.company === "string" && data.company.trim() ? data.company : "Empresa não informada",
    seniority: typeof data.seniority === "string" ? data.seniority : "Não informada",
    compatibility: clampScore(typeof data.compatibility === "number" ? data.compatibility : 0),
    strongest: typeof data.strongest === "string" ? data.strongest : technologies[0].name,
    priority: typeof data.priority === "string" ? data.priority : technologies.at(-1)?.name ?? technologies[0].name,
    technologies,
    requirements: asStringArray(data.requirements),
    softSkills: asStringArray(data.softSkills, 8),
    summary: typeof data.summary === "string" ? data.summary : "Requisitos analisados para orientar o treino.",
    source: "groq",
  };
}

export async function analyzeJobWithGroq({
  description,
  company,
  imageDataUrl,
  profile,
}: {
  description: string;
  company: string;
  imageDataUrl?: string;
  profile?: CandidateProfileSnapshot;
}) {
  const profileDescription = profile
    ? `${profile.label}: ${[
      ...Object.entries(profile.skillScores).map(([skill, score]) => `${skill} ${score}`),
      ...Object.entries(profile.skillEvidence ?? {}).map(([skill, evidence]) => `${skill} mencionado em ${evidence.join(" e ")}`),
    ].join(", ")}`
    : "nenhuma evidência de perfil disponível";
  const instruction = `Analise a vaga em português do Brasil. Extraia empresa, senioridade, tecnologias, requisitos e competências comportamentais. Contexto do candidato: ${profileDescription}. Só atribua profileScore quando houver pontuação fornecida no contexto; caso contrário use null. Calcule a compatibilidade somente com evidências disponíveis e não trate ausência de evidência como falta de conhecimento. Retorne JSON puro com: company, seniority, compatibility, strongest, priority, technologies (array de objetos com name e profileScore numérico ou null), requirements (array), softSkills (array), summary. Não invente uma empresa se ela não estiver no texto.`;
  const userText = `Empresa informada no formulário: ${company || "não informada"}\nDescrição digitada: ${description || "não fornecida; leia a imagem"}`;
  const content: GroqMessage["content"] = imageDataUrl
    ? [{ type: "text", text: `${instruction}\n\n${userText}` }, { type: "image_url", image_url: { url: imageDataUrl } }]
    : `${instruction}\n\n${userText}`;
  const raw = await requestJson<unknown>([
    { role: "system", content: "Você é um analisador de vagas de tecnologia. Responda exclusivamente com JSON válido." },
    { role: "user", content },
  ], imageDataUrl ? (process.env.GROQ_VISION_MODEL || DEFAULT_VISION_MODEL) : (process.env.GROQ_MODEL || DEFAULT_TEXT_MODEL));
  const analysis = parseAnalysis(raw);
  const findProfileEntry = <T,>(entries: Record<string, T> | undefined, name: string) =>
    Object.entries(entries ?? {}).find(([skill]) =>
      canonicalCandidateSkill(skill).toLocaleLowerCase("pt-BR") === canonicalCandidateSkill(name).toLocaleLowerCase("pt-BR")
    )?.[1];
  const technologies = analysis.technologies.map((technology) => ({
    ...technology,
    profileScore: findProfileEntry(profile?.skillScores, technology.name) ?? null,
    evidence: findProfileEntry(profile?.skillEvidence, technology.name) ?? [],
  }));
  const scored = technologies.filter((technology) => technology.profileScore !== null);
  const evidenced = technologies.filter((technology) => technology.profileScore !== null || technology.evidence.length);
  const compatibility = scored.length
    ? clampScore(scored.reduce((total, technology) => total + (technology.profileScore ?? 0), 0) / technologies.length)
    : clampScore((evidenced.length / technologies.length) * 100);
  const ranked = [...technologies].sort((a, b) => ((b.profileScore ?? 0) + b.evidence.length) - ((a.profileScore ?? 0) + a.evidence.length));
  return {
    ...analysis,
    technologies,
    compatibility,
    strongest: ranked[0]?.name ?? analysis.strongest,
    priority: ranked.at(-1)?.name ?? analysis.priority,
    profileLabel: profile?.label ?? "Perfil sem evidências processadas",
  };
}

function parseTrainingContent(value: unknown): TrainingContent {
  if (!value || typeof value !== "object") throw new Error("Conteúdo de treino inválido.");
  const data = value as Record<string, unknown>;
  if (!Array.isArray(data.questions) || data.questions.length < 15) throw new Error("A Groq retornou menos de 15 perguntas.");
  const questions = data.questions.slice(0, 15).map((item, index) => {
    if (!item || typeof item !== "object") throw new Error("Pergunta inválida.");
    const question = item as Record<string, unknown>;
    const options = asStringArray(question.options, 4);
    if (options.length !== 4 || typeof question.prompt !== "string") throw new Error("Alternativas inválidas.");
    return {
      id: typeof question.id === "string" ? question.id : `groq-${index + 1}`,
      topic: typeof question.topic === "string" ? question.topic : "Fundamentos",
      difficulty: (["iniciante", "intermediaria", "avancada"].includes(String(question.difficulty)) ? question.difficulty : "intermediaria") as TrainingDifficulty,
      prompt: question.prompt,
      options: options as [string, string, string, string],
      correctIndex: Math.max(0, Math.min(3, Number(question.correctIndex) || 0)),
      explanation: typeof question.explanation === "string" ? question.explanation : "Revise o conceito e compare as alternativas.",
    };
  });
  const challenge = data.codeChallenge as Record<string, unknown> | undefined;
  if (!challenge || typeof challenge.statement !== "string") throw new Error("Desafio de código inválido.");
  return {
    questions,
    behavioralQuestion: typeof data.behavioralQuestion === "string" ? data.behavioralQuestion : "Conte uma experiência relevante usando o método STAR.",
    codeChallenge: {
      title: typeof challenge.title === "string" ? challenge.title : "Desafio prático",
      language: typeof challenge.language === "string" ? challenge.language : "JavaScript",
      difficulty: (["iniciante", "intermediaria", "avancada"].includes(String(challenge.difficulty)) ? challenge.difficulty : "intermediaria") as TrainingDifficulty,
      statement: challenge.statement,
      requirements: asStringArray(challenge.requirements, 6),
      starterCode: typeof challenge.starterCode === "string" ? challenge.starterCode : "",
    },
    source: "groq",
  };
}

export async function generateTrainingWithGroq(analysis: JobAnalysis, description: string) {
  const prompt = `Crie um treino para esta vaga: ${description}\nAnálise: ${JSON.stringify(analysis)}\nRetorne JSON puro com exatamente 15 perguntas de múltipla escolha em questions. Cada pergunta deve ter id, topic, difficulty (iniciante, intermediaria ou avancada), prompt, options com exatamente 4 alternativas, correctIndex de 0 a 3 e explanation. Distribua as respostas corretas entre as quatro posições. Inclua behavioralQuestion no método STAR e codeChallenge com title, language, difficulty, statement, requirements e starterCode. Alinhe tudo às tecnologias e à senioridade da vaga; não peça credenciais, dados pessoais nem execução de código perigoso.`;
  const raw = await requestJson<unknown>([
    { role: "system", content: "Você cria avaliações educacionais para entrevistas de tecnologia. Responda exclusivamente com JSON válido." },
    { role: "user", content: prompt },
  ], process.env.GROQ_MODEL || DEFAULT_TEXT_MODEL);
  return parseTrainingContent(raw);
}

function parseEvaluation(value: unknown): Omit<TrainingEvaluation, "source"> {
  if (!value || typeof value !== "object") throw new Error("Avaliação inválida.");
  const data = value as Record<string, unknown>;
  const difficulty = String(data.nextDifficulty);
  return {
    score: clampScore(typeof data.score === "number" ? data.score : 0),
    feedback: typeof data.feedback === "string" ? data.feedback : "Revise a resposta e tente novamente.",
    strengths: asStringArray(data.strengths, 5),
    improvements: asStringArray(data.improvements, 5),
    nextDifficulty: (["iniciante", "intermediaria", "avancada"].includes(difficulty) ? difficulty : "intermediaria") as TrainingDifficulty,
  };
}

export async function evaluateWithGroq({
  mode,
  answer,
  prompt,
  requirements,
  difficulty,
}: {
  mode: "comportamental" | "codigo";
  answer: string;
  prompt: string;
  requirements: string[];
  difficulty: TrainingDifficulty;
}) {
  const criteria = mode === "codigo"
    ? "correção conceitual, clareza do raciocínio, casos de borda, testes e legibilidade; não execute o código"
    : "Situação, Tarefa, Ação, Resultado, clareza, evidências e impacto";
  const raw = await requestJson<unknown>([
    { role: "system", content: "Você avalia respostas educacionais de entrevistas de tecnologia. Não execute código. Responda exclusivamente com JSON válido." },
    { role: "user", content: `Modalidade: ${mode}. Nível atual: ${difficulty}. Critérios: ${criteria}. Pergunta/desafio: ${prompt}. Requisitos: ${requirements.join("; ")}. Resposta: ${answer}. Retorne JSON com score de 0 a 100, feedback, strengths (array), improvements (array) e nextDifficulty (iniciante, intermediaria ou avancada).` },
  ], process.env.GROQ_MODEL || DEFAULT_TEXT_MODEL);
  return { ...parseEvaluation(raw), source: "groq" as const };
}

export function groqIsConfigured() {
  return Boolean(process.env.GROQ_API_KEY?.trim());
}
