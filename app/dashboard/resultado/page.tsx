"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, CheckCircle2, Pencil, Sparkles } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { Mascot } from "@/components/Mascot";
import { EvidenceMatrix } from "@/components/EvidenceMatrix";
import { PreparationJourney } from "@/components/PreparationJourney";
import {
  defaultMockSession,
  MOCK_SESSION_KEY,
  parseMockSession,
  persistMockSession,
  type MockSession,
} from "@/lib/mock-session";
import { analyzeJobLocally, demoCandidateProfile } from "@/lib/job-training";
import { buildEvidenceMatrix, getNextJourneyAction } from "@/lib/preparation-journey";

const defaultSessionSerialized = JSON.stringify(defaultMockSession);
const subscribeToStoredSession = () => () => undefined;
const getStoredSession = () => window.sessionStorage.getItem(MOCK_SESSION_KEY) ?? defaultSessionSerialized;
const getServerSession = () => defaultSessionSerialized;

function parseStoredSession(value: string): MockSession {
  return parseMockSession(value);
}

export default function Resultado() {
  const storedSessionValue = useSyncExternalStore(subscribeToStoredSession, getStoredSession, getServerSession);
  const storedSession = useMemo(() => parseStoredSession(storedSessionValue), [storedSessionValue]);
  const [sessionOverride, setSessionOverride] = useState<MockSession | null>(null);
  const [descriptionOverride, setDescriptionOverride] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [reanalyzed, setReanalyzed] = useState(false);
  const session = sessionOverride ?? storedSession;
  const description = descriptionOverride ?? session.description;

  const analysis = useMemo(
    () => description === session.description
      ? session.analysis
      : analyzeJobLocally(description, session.company, session.analysis.profileIsDemo ? demoCandidateProfile : undefined),
    [description, session.analysis, session.company, session.description],
  );
  const evidenceMatrix = useMemo(
    () => buildEvidenceMatrix(analysis, analysis.profileLabel ?? "Perfil sem evidências processadas", session.progress),
    [analysis, session.progress],
  );
  const nextAction = getNextJourneyAction(session.progress);

  function saveAndReanalyze(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const updated = {
      ...session,
      description,
      analysis: analyzeJobLocally(description, session.company, session.analysis.profileIsDemo ? demoCandidateProfile : undefined),
      analysisNotice: "Análise recalculada localmente após a edição.",
    };
    setSessionOverride(updated);
    setDescriptionOverride(null);
    persistMockSession(updated);
    setIsEditing(false);
    setReanalyzed(true);
  }

  return (
    <div className="flex min-h-screen bg-[#f4f3f8]">
      <Sidebar />
      <main className="min-w-0 flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:py-8">
        <div className="mx-auto max-w-6xl">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#7755e8]">Análise da vaga</span>
              <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold text-[#1d1b33] sm:text-4xl">{session.name}</h1>
              <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-[#6d698a]"><BriefcaseBusiness className="h-4 w-4" /> {session.company}</p>
            </div>
            <button type="button" onClick={() => { setReanalyzed(false); setIsEditing(true); }} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#dcd7e6] bg-white px-5 text-sm font-extrabold text-[#1d1b33] transition hover:border-[#7755e8]"><Pencil className="h-4 w-4" /> Editar vaga</button>
          </header>
          <PreparationJourney current="diagnostico" sessionName={`${session.name} · ${session.company}`} />

          {isEditing ? (
            <form onSubmit={saveAndReanalyze} className="mt-6 rounded-3xl border border-[#e7e3ee] bg-white p-6 sm:p-8">
              <label htmlFor="job-description" className="text-sm font-extrabold text-[#1d1b33]">Descrição da vaga</label>
              <textarea id="job-description" required rows={7} value={description} onChange={(event) => setDescriptionOverride(event.target.value)} className="mt-2 w-full resize-y rounded-xl border-[1.5px] border-[#e4dfd3] px-4 py-3 leading-relaxed focus:border-[#7755e8] focus:outline-none focus:ring-2 focus:ring-[#7755e8]/25" />
              <p className="mt-2 text-xs font-semibold text-[#8b8593]">A análise será recalculada ao salvar.</p>
              <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row">
                <button type="button" onClick={() => { setDescriptionOverride(null); setIsEditing(false); }} className="min-h-11 rounded-full border border-[#dcd7e6] px-5 font-extrabold text-[#1d1b33]">Cancelar</button>
                <button type="submit" className="min-h-11 rounded-full bg-gradient-to-r from-[#7755e8] to-[#e8641d] px-6 font-extrabold text-white">Salvar e reanalisar</button>
              </div>
            </form>
          ) : (
            <>
              {reanalyzed && <p role="status" className="mt-5 rounded-xl bg-[#eaf7ef] px-4 py-3 text-sm font-bold text-[#247544]">Análise atualizada com os novos requisitos da vaga.</p>}
              {session.analysisNotice && !reanalyzed && <p role="status" className="mt-5 rounded-xl border border-[#e3d9b5] bg-[#fff9e8] px-4 py-3 text-sm font-bold text-[#725b1e]">{session.analysisNotice}</p>}
              <section className="relative mt-6 overflow-hidden rounded-[28px] bg-[#17172f] p-6 text-white sm:p-8">
                <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#7755e8]/35 blur-2xl" />
                <div className="relative grid items-center gap-7 md:grid-cols-[1fr_auto]">
                  <div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-extrabold text-[#dcd8ff]"><Sparkles className="h-3.5 w-3.5" /> Leitura da vaga</span>
                    <h2 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-bold sm:text-3xl">Boa base em {analysis.strongest}. Sua maior oportunidade está em {analysis.priority}.</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#c2bfd7]">Leitura orientativa da cobertura de competências. Cada conclusão pode ser conferida na matriz de evidências.</p>
                  </div>
                  <div className="grid h-32 w-32 place-items-center rounded-full border-8 border-white/10 bg-white/[0.06] text-center">
                    <div><p className="text-4xl font-extrabold">{analysis.compatibility}%</p><p className="text-[10px] font-extrabold uppercase tracking-wider text-[#c2bfd7]">cobertura inicial</p></div>
                  </div>
                </div>
              </section>
            </>
          )}

          {!isEditing && (
            <div className="mt-6 grid gap-6">
              <EvidenceMatrix items={evidenceMatrix} demo={Boolean(analysis.profileIsDemo)} />

              <section className="rounded-3xl border border-[#e7e3ee] bg-white p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#8b8593]">Próximo passo</p>
                    <h2 className="mt-1 text-xl font-extrabold text-[#1d1b33]">{nextAction.label}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-[#6d698a]">{nextAction.description}</p>
                  </div>
                  <Mascot pose="coach" className="hidden h-28 w-28 shrink-0 sm:block" />
                </div>
                <Link href={nextAction.href} className="group mt-5 flex min-h-14 items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-[#7755e8] to-[#e8641d] p-4 text-left text-white shadow-[0_18px_40px_-24px_rgba(119,85,232,0.9)] transition hover:-translate-y-0.5">
                  <div><p className="font-extrabold">Continuar preparação</p><p className="mt-1 text-xs leading-relaxed text-white/80">Siga para a etapa recomendada com o contexto desta vaga.</p></div><ArrowRight className="h-4 w-4 shrink-0 transition group-hover:translate-x-1" />
                </Link>
                <details className="mt-3 rounded-2xl border border-[#e7e3ee] bg-white p-4">
                  <summary className="cursor-pointer text-sm font-extrabold text-[#5d43c4]">Escolher outra etapa</summary>
                  <div className="mt-3 flex flex-wrap gap-2 text-sm font-bold">
                    <Link href="/dashboard/treino-vaga" className="rounded-full bg-[#f4f1fb] px-4 py-2 text-[#5d43c4]">Prática</Link>
                    <Link href="/dashboard/agente" className="rounded-full bg-[#f4f1fb] px-4 py-2 text-[#5d43c4]">Entrevista</Link>
                    <Link href="/dashboard/trilha" className="rounded-full bg-[#f4f1fb] px-4 py-2 text-[#5d43c4]">Plano</Link>
                  </div>
                </details>
                <div className="mt-5 flex items-start gap-2 rounded-xl bg-[#f4f1fb] p-4 text-xs leading-relaxed text-[#5b5674]"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#7755e8]" /> Diagnóstico orientativo para preparação; não representa uma avaliação de recrutamento.</div>
              </section>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
