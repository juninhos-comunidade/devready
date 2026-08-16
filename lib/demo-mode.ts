import type { CandidateProfileSnapshot } from "@/lib/job-training";

export const demoModeEnabled = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export const demoCredentials = {
  email: "demo@devready.app",
  password: "DevReady@2026!",
} as const;

export const demoProfile = {
  id: "demo-user",
  name: "Marina Costa",
  email: "marina.costa@exemplo.dev",
  githubUrl: "https://github.com/octocat",
  areaInterest: "Frontend",
  experienceLevel: "Júnior (até 2 anos)",
  privacyConsent: true,
} as const;

export const demoCandidateProfile: CandidateProfileSnapshot = {
  label: "Dados fictícios da conta de demonstração",
  isDemo: true,
  skillScores: {
    React: 86,
    TypeScript: 78,
    JavaScript: 81,
    Testes: 61,
    SQL: 54,
    "Node.js": 68,
    "APIs REST": 70,
    Docker: 45,
  },
  skillEvidence: {
    React: ["Currículo demonstrativo: React", "GitHub demonstrativo: projetos frontend"],
    TypeScript: ["Currículo demonstrativo: TypeScript", "GitHub demonstrativo: projetos tipados"],
    JavaScript: ["Currículo demonstrativo: JavaScript"],
    Testes: ["Currículo demonstrativo: testes automatizados"],
    SQL: ["Currículo demonstrativo: SQL"],
    "Node.js": ["GitHub demonstrativo: API Node.js"],
    "APIs REST": ["GitHub demonstrativo: API REST"],
    Docker: ["Currículo demonstrativo: Docker"],
  },
};

export function isDemoAccountEmail(email: string | null | undefined) {
  return email?.trim().toLocaleLowerCase("pt-BR") === demoCredentials.email;
}
