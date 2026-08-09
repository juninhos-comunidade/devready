// Banco de perguntas do quiz de múltipla escolha (seção 4.4 dos requisitos).
// Assim como o "Agente de entrevista" (lib/interview-agent.ts), isso roda
// 100% no navegador — sem chamada de IA de verdade ainda. Quando a geração
// dinâmica via IA existir, essa lista vira o "fallback" ou é substituída
// pela resposta da API, mas a estrutura (pergunta, opções, dificuldade)
// continua a mesma.

export type QuizDifficulty = "iniciante" | "intermediaria" | "avancada";

export type QuizQuestion = {
  id: string;
  difficulty: QuizDifficulty;
  // "topic" é o rótulo mostrado na tela (texto livre, pode mudar de
  // redação a qualquer momento). "competency" é a chave estável usada
  // pra ligar erros a materiais de estudo na Trilha — mesmo que uma IA
  // gere perguntas com "topic" em qualquer formato no futuro, o
  // "competency" continua batendo com o StudyMaterial certo.
  competency: string;
  topic: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export const quizQuestions: QuizQuestion[] = [
  {
    id: "q-map",
    difficulty: "iniciante",
    competency: "javascript",
    topic: "JavaScript",
    prompt: "O que o método .map() faz em um array no JavaScript?",
    options: [
      "Modifica o array original removendo itens",
      "Cria um novo array aplicando uma função a cada item",
      "Ordena o array em ordem alfabética",
      "Verifica se todos os itens satisfazem uma condição",
    ],
    correctIndex: 1,
    explanation: ".map() sempre retorna um array novo, do mesmo tamanho, sem alterar o original — diferente de métodos como .sort() ou .splice().",
  },
  {
    id: "q-usestate",
    difficulty: "iniciante",
    competency: "react",
    topic: "React",
    prompt: "Em React, qual hook é usado para guardar um estado dentro de um componente?",
    options: ["useEffect", "useContext", "useState", "useRef"],
    correctIndex: 2,
    explanation: "useState é o hook básico de estado local — ele retorna o valor atual e uma função pra atualizá-lo.",
  },
  {
    id: "q-props",
    difficulty: "iniciante",
    competency: "react",
    topic: "React",
    prompt: "O que significam as \"props\" em React?",
    options: [
      "Propriedades passadas de um componente pai para um filho",
      "Um tipo de estado interno do componente",
      "Uma função de ciclo de vida",
      "Um hook de navegação",
    ],
    correctIndex: 0,
    explanation: "Props são somente-leitura do ponto de vista do componente filho — quem controla o valor é sempre quem passou a prop.",
  },
  {
    id: "q-let-const",
    difficulty: "intermediaria",
    competency: "javascript",
    topic: "JavaScript",
    prompt: "Qual a principal diferença entre let e const no JavaScript?",
    options: [
      "let só funciona dentro de funções",
      "const não permite reatribuição do valor da variável",
      "const é mais lento que let",
      "Não há diferença, são sinônimos",
    ],
    correctIndex: 1,
    explanation: "const impede reatribuir a variável (não necessariamente torna o valor imutável — um objeto const ainda pode ter suas propriedades alteradas).",
  },
  {
    id: "q-ts-interface",
    difficulty: "intermediaria",
    competency: "typescript",
    topic: "TypeScript",
    prompt: "No TypeScript, o que o campo `idade?: number` representa dentro de uma interface?",
    options: [
      "idade é obrigatório e do tipo string",
      "idade é um campo opcional do tipo number",
      "idade só aceita valores negativos",
      "Isso não é uma sintaxe válida em TypeScript",
    ],
    correctIndex: 1,
    explanation: "O `?` depois do nome do campo marca ele como opcional — o valor pode ser number ou undefined.",
  },
  {
    id: "q-useeffect",
    difficulty: "intermediaria",
    competency: "react",
    topic: "React",
    prompt: "Qual é o propósito do useEffect em React?",
    options: [
      "Criar componentes de classe",
      "Executar efeitos colaterais (como chamadas de API) em resposta a mudanças",
      "Armazenar estado local",
      "Estilizar componentes",
    ],
    correctIndex: 1,
    explanation: "useEffect roda código fora da renderização — buscar dados, se inscrever em eventos, manipular o DOM diretamente, etc.",
  },
  {
    id: "q-usememo",
    difficulty: "avancada",
    competency: "react",
    topic: "React",
    prompt: "O que é \"memoization\" e qual hook do React se relaciona a esse conceito?",
    options: [
      "Uma técnica de cache de resultados; useMemo",
      "Um padrão de roteamento; useRouter",
      "Uma forma de validar formulários; useForm",
      "Um método de logging; useEffect",
    ],
    correctIndex: 0,
    explanation: "useMemo guarda o resultado de um cálculo caro e só recalcula quando as dependências mudam — evita trabalho repetido a cada renderização.",
  },
  {
    id: "q-jestfn",
    difficulty: "avancada",
    competency: "testes",
    topic: "Testes",
    prompt: "Em testes com Jest, o que jest.fn() faz?",
    options: [
      "Executa todos os testes do arquivo",
      "Cria uma função mock (simulada) para rastrear chamadas",
      "Pula o teste atual",
      "Gera um relatório de cobertura",
    ],
    correctIndex: 1,
    explanation: "jest.fn() cria uma função-espiã: dá pra checar se foi chamada, com quais argumentos e quantas vezes — sem executar lógica real.",
  },
  {
    id: "q-sql-injection",
    difficulty: "avancada",
    competency: "sql",
    topic: "SQL",
    prompt: "Qual é a vantagem de usar SQL parametrizado (prepared statements) em vez de concatenar strings numa query?",
    options: [
      "É mais rápido de escrever",
      "Previne ataques de SQL Injection",
      "Reduz o tamanho do banco de dados",
      "Não tem vantagem real",
    ],
    correctIndex: 1,
    explanation: "Parâmetros são tratados como dados, nunca como parte do comando SQL — isso impede que um valor malicioso altere a query original.",
  },
];

const difficultyOrder: QuizDifficulty[] = ["iniciante", "intermediaria", "avancada"];

// diagnóstico adaptativo (seção 4.4): acertou, sobe de nível; errou, desce —
// sem deixar passar do "avancada" nem cair abaixo de "iniciante"
export function nextQuizDifficulty(current: QuizDifficulty, wasCorrect: boolean): QuizDifficulty {
  const index = difficultyOrder.indexOf(current);
  const nextIndex = wasCorrect
    ? Math.min(index + 1, difficultyOrder.length - 1)
    : Math.max(index - 1, 0);
  return difficultyOrder[nextIndex];
}

export function pickQuizQuestion(difficulty: QuizDifficulty, askedIds: string[]): QuizQuestion | null {
  const exactPool = quizQuestions.filter((question) => question.difficulty === difficulty && !askedIds.includes(question.id));
  if (exactPool.length > 0) {
    return exactPool[Math.floor(Math.random() * exactPool.length)];
  }

  // com só 3 perguntas por dificuldade, é fácil essa dificuldade específica
  // esgotar antes das 6 rodadas (ex.: errar várias vezes seguidas mantém a
  // pessoa presa no "iniciante"). Nesse caso, busca em QUALQUER dificuldade
  // que ainda tenha pergunta não usada, em vez de encerrar o quiz cedo demais
  const anyRemaining = quizQuestions.filter((question) => !askedIds.includes(question.id));
  if (anyRemaining.length === 0) return null;
  return anyRemaining[Math.floor(Math.random() * anyRemaining.length)];
}
