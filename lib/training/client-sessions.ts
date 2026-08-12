const STORAGE_KEY = "devready-training-session-ids";

export function addLocalTrainingSessionId(sessionId: string) {
  if (typeof window === "undefined") return;
  const ids = getLocalTrainingSessionIds();
  if (ids.includes(sessionId)) return;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...ids, sessionId]));
}

export function getLocalTrainingSessionIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
