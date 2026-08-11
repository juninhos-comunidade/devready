import Groq from "groq-sdk";
import { PDFParse } from "pdf-parse";

const EXTRACT_TOOL_NAME = "extract_curriculum_data";
const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";
const MIN_EXTRACTED_TEXT_LENGTH = 50;

const SYSTEM_PROMPT =
  "Você é um extrator de dados neutro e literal. Sua única função é ler o texto de um currículo e " +
  "transcrever, para a ferramenta disponível, as informações já presentes nesse texto. Você não avalia " +
  "qualidade, não julga adequação a nenhuma vaga, não gera nota, pontuação ou classificação, e não " +
  "inventa nem infere nenhuma informação que não esteja explicitamente escrita no texto.";

const USER_INSTRUCTION =
  "Extraia as informações do currículo abaixo nas categorias skills, experiences, formacao e " +
  "certificacoes, usando exclusivamente o que está escrito no texto. Não avalie, não pontue, não " +
  "complete lacunas e não infira dados que não estejam explícitos.";

export interface CurriculumExperience {
  empresa: string;
  cargo: string;
  inicio: string;
  /** Data/período de término, como escrito no texto. null quando o texto indica emprego atual. */
  fim: string | null;
  descricao: string;
  tecnologias: string[];
}

export interface CurriculumFormacao {
  instituicao: string;
  curso: string;
  inicio: string;
  fim: string;
  status: "cursando" | "concluido";
}

export interface CurriculumCertificacao {
  nome: string;
  emissor: string;
  data: string;
}

export interface ExtractedData {
  skills: string[];
  experiences: CurriculumExperience[];
  formacao: CurriculumFormacao[];
  certificacoes: CurriculumCertificacao[];
}

const extractCurriculumTool: Groq.Chat.ChatCompletionTool = {
  type: "function",
  function: {
    name: EXTRACT_TOOL_NAME,
    description:
      "Extrai informações estruturadas de um currículo a partir do texto fornecido. Extração pura: " +
      "registre apenas o que está escrito no texto. Não avalie qualidade, não julgue adequação, não " +
      "infira dados ausentes e não gere nenhuma pontuação, nota ou classificação.",
    parameters: {
      type: "object",
      properties: {
        skills: {
          type: "array",
          items: { type: "string" },
          description:
            "Habilidades/competências mencionadas explicitamente no texto, como escritas. Não infira " +
            "habilidades que não estejam citadas.",
        },
        experiences: {
          type: "array",
          description: "Experiências profissionais listadas no texto, na ordem em que aparecem.",
          items: {
            type: "object",
            properties: {
              empresa: {
                type: "string",
                description: "Nome da empresa, exatamente como escrito no texto.",
              },
              cargo: {
                type: "string",
                description: "Cargo/título ocupado, exatamente como escrito no texto.",
              },
              inicio: {
                type: "string",
                description: "Data ou período de início, em formato livre, como escrito no texto.",
              },
              fim: {
                type: ["string", "null"],
                description:
                  "Data ou período de término, como escrito no texto. Use null somente se o texto " +
                  "indicar que o emprego é atual (ex.: 'atual', 'presente', sem data de término). Não " +
                  "infira o fim caso não esteja claro.",
              },
              descricao: {
                type: "string",
                description:
                  "Descrição das atividades/responsabilidades, como escrita no texto. Não resuma, não " +
                  "avalie e não julgue — apenas organize o conteúdo já presente.",
              },
              tecnologias: {
                type: "array",
                items: { type: "string" },
                description:
                  "Tecnologias mencionadas nessa experiência especificamente, como escritas no texto.",
              },
            },
            required: ["empresa", "cargo", "inicio", "fim", "descricao", "tecnologias"],
          },
        },
        formacao: {
          type: "array",
          description: "Formação acadêmica listada no texto.",
          items: {
            type: "object",
            properties: {
              instituicao: {
                type: "string",
                description: "Nome da instituição de ensino, exatamente como escrito no texto.",
              },
              curso: {
                type: "string",
                description: "Nome do curso, exatamente como escrito no texto.",
              },
              inicio: {
                type: "string",
                description: "Data ou período de início, em formato livre, como escrito no texto.",
              },
              fim: {
                type: "string",
                description: "Data ou período de término/previsão, como escrito no texto.",
              },
              status: {
                type: "string",
                enum: ["cursando", "concluido"],
                description:
                  "'cursando' se o texto indicar que a formação ainda está em andamento, 'concluido' se " +
                  "indicar que já foi concluída. Não infira além do que o texto afirma explicitamente.",
              },
            },
            required: ["instituicao", "curso", "inicio", "fim", "status"],
          },
        },
        certificacoes: {
          type: "array",
          description: "Certificações listadas no texto.",
          items: {
            type: "object",
            properties: {
              nome: {
                type: "string",
                description: "Nome da certificação, exatamente como escrito no texto.",
              },
              emissor: {
                type: "string",
                description: "Instituição/organização emissora, exatamente como escrita no texto.",
              },
              data: {
                type: "string",
                description: "Data de emissão, em formato livre, como escrita no texto.",
              },
            },
            required: ["nome", "emissor", "data"],
          },
        },
      },
      required: ["skills", "experiences", "formacao", "certificacoes"],
    },
  },
};

export async function extractCurriculumData(pdfBase64: string): Promise<ExtractedData> {
  const pdfBuffer = Buffer.from(pdfBase64, "base64");

  const parser = new PDFParse({ data: pdfBuffer });
  let text: string;
  try {
    ({ text } = await parser.getText());
  } finally {
    await parser.destroy();
  }

  if (!text || text.trim().length < MIN_EXTRACTED_TEXT_LENGTH) {
    throw new Error(
      "Não foi possível extrair texto suficiente do PDF do currículo (documento vazio, escaneado sem OCR ou corrompido)."
    );
  }

  const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const model = process.env.GROQ_MODEL ?? DEFAULT_GROQ_MODEL;

  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `${USER_INSTRUCTION}\n\n---\n${text}\n---` },
    ],
    tools: [extractCurriculumTool],
    tool_choice: { type: "function", function: { name: EXTRACT_TOOL_NAME } },
  });

  const toolCall = response.choices[0]?.message?.tool_calls?.[0];
  if (!toolCall) {
    throw new Error("A Groq não retornou uma chamada de função com os dados extraídos do currículo.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(toolCall.function.arguments);
  } catch (error) {
    throw new Error(
      `A Groq retornou um JSON inválido para os dados extraídos do currículo: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }

  return parsed as ExtractedData;
}
