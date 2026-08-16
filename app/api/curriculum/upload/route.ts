import { NextResponse } from "next/server";
import { headers } from "next/headers";
import type { Prisma } from "@/app/generated/prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { extractCurriculumData } from "@/lib/extraction";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_PDF_BYTES = 2.5 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const pdfBase64 = body && typeof body === "object" ? (body as Record<string, unknown>).pdfBase64 : undefined;

  if (typeof pdfBase64 !== "string" || !pdfBase64) {
    return NextResponse.json({ error: "Adicione seu currículo em PDF." }, { status: 400 });
  }

  if (Buffer.byteLength(pdfBase64, "base64") > MAX_PDF_BYTES) {
    return NextResponse.json({ error: "O currículo deve ter no máximo 2,5 MB." }, { status: 413 });
  }

  const curriculum = await prisma.curriculum.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, bruteData: pdfBase64, status: "PROCESSING" },
    update: { bruteData: pdfBase64, status: "PROCESSING", extractedData: undefined },
  });

  try {
    const extractedData = await extractCurriculumData(pdfBase64);
    await prisma.curriculum.update({
      where: { id: curriculum.id },
      data: {
        status: "COMPLETED",
        extractedData: extractedData as unknown as Prisma.InputJsonValue,
        bruteData: null,
      },
    });
    return NextResponse.json({ ok: true, status: "COMPLETED" });
  } catch (error) {
    console.error(`Falha ao extrair dados do currículo ${curriculum.id}.`, error);
    await prisma.curriculum.update({
      where: { id: curriculum.id },
      data: { status: "FAILED" },
    });
    return NextResponse.json(
      { error: "O currículo foi salvo, mas não foi possível extrair os dados agora. Tente novamente em instantes." },
      { status: 502 },
    );
  }
}
