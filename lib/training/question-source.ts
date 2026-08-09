// Strategy pattern: isola "de onde vêm as perguntas de treino" do resto do
// app. Hoje só existe a MockQuizQuestionSource, que reaproveita a lista
// fixa de lib/mock-quiz.ts. Quando a geração por IA (currículo + vaga)
// estiver pronta, basta criar uma AiQuizQuestionSource que implementa a
// mesma interface e trocar o retorno de getQuestionSource() — nenhuma tela
// nem Server Action precisa mudar, porque todas conversam só com
// QuestionSource e com o tipo TrainingQuestionDTO (lib/training/types.ts).

import {
  nextQuizDifficulty,
  pickQuizQuestion,
  quizQuestions,
} from "@/lib/mock-quiz";
import type { Difficulty, TrainingQuestionDTO } from "./types";

export interface QuestionSource {
  pickQuestion(difficulty: Difficulty, askedIds: string[]): TrainingQuestionDTO | null;
  nextDifficulty(current: Difficulty, wasCorrect: boolean): Difficulty;
}

// rótulo de exibição por competência — usado quando queremos um texto
// padronizado, mas cada pergunta mocada já carrega o seu próprio "topic"
// como rótulo (ver lib/mock-quiz.ts), que é o que de fato aparece na tela
const competencyLabels: Record<string, string> = {
  javascript: "JavaScript",
  react: "React",
  typescript: "TypeScript",
  testes: "Testes",
  sql: "SQL",
};

export function competencyLabelFor(competency: string): string {
  return competencyLabels[competency] ?? competency;
}

class MockQuizQuestionSource implements QuestionSource {
  pickQuestion(difficulty: Difficulty, askedIds: string[]): TrainingQuestionDTO | null {
    const question = pickQuizQuestion(difficulty, askedIds);
    if (!question) return null;
    return {
      id: question.id,
      competency: question.competency,
      competencyLabel: competencyLabelFor(question.competency),
      difficulty: question.difficulty,
      prompt: question.prompt,
      options: question.options,
      correctIndex: question.correctIndex,
      explanation: question.explanation,
      source: "mock",
    };
  }

  nextDifficulty(current: Difficulty, wasCorrect: boolean): Difficulty {
    return nextQuizDifficulty(current, wasCorrect);
  }
}

// ponto único de troca: quando a colega entregar a geração via IA, é aqui
// (e só aqui) que a nova fonte entra
export function getQuestionSource(): QuestionSource {
  return new MockQuizQuestionSource();
}

// usado pela Trilha pra saber quantas competências existem no total —
// não depende da fonte ativa, é só a lista de chaves conhecidas hoje
export function knownCompetencies(): string[] {
  return [...new Set(quizQuestions.map((question) => question.competency))];
}
