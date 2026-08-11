import {
  buildLocalTraining,
  evaluateAnswerLocally,
  type JobAnalysis,
  type TrainingDifficulty,
} from "@/lib/job-training";
import {
  evaluateWithGroq,
  generateTrainingWithGroq,
  groqIsConfigured,
} from "@/lib/groq-job-training";

export const runtime = "nodejs";

type GenerateRequest = {
  action: "generate";
  analysis: JobAnalysis;
  description: string;
};

type EvaluateRequest = {
  action: "evaluate";
  mode: "comportamental" | "codigo";
  answer: string;
  prompt: string;
  requirements?: string[];
  difficulty: TrainingDifficulty;
};

export async function GET() {
  return Response.json({ configured: groqIsConfigured() });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as GenerateRequest | EvaluateRequest | null;
  if (!body || typeof body !== "object" || !("action" in body)) {
    return Response.json({ error: "Solicitação inválida." }, { status: 400 });
  }

  if (body.action === "generate") {
    if (!body.analysis || typeof body.description !== "string") {
      return Response.json({ error: "Análise e descrição são obrigatórias." }, { status: 400 });
    }
    if (groqIsConfigured()) {
      try {
        return Response.json({ content: await generateTrainingWithGroq(body.analysis, body.description), aiAvailable: true });
      } catch (error) {
        console.error("Falha ao gerar treino com Groq; usando contingência local.", error);
      }
    }
    return Response.json({
      content: buildLocalTraining(body.analysis),
      aiAvailable: false,
      notice: groqIsConfigured() ? "A IA ficou indisponível; o banco local foi usado." : "Chave não configurada; o banco local foi usado.",
    });
  }

  if (body.action === "evaluate") {
    const answer = typeof body.answer === "string" ? body.answer.trim().slice(0, 20_000) : "";
    if (answer.length < 30 || !["comportamental", "codigo"].includes(body.mode)) {
      return Response.json({ error: "A resposta deve ter pelo menos 30 caracteres." }, { status: 400 });
    }
    if (groqIsConfigured()) {
      try {
        return Response.json({
          evaluation: await evaluateWithGroq({
            mode: body.mode,
            answer,
            prompt: String(body.prompt ?? "").slice(0, 8_000),
            requirements: Array.isArray(body.requirements) ? body.requirements.slice(0, 8) : [],
            difficulty: body.difficulty,
          }),
          aiAvailable: true,
        });
      } catch (error) {
        console.error("Falha ao avaliar com Groq; usando contingência local.", error);
      }
    }
    return Response.json({
      evaluation: evaluateAnswerLocally(body.mode, answer, body.difficulty),
      aiAvailable: false,
      notice: groqIsConfigured() ? "A IA ficou indisponível; a avaliação local foi usada." : "Chave não configurada; a avaliação local foi usada.",
    });
  }

  return Response.json({ error: "Ação não suportada." }, { status: 400 });
}
