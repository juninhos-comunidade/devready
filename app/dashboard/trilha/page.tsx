"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { PreparationJourney } from "@/components/PreparationJourney";
import { MOCK_SESSION_KEY, parseMockSession, type MockSession } from "@/lib/mock-session";
import { TrilhaContent } from "./TrilhaContent";

export default function TrilhaDeEstudo() {
  const [session, setSession] = useState<MockSession | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSession(parseMockSession(window.sessionStorage.getItem(MOCK_SESSION_KEY)));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#f4f3f8]">
      <Sidebar />
      <main className="min-w-0 flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:py-8">
        <div className="mx-auto max-w-6xl">
          <header>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#7755e8]">Trilha de estudo</p>
            <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold text-[#1d1b33] sm:text-4xl">O que estudar pra fechar suas lacunas</h1>
            <p className="mt-2 max-w-2xl leading-relaxed text-[#6d698a]">Montada a partir do seu desempenho no treino, não só da leitura da vaga.</p>
          </header>

          <PreparationJourney current="plano" sessionName={session ? `${session.name} · ${session.company}` : undefined} />

          {session && <TrilhaContent vagaId={session.id} />}

          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#e7e3ee] bg-white p-5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#e7f7ef] text-[#1f9d73]">
              <Sparkles className="h-4.5 w-4.5" />
            </span>
            <p className="text-sm leading-relaxed text-[#6d698a]">
              Essa trilha reúne os erros do quiz, da resposta STAR e do desafio de código num lugar só. Ela é recalculada conforme você pratica mais.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
