import { NextResponse } from "next/server";
import { APIError } from "better-auth/api";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const { name, email, password, github, areaInterest, experienceLevel, privacyConsent, pdfBase64 } = body;

  if (!pdfBase64) {
    return NextResponse.json({ error: "Adicione seu currículo em PDF para concluir o cadastro." }, { status: 400 });
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

  try {
    await prisma.curriculum.create({
      data: {
        userId: user.id,
        bruteData: pdfBase64,
        githubUrl: github || null,
      },
    });
  } catch (error) {
    console.error("Falha ao salvar currículo, revertendo cadastro.", error);
    await prisma.user.delete({ where: { id: user.id } }).catch(() => {});
    return NextResponse.json(
      { error: "Não foi possível salvar seu currículo. Tente novamente." },
      { status: 500 }
    );
  }

  const successResponse = NextResponse.json({ ok: true });
  headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") {
      successResponse.headers.append(key, value);
    }
  });

  return successResponse;
}
