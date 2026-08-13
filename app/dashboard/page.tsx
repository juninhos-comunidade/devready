import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Plus,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { Mascot } from "@/components/Mascot";
import { EvolutionChart } from "@/components/dashboard/EvolutionChart";
import { dashboardData } from "@/lib/dashboard-data";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CurriculumProcessingTrigger } from "@/components/dashboard/CurriculumProcessingTrigger";
import { GithubAnalysisCard } from "@/components/dashboard/GithubAnalysisCard";
import { ActivePreparationCard } from "@/components/dashboard/ActivePreparationCard";
import { PreparationHistory } from "@/components/dashboard/PreparationHistory";
import { SessionsCard } from "@/components/dashboard/SessionsCard";
import { TechnologyRow } from "@/components/dashboard/TechnologyRow";
import { demoModeEnabled } from "@/lib/demo-mode";
import { getDashboardTrainingStats } from "@/lib/training/dashboard-stats";
import type { Prisma } from "@/app/generated/prisma/client";

type CurriculumWithGithub = Prisma.CurriculumGetPayload<{
  include: { githubProfile: { include: { repos: true } } };
}>;

export default async function Dashboard() {
  let curriculum: CurriculumWithGithub | null = null;
  let trainingStats: Awaited<ReturnType<typeof getDashboardTrainingStats>> | null = null;

  if (!demoModeEnabled) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      redirect("/login");
    }

    curriculum = await prisma.curriculum.findUnique({
      where: { userId: session.user.id },
      include: { githubProfile: { include: { repos: true } } },
    });
    trainingStats = await getDashboardTrainingStats(session.user.id);
  }

  const hasRealStats = Boolean(trainingStats && trainingStats.technologies.length > 0);
  const technologies = hasRealStats ? trainingStats!.technologies : dashboardData.technologies;
  const history = hasRealStats ? trainingStats!.history : dashboardData.history;

  const scoredTechnologies = technologies.filter((technology) => technology.score !== null);
  const realReadiness = scoredTechnologies.length
    ? Math.round(scoredTechnologies.reduce((total, technology) => total + technology.score!, 0) / scoredTechnologies.length)
    : null;
  const technologiesWithTrend = technologies.filter((technology) => technology.previousScore !== null);
  const realPreviousReadiness = technologiesWithTrend.length
    ? Math.round(technologiesWithTrend.reduce((total, technology) => total + technology.previousScore!, 0) / technologiesWithTrend.length)
    : null;

  const hasRealReadiness = hasRealStats && realReadiness !== null;
  const readiness = hasRealReadiness ? realReadiness! : dashboardData.readiness;
  const readinessDelta = hasRealReadiness
    ? (realPreviousReadiness !== null ? readiness - realPreviousReadiness : null)
    : dashboardData.readiness - dashboardData.previousReadiness;
  const testedTechnologies = technologies.filter(
    (technology) => technology.score !== null,
  ).length;

  return (
    <div className="flex min-h-screen bg-[#f4f3f8]">
      <Sidebar />

      <main className="min-w-0 flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:py-8 xl:px-10">
        <div className="mx-auto max-w-[1440px]">
          <header className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#7755e8]">
                Visão geral
              </p>
              <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold text-[#1d1b33] sm:text-4xl">
                Visão de prontidão
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#6d698a] sm:text-base">
                Acompanhe sua evolução e priorize as competências com maior impacto para a próxima vaga.
              </p>
              <span className="mt-3 inline-flex rounded-full bg-[#ece8f8] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-[#654bc9]">
                {hasRealStats ? "Notas por tecnologia reais" : "Dados de exemplo"}
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard/nova-sessao" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-gradient-to-r from-[#7755e8] to-[#e8641d] px-5 py-3 text-sm font-extrabold text-white shadow-[0_16px_34px_-18px_rgba(119,85,232,0.85)] transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7755e8]">
                <Plus className="h-4 w-4" /> Preparar outra vaga
              </Link>
            </div>
          </header>

          {curriculum && (curriculum.status === "PENDING" || curriculum.status === "PROCESSING") && (
            <div className="mt-5 rounded-2xl border border-[#d9d0f2] bg-[#faf8ff] px-5 py-4">
              <CurriculumProcessingTrigger
                curriculumId={curriculum.id}
                initialStatus={curriculum.status}
              />
            </div>
          )}

          <ActivePreparationCard />

          <section className="relative mt-6 overflow-hidden rounded-[28px] border border-[#e7e3ee] bg-white px-6 py-7 text-[#1d1b33] sm:px-8 sm:py-8">
            <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full bg-[#7755e8]/35 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-32 right-24 h-72 w-72 rounded-full bg-[#e8641d]/25 blur-2xl" />

            <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-extrabold text-[#dcd8ff]">
                  <Sparkles className="h-3.5 w-3.5" />
                  {hasRealStats ? "Sua evolução" : "Exemplo de evolução"}
                </span>
                <h2 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-bold sm:text-3xl">
                  Visualize como a prática muda sua prontidão.
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#c2bfd7] sm:text-base">
                  {hasRealStats
                    ? "As notas por tecnologia abaixo vêm das suas tentativas de treino reais."
                    : "Os indicadores abaixo são fictícios e demonstram como o histórico será apresentado depois de novas tentativas."}
                </p>
                <Link href="/dashboard/resultado" className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-[#5d43c4] underline decoration-[#e8641d] decoration-2 underline-offset-4">
                  Abrir preparação ativa <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="relative flex items-center gap-4 rounded-2xl border border-[#e7e3ee] bg-[#f7f5fa] p-5 pr-24 sm:min-w-64">
                <Mascot pose="launch" className="pointer-events-none absolute -right-4 -top-14 h-32 w-32" />
                <div
                  className="grid h-24 w-24 shrink-0 place-items-center rounded-full p-2"
                  style={{ background: `conic-gradient(#e8641d 0 ${readiness}%, rgba(255,255,255,0.12) ${readiness}% 100%)` }}
                >
                  <div className="grid h-full w-full place-items-center rounded-full bg-white">
                    <span className="font-[family-name:var(--font-display)] text-3xl font-extrabold">
                      {readiness}%
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#6d698a]">
                    Prontidão geral
                  </p>
                  {readinessDelta !== null ? (
                    <p className={`mt-1 flex items-center gap-1 text-sm font-extrabold ${readinessDelta >= 0 ? "text-[#78ddb0]" : "text-[#f2a35a]"}`}>
                      <TrendingUp className="h-4 w-4" /> {readinessDelta >= 0 ? "+" : ""}{readinessDelta} pts
                    </p>
                  ) : (
                    <p className="mt-1 text-sm font-extrabold text-[#c2bfd7]">primeira medição</p>
                  )}
                  <p className="mt-1 text-xs text-[#6d698a]">{hasRealReadiness ? "média das suas notas reais" : "exemplo demonstrativo"}</p>
                </div>
              </div>
            </div>
          </section>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SessionsCard />

            <article className="rounded-2xl border border-[#e7e3ee] bg-white p-5">
              <div className="flex items-center justify-between">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#e7f7ef] text-[#1f9d73]">
                  <TrendingUp className="h-4.5 w-4.5" />
                </span>
                {readinessDelta !== null && (
                  <span className={`text-xs font-extrabold ${readinessDelta >= 0 ? "text-[#1f9d73]" : "text-[#c23b3b]"}`}>
                    {readinessDelta >= 0 ? "+" : ""}{readinessDelta} pts
                  </span>
                )}
              </div>
              <p className="mt-4 text-3xl font-extrabold text-[#1d1b33]">{readiness}%</p>
              <p className="text-sm font-semibold text-[#6d698a]">Prontidão atual</p>
            </article>

            <article className="rounded-2xl border border-[#e7e3ee] bg-white p-5">
              <div className="flex items-center justify-between">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#fff0e7] text-[#e8641d]">
                  <CheckCircle2 className="h-4.5 w-4.5" />
                </span>
                <span className="text-xs font-bold text-[#8b8593]">de 5 no perfil</span>
              </div>
              <p className="mt-4 text-3xl font-extrabold text-[#1d1b33]">{testedTechnologies}</p>
              <p className="text-sm font-semibold text-[#6d698a]">Tecnologias testadas</p>
            </article>

            <Link
              href="/dashboard/trilha"
              className="group rounded-2xl border border-[#e7e3ee] bg-white p-5 transition hover:border-[#d7d0e8] hover:shadow-[0_14px_35px_-30px_rgba(29,27,51,0.55)]"
            >
              <div className="flex items-center justify-between">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#eeeef4] text-[#1d1b33]">
                  <BookOpen className="h-4.5 w-4.5" />
                </span>
                <span className="text-xs font-bold text-[#8b8593]">prioridade alta</span>
              </div>
              <p className="mt-4 truncate text-xl font-extrabold text-[#1d1b33]">Testes</p>
              <p className="flex items-center gap-1 text-sm font-semibold text-[#6d698a]">
                Próximo foco sugerido
                <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
              </p>
            </Link>
          </div>

          <PreparationHistory />

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
            <section className="rounded-3xl border border-[#e7e3ee] bg-white p-5 shadow-[0_18px_55px_-42px_rgba(29,27,51,0.45)] sm:p-6">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#8b8593]">
                    Nota por tecnologia
                  </p>
                  <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold text-[#1d1b33]">
                    Onde você está mais forte
                  </h2>
                </div>
                <p className="text-xs font-semibold text-[#8b8593]">Escala de 0 a 100</p>
              </div>

              <ul className="mt-5 grid gap-3">
                {technologies.map((technology) => (
                  <TechnologyRow key={technology.name} technology={technology} />
                ))}
              </ul>
            </section>

            <GithubAnalysisCard curriculum={curriculum} demoMode={demoModeEnabled} />
          </div>

          <div className="mt-6">
            <EvolutionChart series={history} />
          </div>
        </div>
      </main>
    </div>
  );
}
