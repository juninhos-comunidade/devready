import type { CandidateProfileSnapshot } from "@/lib/job-training";
import type { ExtractedData } from "@/lib/extraction";

const skillAliases = [
  { name: "React", terms: ["react", "hooks"] },
  { name: "Next.js", terms: ["next.js", "nextjs"] },
  { name: "TypeScript", terms: ["typescript", "type script"] },
  { name: "JavaScript", terms: ["javascript", "ecmascript"] },
  { name: "Testes", terms: ["jest", "vitest", "testing library", "cypress", "playwright", "testes automatizados"] },
  { name: "SQL", terms: ["sql", "postgres", "postgresql", "mysql"] },
  { name: "Node.js", terms: ["node.js", "nodejs", "node js"] },
  { name: "Python", terms: ["python", "django", "fastapi"] },
  { name: "Java", terms: ["java", "spring"] },
  { name: "C#", terms: ["c#", ".net", "dotnet"] },
  { name: "APIs REST", terms: ["api rest", "restful", "openapi", "rest"] },
  { name: "Docker", terms: ["docker", "container"] },
  { name: "AWS", terms: ["aws", "amazon web services"] },
  { name: "Azure", terms: ["azure"] },
  { name: "Git", terms: ["git", "github"] },
] as const;

type GithubEvidence = {
  topLanguages?: unknown;
  repos?: Array<{ name: string; description: string | null; languages?: unknown }>;
};

function normalize(value: string) {
  return value.trim().toLocaleLowerCase("pt-BR");
}

export function canonicalCandidateSkill(value: string) {
  const normalized = normalize(value);
  return skillAliases.find(({ terms }) => terms.some((term) => normalized === term || normalized.includes(term)))?.name ?? value.trim();
}

function jsonKeys(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? Object.keys(value) : [];
}

export function buildCandidateProfileSnapshot({ curriculumData, githubProfile }: {
  curriculumData?: unknown;
  githubProfile?: GithubEvidence;
}): CandidateProfileSnapshot | undefined {
  const evidence = new Map<string, Set<string>>();
  const add = (skill: string, source: string) => {
    const name = canonicalCandidateSkill(skill);
    if (!name) return;
    const sources = evidence.get(name) ?? new Set<string>();
    sources.add(source);
    evidence.set(name, sources);
  };

  if (curriculumData && typeof curriculumData === "object") {
    const curriculum = curriculumData as Partial<ExtractedData>;
    for (const skill of Array.isArray(curriculum.skills) ? curriculum.skills : []) {
      if (typeof skill === "string") add(skill, "Currículo: habilidade declarada");
    }
    for (const experience of Array.isArray(curriculum.experiences) ? curriculum.experiences : []) {
      if (!experience || typeof experience !== "object") continue;
      const context = [experience.cargo, experience.empresa].filter(Boolean).join(" na ");
      for (const skill of Array.isArray(experience.tecnologias) ? experience.tecnologias : []) {
        if (typeof skill === "string") add(skill, `Currículo: experiência${context ? ` como ${context}` : " profissional"}`);
      }
    }
  }

  if (githubProfile) {
    for (const language of jsonKeys(githubProfile.topLanguages)) add(language, "GitHub: linguagem identificada nos repositórios");
    for (const repo of githubProfile.repos ?? []) {
      for (const language of jsonKeys(repo.languages)) add(language, `GitHub: repositório ${repo.name}`);
      const description = normalize(repo.description ?? "");
      for (const alias of skillAliases) {
        if (alias.terms.some((term) => description.includes(term))) add(alias.name, `GitHub: descrição do repositório ${repo.name}`);
      }
    }
  }

  if (!evidence.size) return undefined;
  return {
    label: curriculumData && githubProfile
      ? "Currículo e GitHub processados"
      : curriculumData
        ? "Currículo processado"
        : "GitHub processado",
    skillScores: {},
    skillEvidence: Object.fromEntries([...evidence].map(([skill, sources]) => [skill, [...sources]])),
  };
}
