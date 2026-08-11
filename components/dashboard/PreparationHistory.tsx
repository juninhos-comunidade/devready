"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Plus } from "lucide-react";
import { MOCK_SESSION_KEY, parseMockSession, type MockSession } from "@/lib/mock-session";
import { SESSION_LIST_KEY } from "@/lib/job-training";
import { getJourneyCompletion } from "@/lib/preparation-journey";

function readSessions() {
  try {
    const stored = window.localStorage.getItem(SESSION_LIST_KEY);
    const parsed: unknown = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed)
      ? parsed.map((item) => parseMockSession(JSON.stringify(item))).slice(0, 5)
      : [];
  } catch {
    return [];
  }
}

export function PreparationHistory() {
  const [sessions, setSessions] = useState<MockSession[] | null>(null);
  useEffect(() => {
    const timer = window.setTimeout(() => setSessions(readSessions()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  function resume(session: MockSession) {
    window.sessionStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(session));
  }

  return (
    <section className="mt-6 rounded-3xl border border-[#e7e3ee] bg-white p-5 shadow-[0_18px_55px_-42px_rgba(29,27,51,0.45)] sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#8b8593]">Histórico real desta demonstração</p><h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold text-[#1d1b33]">Preparações por vaga</h2></div>
        <Link href="/dashboard/nova-sessao" className="inline-flex items-center gap-2 text-sm font-extrabold text-[#5d43c4] hover:underline"><Plus className="h-4 w-4" /> Nova preparação</Link>
      </div>

      {sessions === null ? (
        <div className="mt-5 h-24 animate-pulse rounded-2xl bg-[#f0eef4]" aria-hidden="true" />
      ) : sessions.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-[#d9d3e3] bg-[#faf9fc] p-6 text-center">
          <BriefcaseBusiness className="mx-auto h-6 w-6 text-[#7755e8]" />
          <p className="mt-3 font-extrabold text-[#1d1b33]">Nenhuma vaga analisada neste navegador</p>
          <p className="mt-1 text-sm text-[#6d698a]">Sua primeira preparação aparecerá aqui com progresso e próxima ação.</p>
        </div>
      ) : (
        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          {sessions.map((session) => {
            const completion = getJourneyCompletion(session.progress);
            return (
              <Link key={session.id} href="/dashboard/resultado" onClick={() => resume(session)} className="group rounded-2xl border border-[#ece9f1] p-4 transition hover:border-[#7755e8] hover:bg-[#faf8ff]">
                <p className="font-extrabold text-[#1d1b33]">{session.name}</p>
                <p className="mt-0.5 text-xs font-semibold text-[#8b8593]">{session.company} · foco em {session.analysis.priority}</p>
                <div className="mt-4 flex items-center justify-between gap-3"><span className="text-xs font-bold text-[#6d698a]">{completion}% concluído</span><ArrowRight className="h-4 w-4 text-[#7755e8] transition group-hover:translate-x-1" /></div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#ece9f1]"><div className="h-full rounded-full bg-gradient-to-r from-[#7755e8] to-[#e8641d]" style={{ width: `${completion}%` }} /></div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
