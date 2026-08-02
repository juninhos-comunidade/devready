-- Campos adicionais do perfil usados pelo cadastro e pelo consentimento LGPD.
-- Todos, exceto o consentimento, são opcionais para preservar usuários existentes.
ALTER TABLE "User"
ADD COLUMN "githubUrl" TEXT,
ADD COLUMN "areaInterest" TEXT,
ADD COLUMN "experienceLevel" TEXT,
ADD COLUMN "privacyConsent" BOOLEAN NOT NULL DEFAULT false;
