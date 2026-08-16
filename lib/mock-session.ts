import { analyzeJobLocally, getSessionLimit, SESSION_LIST_KEY, type JobAnalysis } from "@/lib/job-training";
import type { JourneyProgress } from "@/lib/preparation-journey";

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

export function parseMockSession(value: string | null): MockSession | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Partial<MockSession>;
    if (parsed.id === "demo-frontend-junior") return null;
    const description = parsed.description?.trim();
    if (!description) return null;
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
    return null;
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
    const sessions = Array.isArray(parsed)
      ? parsed.map((item) => parseMockSession(JSON.stringify(item))).filter((item): item is MockSession => item !== null)
      : [];
    return sessions;
  } catch {
    return [];
  }
}

export function removeSessionFromList(sessionId: string) {
  if (typeof window === "undefined") return;
  try {
    const sessions = readSessionList().filter((item) => item.id !== sessionId);
    window.localStorage.setItem(SESSION_LIST_KEY, JSON.stringify(sessions));
  } catch {}
}
