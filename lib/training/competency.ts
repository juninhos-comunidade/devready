const knownCompetencies: Array<{ key: string; label: string; terms: string[] }> = [
  { key: "nodejs", label: "Node.js", terms: ["node.js", "nodejs", "node ", "backend"] },
  { key: "react", label: "React", terms: ["react", "hooks", "jsx"] },
  { key: "typescript", label: "TypeScript", terms: ["typescript", "tipagem", "tipos"] },
  { key: "javascript", label: "JavaScript", terms: ["javascript", "ecmascript"] },
  { key: "testes", label: "Testes", terms: ["teste", "jest", "vitest", "qa"] },
  { key: "sql", label: "SQL", terms: ["sql", "postgres", "banco de dados", "query"] },
  { key: "python", label: "Python", terms: ["python", "django", "fastapi"] },
  { key: "apis-rest", label: "APIs REST", terms: ["api", "rest", "http"] },
  { key: "docker", label: "Docker", terms: ["docker", "container"] },
  { key: "aws", label: "AWS", terms: ["aws", "cloud", "nuvem"] },
  { key: "comportamental", label: "Comportamental", terms: ["comportamental", "star", "comunicação"] },
];

const DIACRITICS_PATTERN = /[̀-ͯ]/g;

function slugify(text: string): string {
  const withoutAccents = text.toLocaleLowerCase("pt-BR").normalize("NFD").replace(DIACRITICS_PATTERN, "");
  const slug = withoutAccents.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return slug || "geral";
}

export function resolveCompetency(freeText: string): { key: string; label: string } {
  const normalized = freeText.toLocaleLowerCase("pt-BR");
  const match = knownCompetencies.find((item) => item.terms.some((term) => normalized.includes(term)));
  if (match) return { key: match.key, label: match.label };
  return { key: slugify(freeText), label: freeText };
}
