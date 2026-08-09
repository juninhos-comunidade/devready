// Tipos "neutros" do módulo de treino — não conhecem se a pergunta veio da
// lista mocada ou (no futuro) de uma IA. É o "contrato" que todo o resto do
// sistema (tela de quiz, Server Actions, Trilha de Estudo) usa, então trocar
// a origem das perguntas depois não deve exigir mudar essas telas.

export type Difficulty = "iniciante" | "intermediaria" | "avancada";

export type TrainingQuestionDTO = {
  id: string;
  // chave estável (ex.: "react", "sql") — é o que liga um erro a um
  // material de estudo. Diferente de "competencyLabel", que é só o texto
  // bonito mostrado na tela e pode vir formatado de qualquer jeito.
  competency: string;
  competencyLabel: string;
  difficulty: Difficulty;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  // registra de onde essa pergunta veio, sem que a tela precise saber lidar
  // com isso de forma diferente — hoje é sempre "mock"
  source: "mock" | "ai";
};
