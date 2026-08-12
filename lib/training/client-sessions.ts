const STORAGE_PREFIX = "devready-training-session-ids";

function storageKey(vagaId: string): string {
  return `${STORAGE_PREFIX}:${vagaId}`;
}

export function addLocalTrainingSessionId(vagaId: string, trainingSessionId: string) {
  if (typeof window === "undefined") return;
  const ids = getLocalTrainingSessionIds(vagaId);
  if (ids.includes(trainingSessionId)) return;
  window.sessionStorage.setItem(storageKey(vagaId), JSON.stringify([...ids, trainingSessionId]));
}

export function getLocalTrainingSessionIds(vagaId: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(storageKey(vagaId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
