import { NextResponse } from "next/server";
import { APIError } from "better-auth/api";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const MAX_PDF_BYTES = 2.5 * 1024 * 1024;

function isForeignKeyViolation(error: unknown): boolean {
  return Boolean(error && typeof error === "object" && "code" in error && (error as { code?: unknown }).code === "P2003");
}

async function waitForUserVisible(userId: string, attempts = 6) {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    const found = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (found) return true;
    await new Promise((resolve) => setTimeout(resolve, attempt * 400));
  }
  return false;
}

async function createCurriculumWithRetry(data: { userId: string; bruteData: string; githubUrl: string | null }, attempts = 4) {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      await prisma.curriculum.create({ data });
      return;
    } catch (error) {
      lastError = error;
      if (!isForeignKeyViolation(error) || attempt === attempts) throw error;
      await new Promise((resolve) => setTimeout(resolve, attempt * 400));
    }
  }
  throw lastError;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const { name, email, password, github, areaInterest, experienceLevel, privacyConsent, pdfBase64 } = body as Record<string, unknown>;

  if (
    typeof name !== "string" || name.trim().length < 2 || name.length > 120 ||
    typeof email !== "string" || email.length > 254 ||
    typeof password !== "string" || password.length > 128 ||
    typeof areaInterest !== "string" || areaInterest.length > 80 ||
    typeof experienceLevel !== "string" || experienceLevel.length > 80 ||
    privacyConsent !== true
  ) {
    return NextResponse.json({ error: "Revise os dados obrigatórios do cadastro." }, { status: 400 });
  }

  if (typeof pdfBase64 !== "string" || !pdfBase64) {
    return NextResponse.json({ error: "Adicione seu currículo em PDF para concluir o cadastro." }, { status: 400 });
  }

  if (Buffer.byteLength(pdfBase64, "base64") > MAX_PDF_BYTES) {
    return NextResponse.json({ error: "O currículo deve ter no máximo 2,5 MB." }, { status: 413 });
  }

  const githubUrl = typeof github === "string" && github.trim() ? github.trim() : null;
  if (githubUrl && !/^https?:\/\/(www\.)?github\.com\/[\w-]+\/?$/i.test(githubUrl)) {
    return NextResponse.json({ error: "Informe um link válido de perfil do GitHub." }, { status: 400 });
  }

  let signUpResult;
  try {
    signUpResult = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
        areaInterest,
        experienceLevel,
        privacyConsent,
        callbackURL: "/dashboard",
      },
      returnHeaders: true,
    });
  } catch (error) {
    if (error instanceof APIError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error("Falha ao criar usuário no signup-completo.", error);
    return NextResponse.json(
      { error: "Não foi possível criar a conta. Tente novamente." },
      { status: 500 }
    );
  }

  const { headers, response: { user } } = signUpResult;

  await waitForUserVisible(user.id);

  let curriculumSaved = true;
  try {
    await createCurriculumWithRetry({ userId: user.id, bruteData: pdfBase64, githubUrl });
  } catch (error) {
    curriculumSaved = false;
    console.error("Falha ao salvar currículo no cadastro; a conta foi criada mesmo assim.", error);
  }

  const successResponse = NextResponse.json({ ok: true, curriculumSaved });
  headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") {
      successResponse.headers.append(key, value);
    }
  });

  return successResponse;
}
