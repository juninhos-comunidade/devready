import assert from "node:assert/strict";
import test from "node:test";
import { extractCurriculumDataLocally } from "../lib/extraction";

test("extrai somente tecnologias explicitamente mencionadas", () => {
  const result = extractCurriculumDataLocally(
    "Desenvolvimento com React, TypeScript e GitHub. Experiência criando algoritmos.",
  );

  assert.deepEqual(result.skills, ["TypeScript", "React", "GitHub"]);
  assert.equal(result.skills.includes("Go"), false);
  assert.deepEqual(result.experiences, []);
});

test("não inventa competências quando não encontra evidência textual", () => {
  const result = extractCurriculumDataLocally(
    "Profissional em início de carreira, com interesse em aprender e colaborar.",
  );

  assert.deepEqual(result.skills, []);
});
