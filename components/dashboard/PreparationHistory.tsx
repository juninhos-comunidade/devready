"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Plus, Trash2 } from "lucide-react";
import { MOCK_SESSION_KEY, parseMockSession, readSessionList, removeSessionFromList, type MockSession } from "@/lib/mock-session";
import { getSessionLimit } from "@/lib/job-training";
import { getJourneyCompletion } from "@/lib/preparation-journey";
import { deleteVagaTrainingData } from "@/lib/training/actions";

export function PreparationHistory({ demoSessions = [] }: { demoSessions?: MockSession[] }) {
  const [sessions, setSessions] = useState<MockSession[] | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = readSessionList();
      setSessions(stored.length ? stored : demoSessions);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [demoSessions]);

  function resume(session: MockSession) {
    window.sessionStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(session));
  }

  async function remove(sessionId: string) {
    removeSessionFromList(sessionId);
    const active = parseMockSession(window.sessionStorage.getItem(MOCK_SESSION_KEY));
    if (active?.id === sessionId) {
      window.sessionStorage.removeItem(MOCK_SESSION_KEY);
    }
    try {
      await deleteVagaTrainingData(sessionId);
    } catch {}
    window.location.reload();
  }

  const limit = getSessionLimit();
  const atLimit = (sessions?.length ?? 0) >= limit;

  return (
    <section className="mt-6 rounded-3xl border border-[#e7e3ee] bg-white p-5 shadow-[0_18px_55px_-42px_rgba(29,27,51,0.45)] sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#8b8593]">Histórico salvo neste navegador</p><h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold text-[#1d1b33]">Preparações por vaga</h2></div>
        <Link href="/dashboard/nova-sessao" className="inline-flex items-center gap-2 text-sm font-extrabold text-[#5d43c4] hover:underline"><Plus className="h-4 w-4" /> Nova preparação</Link>
      </div>

      {atLimit && (
        <p className="mt-4 rounded-xl border border-[#e3d9b5] bg-[#fff9e8] px-4 py-3 text-sm font-bold text-[#725b1e]">
          Você atingiu o limite de {limit} vagas salvas neste navegador. Criar uma nova vai substituir a mais antiga automaticamente, ou exclua uma abaixo antes.
        </p>
      )}

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
              <div key={session.id} className="group relative rounded-2xl border border-[#ece9f1] p-4 transition hover:border-[#7755e8] hover:bg-[#faf8ff]">
                {demoSessions.length === 0 && <button
                  type="button"
                  onClick={() => remove(session.id)}
                  aria-label={`Excluir preparação de ${session.name}`}
                  className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full text-[#a19cb5] opacity-0 transition hover:bg-[#fdf2f2] hover:text-[#a83030] focus-visible:opacity-100 group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>}
                <Link href="/dashboard/resultado" onClick={() => resume(session)} className="block pr-8">
                  <p className="font-extrabold text-[#1d1b33]">{session.name}</p>
                  <p className="mt-0.5 text-xs font-semibold text-[#8b8593]">{session.company} · foco em {session.analysis.priority}</p>
                  <div className="mt-4 flex items-center justify-between gap-3"><span className="text-xs font-bold text-[#6d698a]">{completion}% concluído</span><ArrowRight className="h-4 w-4 text-[#7755e8] transition group-hover:translate-x-1" /></div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#ece9f1]"><div className="h-full rounded-full bg-gradient-to-r from-[#7755e8] to-[#e8641d]" style={{ width: `${completion}%` }} /></div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
