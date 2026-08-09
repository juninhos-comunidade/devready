// Script de seed pontual pra StudyMaterial — roda uma vez (ou sempre que
// quisermos ajustar a curadoria) com `npx tsx prisma/seed-study-materials.ts`.
// Não é automático a cada build de propósito: essa tabela é mantida à mão
// pela equipe, não gerada por IA (ver comentário em prisma/schema.prisma).

// fora do Next.js, o .env não é carregado sozinho
import "dotenv/config";
import { prisma } from "../lib/prisma";

const materials = [
  {
    competency: "javascript",
    title: "Guia de JavaScript moderno (MDN)",
    url: "https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Guide",
    contentType: "Artigo",
    level: "iniciante",
  },
  {
    competency: "javascript",
    title: "JavaScript Algorithms and Data Structures",
    url: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/",
    contentType: "Curso",
    level: "intermediaria",
  },
  {
    competency: "react",
    title: "Aprenda React — documentação oficial",
    url: "https://pt-br.react.dev/learn",
    contentType: "Artigo",
    level: "iniciante",
  },
  {
    competency: "react",
    title: "Referência de Hooks em React",
    url: "https://pt-br.react.dev/reference/react/hooks",
    contentType: "Exercício",
    level: "intermediaria",
  },
  {
    competency: "typescript",
    title: "TypeScript para iniciantes",
    url: "https://www.typescriptlang.org/pt/docs/handbook/typescript-from-scratch.html",
    contentType: "Artigo",
    level: "iniciante",
  },
  {
    competency: "typescript",
    title: "TypeScript Handbook — tipos avançados",
    url: "https://www.typescriptlang.org/docs/handbook/2/types-from-types.html",
    contentType: "Artigo",
    level: "avancada",
  },
  {
    competency: "testes",
    title: "Testes unitários com Jest",
    url: "https://jestjs.io/pt-BR/docs/getting-started",
    contentType: "Artigo",
    level: "iniciante",
  },
  {
    competency: "testes",
    title: "Testing Library — documentação",
    url: "https://testing-library.com/docs/",
    contentType: "Curso",
    level: "intermediaria",
  },
  {
    competency: "sql",
    title: "Introdução a SQL para devs",
    url: "https://www.freecodecamp.org/learn/relational-database/",
    contentType: "Curso",
    level: "iniciante",
  },
];

async function main() {
  for (const material of materials) {
    const existing = await prisma.studyMaterial.findFirst({
      where: { competency: material.competency, title: material.title },
    });
    if (existing) {
      console.log(`já existe, pulando: ${material.title}`);
      continue;
    }
    await prisma.studyMaterial.create({ data: material });
    console.log(`criado: ${material.title}`);
  }
}

main()
  .then(() => {
    console.log("Seed de StudyMaterial concluído.");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
