import { NextResponse } from "next/server";
import type { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { extractCurriculumData } from "@/lib/extraction";

interface ProcessRequestBody {
  curriculumId: number;
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json().catch(() => null);

    if (
      !body ||
      typeof body !== "object" ||
      !("curriculumId" in body) ||
      typeof (body as { curriculumId: unknown }).curriculumId !== "number"
    ) {
      return NextResponse.json(
        { error: "curriculumId é obrigatório e deve ser um número." },
        { status: 400 }
      );
    }

    const { curriculumId } = body as ProcessRequestBody;

    // Lock atômico: só assume o job se ainda estiver PENDING.
    const lock = await prisma.curriculum.updateMany({
      where: { id: curriculumId, status: "PENDING" },
      data: { status: "PROCESSING" },
    });

    if (lock.count === 0) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const curriculum = await prisma.curriculum.findUnique({
      where: { id: curriculumId },
    });

    if (!curriculum?.bruteData) {
      console.error(
        `Curriculum ${curriculumId} está PROCESSING mas sem bruteData.`
      );
      await prisma.curriculum.update({
        where: { id: curriculumId },
        data: { status: "FAILED" },
      });
      return NextResponse.json(
        { error: "Currículo sem dados para processar." },
        { status: 500 }
      );
    }

    try {
      const extractedData = await extractCurriculumData(curriculum.bruteData);
      await prisma.curriculum.update({
        where: { id: curriculumId },
        data: {
          status: "COMPLETED",
          extractedData: extractedData as unknown as Prisma.InputJsonValue,
          bruteData: null,
        },
      });
    } catch (error) {
      console.error(`Falha ao extrair dados do currículo ${curriculumId}.`, error);
      await prisma.curriculum.update({
        where: { id: curriculumId },
        data: { status: "FAILED" },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro inesperado ao processar currículo.", error);
    return NextResponse.json(
      { error: "Erro inesperado ao processar currículo." },
      { status: 500 }
    );
  }
}
