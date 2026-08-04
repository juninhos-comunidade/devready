"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, CheckCircle2, Pencil, Sparkles, Target } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import {
  analyzeMockJob,
  defaultMockSession,
  MOCK_SESSION_KEY,
  type MockSession,
} from "@/lib/mock-session";

const defaultSessionSerialized = JSON.stringify(defaultMockSession);
const subscribeToStoredSession = () => () => undefined;
const getStoredSession = () => window.sessionStorage.getItem(MOCK_SESSION_KEY) ?? defaultSessionSerialized;
const getServerSession = () => defaultSessionSerialized;

function parseStoredSession(value: string): MockSession {
  try {
    return JSON.parse(value) as MockSession;
  } catch {
    return defaultMockSession;
  }
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

  const analysis = useMemo(() => analyzeMockJob(description), [description]);

  function saveAndReanalyze(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const updated = { ...session, description };
    setSessionOverride(updated);
    setDescriptionOverride(null);
    window.sessionStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(updated));
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
              <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-[#6d698a]"><BriefcaseBusiness className="h-4 w-4" /> {session.company} · foco em {session.focus.toLocaleLowerCase("pt-BR")}</p>
            </div>
            <button type="button" onClick={() => { setReanalyzed(false); setIsEditing(true); }} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#dcd7e6] bg-white px-5 text-sm font-extrabold text-[#1d1b33] transition hover:border-[#7755e8]"><Pencil className="h-4 w-4" /> Editar vaga</button>
          </header>

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
              <section className="relative mt-6 overflow-hidden rounded-[28px] bg-[#17172f] p-6 text-white sm:p-8">
                <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#7755e8]/35 blur-2xl" />
                <div className="relative grid items-center gap-7 md:grid-cols-[1fr_auto]">
                  <div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-extrabold text-[#dcd8ff]"><Sparkles className="h-3.5 w-3.5" /> Leitura da vaga</span>
                    <h2 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-bold sm:text-3xl">Boa base em {analysis.strongest}. Sua maior oportunidade está em {analysis.priority}.</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#c2bfd7]">Compatibilidade calculada a partir dos requisitos identificados na descrição.</p>
                  </div>
                  <div className="grid h-32 w-32 place-items-center rounded-full border-8 border-white/10 bg-white/[0.06] text-center">
                    <div><p className="text-4xl font-extrabold">{analysis.compatibility}%</p><p className="text-[10px] font-extrabold uppercase tracking-wider text-[#c2bfd7]">compatibilidade</p></div>
                  </div>
                </div>
              </section>
            </>
          )}

          {!isEditing && (
            <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <section className="rounded-3xl border border-[#e7e3ee] bg-white p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4"><div><p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#8b8593]">Aderência por tecnologia</p><h2 className="mt-1 text-xl font-extrabold text-[#1d1b33]">Como seu perfil responde à vaga</h2></div><Target className="h-5 w-5 text-[#7755e8]" /></div>
                <ul className="mt-5 grid gap-3">
                  {analysis.technologies.map((technology) => (
                    <li key={technology.name} className="rounded-2xl border border-[#ece9f1] p-4">
                      <div className="flex items-center justify-between gap-3"><div><p className="font-extrabold text-[#1d1b33]">{technology.name}</p><p className="text-xs font-semibold text-[#8b8593]">{technology.required ? "Identificada nos requisitos" : "Não identificada nesta vaga"}</p></div><p className="text-xl font-extrabold text-[#1d1b33]">{technology.score === null ? "—" : `${technology.score}%`}</p></div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#eeebf2]">{technology.score !== null && <div className="h-full rounded-full bg-gradient-to-r from-[#7755e8] to-[#e8641d]" style={{ width: `${technology.score}%` }} />}</div>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-3xl border border-[#e7e3ee] bg-white p-5 sm:p-6">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#8b8593]">Próximo passo</p>
                <h2 className="mt-1 text-xl font-extrabold text-[#1d1b33]">Pratique para a entrevista</h2>
                <p className="mt-2 text-sm leading-relaxed text-[#6d698a]">Converse com um agente adaptativo, organize seu raciocínio e receba orientações para estudar.</p>
                <Link href="/dashboard/agente" className="group mt-5 flex items-center justify-between gap-4 rounded-2xl border border-[#d9d0f2] bg-[#faf8ff] p-4 text-left transition hover:border-[#7755e8]">
                  <div><p className="font-extrabold text-[#1d1b33]">Simular entrevista</p><p className="mt-1 text-xs leading-relaxed text-[#6d698a]">Perguntas técnicas ou comportamentais com dificuldade adaptativa.</p></div><ArrowRight className="h-4 w-4 shrink-0 text-[#7755e8] transition group-hover:translate-x-1" />
                </Link>
                {/* gancho pra Trilha de Estudo (seção 4.5) — consolida as lacunas
                    dessa sessão numa trilha só, com materiais recomendados */}
                <Link href="/dashboard/trilha" className="group mt-3 flex items-center justify-between gap-4 rounded-2xl border border-[#e7e3ee] bg-white p-4 text-left transition hover:border-[#7755e8]">
                  <div><p className="font-extrabold text-[#1d1b33]">Ver trilha de estudo</p><p className="mt-1 text-xs leading-relaxed text-[#6d698a]">Materiais recomendados pra fechar as lacunas dessa vaga.</p></div><ArrowRight className="h-4 w-4 shrink-0 text-[#7755e8] transition group-hover:translate-x-1" />
                </Link>
                <div className="mt-5 flex items-start gap-2 rounded-xl bg-[#f4f1fb] p-4 text-xs leading-relaxed text-[#5b5674]"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#7755e8]" /> Diagnóstico orientativo para preparação; não representa uma avaliação de recrutamento.</div>
              </section>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
