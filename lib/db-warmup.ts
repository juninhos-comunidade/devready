// "Acorda" o banco assim que a pessoa entra em qualquer tela do Dashboard,
// bem antes de ela chegar no quiz — o plano gratuito de banco (Prisma
// Postgres) dorme quando fica sem uso, e a primeira consulta depois disso
// pode demorar demais e falhar (ver lib/training/with-retry.ts). Disparando
// essa consultinha boba (SELECT 1) cedo, em segundo plano, o banco já deve
// estar pronto quando a Server Action de verdade for chamada.

import { prisma } from "@/lib/prisma";

// evita disparar várias vezes ao mesmo tempo se a pessoa navegar rápido
// entre telas do dashboard — mas libera de novo depois, caso o banco volte
// a dormir numa sessão longa
let warmupInFlight = false;

export function warmUpDatabase() {
  if (warmupInFlight) return;
  warmupInFlight = true;
  prisma
    .$queryRaw`SELECT 1`
    .catch(() => {
      // se essa consulta boba falhar, não tem problema — as Server Actions
      // de verdade já têm retry próprio (lib/training/with-retry.ts)
    })
    .finally(() => {
      warmupInFlight = false;
    });
}
