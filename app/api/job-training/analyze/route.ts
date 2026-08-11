import { analyzeJobLocally } from "@/lib/job-training";
import { analyzeJobWithGroq, groqIsConfigured } from "@/lib/groq-job-training";

export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const acceptedImageTypes = new Set(["image/png", "image/jpeg"]);

export async function POST(request: Request) {
  const form = await request.formData();
  const description = String(form.get("description") ?? "").trim().slice(0, 12_000);
  const company = String(form.get("company") ?? "").trim().slice(0, 160) || "Empresa não informada";
  const image = form.get("image");

  if (!description && !(image instanceof File && image.size > 0)) {
    return Response.json({ error: "Informe a descrição ou uma imagem da vaga." }, { status: 400 });
  }
  if (image instanceof File && image.size > 0 && (!acceptedImageTypes.has(image.type) || image.size > MAX_IMAGE_BYTES)) {
    return Response.json({ error: "A imagem deve ser PNG ou JPG e ter no máximo 5 MB." }, { status: 400 });
  }

  let imageDataUrl: string | undefined;
  if (image instanceof File && image.size > 0) {
    const buffer = Buffer.from(await image.arrayBuffer());
    imageDataUrl = `data:${image.type};base64,${buffer.toString("base64")}`;
  }

  if (groqIsConfigured()) {
    try {
      const analysis = await analyzeJobWithGroq({ description, company, imageDataUrl });
      return Response.json({ analysis, extractedDescription: description || analysis.summary, aiAvailable: true });
    } catch (error) {
      console.error("Falha na análise Groq; usando contingência local.", error);
    }
  }

  if (!description) {
    return Response.json({
      error: "A leitura da imagem precisa da chave GROQ_API_KEY. Cole também a descrição para usar sem conexão.",
      aiAvailable: false,
    }, { status: 503 });
  }
  return Response.json({
    analysis: analyzeJobLocally(description, company),
    extractedDescription: description,
    aiAvailable: false,
    notice: groqIsConfigured() ? "A IA ficou indisponível; a análise local foi usada." : "Chave não configurada; a análise local foi usada.",
  });
}
