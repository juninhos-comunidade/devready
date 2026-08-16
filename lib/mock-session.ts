import { analyzeJobLocally, demoCandidateProfile, getSessionLimit, SESSION_LIST_KEY, type JobAnalysis, type TrainingAttempt } from "@/lib/job-training";
import type { JourneyProgress } from "@/lib/preparation-journey";
import { demoModeEnabled } from "@/lib/demo-mode";

export const MOCK_SESSION_KEY = "devready:mock-session";

export type MockSession = {
  id: string;
  name: string;
  company: string;
  description: string;
  source: "text" | "image";
  analysis: JobAnalysis;
  analysisNotice?: string;
  progress: JourneyProgress;
  createdAt: string;
};

const defaultDescription =
  "Vaga para pessoa desenvolvedora frontend com React, TypeScript, testes automatizados e consumo de APIs REST. Valorizamos comunicação, colaboração e vontade de aprender.";

export const defaultMockSession: MockSession = {
  id: "demo-frontend-junior",
  name: "Frontend Júnior",
  company: "Aurora Tech",
  description: defaultDescription,
  source: "text",
  analysis: analyzeJobLocally(defaultDescription, "Aurora Tech", demoCandidateProfile),
  progress: {
    trainingAttempts: (demoModeEnabled ? [
      { id: "demo-1", sessionId: "demo-frontend-junior", sessionName: "Frontend Júnior", mode: "quiz", score: 80, difficulty: "intermediaria", createdAt: "2026-08-13T09:00:00.000Z" },
      { id: "demo-2", sessionId: "demo-frontend-junior", sessionName: "Frontend Júnior", mode: "comportamental", score: 75, difficulty: "iniciante", createdAt: "2026-08-13T11:00:00.000Z" },
    ] satisfies TrainingAttempt[] : []),
  },
  createdAt: "2026-08-12T09:00:00.000Z",
};

export function parseMockSession(value: string | null): MockSession {
  if (!value) return defaultMockSession;

  try {
    const parsed = JSON.parse(value) as Partial<MockSession>;
    const description = parsed.description?.trim() || defaultMockSession.description;
    const company = parsed.company?.trim() || "Empresa não informada";

    return {
      id: parsed.id || "legacy-session",
      name: parsed.name?.trim() || "Treino personalizado",
      company,
      description,
      source: parsed.source === "image" ? "image" : "text",
      analysis: parsed.analysis ?? analyzeJobLocally(description, company),
      analysisNotice: parsed.analysisNotice,
      progress: parsed.progress && Array.isArray(parsed.progress.trainingAttempts)
        ? parsed.progress
        : { trainingAttempts: [] },
      createdAt: parsed.createdAt || new Date().toISOString(),
    };
  } catch {
    return defaultMockSession;
  }
}

export function persistMockSession(session: MockSession) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(session));
  try {
    const stored = window.localStorage.getItem(SESSION_LIST_KEY);
    const parsed: unknown = stored ? JSON.parse(stored) : [];
    const previous = Array.isArray(parsed) ? parsed as MockSession[] : [];
    const sessions = [session, ...previous.filter((item) => item.id !== session.id)].slice(0, getSessionLimit());
    window.localStorage.setItem(SESSION_LIST_KEY, JSON.stringify(sessions));
  } catch {}
}

export function readSessionList(): MockSession[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = window.localStorage.getItem(SESSION_LIST_KEY);
    const parsed: unknown = stored ? JSON.parse(stored) : [];
    const sessions = Array.isArray(parsed) ? parsed.map((item) => parseMockSession(JSON.stringify(item))) : [];
    return sessions.length === 0 && demoModeEnabled ? [defaultMockSession] : sessions;
  } catch {
    return demoModeEnabled ? [defaultMockSession] : [];
  }
}

export function removeSessionFromList(sessionId: string) {
  if (typeof window === "undefined") return;
  try {
    const sessions = readSessionList().filter((item) => item.id !== sessionId);
    window.localStorage.setItem(SESSION_LIST_KEY, JSON.stringify(sessions));
  } catch {}
}

const technologyRules = [
  { name: "React", terms: ["react", "hooks", "frontend"], base: 86 },
  { name: "TypeScript", terms: ["typescript", "tipagem"], base: 78 },
  { name: "Testes", terms: ["teste", "jest", "vitest", "qa"], base: 61 },
  { name: "SQL", terms: ["sql", "banco", "postgres"], base: 54 },
  { name: "Node.js", terms: ["node", "backend", "api"], base: 68 },
] as const;

export function analyzeMockJob(description: string) {
  const normalized = description.toLocaleLowerCase("pt-BR");
  const technologies = technologyRules.map((technology) => {
    const required = technology.terms.some((term) => normalized.includes(term));
    return { name: technology.name, required, score: required ? technology.base : null };
  });
  const required = technologies.filter((technology) => technology.required);
  const compatibility = required.length
    ? Math.round(required.reduce((total, technology) => total + (technology.score ?? 0), 0) / required.length)
    : 72;

  return {
    compatibility,
    technologies,
    strongest: [...required].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0]?.name ?? "Fundamentos",
    priority: [...required].sort((a, b) => (a.score ?? 0) - (b.score ?? 0))[0]?.name ?? "Mapear requisitos",
  };
}
