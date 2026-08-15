"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, ExternalLink, PlayCircle, RotateCcw } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { PreparationJourney } from "@/components/PreparationJourney";
import { Mascot } from "@/components/Mascot";
import { MOCK_SESSION_KEY, parseMockSession, type MockSession } from "@/lib/mock-session";
import { materialsFor } from "@/lib/study-materials";
import { TrilhaContent } from "./TrilhaContent";

export default function TrilhaDeEstudo() {
  const [session, setSession] = useState<MockSession | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const current = parseMockSession(window.sessionStorage.getItem(MOCK_SESSION_KEY));
      setSession(current);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const competencies = useMemo(() => {
    if (!session) return [];
    return [session.analysis.priority, ...session.analysis.requirements]
      .filter((item, index, list) => item && list.indexOf(item) === index)
      .slice(0, 3);
  }, [session]);

  return (
    <div className="flex min-h-screen bg-[#f4f3f8]">
      <Sidebar />
      <main className="min-w-0 flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:py-8">
        <div className="mx-auto max-w-6xl">
          <header className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#7755e8]">Trilha de preparação</p>
              <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold text-[#1d1b33] sm:text-4xl">Transforme lacunas em ações</h1>
              <p className="mt-2 max-w-2xl leading-relaxed text-[#6d698a]">Recomendações ligadas à vaga e ao que ainda precisa ser demonstrado.</p>
            </div>
            <Mascot pose="coach" className="hidden h-28 w-28 sm:block" />
          </header>

          <PreparationJourney current="plano" sessionName={session ? `${session.name} · ${session.company}` : undefined} />

          {session && (
            <section className="mt-6">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#8b8593]">Baseado no seu desempenho real</p>
              <h2 className="mt-1 text-xl font-extrabold text-[#1d1b33]">Onde você mais precisa reforçar</h2>
              <TrilhaContent vagaId={session.id} />
            </section>
          )}

          <section className="mt-6 rounded-3xl border border-[#e7e3ee] bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div><p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#8b8593]">Curadoria confiável</p><h2 className="mt-1 text-xl font-extrabold text-[#1d1b33]">Materiais para as prioridades da vaga</h2></div>
              <span className="text-xs font-bold text-[#6d698a]">Links oficiais e gratuitos</span>
            </div>
            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              {competencies.map((competency, index) => (
                <article key={competency} className="rounded-2xl border border-[#ece9f1] p-4">
                  <div className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-[#7755e8]" /><h3 className="font-extrabold text-[#1d1b33]">{competency}</h3></div>
                  <span className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase ${index === 0 ? "bg-[#fff0e7] text-[#b65015]" : "bg-[#efeaff] text-[#654bc9]"}`}>{index === 0 ? "Prioridade" : "Reforço"}</span>
                  <ul className="mt-4 space-y-3">
                    {materialsFor(competency).map((material) => (
                      <li key={material.url}>
                        <a href={material.url} target="_blank" rel="noopener noreferrer" className="group block rounded-xl bg-[#f7f5fa] p-3 hover:bg-[#f0ecfb]">
                          <p className="flex items-center gap-2 text-sm font-extrabold text-[#1d1b33]"><PlayCircle className="h-4 w-4 text-[#7755e8]" /> {material.title}<ExternalLink className="ml-auto h-3.5 w-3.5" /></p>
                          <p className="mt-1 text-xs font-semibold text-[#8b8593]">{material.type} · {material.duration}</p>
                        </a>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/dashboard/agente" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-gradient-to-r from-[#7755e8] to-[#e8641d] px-5 font-extrabold text-white"><RotateCcw className="h-4 w-4" /> Refazer entrevista</Link>
            <Link href="/dashboard/resultado" className="inline-flex min-h-11 items-center rounded-full border border-[#dcd7e6] bg-white px-5 font-extrabold text-[#1d1b33]">Rever diagnóstico</Link>
            <Link href="/dashboard/relatorio" className="inline-flex min-h-11 items-center rounded-full border border-[#dcd7e6] bg-white px-5 font-extrabold text-[#1d1b33]">Ver relatório final</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
