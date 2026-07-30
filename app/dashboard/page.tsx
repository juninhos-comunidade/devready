import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { Plus } from "lucide-react";

// Enquanto o backend não existe, a tela usa esses dados fixos só pra gente
// conseguir ver o layout funcionando de verdade (com números, barras, etc.)
// em vez de olhar pra caixas vazias. Quando a análise de sessões estiver
// pronta, isso tudo vira uma busca no banco de dados no lugar dessas listas.
const techScores = [
  { name: "React", score: 8.5, tested: true },
  { name: "TypeScript", score: 7.0, tested: true },
  { name: "Testes", score: 4.2, tested: true },
  { name: "SQL", score: null, tested: false },
  { name: "Node.js", score: null, tested: false },
];

const trilha = [
  {
    badge: "Reforço",
    badgeClass: "bg-[#fdeee3] text-[#e8641d]",
    title: "Testes unitários com Jest",
    meta: "Artigo · 12 min",
  },
  {
    badge: "Base",
    badgeClass: "bg-[#efeaff] text-[#7755e8]",
    title: "Introdução a SQL para devs",
    meta: "Curso · 2h",
  },
  {
    badge: "Prática",
    badgeClass: "bg-[#e6f6ec] text-[#1f9d55]",
    title: "Desafio de hooks em React",
    meta: "Exercício · 25 min",
  },
];

export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-[#eef0f3]">
      <Sidebar />

      <main className="flex-1 p-6 md:p-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold tracking-widest text-[#7755e8] uppercase">
              Visão geral
            </span>
            <h1 className="font-[family-name:var(--font-display)] mt-1 text-3xl md:text-4xl text-[#1d1b33]">
              Seu painel de progresso
            </h1>
            <p className="mt-1 text-[#59567a]">
              Acompanhe sua prontidão por tecnologia e escolha o próximo
              treino com clareza.
            </p>
          </div>

          <Link
            href="/dashboard/nova-sessao"
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#7755e8] to-[#e8641d] px-5 py-3 font-extrabold text-white shadow-[0_14px_32px_-16px_rgba(119,85,232,0.75)] transition hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4" />
            Nova sessão
          </Link>
        </div>

        {/* banner de destaque com a nota geral — o número grande (72%) é a
            média das sessões de treino, nunca inclui a nota do GitHub, que
            o requisito pede pra ficar sempre separada (ver o card "GitHub" abaixo) */}
        <div className="relative mt-6 overflow-hidden rounded-2xl bg-gradient-to-r from-[#7755e8] to-[#e8641d] p-8 text-white">
          <div className="pointer-events-none absolute -right-8 -top-10 h-48 w-48 rounded-full border border-white/20" />
          <div className="relative flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-lg">
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold md:text-3xl">
                Você está mais perto da próxima vaga.
              </h2>
              <p className="mt-2 text-white/85">
                Seu maior ganho possível agora está em testes automatizados e
                fundamentos de SQL.
              </p>
            </div>
            <div className="text-right">
              <div className="font-[family-name:var(--font-display)] text-5xl font-extrabold">
                72%
              </div>
              <div className="mt-1 text-xs font-extrabold uppercase tracking-widest text-white/80">
                Prontidão geral
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-6">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#8b8593]">
              Evolução recente
            </span>
            <div className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold text-[#1f9d55]">
              +6%
            </div>
            <p className="mt-1 text-sm text-[#59567a]">
              Desde a última sessão
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#8b8593]">
              Sessões realizadas
            </span>
            <div className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold text-[#1d1b33]">
              4
            </div>
            <p className="mt-1 text-sm text-[#59567a]">3 vagas diferentes</p>
          </div>

          {/* nota do GitHub sempre num card à parte, nunca somada à nota
              geral de prontidão — é uma regra do requisito, não só de layout */}
          <div className="rounded-2xl bg-white p-6">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#8b8593]">
              GitHub
            </span>
            <div className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold text-[#1d1b33]">
              B+
            </div>
            <p className="mt-1 text-sm text-[#59567a]">
              Nota exibida separadamente
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-[1.3fr_1fr]">
          <div className="rounded-2xl bg-white p-6">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#8b8593]">
              Nota por tecnologia
            </span>

            <ul className="mt-4 grid gap-4">
              {techScores.map(({ name, score, tested }) => (
                <li key={name} className="flex items-center gap-4">
                  <div className="flex w-32 shrink-0 items-center gap-2">
                    <span className="font-bold text-[#1d1b33]">{name}</span>
                    {/* tecnologia do currículo que ainda não foi testada em
                        nenhuma sessão: mostra o rótulo em vez de tratar como
                        nota zero, que seria injusto com quem nunca treinou */}
                    {!tested && (
                      <span className="whitespace-nowrap rounded-full bg-[#eef0f3] px-2 py-0.5 text-[10px] font-bold uppercase text-[#8b8593]">
                        não testado
                      </span>
                    )}
                  </div>
                  <div className="h-2 flex-1 rounded-full bg-[#eef0f3]">
                    {tested && (
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-[#7755e8] to-[#e8641d]"
                        style={{ width: `${(score! / 10) * 100}%` }}
                      />
                    )}
                  </div>
                  <span className="w-8 text-right font-bold text-[#1d1b33]">
                    {tested ? score!.toFixed(1) : "–"}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-white p-6">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#8b8593]">
              Trilha sugerida
            </span>

            <ul className="mt-4 grid gap-4">
              {trilha.map(({ badge, badgeClass, title, meta }) => (
                <li key={title} className="flex items-start justify-between gap-3">
                  <div>
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide ${badgeClass}`}
                    >
                      {badge}
                    </span>
                    <p className="mt-1.5 font-bold text-[#1d1b33]">{title}</p>
                    <p className="text-sm text-[#8b8593]">{meta}</p>
                  </div>
                  <Link
                    href="#"
                    className="shrink-0 text-sm font-extrabold text-[#443388] underline underline-offset-2"
                  >
                    Abrir →
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
