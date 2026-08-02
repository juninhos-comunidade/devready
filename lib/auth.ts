import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { sendTransactionalEmail } from "./email";

function reportEmailError(error: unknown) {
  console.error("Não foi possível enviar o e-mail do Better Auth.", error);
}

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    sendResetPassword: async ({ user, url }) => {
      void sendTransactionalEmail({
        to: user.email,
        subject: "Redefina sua senha no DevReady",
        text: `Olá, ${user.name}. Use este link para criar uma nova senha: ${url}`,
      }).catch(reportEmailError);
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      void sendTransactionalEmail({
        to: user.email,
        subject: "Confirme seu e-mail no DevReady",
        text: `Olá, ${user.name}. Confirme seu e-mail para liberar o DevReady: ${url}`,
      }).catch(reportEmailError);
    },
  },
  user: {
    additionalFields: {
      githubUrl: { type: "string", required: false },
      areaInterest: { type: "string", required: false },
      experienceLevel: { type: "string", required: false },
      privacyConsent: { type: "boolean", required: true },
    },
    deleteUser: {
      enabled: true,
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (user.privacyConsent !== true) {
            throw APIError.from("BAD_REQUEST", {
              code: "PRIVACY_CONSENT_REQUIRED",
              message: "O consentimento de privacidade é obrigatório.",
            });
          }
        },
      },
    },
  },
});
