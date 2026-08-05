import Link from "next/link";
import {
  Code2,
  ExternalLink,
  FileText,
  GraduationCap,
  PlayCircle,
  Sparkles,
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";

// A curadoria de verdade (seção 4.5) ainda vai virar uma tabela própria da
// equipe (provavelmente vinda de um banco de dados), mas os links abaixo já
// são reais — documentação oficial e freeCodeCamp — pra quem testar a tela
// conseguir clicar e estudar de verdade, não só ver um botão sem função.
const trilha = [
  {
    tecnologia: "Testes automatizados",
    // "ausente" = a pessoa não tem nenhuma base ainda (lacuna total);
    // "parcial" = ela já sabe algo, mas precisa reforçar (seção 4.5)
    status: "ausente" as const,
    mensagem: "Você ainda não tem base aqui — é o seu maior ganho possível antes da próxima entrevista.",
    materiais: [
      {
        titulo: "Testes unitários com Jest",
        tipo: "Artigo",
        duracao: "12 min",
        link: "https://jestjs.io/pt-BR/docs/getting-started",
      },
      {
        titulo: "Fundamentos de testes automatizados",
        tipo: "Curso",
        duracao: "1h30",
        link: "https://testing-library.com/docs/",
      },
    ],
  },
  {
    tecnologia: "SQL",
    status: "ausente" as const,
    mensagem: "Nenhum teste feito ainda nessa tecnologia — comece pelo básico.",
    materiais: [
      {
        titulo: "Introdução a SQL para devs",
        tipo: "Curso",
        duracao: "2h",
        link: "https://www.freecodecamp.org/learn/relational-database/",
      },
    ],
  },
  {
    tecnologia: "React",
    status: "parcial" as const,
    mensagem: "Você já tem uma boa base — hora de aprofundar em pontos específicos.",
    materiais: [
      {
        titulo: "Desafio de hooks em React",
        tipo: "Exercício",
        duracao: "25 min",
        link: "https://pt-br.react.dev/reference/react/hooks",
      },
    ],
  },
];

const statusConfig = {
  ausente: { label: "Recomendação principal", badgeClass: "bg-[#fff0e7] text-[#e8641d]" },
  parcial: { label: "Reforço", badgeClass: "bg-[#efeaff] text-[#7755e8]" },
};

const tipoIcon = {
  Artigo: FileText,
  Curso: PlayCircle,
  Exercício: Code2,
};

export default function TrilhaDeEstudo() {
  return (
    <div className="flex min-h-screen bg-[#f4f3f8]">
      <Sidebar />

      <main className="min-w-0 flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:py-8 xl:px-10">
        <div className="mx-auto max-w-[1440px]">
          <header>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#7755e8]">
              Trilha de estudo
            </p>
            <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold text-[#1d1b33] sm:text-4xl">
              O que estudar pra fechar suas lacunas
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#6d698a] sm:text-base">
              Consolidado a partir da sessão{" "}
              <Link href="/dashboard/resultado" className="font-extrabold text-[#5d43c4] hover:underline">
                Frontend Pleno — Empresa X
              </Link>
              .
            </p>
            <span className="mt-3 inline-flex rounded-full bg-[#ece8f8] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-[#654bc9]">
              Prévia com dados demonstrativos
            </span>
          </header>

          <div className="mt-7 grid gap-5">
            {trilha.map(({ tecnologia, status, mensagem, materiais }) => {
              const config = statusConfig[status];
              return (
                <section
                  key={tecnologia}
                  className="rounded-3xl border border-[#e7e3ee] bg-white p-5 shadow-[0_18px_55px_-42px_rgba(29,27,51,0.45)] sm:p-6"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#eeeef4] text-[#1d1b33]">
                      <GraduationCap className="h-4.5 w-4.5" />
                    </span>
                    <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[#1d1b33]">
                      {tecnologia}
                    </h2>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${config.badgeClass}`}>
                      {config.label}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-[#6d698a]">{mensagem}</p>

                  <ul className="mt-4 grid gap-3">
                    {materiais.map((material) => {
                      const Icon = tipoIcon[material.tipo as keyof typeof tipoIcon];
                      return (
                        <li
                          key={material.titulo}
                          className="flex items-center justify-between gap-4 rounded-2xl border border-[#ece9f1] p-4 transition hover:border-[#d7d0e8]"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#efeaff] text-[#7755e8]">
                              <Icon className="h-4.5 w-4.5" />
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-extrabold text-[#1d1b33]">{material.titulo}</p>
                              <p className="text-xs font-semibold text-[#8b8593]">
                                {material.tipo} · {material.duracao}
                              </p>
                            </div>
                          </div>
                          {/* target=_blank leva pra fora do site (documentação, curso, etc.) —
                              rel="noopener noreferrer" evita que a página aberta consiga
                              manipular a aba do DevReady que ficou pra trás */}
                          <a
                            href={material.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex shrink-0 items-center gap-1.5 text-sm font-extrabold text-[#5d43c4] hover:underline"
                          >
                            Abrir material <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#e7e3ee] bg-white p-5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#e7f7ef] text-[#1f9d73]">
              <Sparkles className="h-4.5 w-4.5" />
            </span>
            <p className="text-sm leading-relaxed text-[#6d698a]">
              Essa trilha reúne todas as lacunas dessa sessão num lugar só —
              conforme você treina, ela é atualizada automaticamente.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
