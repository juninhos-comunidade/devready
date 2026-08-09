// O banco gratuito que usamos "dorme" quando fica um tempo sem uso, e a
// primeira consulta depois disso pode demorar demais e ser cancelada pelo
// próprio Postgres (erro "query timeout", código 08P01) — não é um erro de
// verdade no nosso código, é só o banco ainda acordando. Em vez de deixar
// isso quebrar a tela (o que já aconteceu), tentamos de novo algumas vezes
// com uma pausa curta entre as tentativas antes de desistir.

const RETRYABLE_ERROR_CODES = new Set([
  "08P01", // query_canceled / timeout no protocolo do Postgres
  "57P01", // admin_shutdown (conexão derrubada no meio)
  "P1001", // Prisma: não conseguiu alcançar o banco
  "P1002", // Prisma: banco demorou demais pra responder
  "P2024", // Prisma: esgotou o tempo esperando uma conexão livre no pool
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
      // espera um pouco mais a cada tentativa (até um teto), dando tempo
      // do banco "acordar" de verdade — o cold start pode levar bem mais
      // que alguns segundos no plano gratuito
      const delay = Math.min(attempt * 1500, 6000);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}
