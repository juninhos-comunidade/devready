import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { hashPassword } from "better-auth/crypto";

const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined;
const baseURL = process.env.BETTER_AUTH_URL ?? vercelUrl;
const secret = process.env.BETTER_AUTH_SECRET;

export const auth = betterAuth({
  baseURL,
  secret,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    password: {
      hash: async (password) => {
        const specialCharCount = (password.match(/[^A-Za-z0-9]/g) ?? []).length;
        if (specialCharCount < 2) {
          throw APIError.from("BAD_REQUEST", {
            code: "PASSWORD_TOO_WEAK",
            message: "A senha deve conter pelo menos 2 caracteres especiais.",
          });
        }
        return hashPassword(password);
      },
    },
  },
  user: {
    additionalFields: {
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
