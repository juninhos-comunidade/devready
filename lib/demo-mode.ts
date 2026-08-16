import { analyzeJobLocally, type CandidateProfileSnapshot } from "@/lib/job-training";
import type { MockSession } from "@/lib/mock-session";

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

const frontendJobDescription = "Vaga júnior com React, TypeScript, testes automatizados, APIs REST, comunicação e colaboração.";
const backendJobDescription = "Vaga júnior com Node.js, TypeScript, APIs REST, SQL, Docker, testes e trabalho em equipe.";

export const demoDashboardSessions: MockSession[] = [
  {
    id: "demo-account-frontend",
    name: "Frontend Júnior",
    company: "Nexa Labs",
    description: frontendJobDescription,
    source: "text",
    analysis: analyzeJobLocally(frontendJobDescription, "Nexa Labs", demoCandidateProfile),
    progress: {
      trainingAttempts: [
        { id: "demo-account-quiz-1", sessionId: "demo-account-frontend", sessionName: "Frontend Júnior", mode: "quiz", score: 82, difficulty: "intermediaria", createdAt: "2026-08-10T14:00:00.000Z" },
        { id: "demo-account-star-1", sessionId: "demo-account-frontend", sessionName: "Frontend Júnior", mode: "comportamental", score: 76, difficulty: "intermediaria", createdAt: "2026-08-10T14:20:00.000Z" },
      ],
      interviewHistory: [
        { score: 78, strongest: "React", priority: "Testes", completedAt: "2026-08-10T15:00:00.000Z", track: "Frontend", criteria: { content: 82, clarity: 78, evidence: 72, structure: 80 } },
      ],
    },
    createdAt: "2026-08-10T13:30:00.000Z",
  },
  {
    id: "demo-account-backend",
    name: "Backend Júnior",
    company: "Orion Sistemas",
    description: backendJobDescription,
    source: "text",
    analysis: analyzeJobLocally(backendJobDescription, "Orion Sistemas", demoCandidateProfile),
    progress: {
      trainingAttempts: [
        { id: "demo-account-quiz-2", sessionId: "demo-account-backend", sessionName: "Backend Júnior", mode: "quiz", score: 69, difficulty: "intermediaria", createdAt: "2026-08-08T16:00:00.000Z" },
      ],
    },
    createdAt: "2026-08-08T15:30:00.000Z",
  },
];
