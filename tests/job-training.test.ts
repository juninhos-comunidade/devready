import assert from "node:assert/strict";
import test from "node:test";
import {
  analyzeJobLocally,
  buildLocalTraining,
  evaluateAnswerLocally,
  nextDifficulty,
} from "../lib/job-training";
import { parseMockSession } from "../lib/mock-session";
import { buildCandidateProfileSnapshot } from "../lib/candidate-profile";

test("identifica requisitos e senioridade na descrição da vaga", () => {
  const analysis = analyzeJobLocally(
    "Vaga júnior com Node.js, APIs REST, TypeScript, SQL, testes e colaboração.",
    "Nuvem Aurora",
  );

  assert.equal(analysis.company, "Nuvem Aurora");
  assert.equal(analysis.seniority, "Júnior");
  assert.ok(analysis.requirements.includes("Node.js"));
  assert.ok(analysis.requirements.includes("SQL"));
  assert.ok(analysis.softSkills.includes("colaboração"));
  assert.ok(analysis.compatibility >= 0 && analysis.compatibility <= 100);
});

test("gera quinze perguntas válidas para o treino local", () => {
  const analysis = analyzeJobLocally("Vaga com React, TypeScript e testes.", "Empresa");
  const content = buildLocalTraining(analysis);

  assert.equal(content.questions.length, 15);
  assert.equal(new Set(content.questions.map((question) => question.id)).size, 15);
  for (const question of content.questions) {
    assert.equal(question.options.length, 4);
    assert.ok(question.correctIndex >= 0 && question.correctIndex < 4);
    assert.ok(question.explanation.length > 20);
  }
});

test("adapta a dificuldade sem ultrapassar os níveis disponíveis", () => {
  assert.equal(nextDifficulty(90, "iniciante"), "intermediaria");
  assert.equal(nextDifficulty(90, "avancada"), "avancada");
  assert.equal(nextDifficulty(20, "intermediaria"), "iniciante");
});

test("avalia resposta comportamental e sugere melhorias", () => {
  const evaluation = evaluateAnswerLocally(
    "comportamental",
    "Situação: havia atraso. Tarefa: reorganizar. Ação: alinhei prioridades. Resultado: entregamos no prazo e registrei o aprendizado.",
    "intermediaria",
  );

  assert.ok(evaluation.score >= 50 && evaluation.score <= 100);
  assert.ok(evaluation.strengths.length > 0);
  assert.ok(evaluation.improvements.length > 0);
  assert.equal(evaluation.source, "local");
});

test("normaliza sessões antigas sem quebrar o fluxo", () => {
  const legacy = parseMockSession(JSON.stringify({
    name: "Sessão antiga",
    company: "Empresa Demo",
    description: "Vaga com React e testes",
    focus: "Entrevista completa",
    source: "text",
  }));

  assert.ok(legacy);
  assert.equal(legacy.id, "legacy-session");
  assert.equal(legacy.name, "Sessão antiga");
  assert.ok(legacy.analysis.requirements.includes("React"));
});

test("não cria sessão quando não existem dados da vaga", () => {
  assert.equal(parseMockSession(null), null);
  assert.equal(parseMockSession("{}"), null);
});

test("cruza evidências reais do currículo e do GitHub", () => {
  const profile = buildCandidateProfileSnapshot({
    curriculumData: {
      skills: ["React", "PostgreSQL"],
      experiences: [{ empresa: "Empresa Exemplo", cargo: "Desenvolvedora", tecnologias: ["TypeScript"] }],
    },
    githubProfile: {
      topLanguages: { JavaScript: 1200 },
      repos: [{ name: "api", description: "API REST", languages: { TypeScript: 800 } }],
    },
  });

  assert.ok(profile);
  assert.ok(profile.skillEvidence?.React?.some((item) => item.startsWith("Currículo:")));
  assert.ok(profile.skillEvidence?.TypeScript?.some((item) => item.startsWith("GitHub:")));
});
