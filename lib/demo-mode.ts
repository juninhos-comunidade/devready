export const demoModeEnabled =
  process.env.NEXT_PUBLIC_DEMO_MODE === "true";

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
