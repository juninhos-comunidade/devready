export type InterviewTrack = "tecnica" | "comportamental" | "mista";
export type InterviewDifficulty = "iniciante" | "intermediaria" | "avancada";
export type InterviewArea =
  | "frontend"
  | "backend"
  | "fullstack"
  | "mobile"
  | "dados-bi"
  | "dados-ia"
  | "qa"
  | "devops"
  | "seguranca"
  | "produto-ux";

export type InterviewQuestion = {
  id: string;
  track: Exclude<InterviewTrack, "mista">;
  area: InterviewArea | "geral";
  competency: string;
  difficulty: InterviewDifficulty;
  prompt: string;
  hint: string;
  keywords: string[];
};

export type InterviewEvaluation = {
  score: number;
  criteria: {
    content: number;
    clarity: number;
    evidence: number;
    structure: number;
  };
  evidenceFound: string[];
  missingEvidence: string[];
  feedback: string;
  nextStep: string;
  nextDifficulty: InterviewDifficulty;
};

type Topic = {
  name: string;
  context: string;
  keywords: string[];
};

export const interviewAreaOptions: Array<{ value: InterviewArea; label: string }> = [
  { value: "frontend", label: "Frontend" },
  { value: "backend", label: "Backend" },
  { value: "fullstack", label: "Full Stack" },
  { value: "mobile", label: "Mobile" },
  { value: "dados-bi", label: "Dados e BI" },
  { value: "dados-ia", label: "Ciência de Dados e IA" },
  { value: "qa", label: "QA e Testes" },
  { value: "devops", label: "DevOps e Cloud" },
  { value: "seguranca", label: "Segurança da Informação" },
  { value: "produto-ux", label: "Produto e UX/UI" },
];

const technicalTopics: Record<InterviewArea, Topic[]> = {
  frontend: [
    { name: "HTML semântico e acessibilidade", context: "uma interface precisa funcionar com teclado e leitor de tela", keywords: ["semântica", "teclado", "foco", "label", "acessibilidade"] },
    { name: "CSS responsivo", context: "o layout quebra em telas pequenas e com textos longos", keywords: ["mobile", "flex", "grid", "breakpoint", "conteúdo"] },
    { name: "JavaScript assíncrono", context: "duas requisições concorrentes retornam fora de ordem", keywords: ["promise", "async", "await", "cancelamento", "erro"] },
    { name: "estado e efeitos no React", context: "um componente renderiza demais e mantém estados duplicados", keywords: ["estado", "props", "effect", "render", "fonte"] },
    { name: "TypeScript", context: "uma resposta de API pode chegar incompleta ou em formatos diferentes", keywords: ["tipo", "interface", "unknown", "validação", "narrowing"] },
    { name: "consumo de APIs", context: "uma tela precisa comunicar carregamento, vazio, erro e sucesso", keywords: ["loading", "erro", "retry", "status", "feedback"] },
    { name: "qualidade e performance web", context: "uma página está lenta e uma mudança visual quebrou um fluxo", keywords: ["medir", "teste", "cache", "bundle", "usuário"] },
  ],
  backend: [
    { name: "HTTP e desenho de APIs", context: "uma API precisa evoluir sem quebrar clientes existentes", keywords: ["http", "status", "contrato", "versão", "idempotência"] },
    { name: "autenticação e autorização", context: "usuários autenticados têm permissões diferentes sobre um recurso", keywords: ["autenticação", "autorização", "papel", "sessão", "acesso"] },
    { name: "SQL e modelagem", context: "uma consulta cresce, fica lenta e retorna dados duplicados", keywords: ["índice", "join", "normalização", "query", "transação"] },
    { name: "validação e tratamento de erros", context: "dados inválidos chegam de múltiplos clientes", keywords: ["validar", "schema", "erro", "log", "contrato"] },
    { name: "concorrência e tarefas assíncronas", context: "a mesma operação pode ser executada duas vezes", keywords: ["fila", "idempotência", "lock", "concorrência", "retry"] },
    { name: "testes e observabilidade", context: "um erro ocorre apenas em produção e é difícil reproduzir", keywords: ["teste", "log", "métrica", "trace", "correlação"] },
    { name: "cache e segurança", context: "a aplicação precisa escalar sem expor dados entre usuários", keywords: ["cache", "ttl", "invalidação", "segredo", "isolamento"] },
  ],
  fullstack: [
    { name: "arquitetura web ponta a ponta", context: "uma ação atravessa navegador, API e banco de dados", keywords: ["cliente", "servidor", "http", "banco", "contrato"] },
    { name: "estado e contrato de API", context: "frontend e backend discordam sobre campos e estados possíveis", keywords: ["schema", "tipo", "validação", "versão", "erro"] },
    { name: "autenticação completa", context: "login, sessão e autorização precisam funcionar com segurança", keywords: ["cookie", "sessão", "csrf", "autorização", "expiração"] },
    { name: "persistência e transações", context: "uma operação altera várias tabelas e pode falhar no meio", keywords: ["transação", "rollback", "integridade", "índice", "migração"] },
    { name: "testes em camadas", context: "o time precisa testar rápido sem perder confiança no fluxo completo", keywords: ["unitário", "integração", "e2e", "mock", "contrato"] },
    { name: "deploy e configuração", context: "o sistema funciona localmente, mas falha no ambiente publicado", keywords: ["ambiente", "variável", "build", "log", "rollback"] },
    { name: "performance e experiência", context: "a página está lenta e a API sofre com picos de acesso", keywords: ["medir", "cache", "consulta", "bundle", "latência"] },
  ],
  mobile: [
    { name: "ciclo de vida e estado", context: "a tela perde dados ao girar o aparelho ou voltar do segundo plano", keywords: ["estado", "lifecycle", "restaurar", "viewmodel", "fonte"] },
    { name: "navegação", context: "um fluxo possui telas, modais e links externos profundos", keywords: ["rota", "backstack", "deeplink", "estado", "navegação"] },
    { name: "rede e modo offline", context: "a conexão oscila durante o envio de uma ação importante", keywords: ["offline", "cache", "retry", "fila", "sincronização"] },
    { name: "persistência local", context: "dados locais precisam sobreviver ao fechamento do aplicativo", keywords: ["persistência", "banco", "migração", "cache", "segurança"] },
    { name: "permissões e privacidade", context: "um recurso pede acesso à câmera e localização", keywords: ["permissão", "contexto", "privacidade", "negação", "mínimo"] },
    { name: "acessibilidade e layouts adaptativos", context: "a interface precisa funcionar com fonte ampliada e leitor de tela", keywords: ["acessibilidade", "label", "contraste", "fonte", "layout"] },
    { name: "testes e performance mobile", context: "uma lista trava em aparelhos mais simples", keywords: ["profiling", "memória", "render", "teste", "dispositivo"] },
  ],
  "dados-bi": [
    { name: "SQL analítico", context: "uma métrica exige agregações, janelas e tratamento de duplicidades", keywords: ["group", "window", "join", "duplicado", "granularidade"] },
    { name: "modelagem dimensional", context: "um dashboard precisa combinar fatos e dimensões historicamente", keywords: ["fato", "dimensão", "chave", "histórico", "granularidade"] },
    { name: "ETL e qualidade", context: "a fonte muda o formato e passa a enviar valores ausentes", keywords: ["pipeline", "schema", "nulo", "validação", "alerta"] },
    { name: "métricas e dashboards", context: "duas áreas calculam o mesmo indicador de formas diferentes", keywords: ["definição", "fonte", "filtro", "período", "governança"] },
    { name: "limpeza com Python e pandas", context: "um conjunto possui tipos inconsistentes, nulos e outliers", keywords: ["pandas", "tipo", "nulo", "duplicado", "outlier"] },
    { name: "visualização de dados", context: "um gráfico precisa comunicar tendência sem induzir interpretação errada", keywords: ["escala", "contexto", "gráfico", "cor", "acessibilidade"] },
    { name: "governança e privacidade", context: "um relatório usa dados pessoais e será compartilhado", keywords: ["acesso", "anonimização", "lgpd", "linhagem", "permissão"] },
  ],
  "dados-ia": [
    { name: "preparação e vazamento de dados", context: "o modelo tem ótima validação, mas falha em dados novos", keywords: ["leakage", "split", "treino", "teste", "pipeline"] },
    { name: "métricas de avaliação", context: "acurácia alta esconde erros na classe mais importante", keywords: ["precision", "recall", "f1", "matriz", "objetivo"] },
    { name: "engenharia de atributos", context: "dados brutos misturam escalas, categorias e valores ausentes", keywords: ["feature", "encoding", "scaling", "imputação", "pipeline"] },
    { name: "classes desbalanceadas", context: "o evento de interesse acontece em menos de 2% dos casos", keywords: ["desbalanceamento", "amostragem", "threshold", "métrica", "custo"] },
    { name: "reprodutibilidade", context: "duas pessoas obtêm resultados diferentes com o mesmo experimento", keywords: ["seed", "versão", "dados", "ambiente", "experimento"] },
    { name: "deploy e monitoramento de modelos", context: "o comportamento dos dados muda depois da publicação", keywords: ["drift", "monitoramento", "latência", "versão", "rollback"] },
    { name: "ética e explicabilidade", context: "uma previsão afeta pessoas e apresenta diferenças entre grupos", keywords: ["viés", "explicabilidade", "privacidade", "grupo", "impacto"] },
  ],
  qa: [
    { name: "estratégia de testes", context: "o time tem pouco tempo e precisa decidir o que testar primeiro", keywords: ["risco", "prioridade", "pirâmide", "cobertura", "impacto"] },
    { name: "testes unitários, integração e E2E", context: "a suíte está lenta e ainda deixa bugs escaparem", keywords: ["unitário", "integração", "e2e", "isolamento", "confiança"] },
    { name: "relato e investigação de bugs", context: "um erro aparece de forma intermitente", keywords: ["reproduzir", "evidência", "ambiente", "passos", "impacto"] },
    { name: "automação resiliente", context: "testes quebram sempre que o CSS muda", keywords: ["locator", "papel", "usuário", "isolamento", "espera"] },
    { name: "testes de API", context: "um endpoint aceita entradas inválidas e possui vários status", keywords: ["contrato", "status", "schema", "borda", "autorização"] },
    { name: "regressão e CI", context: "uma correção volta a quebrar em outra entrega", keywords: ["regressão", "pipeline", "rápido", "feedback", "bloqueio"] },
    { name: "testes não funcionais", context: "o produto precisa atender acessibilidade, segurança e desempenho", keywords: ["acessibilidade", "performance", "segurança", "carga", "critério"] },
  ],
  devops: [
    { name: "CI/CD", context: "uma mudança precisa ser validada e publicada com baixo risco", keywords: ["pipeline", "teste", "deploy", "rollback", "aprovação"] },
    { name: "containers", context: "a aplicação se comporta diferente entre máquinas", keywords: ["imagem", "docker", "camada", "ambiente", "healthcheck"] },
    { name: "infraestrutura como código", context: "ambientes foram configurados manualmente e divergiram", keywords: ["iac", "estado", "revisão", "idempotência", "módulo"] },
    { name: "observabilidade", context: "usuários relatam lentidão, mas não há erro aparente", keywords: ["métrica", "log", "trace", "alerta", "sli"] },
    { name: "confiabilidade", context: "uma dependência externa fica indisponível", keywords: ["timeout", "retry", "circuit", "fallback", "slo"] },
    { name: "segredos e segurança operacional", context: "credenciais precisam chegar à aplicação sem entrar no repositório", keywords: ["secret", "rotação", "mínimo", "cofre", "auditoria"] },
    { name: "escala e custos", context: "o tráfego cresce em picos e a conta aumenta", keywords: ["autoscaling", "capacidade", "custo", "cache", "medir"] },
  ],
  seguranca: [
    { name: "controle de acesso", context: "um usuário tenta acessar um recurso que pertence a outra conta", keywords: ["autorização", "servidor", "objeto", "mínimo", "negação"] },
    { name: "autenticação e sessões", context: "uma sessão pode ser roubada ou continuar válida por tempo demais", keywords: ["cookie", "expiração", "mfa", "revogar", "sessão"] },
    { name: "injeção e validação", context: "uma entrada do usuário chega a uma consulta ou comando", keywords: ["parametrizar", "validar", "escape", "entrada", "privilégio"] },
    { name: "criptografia e segredos", context: "o sistema armazena senhas, tokens e dados sensíveis", keywords: ["hash", "salt", "criptografia", "chave", "rotação"] },
    { name: "cadeia de suprimentos", context: "uma dependência possui vulnerabilidade conhecida", keywords: ["dependência", "scan", "versão", "assinatura", "sbom"] },
    { name: "logs e resposta a incidentes", context: "há sinais de acesso indevido em produção", keywords: ["detectar", "conter", "evidência", "alerta", "incidente"] },
    { name: "modelagem de ameaças", context: "uma nova funcionalidade manipula dados pessoais", keywords: ["ameaça", "risco", "ativo", "mitigação", "privacidade"] },
  ],
  "produto-ux": [
    { name: "descoberta do problema", context: "uma solução foi pedida antes de o problema estar claro", keywords: ["usuário", "problema", "hipótese", "contexto", "resultado"] },
    { name: "pesquisa com usuários", context: "o time precisa entender um comportamento sem induzir respostas", keywords: ["roteiro", "aberta", "amostra", "evidência", "síntese"] },
    { name: "arquitetura da informação", context: "pessoas não encontram uma função importante", keywords: ["hierarquia", "navegação", "rótulo", "card sorting", "modelo"] },
    { name: "prototipação e usabilidade", context: "uma hipótese precisa ser validada antes do desenvolvimento", keywords: ["protótipo", "tarefa", "teste", "observação", "iteração"] },
    { name: "acessibilidade", context: "o fluxo depende apenas de cor e interação com mouse", keywords: ["contraste", "teclado", "foco", "label", "inclusão"] },
    { name: "design system e handoff", context: "telas semelhantes possuem comportamentos inconsistentes", keywords: ["componente", "token", "documentação", "estado", "dev"] },
    { name: "métricas e experimentos", context: "uma mudança aumentou cliques, mas pode ter piorado a experiência", keywords: ["objetivo", "métrica", "guardrail", "experimento", "qualitativo"] },
  ],
};

const behavioralTopics: Topic[] = [
  { name: "aprendizado rápido", context: "você precisou aprender algo novo para entregar uma tarefa", keywords: ["contexto", "ação", "fonte", "resultado", "aprendizado"] },
  { name: "colaboração", context: "você dependia de outra pessoa ou área para avançar", keywords: ["alinhamento", "comunicação", "acordo", "time", "resultado"] },
  { name: "feedback", context: "você recebeu ou precisou oferecer um feedback difícil", keywords: ["escuta", "exemplo", "respeito", "ação", "mudança"] },
  { name: "ambiguidade", context: "uma tarefa chegou sem critérios ou contexto suficientes", keywords: ["pergunta", "objetivo", "critério", "risco", "alinhamento"] },
  { name: "responsabilidade", context: "um erro seu afetou uma entrega", keywords: ["assumir", "comunicar", "corrigir", "causa", "prevenir"] },
  { name: "priorização", context: "duas demandas importantes disputavam seu tempo", keywords: ["impacto", "urgência", "negociar", "risco", "decisão"] },
  { name: "comunicação técnica", context: "você precisou explicar um tema técnico para alguém não técnico", keywords: ["público", "clareza", "exemplo", "confirmar", "objetivo"] },
];

const questionPatterns: Array<{
  difficulty: InterviewDifficulty;
  build: (topic: Topic) => string;
  hint: string;
}> = [
  { difficulty: "iniciante", build: (topic) => `Como você explicaria ${topic.name} para uma pessoa júnior e quando esse conhecimento é útil?`, hint: "Defina com suas palavras e use um exemplo simples." },
  { difficulty: "iniciante", build: (topic) => `Conte como você lidaria com esta situação: ${topic.context}.`, hint: "Organize a resposta em contexto, ação e resultado esperado." },
  { difficulty: "intermediaria", build: (topic) => `Qual erro comum relacionado a ${topic.name} você procuraria primeiro e como o evitaria?`, hint: "Explique como investigaria antes de propor uma correção." },
  { difficulty: "intermediaria", build: (topic) => `Quais decisões e trade-offs você avaliaria quando ${topic.context}?`, hint: "Mostre alternativas, riscos e o motivo da sua escolha." },
  { difficulty: "avancada", build: (topic) => `Como você validaria, testaria ou monitoraria uma solução para ${topic.context}?`, hint: "Inclua critérios de sucesso, sinais de falha e próximos passos." },
];

function buildQuestionBank(topics: Topic[], area: InterviewArea | "geral", track: "tecnica" | "comportamental") {
  return topics.flatMap((topic, topicIndex) =>
    questionPatterns.map((pattern, patternIndex) => ({
      id: `${area}-${track}-${topicIndex + 1}-${patternIndex + 1}`,
      area,
      track,
      competency: topic.name,
      difficulty: pattern.difficulty,
      prompt: pattern.build(topic),
      hint: pattern.hint,
      keywords: topic.keywords,
    })),
  );
}

const technicalBanks = Object.fromEntries(
  interviewAreaOptions.map(({ value }) => [value, buildQuestionBank(technicalTopics[value], value, "tecnica")]),
) as Record<InterviewArea, InterviewQuestion[]>;

const behavioralBank = buildQuestionBank(behavioralTopics, "geral", "comportamental");
const difficultyOrder: InterviewDifficulty[] = ["iniciante", "intermediaria", "avancada"];

export function detectInterviewArea(description: string): InterviewArea {
  const normalized = description.toLocaleLowerCase("pt-BR");
  const aliases: Record<InterviewArea, string[]> = {
    frontend: ["frontend", "react", "vue", "angular", "css", "javascript"],
    backend: ["backend", "api", "node", "java", "c#", "spring", "django"],
    fullstack: ["full stack", "fullstack", "ponta a ponta"],
    mobile: ["mobile", "android", "ios", "flutter", "react native", "swift", "kotlin"],
    "dados-bi": ["bi", "power bi", "sql", "dashboard", "analista de dados"],
    "dados-ia": ["machine learning", "ciência de dados", "data science", "modelo", "python"],
    qa: ["qa", "quality", "testes", "tester", "automação"],
    devops: ["devops", "cloud", "aws", "azure", "docker", "kubernetes", "ci/cd"],
    seguranca: ["segurança", "security", "soc", "pentest", "vulnerabilidade"],
    "produto-ux": ["produto", "ux", "ui", "product design", "figma"],
  };

  return interviewAreaOptions
    .map(({ value }) => ({ value, score: aliases[value].filter((term) => normalized.includes(term)).length }))
    .sort((a, b) => b.score - a.score)[0]?.value ?? "frontend";
}

export function getInterviewQuestions(
  track: InterviewTrack,
  area: InterviewArea,
  jobDescription = "",
) {
  const questions = track === "tecnica"
    ? technicalBanks[area]
    : track === "comportamental"
      ? behavioralBank
      : [...technicalBanks[area], ...behavioralBank];
  const normalizedDescription = jobDescription.toLocaleLowerCase("pt-BR");

  if (!normalizedDescription.trim()) return questions;
  return [...questions].sort((a, b) => {
    const scoreA = a.keywords.filter((keyword) => normalizedDescription.includes(keyword)).length;
    const scoreB = b.keywords.filter((keyword) => normalizedDescription.includes(keyword)).length;
    return scoreB - scoreA;
  });
}

export function pickInterviewQuestion(
  track: InterviewTrack,
  area: InterviewArea,
  difficulty: InterviewDifficulty,
  usedIds: string[],
  jobDescription = "",
  focusKeywords: string[] = [],
) {
  const available = getInterviewQuestions(track, area, jobDescription)
    .filter((question) => !usedIds.includes(question.id));
  const ranked = focusKeywords.length
    ? [...available].sort((a, b) => {
        const scoreA = a.keywords.filter((keyword) => focusKeywords.includes(keyword)).length;
        const scoreB = b.keywords.filter((keyword) => focusKeywords.includes(keyword)).length;
        return scoreB - scoreA;
      })
    : available;
  return ranked.find((question) => question.difficulty === difficulty) ?? ranked[0] ?? null;
}

export function evaluateInterviewAnswer(answer: string, question: InterviewQuestion): InterviewEvaluation {
  const normalized = answer.toLocaleLowerCase("pt-BR");
  const evidenceFound = question.keywords.filter((keyword) => normalized.includes(keyword));
  const missingEvidence = question.keywords.filter((keyword) => !normalized.includes(keyword));
  const keywordRatio = evidenceFound.length / question.keywords.length;
  const sentences = answer.split(/[.!?]+/).filter((sentence) => sentence.trim().length > 0);
  const hasExample = /por exemplo|em um projeto|em uma situação|quando eu|implementei|desenvolvi/.test(normalized);
  const hasOutcome = /resultado|impacto|melhorou|reduziu|aumentou|aprendi|valid/.test(normalized);
  const hasSequence = /primeiro|depois|em seguida|por fim|situação|tarefa|ação/.test(normalized);
  const hasMeasurement = /\d+%?|métrica|medir|indicador|critério/.test(normalized);

  const content = Math.min(100, Math.round(35 + keywordRatio * 65));
  const clarity = Math.min(100, 35 + (answer.length >= 100 ? 25 : 10) + (sentences.length >= 2 ? 20 : 5) + (answer.length <= 900 ? 20 : 5));
  const evidence = Math.min(100, 30 + (hasExample ? 30 : 5) + (hasOutcome ? 25 : 5) + (hasMeasurement ? 15 : 0));
  const structure = Math.min(100, 35 + (hasSequence ? 35 : 10) + (hasOutcome ? 20 : 5) + (answer.length >= 140 ? 10 : 0));
  const score = Math.round(content * 0.4 + clarity * 0.2 + evidence * 0.2 + structure * 0.2);
  const currentIndex = difficultyOrder.indexOf(question.difficulty);
  const nextIndex = score >= 75
    ? Math.min(currentIndex + 1, difficultyOrder.length - 1)
    : score < 50
      ? Math.max(currentIndex - 1, 0)
      : currentIndex;

  return {
    score,
    criteria: { content, clarity, evidence, structure },
    evidenceFound,
    missingEvidence,
    feedback: score >= 75
      ? "Resposta consistente: você trouxe contexto e sinais claros do seu raciocínio."
      : score >= 50
        ? "Boa direção. Sua resposta fica mais convincente com um exemplo concreto e um resultado verificável."
        : "A ideia inicial apareceu, mas faltou explicar suas ações e o impacto. Tente responder em etapas.",
    nextStep: evidenceFound.length === 0
      ? `Conecte sua resposta a conceitos como ${question.keywords.slice(0, 3).join(", ")} sem apenas listá-los.`
      : !hasExample
        ? "Inclua um exemplo concreto que demonstre como você aplicaria esse conhecimento."
        : !hasOutcome
          ? "Feche a resposta com o resultado, a validação ou o aprendizado obtido."
          : "Torne a resposta mais concisa, mantendo contexto, decisão e impacto.",
    nextDifficulty: difficultyOrder[nextIndex],
  };
}

export function getQuestionReason(question: InterviewQuestion, jobDescription: string) {
  const normalizedDescription = jobDescription.toLocaleLowerCase("pt-BR");
  const matchedRequirement = question.keywords.find((keyword) => normalizedDescription.includes(keyword));
  if (matchedRequirement) {
    return `A vaga menciona ${matchedRequirement}; esta pergunta verifica como você aplica essa competência.`;
  }
  if (question.track === "comportamental") {
    return `Esta pergunta avalia ${question.competency}, uma competência recorrente em processos seletivos.`;
  }
  return `${question.competency} faz parte das competências essenciais da área selecionada.`;
}

export function buildInterviewSummary(
  turns: Array<{ question: InterviewQuestion; evaluation: InterviewEvaluation }>,
) {
  const competencyScores = new Map<string, number[]>();
  turns.forEach(({ question, evaluation }) => {
    const scores = competencyScores.get(question.competency) ?? [];
    scores.push(evaluation.score);
    competencyScores.set(question.competency, scores);
  });

  const competencies = [...competencyScores.entries()]
    .map(([name, scores]) => ({
      name,
      score: Math.round(scores.reduce((total, score) => total + score, 0) / scores.length),
    }))
    .sort((a, b) => b.score - a.score);
  const strongest = competencies[0] ?? { name: "Comunicação", score: 0 };
  const priority = competencies.at(-1) ?? strongest;
  const averageCriterion = (key: keyof InterviewEvaluation["criteria"]) =>
    turns.length
      ? Math.round(turns.reduce((total, turn) => total + turn.evaluation.criteria[key], 0) / turns.length)
      : 0;

  return {
    strongest,
    priority,
    competencies,
    criteria: {
      content: averageCriterion("content"),
      clarity: averageCriterion("clarity"),
      evidence: averageCriterion("evidence"),
      structure: averageCriterion("structure"),
    },
  };
}

export function getQuestionBankSize(area: InterviewArea) {
  return technicalBanks[area].length;
}
