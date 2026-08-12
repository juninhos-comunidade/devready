import "dotenv/config";
import { prisma } from "../lib/prisma";

const materials = [
  {
    competency: "nodejs",
    title: "Introdução ao Node.js",
    url: "https://nodejs.org/en/learn/getting-started/introduction-to-nodejs",
    contentType: "Artigo",
    level: "iniciante",
  },
  {
    competency: "python",
    title: "Tutorial Python (documentação oficial)",
    url: "https://docs.python.org/pt-br/3/tutorial/",
    contentType: "Curso",
    level: "iniciante",
  },
  {
    competency: "apis-rest",
    title: "Guia de APIs REST (MDN)",
    url: "https://developer.mozilla.org/pt-BR/docs/Glossary/REST",
    contentType: "Artigo",
    level: "intermediaria",
  },
  {
    competency: "docker",
    title: "Docker: primeiros passos",
    url: "https://docs.docker.com/get-started/",
    contentType: "Curso",
    level: "iniciante",
  },
  {
    competency: "aws",
    title: "AWS Cloud Practitioner Essentials",
    url: "https://aws.amazon.com/pt/training/digital/aws-cloud-practitioner-essentials/",
    contentType: "Curso",
    level: "iniciante",
  },
  {
    competency: "comportamental",
    title: "Método STAR pra respostas comportamentais",
    url: "https://www.themuse.com/advice/star-interview-method",
    contentType: "Artigo",
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
    console.log("Seed extra de StudyMaterial concluído.");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
