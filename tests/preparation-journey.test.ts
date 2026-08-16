import assert from "node:assert/strict";
import test from "node:test";
import { analyzeJobLocally, type CandidateProfileSnapshot, type TrainingAttempt } from "../lib/job-training";
import { buildEvidenceMatrix, getJourneyCompletion, getNextJourneyAction } from "../lib/preparation-journey";
import { buildCandidateProfileSnapshot } from "../lib/candidate-profile";

const testCandidateProfile: CandidateProfileSnapshot = {
  label: "Perfil de teste",
  skillScores: {
    React: 86,
    TypeScript: 78,
    JavaScript: 81,
    Testes: 61,
    SQL: 54,
    "Node.js": 68,
    Python: 72,
    "APIs REST": 70,
    Docker: 45,
    AWS: 42,
  },
  skillEvidence: {
    React: ["Currículo de teste"],
    TypeScript: ["Currículo de teste"],
    SQL: ["Currículo de teste"],
  },
};

const analysis = analyzeJobLocally(
  "Vaga júnior com React, TypeScript, SQL, testes e colaboração.",
  "Empresa fictícia",
  testCandidateProfile,
);

test("a matriz distingue evidência, desenvolvimento e ausência de evidência", () => {
  const matrix = buildEvidenceMatrix(analysis, testCandidateProfile.label);
  assert.ok(matrix.some((item) => item.status === "demonstrated"));
  assert.ok(matrix.some((item) => item.status === "developing"));
  assert.ok(matrix.some((item) => item.status === "not-evidenced"));
  assert.ok(matrix.every((item) => item.evidence.length > 0 && item.nextAction.length > 0));
});

test("a análise sem perfil não inventa pontuações do candidato", () => {
  const withoutProfile = analyzeJobLocally("Vaga com React e SQL", "Empresa");
  assert.equal(withoutProfile.compatibility, 0);
  assert.ok(withoutProfile.technologies.every((technology) => technology.profileScore === null));
});

test("a próxima ação acompanha o progresso da jornada", () => {
  assert.equal(getNextJourneyAction({ trainingAttempts: [] }).stage, "pratica");

  const attempt: TrainingAttempt = {
    id: "attempt-1",
    sessionId: "session-1",
    sessionName: "Frontend júnior",
    mode: "quiz",
    score: 80,
    difficulty: "intermediaria",
    createdAt: new Date().toISOString(),
  };
  assert.equal(getNextJourneyAction({ trainingAttempts: [attempt] }).stage, "entrevista");
  assert.equal(getJourneyCompletion({ trainingAttempts: [attempt] }), 60);
});

test("o perfil real registra somente a origem da evidência encontrada", () => {
  const profile = buildCandidateProfileSnapshot({
    curriculumText: "Experiência acadêmica com TypeScript e PostgreSQL.",
    githubText: "Projeto de API REST em Node.js com Docker.",
  });
  assert.deepEqual(profile?.skillScores, {});
  assert.deepEqual(profile?.skillEvidence?.TypeScript, ["Currículo processado"]);
  assert.deepEqual(profile?.skillEvidence?.Docker, ["GitHub público"]);
});
