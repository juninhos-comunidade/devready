const RETRYABLE_ERROR_CODES = new Set([
  "08P01",
  "57P01",
  "P1001",
  "P1002",
  "P2024",
]);

function isRetryableError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const code = "code" in error ? (error as { code?: unknown }).code : undefined;
  if (typeof code === "string" && RETRYABLE_ERROR_CODES.has(code)) return true;
  const message = "message" in error ? String((error as { message?: unknown }).message ?? "") : "";
  return message.includes("query timeout") || message.includes("Timed out");
}

export async function withDbRetry<T>(operation: () => Promise<T>, attempts = 5): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (!isRetryableError(error) || attempt === attempts) throw error;
      const delay = Math.min(attempt * 1500, 6000);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}
