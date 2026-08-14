import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const githubUrl = body && typeof body === "object" ? (body as Record<string, unknown>).githubUrl : undefined;

  if (githubUrl !== null && typeof githubUrl !== "string") {
    return NextResponse.json({ error: "Link do GitHub inválido." }, { status: 400 });
  }

  const normalized = typeof githubUrl === "string" && githubUrl.trim() ? githubUrl.trim() : null;
  if (normalized && !/^https?:\/\/(www\.)?github\.com\/[\w-]+\/?$/i.test(normalized)) {
    return NextResponse.json({ error: "Informe um link válido de perfil do GitHub." }, { status: 400 });
  }

  await prisma.curriculum.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, githubUrl: normalized },
    update: { githubUrl: normalized },
  });

  return NextResponse.json({ ok: true });
}
