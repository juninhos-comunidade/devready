// Strategy pattern. Isola de onde vêm as perguntas de treino do resto do
// app. Hoje só existe a MockQuizQuestionSource, que usa a lista fixa de
// lib/mock-quiz.ts. Quando a geração por IA estiver pronta, basta criar
// uma nova classe que implemente a mesma interface e trocar o retorno de
// getQuestionSource(). Nenhuma tela precisa mudar.

import {
  nextQuizDifficulty,
  pickQuizQuestion,
  quizQuestions,
} from "@/lib/mock-quiz";
import type { Difficulty, TrainingQuestionDTO } from "./types";

export interface QuestionSource {
  // "competency" é opcional. Quando a pessoa chega no quiz a partir de uma
  // competência específica (Resultado da vaga), a rodada fica restrita a
  // ela.
  pickQuestion(difficulty: Difficulty, askedIds: string[], competency?: string): TrainingQuestionDTO | null;
  nextDifficulty(current: Difficulty, wasCorrect: boolean): Difficulty;
}

// Rótulo de exibição por competência.
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
  pickQuestion(difficulty: Difficulty, askedIds: string[], competency?: string): TrainingQuestionDTO | null {
    const question = pickQuizQuestion(difficulty, askedIds, competency);
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

// Ponto único de troca. Quando a geração via IA existir, entra aqui.
export function getQuestionSource(): QuestionSource {
  return new MockQuizQuestionSource();
}

// Lista de competências conhecidas hoje, usada pela Trilha.
export function knownCompetencies(): string[] {
  return [...new Set(quizQuestions.map((question) => question.competency))];
}

// Usado pelo Resultado pra decidir se mostra o botão de quiz numa
// competência sem perguntas disponíveis.
export function hasQuestionsForCompetency(competency: string): boolean {
  return quizQuestions.some((question) => question.competency === competency);
}
