export const demoModeEnabled =
  process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export const trainingRoutesEnabled =
  process.env.NEXT_PUBLIC_TRAINING_ROUTES_ENABLED === "true";

export const demoProfile = {
  id: "demo-user",
  name: "Marina Costa",
  email: "marina.costa@exemplo.dev",
  githubUrl: "https://github.com/octocat",
  areaInterest: "Frontend",
  experienceLevel: "Júnior",
  privacyConsent: true,
} as const;
