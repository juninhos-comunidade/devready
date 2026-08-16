"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Target } from "lucide-react";
import { MOCK_SESSION_KEY, parseMockSession, readSessionList, type MockSession } from "@/lib/mock-session";
import { getJourneyCompletion, getNextJourneyAction } from "@/lib/preparation-journey";
import { getTrilhaCompletionSignal } from "@/lib/training/actions";

export function ActivePreparationCard() {
  const [session, setSession] = useState<MockSession | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [trilhaComplete, setTrilhaComplete] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const current = parseMockSession(window.sessionStorage.getItem(MOCK_SESSION_KEY));
      const persisted = readSessionList();
      const active = persisted.some((item) => item.id === current.id) ? current : null;
      setSession(active);
      setLoaded(true);
      if (active) {
        getTrilhaCompletionSignal(active.id).then(setTrilhaComplete).catch(() => setTrilhaComplete(false));
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  if (!loaded) return <div className="mt-7 h-44 animate-pulse rounded-[28px] bg-[#e9e6ef]" aria-hidden="true" />;

  if (!session) return null;

  const nextAction = getNextJourneyAction(session.progress);
  const completion = getJourneyCompletion(session.progress, trilhaComplete);

  return (
    <section className="relative mt-7 overflow-hidden rounded-[28px] bg-[#17172f] px-6 py-7 text-white shadow-[0_28px_80px_-45px_rgba(21,22,50,0.9)] sm:px-8" aria-labelledby="active-preparation-title">
      <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full bg-[#7755e8]/35 blur-2xl" />
      <div className="relative grid gap-6 lg:grid-cols-[1fr_280px] lg:items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-extrabold text-[#dcd8ff]"><BriefcaseBusiness className="h-3.5 w-3.5" /> Preparação ativa</span>
          <h2 id="active-preparation-title" className="mt-4 font-[family-name:var(--font-display)] text-2xl font-bold sm:text-3xl">{session.name}</h2>
          <p className="mt-1 text-sm font-semibold text-[#aaa6d6]">{session.company} · prioridade em {session.analysis.priority}</p>
          <div className="mt-5 max-w-xl">
            <div className="flex items-center justify-between text-xs font-bold text-[#c2bfd7]"><span>Progresso da preparação</span><span>{completion}%</span></div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-label="Progresso da preparação" aria-valuemin={0} aria-valuemax={100} aria-valuenow={completion}>
              <div className="h-full rounded-full bg-gradient-to-r from-[#8b6cff] to-[#f27a35]" style={{ width: `${completion}%` }} />
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-5">
          <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#bcb6ec]"><Target className="h-4 w-4" /> Próxima melhor ação</p>
          <p className="mt-2 font-extrabold">{nextAction.label}</p>
          <p className="mt-1 text-xs leading-relaxed text-[#c2bfd7]">{nextAction.description}</p>
          <Link href={nextAction.href} className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-white underline decoration-[#e8641d] decoration-2 underline-offset-4">Continuar <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </div>
    </section>
  );
}
