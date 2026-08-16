import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function isNotFoundError(error: unknown): boolean {
  return Boolean(error && typeof error === "object" && "code" in error && (error as { code?: unknown }).code === "P2025");
}

export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const userId = session.user.id;
  let lastError: unknown;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      await prisma.user.delete({ where: { id: userId } });
      break;
    } catch (error) {
      if (isNotFoundError(error)) break;
      lastError = error;
      if (attempt === 4) {
        console.error("Falha ao excluir conta.", error);
        return NextResponse.json({ error: "Não foi possível excluir sua conta agora. Tente novamente." }, { status: 500 });
      }
      await new Promise((resolve) => setTimeout(resolve, attempt * 400));
    }
  }
  void lastError;

  const stillExists = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (stillExists) {
    console.error(`Conta ${userId} ainda existe após tentativa de exclusão.`);
    return NextResponse.json({ error: "Não foi possível excluir sua conta agora. Tente novamente." }, { status: 500 });
  }

  const signOutResult = await auth.api.signOut({ headers: await headers(), returnHeaders: true }).catch(() => null);

  const response = NextResponse.json({ ok: true });
  signOutResult?.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") response.headers.append(key, value);
  });
  return response;
}
