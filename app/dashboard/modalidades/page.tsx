import Link from "next/link";
import { ArrowRight, CheckCircle2, Code2, ListChecks } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";

// As 3 modalidades previstas nos requisitos (seção 4.4) são: quiz de múltipla
// escolha, desafio de código e perguntas comportamentais. A parte
// comportamental já é coberta pelo "Agente de entrevista" (uma etapa separada,
// tratada como bônus) — aqui ficam as outras duas, que ainda não existiam.
const modalidades = [
  {
    href: "/dashboard/modalidades/quiz",
    icon: ListChecks,
    titulo: "Quiz de múltipla escolha",
    descricao: "Perguntas rápidas de teoria, com dificuldade que se ajusta conforme você acerta ou erra.",
    tempo: "~10 min",
  },
  {
    href: "/dashboard/modalidades/desafio",
    icon: Code2,
    titulo: "Desafio de código",
    descricao: "Resolva um problema de programação de verdade, do básico ao avançado.",
    tempo: "~20 min",
  },
];

export default function Modalidades() {
  return (
    <div className="flex min-h-screen bg-[#f4f3f8]">
      <Sidebar />

      <main className="min-w-0 flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:py-8 xl:px-10">
        <div className="mx-auto max-w-[1100px]">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#7755e8]">
            Modalidades de treino
          </span>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold text-[#1d1b33] sm:text-4xl">
            Como você quer treinar hoje?
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#6d698a] sm:text-base">
            Cada modalidade cobre um jeito diferente de mostrar o que você
            sabe — pode repetir quantas vezes quiser dentro da mesma sessão.
          </p>

          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            {modalidades.map(({ href, icon: Icon, titulo, descricao, tempo }) => (
              <Link
                key={href}
                href={href}
                className="group flex flex-col rounded-3xl border border-[#e7e3ee] bg-white p-6 shadow-[0_18px_55px_-42px_rgba(29,27,51,0.45)] transition hover:border-[#d7d0e8] hover:shadow-[0_18px_55px_-30px_rgba(29,27,51,0.55)] sm:p-7"
              >
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#efeaff] text-[#7755e8]">
                  <Icon className="h-6 w-6" />
                </span>
                <h2 className="mt-4 font-[family-name:var(--font-display)] text-xl font-bold text-[#1d1b33]">
                  {titulo}
                </h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[#6d698a]">{descricao}</p>
                <div className="mt-5 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#8b8593]">{tempo}</span>
                  <span className="flex items-center gap-1.5 text-sm font-extrabold text-[#5d43c4]">
                    Começar
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#e7e3ee] bg-white p-5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#e7f7ef] text-[#1f9d73]">
              <CheckCircle2 className="h-4.5 w-4.5" />
            </span>
            <p className="text-sm leading-relaxed text-[#6d698a]">
              Prefere praticar perguntas comportamentais e técnicas em formato
              de conversa? Isso já existe no{" "}
              <Link href="/dashboard/agente" className="font-extrabold text-[#5d43c4] hover:underline">
                Agente de entrevista
              </Link>
              .
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
