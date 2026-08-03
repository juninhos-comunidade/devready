export const MOCK_SESSION_KEY = "devready:mock-session";

export type MockSession = {
  name: string;
  company: string;
  description: string;
  focus: string;
  source: "text" | "image";
};

export const defaultMockSession: MockSession = {
  name: "Frontend Júnior",
  company: "Fintech Aurora",
  description:
    "Vaga para pessoa desenvolvedora frontend com React, TypeScript, testes automatizados, consumo de APIs e noções de SQL. Valorizamos comunicação, colaboração e vontade de aprender.",
  focus: "Entrevista completa",
  source: "text",
};

const technologyRules = [
  { name: "React", terms: ["react", "hooks", "frontend"], base: 86 },
  { name: "TypeScript", terms: ["typescript", "tipagem"], base: 78 },
  { name: "Testes", terms: ["teste", "jest", "vitest", "qa"], base: 61 },
  { name: "SQL", terms: ["sql", "banco", "postgres"], base: 54 },
  { name: "Node.js", terms: ["node", "backend", "api"], base: 68 },
] as const;

export function analyzeMockJob(description: string) {
  const normalized = description.toLocaleLowerCase("pt-BR");
  const technologies = technologyRules.map((technology) => {
    const required = technology.terms.some((term) => normalized.includes(term));
    return { name: technology.name, required, score: required ? technology.base : null };
  });
  const required = technologies.filter((technology) => technology.required);
  const compatibility = required.length
    ? Math.round(required.reduce((total, technology) => total + (technology.score ?? 0), 0) / required.length)
    : 72;

  return {
    compatibility,
    technologies,
    strongest: [...required].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0]?.name ?? "Fundamentos",
    priority: [...required].sort((a, b) => (a.score ?? 0) - (b.score ?? 0))[0]?.name ?? "Mapear requisitos",
  };
}
