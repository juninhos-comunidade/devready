import type { CandidateProfileSnapshot } from "@/lib/job-training";

const candidateSkills = [
  { name: "React", terms: ["react", "hooks"] },
  { name: "TypeScript", terms: ["typescript", "type script"] },
  { name: "JavaScript", terms: ["javascript", "ecmascript"] },
  { name: "Testes", terms: ["jest", "vitest", "testing library", "testes automatizados"] },
  { name: "SQL", terms: ["sql", "postgres", "mysql"] },
  { name: "Node.js", terms: ["node.js", "nodejs", "node js"] },
  { name: "Python", terms: ["python", "django", "fastapi"] },
  { name: "APIs REST", terms: ["api rest", "restful", "openapi"] },
  { name: "Docker", terms: ["docker", "container"] },
  { name: "AWS", terms: ["aws", "amazon web services"] },
] as const;

export function buildCandidateProfileSnapshot({
  curriculumText,
  githubText,
}: {
  curriculumText?: string;
  githubText?: string;
}): CandidateProfileSnapshot | undefined {
  const sources = [
    { label: "Currículo processado", text: curriculumText?.toLocaleLowerCase("pt-BR") ?? "" },
    { label: "GitHub público", text: githubText?.toLocaleLowerCase("pt-BR") ?? "" },
  ].filter((source) => source.text.trim());
  if (!sources.length) return undefined;

  const skillEvidence = Object.fromEntries(candidateSkills.flatMap((skill) => {
    const evidence = sources
      .filter((source) => skill.terms.some((term) => source.text.includes(term)))
      .map((source) => source.label);
    return evidence.length ? [[skill.name, evidence]] : [];
  }));

  return {
    label: "Perfil técnico processado",
    isDemo: false,
    skillScores: {},
    skillEvidence,
  };
}
