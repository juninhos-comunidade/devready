import { analyzeJobLocally } from "@/lib/job-training";
import { analyzeJobWithGroq, groqIsConfigured } from "@/lib/groq-job-training";
import { buildCandidateProfileSnapshot } from "@/lib/candidate-profile";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const acceptedImageTypes = new Set(["image/png", "image/jpeg"]);

async function getCandidateProfile() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return undefined;
    const curriculum = await prisma.curriculum.findUnique({
      where: { userId: session.user.id },
      include: { githubProfile: { include: { repos: true } } },
    });
    if (!curriculum) return undefined;
    const curriculumText = [curriculum.bruteData, curriculum.extractedData ? JSON.stringify(curriculum.extractedData) : ""].filter(Boolean).join(" ");
    const githubText = curriculum.githubProfile
      ? [
        curriculum.githubProfile.bio,
        JSON.stringify(curriculum.githubProfile.topLanguages ?? {}),
        ...curriculum.githubProfile.repos.flatMap((repo) => [repo.name, repo.description, JSON.stringify(repo.languages ?? {})]),
      ].filter(Boolean).join(" ")
      : "";
    return buildCandidateProfileSnapshot({ curriculumText, githubText });
  } catch (error) {
    console.error("Não foi possível reunir as evidências do perfil para a análise.", error);
    return undefined;
  }
}

export async function POST(request: Request) {
  const form = await request.formData();
  const description = String(form.get("description") ?? "").trim().slice(0, 12_000);
  const company = String(form.get("company") ?? "").trim().slice(0, 160) || "Empresa não informada";
  const image = form.get("image");

  if (!description && !(image instanceof File && image.size > 0)) {
    return Response.json({ error: "Informe a descrição ou uma imagem da vaga." }, { status: 400 });
  }
  if (image instanceof File && image.size > 0 && (!acceptedImageTypes.has(image.type) || image.size > MAX_IMAGE_BYTES)) {
    return Response.json({ error: "A imagem deve ser PNG ou JPG e ter no máximo 4 MB." }, { status: 400 });
  }

  let imageDataUrl: string | undefined;
  if (image instanceof File && image.size > 0) {
    const buffer = Buffer.from(await image.arrayBuffer());
    imageDataUrl = `data:${image.type};base64,${buffer.toString("base64")}`;
  }

  const candidateProfile = await getCandidateProfile();

  if (groqIsConfigured()) {
    try {
      const analysis = await analyzeJobWithGroq({ description, company, imageDataUrl, profile: candidateProfile });
      return Response.json({ analysis, extractedDescription: description || analysis.summary, aiAvailable: true });
    } catch (error) {
      console.error("Falha na análise Groq; usando contingência local.", error);
    }
  }

  if (!description) {
    return Response.json({
      error: "A leitura automática da imagem está indisponível neste ambiente. Cole também a descrição da vaga para continuar.",
      aiAvailable: false,
    }, { status: 503 });
  }
  return Response.json({
    analysis: analyzeJobLocally(description, company, candidateProfile),
    extractedDescription: description,
    aiAvailable: false,
    notice: groqIsConfigured()
      ? "O serviço inteligente ficou indisponível; ativamos a análise local sem interromper sua sessão."
      : "Análise local: chave de IA não configurada, diagnóstico gerado com dados locais.",
  });
}
