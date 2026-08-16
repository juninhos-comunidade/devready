export type StudyMaterial = { title: string; type: string; duration: string; url: string };

const resources: Array<{ terms: string[]; materials: StudyMaterial[] }> = [
  { terms: ["react", "frontend", "hooks"], materials: [{ title: "Aprenda React", type: "Documentação oficial", duration: "25 min", url: "https://react.dev/learn" }] },
  { terms: ["typescript", "tipagem"], materials: [{ title: "TypeScript para novos programadores", type: "Documentação oficial", duration: "20 min", url: "https://www.typescriptlang.org/docs/handbook/typescript-from-scratch.html" }] },
  { terms: ["teste", "jest", "qa"], materials: [{ title: "Começando com Jest", type: "Documentação oficial", duration: "20 min", url: "https://jestjs.io/pt-BR/docs/getting-started" }] },
  { terms: ["sql", "postgres", "banco"], materials: [{ title: "Tutorial PostgreSQL", type: "Documentação oficial", duration: "35 min", url: "https://www.postgresql.org/docs/current/tutorial.html" }] },
  { terms: ["node", "backend", "api"], materials: [{ title: "Introdução ao Node.js", type: "Documentação oficial", duration: "25 min", url: "https://nodejs.org/en/learn/getting-started/introduction-to-nodejs" }] },
  { terms: ["python", "dados", "ia"], materials: [{ title: "Tutorial Python", type: "Documentação oficial", duration: "35 min", url: "https://docs.python.org/pt-br/3/tutorial/" }] },
  { terms: ["docker", "container"], materials: [{ title: "Docker: primeiros passos", type: "Documentação oficial", duration: "30 min", url: "https://docs.docker.com/get-started/" }] },
  { terms: ["javascript", "web", "fundamentos"], materials: [{ title: "Guia JavaScript", type: "Documentação MDN", duration: "30 min", url: "https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Guide" }] },
];

const fallbackMaterial: StudyMaterial = {
  title: "Competências essenciais para a web",
  type: "Currículo MDN",
  duration: "30 min",
  url: "https://developer.mozilla.org/en-US/curriculum/core/",
};

export function materialsFor(competency: string): StudyMaterial[] {
  const normalized = competency.toLocaleLowerCase("pt-BR");
  return resources.find((resource) => resource.terms.some((term) => normalized.includes(term)))?.materials ?? [fallbackMaterial];
}
