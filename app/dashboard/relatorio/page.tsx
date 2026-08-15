"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Printer, TrendingUp } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { EvidenceMatrix } from "@/components/EvidenceMatrix";
import { MOCK_SESSION_KEY, parseMockSession, type MockSession } from "@/lib/mock-session";
import { buildEvidenceMatrix, getInterviewComparison, getLatestInterview, getNextJourneyAction } from "@/lib/preparation-journey";
import { materialsFor } from "@/lib/study-materials";
import { demoModeEnabled } from "@/lib/demo-mode";

const criteriaLabels = { content: "Conteúdo", clarity: "Clareza", evidence: "Evidências", structure: "Estrutura" } as const;

export default function RelatorioFinal() {
  const [session, setSession] = useState<MockSession | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSession(parseMockSession(window.sessionStorage.getItem(MOCK_SESSION_KEY)));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const evidenceMatrix = useMemo(() => {
    if (!session) return [];
    return buildEvidenceMatrix(session.analysis, session.analysis.profileLabel ?? "Perfil sem evidências processadas", session.progress);
  }, [session]);

  if (!session) {
    return (
      <div className="flex min-h-screen bg-[#f4f3f8]">
        <Sidebar />
        <main className="flex-1 px-4 pt-6 sm:px-6 lg:px-10 lg:py-8">
          <div className="mx-auto h-64 max-w-4xl animate-pulse rounded-3xl bg-[#e9e6ef]" aria-hidden="true" />
        </main>
      </div>
    );
  }

  const latestInterview = getLatestInterview(session.progress);
  const comparison = getInterviewComparison(session.progress);
  const nextAction = getNextJourneyAction(session.progress);
  const demonstrated = evidenceMatrix.filter((item) => item.status === "demonstrated");
  const priorities = evidenceMatrix.filter((item) => item.status !== "demonstrated");
  const preparedAt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(session.createdAt));
  const recommendedCompetencies = [session.analysis.priority, ...session.analysis.requirements]
    .filter((item, index, list) => item && list.indexOf(item) === index)
    .slice(0, 3);

  return (
    <div className="flex min-h-screen bg-[#f4f3f8]">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          main { padding: 0 !important; }
        }
      `}</style>
      <div className="no-print"><Sidebar /></div>
      <main className="min-w-0 flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:py-8 print:px-0 print:py-0">
        <div className="mx-auto max-w-4xl">
          <div className="no-print mb-5 flex flex-wrap items-center justify-between gap-3">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-extrabold text-[#5d43c4] hover:underline">
              <ArrowLeft className="h-4 w-4" /> Voltar ao dashboard
            </Link>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-gradient-to-r from-[#7755e8] to-[#e8641d] px-5 font-extrabold text-white shadow-[0_16px_34px_-18px_rgba(119,85,232,0.85)]"
            >
              <Printer className="h-4 w-4" /> Imprimir ou salvar em PDF
            </button>
          </div>

          <header className="rounded-3xl border border-[#e7e3ee] bg-white p-6 sm:p-8">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#7755e8]">Relatório de preparação</p>
            <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold text-[#1d1b33] sm:text-4xl">{session.name}</h1>
            <p className="mt-2 text-sm font-semibold text-[#6d698a]">{session.company} · preparação iniciada em {preparedAt}</p>
          </header>

          <section className="mt-6 rounded-3xl border border-[#e7e3ee] bg-white p-6 sm:p-8">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#8b8593]">Diagnóstico inicial</p>
            <h2 className="mt-1 text-xl font-extrabold text-[#1d1b33]">{session.analysis.compatibility}% de compatibilidade com a vaga</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#6d698a]">{session.analysis.summary}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-[#edf8f1] p-4"><p className="text-xs font-extrabold uppercase tracking-wide text-[#247544]">Ponto mais forte</p><p className="mt-1 text-sm font-bold text-[#1d1b33]">{session.analysis.strongest}</p></div>
              <div className="rounded-2xl bg-[#fff3eb] p-4"><p className="text-xs font-extrabold uppercase tracking-wide text-[#b94d17]">Prioridade de desenvolvimento</p><p className="mt-1 text-sm font-bold text-[#1d1b33]">{session.analysis.priority}</p></div>
            </div>
          </section>

          <div className="mt-6">
            <EvidenceMatrix items={evidenceMatrix} demo={Boolean(session.analysis.profileIsDemo)} />
          </div>

          <section className="mt-6 rounded-3xl border border-[#e7e3ee] bg-white p-6 sm:p-8">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#8b8593]">Resumo</p>
            <h2 className="mt-1 text-xl font-extrabold text-[#1d1b33]">Competências demonstradas e prioritárias</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wide text-[#247544]">Demonstradas</p>
                <ul className="mt-2 space-y-1 text-sm text-[#514c6a]">
                  {demonstrated.length ? demonstrated.map((item) => <li key={item.competency}>· {item.competency}</li>) : <li className="text-[#8b8593]">Nenhuma competência demonstrada ainda.</li>}
                </ul>
              </div>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wide text-[#b94d17]">Prioritárias</p>
                <ul className="mt-2 space-y-1 text-sm text-[#514c6a]">
                  {priorities.length ? priorities.map((item) => <li key={item.competency}>· {item.competency}</li>) : <li className="text-[#8b8593]">Nenhuma pendência identificada.</li>}
                </ul>
              </div>
            </div>
          </section>

          <section className="mt-6 rounded-3xl border border-[#e7e3ee] bg-white p-6 sm:p-8">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#8b8593]">Entrevista</p>
            <h2 className="mt-1 text-xl font-extrabold text-[#1d1b33]">Resultado da simulação</h2>
            {latestInterview ? (
              <>
                <p className="mt-2 text-sm text-[#6d698a]">Desempenho geral: <strong className="text-[#1d1b33]">{latestInterview.score}/100</strong> · competência mais evidente: <strong className="text-[#1d1b33]">{latestInterview.strongest}</strong></p>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {(Object.keys(criteriaLabels) as (keyof typeof criteriaLabels)[]).map((key) => (
                    <div key={key} className="rounded-2xl border border-[#e7e3ee] p-4"><p className="text-xs font-bold text-[#8b8593]">{criteriaLabels[key]}</p><p className="mt-1 text-xl font-extrabold text-[#1d1b33]">{latestInterview.criteria[key]}</p></div>
                  ))}
                </div>
              </>
            ) : (
              <p className="mt-2 text-sm text-[#6d698a]">Nenhuma entrevista simulada ainda para esta vaga.</p>
            )}

            {comparison && (
              <div className="mt-5 rounded-2xl border border-[#ece9f1] p-5">
                <p className="flex items-center gap-2 font-extrabold text-[#1d1b33]"><TrendingUp className="h-4 w-4 text-[#7755e8]" /> Antes e depois</p>
                <p className="mt-1 text-xs text-[#6d698a]">Primeira tentativa: {comparison.first.score}/100 · Última tentativa: {comparison.latest.score}/100</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {(Object.keys(criteriaLabels) as (keyof typeof criteriaLabels)[]).map((key) => {
                    const delta = comparison.latest.criteria[key] - comparison.first.criteria[key];
                    return (
                      <div key={key} className="rounded-xl border border-[#ece9f1] p-3">
                        <p className="text-xs font-bold text-[#8b8593]">{criteriaLabels[key]}</p>
                        <p className="mt-1 text-sm font-extrabold text-[#1d1b33]">
                          {comparison.first.criteria[key]} → {comparison.latest.criteria[key]}{" "}
                          <span className={delta >= 0 ? "text-[#1f9d73]" : "text-[#c23b3b]"}>({delta >= 0 ? "+" : ""}{delta})</span>
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          <section className="mt-6 rounded-3xl border border-[#e7e3ee] bg-white p-6 sm:p-8">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#8b8593]">Próximas ações</p>
            <h2 className="mt-1 text-xl font-extrabold text-[#1d1b33]">{nextAction.label}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#6d698a]">{nextAction.description}</p>
            <Link href={nextAction.href} className="no-print mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-[#5d43c4] underline decoration-[#e8641d] decoration-2 underline-offset-4">Continuar preparação</Link>
          </section>

          <section className="mt-6 rounded-3xl border border-[#e7e3ee] bg-white p-6 sm:p-8">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#8b8593]">Materiais recomendados</p>
            <h2 className="mt-1 text-xl font-extrabold text-[#1d1b33]">Para reforçar suas prioridades</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {recommendedCompetencies.map((competency) => (
                <div key={competency} className="rounded-2xl border border-[#ece9f1] p-4">
                  <p className="font-extrabold text-[#1d1b33]">{competency}</p>
                  <ul className="mt-3 space-y-2">
                    {materialsFor(competency).map((material) => (
                      <li key={material.url}>
                        <a href={material.url} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-[#5d43c4] hover:underline">{material.title}</a>
                        <p className="text-xs text-[#8b8593]">{material.type} · {material.duration}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <p className="mt-6 rounded-2xl border border-dashed border-[#d9d3e3] bg-[#faf9fc] p-4 text-center text-xs font-semibold leading-relaxed text-[#6d698a]">
            Este resultado é orientativo, baseado nas suas tentativas de treino e entrevista simulada{demoModeEnabled ? " e usa dados fictícios de demonstração" : ""}. Ele não substitui uma avaliação real de recrutamento.
          </p>
        </div>
      </main>
    </div>
  );
}
