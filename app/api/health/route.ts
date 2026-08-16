import { demoModeEnabled } from "@/lib/demo-mode";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const databaseConfigured = Boolean(process.env.DATABASE_URL?.trim());
  let databaseConnected = false;

  if (databaseConfigured) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      databaseConnected = true;
    } catch {
      databaseConnected = false;
    }
  }

  const services = {
    database: databaseConnected ? "connected" : databaseConfigured ? "unavailable" : "missing",
    groq: process.env.GROQ_API_KEY?.trim() ? "configured" : "missing",
    github: process.env.GITHUB_TOKEN?.trim() ? "configured" : "public",
  } as const;
  const ready = databaseConnected && services.groq === "configured";

  return Response.json({
    status: ready ? "ok" : "degraded",
    mode: demoModeEnabled ? "demo" : "authenticated",
    services,
    timestamp: new Date().toISOString(),
  }, {
    status: databaseConnected ? 200 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}
