"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Code2,
  History,
  MessageSquareText,
  RotateCcw,
  Sparkles,
  Target,
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { BrandLoading } from "@/components/BrandLoading";
import { Mascot } from "@/components/Mascot";
import { PreparationJourney } from "@/components/PreparationJourney";
import { MOCK_SESSION_KEY, parseMockSession, persistMockSession, type MockSession } from "@/lib/mock-session";
import {
  TRAINING_HISTORY_KEY,
  nextDifficulty,
  type QuizQuestion,
  type TrainingAttempt,
  type TrainingContent,
  type TrainingDifficulty,
  type TrainingEvaluation,
} from "@/lib/job-training";
import { recordOpenAnswer, recordQuizAnswer, startTrainingSession } from "@/lib/training/actions";
import { addLocalTrainingSessionId } from "@/lib/training/client-sessions";

type Mode = "quiz" | "comportamental" | "codigo";

const difficultyLabels: Record<TrainingDifficulty, string> = {
  iniciante: "Iniciante",
  intermediaria: "Intermediária",
  avancada: "Avançada",
};

const modeItems: Array<{ id: Mode; label: string; description: string; icon: typeof Target }> = [
  { id: "quiz", label: "Quiz técnico", description: "15 perguntas adaptativas", icon: Target },
  { id: "comportamental", label: "Resposta STAR", description: "Comunicação e evidências", icon: MessageSquareText },
  { id: "codigo", label: "Desafio de código", description: "Solução e raciocínio", icon: Code2 },
];

function readSession() {
  return parseMockSession(window.sessionStorage.getItem(MOCK_SESSION_KEY));
}

function readAttempts() {
  try {
    const stored = window.localStorage.getItem(TRAINING_HISTORY_KEY);
    const parsed: unknown = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed as TrainingAttempt[] : [];
  } catch {
    return [];
  }
}

export default function TreinoVaga() {
  const [session, setSession] = useState<MockSession | null>(null);
  const [content, setContent] = useState<TrainingContent | null>(null);
  const [mode, setMode] = useState<Mode>("quiz");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [attempts, setAttempts] = useState<TrainingAttempt[]>([]);
  const dbSessionPromiseRef = useRef<Promise<string> | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loadTimer = window.setTimeout(() => {
      const current = readSession();
      setSession(current);
      setAttempts(readAttempts());

      const dbPromise = startTrainingSession(current.name);
      dbSessionPromiseRef.current = dbPromise;
      dbPromise.then((id) => addLocalTrainingSessionId(id)).catch(() => {});
      const cacheKey = `devready:training-content:${current.id}`;
      try {
        const cached = window.sessionStorage.getItem(cacheKey);
        if (cached) {
          setContent(JSON.parse(cached) as TrainingContent);
          setLoading(false);
          return;
        }
      } catch {
        window.sessionStorage.removeItem(cacheKey);
      }

      fetch("/api/job-training", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate", analysis: current.analysis, description: current.description }),
      })
        .then(async (response) => {
          const payload = await response.json() as { content?: TrainingContent; notice?: string; error?: string };
          if (!response.ok || !payload.content) throw new Error(payload.error || "Não foi possível montar o treino.");
          if (cancelled) return;
          setContent(payload.content);
          setNotice(payload.notice ?? "");
          window.sessionStorage.setItem(cacheKey, JSON.stringify(payload.content));
        })
        .catch((error: unknown) => {
          if (!cancelled) setErrorMessage(error instanceof Error ? error.message : "Não foi possível montar o treino.");
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(loadTimer);
    };
  }, []);

  function saveAttempt(attempt: Omit<TrainingAttempt, "id" | "createdAt" | "sessionId" | "sessionName">) {
    if (!session) return;
    const item: TrainingAttempt = {
      ...attempt,
      id: crypto.randomUUID(),
      sessionId: session.id,
      sessionName: session.name,
      createdAt: new Date().toISOString(),
    };
    const updated = [item, ...readAttempts()].slice(0, 50);
    setAttempts(updated);
    const updatedSession: MockSession = {
      ...session,
      progress: {
        ...session.progress,
        trainingAttempts: [item, ...session.progress.trainingAttempts].slice(0, 20),
      },
    };
    setSession(updatedSession);
    try {
      window.localStorage.setItem(TRAINING_HISTORY_KEY, JSON.stringify(updated));
      persistMockSession(updatedSession);
    } catch {}
  }

  return (
    <div className="flex min-h-screen bg-[#f4f3f8]">
      {loading && <BrandLoading overlay label="Preparando seu treino personalizado..." />}
      <Sidebar />
      <main className="min-w-0 flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:py-8">
        <div className="mx-auto max-w-6xl">
          <Link href="/dashboard/resultado" className="inline-flex items-center gap-2 text-sm font-extrabold text-[#5d43c4] hover:underline"><ArrowLeft className="h-4 w-4" /> Voltar ao resultado</Link>
          <header className="mt-4 flex flex-wrap items-start justify-between gap-5">
            <div>
              <span className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#7755e8]"><Sparkles className="h-3.5 w-3.5" /> Treino por vaga</span>
              <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold text-[#1d1b33] sm:text-4xl">{session?.name ?? "Treino personalizado"}</h1>
              <p className="mt-2 max-w-2xl leading-relaxed text-[#6d698a]">Pratique as competências priorizadas na análise da vaga em três modalidades independentes.</p>
            </div>
            <Mascot pose="coach" className="hidden h-28 w-28 sm:block" />
          </header>
          <PreparationJourney current="pratica" sessionName={session ? `${session.name} · ${session.company}` : undefined} />

          {notice && <p role="status" className="mt-5 rounded-xl border border-[#e3d9b5] bg-[#fff9e8] px-4 py-3 text-sm font-bold text-[#725b1e]">{notice}</p>}
          {errorMessage && (
            <div className="mt-6 rounded-2xl border border-[#efcaca] bg-[#fdf2f2] p-5 text-[#8f2f2f]">
              <p className="font-extrabold">{errorMessage}</p>
              <Link href="/dashboard/nova-sessao" className="mt-3 inline-flex font-extrabold underline">Criar uma nova sessão</Link>
            </div>
          )}

          {content && session && (
            <>
              <nav className="mt-6 grid gap-3 md:grid-cols-3" aria-label="Modalidades de treino">
                {modeItems.map(({ id, label, description, icon: Icon }) => (
                  <button key={id} type="button" onClick={() => setMode(id)} aria-pressed={mode === id} className={`flex min-h-20 items-center gap-3 rounded-2xl border p-4 text-left transition ${mode === id ? "border-[#7755e8] bg-[#f3efff] ring-2 ring-[#7755e8]/15" : "border-[#e7e3ee] bg-white hover:border-[#b8abe8]"}`}>
                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${mode === id ? "bg-[#7755e8] text-white" : "bg-[#efecf5] text-[#6d698a]"}`}><Icon className="h-5 w-5" /></span>
                    <span><span className="block font-extrabold text-[#1d1b33]">{label}</span><span className="mt-0.5 block text-xs font-semibold text-[#6d698a]">{description}</span></span>
                  </button>
                ))}
              </nav>

              <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_300px]">
                <div>
                  {mode === "quiz" && <QuizTraining content={content} dbSessionRef={dbSessionPromiseRef} onComplete={(score, difficulty) => saveAttempt({ mode: "quiz", score, difficulty })} />}
                  {mode === "comportamental" && <OpenAnswerTraining mode="comportamental" prompt={content.behavioralQuestion} requirements={["Situação", "Tarefa", "Ação", "Resultado"]} initialAnswer="" dbSessionRef={dbSessionPromiseRef} onComplete={(score, difficulty) => saveAttempt({ mode: "comportamental", score, difficulty })} />}
                  {mode === "codigo" && <OpenAnswerTraining mode="codigo" prompt={content.codeChallenge.statement} requirements={content.codeChallenge.requirements} initialAnswer={content.codeChallenge.starterCode} title={content.codeChallenge.title} language={content.codeChallenge.language} dbSessionRef={dbSessionPromiseRef} onComplete={(score, difficulty) => saveAttempt({ mode: "codigo", score, difficulty })} />}
                </div>
                <AttemptHistory attempts={attempts.filter((attempt) => attempt.sessionId === session.id)} />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function QuizTraining({
  content,
  dbSessionRef,
  onComplete,
}: {
  content: TrainingContent;
  dbSessionRef: React.RefObject<Promise<string> | null>;
  onComplete: (score: number, difficulty: TrainingDifficulty) => void;
}) {
  const [usedIds, setUsedIds] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<TrainingDifficulty>("iniciante");
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [completed, setCompleted] = useState(false);
  const question = useMemo(() => {
    const available = content.questions.filter((item) => !usedIds.includes(item.id));
    return available.find((item) => item.difficulty === difficulty) ?? available[0] ?? null;
  }, [content.questions, difficulty, usedIds]);

  const answered = usedIds.length;
  const currentCorrect = selected !== null && question ? selected === question.correctIndex : false;

  function recordAnswer(currentQuestion: QuizQuestion, selectedIndex: number) {
    dbSessionRef.current
      ?.then((sessionId) => recordQuizAnswer({ sessionId, question: currentQuestion, selectedIndex }))
      .catch(() => {});
  }

  function next() {
    if (!question || selected === null) return;
    recordAnswer(question, selected);
    const totalCorrect = correctCount + (currentCorrect ? 1 : 0);
    const totalAnswered = answered + 1;
    const score = Math.round((totalCorrect / totalAnswered) * 100);
    const nextLevel = nextDifficulty(score, difficulty);
    if (totalAnswered >= content.questions.length) {
      setCorrectCount(totalCorrect);
      setCompleted(true);
      onComplete(score, nextLevel);
      return;
    }
    setCorrectCount(totalCorrect);
    setUsedIds((items) => [...items, question.id]);
    setDifficulty(nextLevel);
    setSelected(null);
  }

  function restart() {
    setUsedIds([]);
    setDifficulty("iniciante");
    setSelected(null);
    setCorrectCount(0);
    setCompleted(false);
  }

  if (completed) {
    const score = Math.round((correctCount / content.questions.length) * 100);
    return <section className="rounded-3xl border border-[#d8eadf] bg-white p-6 sm:p-8"><CheckCircle2 className="h-10 w-10 text-[#247544]" /><h2 className="mt-4 text-2xl font-extrabold text-[#1d1b33]">Quiz concluído: {score}%</h2><p className="mt-2 text-[#6d698a]">Você respondeu as 15 perguntas. O próximo treino pode começar no nível {difficultyLabels[nextDifficulty(score, difficulty)].toLocaleLowerCase("pt-BR")}.</p><button type="button" onClick={restart} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full border border-[#dcd7e6] px-5 font-extrabold text-[#1d1b33]"><RotateCcw className="h-4 w-4" /> Refazer com nova ordem</button></section>;
  }

  if (!question) return null;
  return (
    <section className="rounded-3xl border border-[#e7e3ee] bg-white p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-extrabold uppercase tracking-widest text-[#7755e8]">Pergunta {answered + 1} de {content.questions.length}</p><p className="mt-1 text-xs font-bold text-[#8b8593]">{question.topic} · {difficultyLabels[difficulty]}</p></div><span className="rounded-full bg-[#f0ecff] px-3 py-1 text-xs font-extrabold text-[#654bc9]">{correctCount} acertos</span></div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#ece9f1]"><div className="h-full rounded-full bg-gradient-to-r from-[#7755e8] to-[#e8641d]" style={{ width: `${(answered / content.questions.length) * 100}%` }} /></div>
      <h2 className="mt-6 text-xl font-extrabold leading-relaxed text-[#1d1b33]">{question.prompt}</h2>
      <div className="mt-5 grid gap-3">
        {question.options.map((option, index) => {
          const revealed = selected !== null;
          const correct = index === question.correctIndex;
          const chosen = selected === index;
          return <button key={option} type="button" disabled={revealed} onClick={() => setSelected(index)} className={`rounded-2xl border p-4 text-left text-sm font-bold transition ${revealed && correct ? "border-[#62aa7d] bg-[#edf8f1] text-[#247544]" : revealed && chosen ? "border-[#d88080] bg-[#fdf2f2] text-[#8f2f2f]" : "border-[#e7e3ee] text-[#514c6a] hover:border-[#9f8ee0]"}`}><span className="mr-2 font-extrabold">{String.fromCharCode(65 + index)}.</span>{option}</button>;
        })}
      </div>
      {selected !== null && <div className="mt-5 rounded-2xl bg-[#f7f5fa] p-4"><p className="font-extrabold text-[#1d1b33]">{currentCorrect ? "Resposta correta" : "Revise este ponto"}</p><p className="mt-1 text-sm leading-relaxed text-[#6d698a]">{question.explanation}</p><button type="button" onClick={next} className="mt-4 min-h-11 rounded-full bg-gradient-to-r from-[#7755e8] to-[#e8641d] px-6 font-extrabold text-white">{answered + 1 === content.questions.length ? "Concluir quiz" : "Próxima pergunta"}</button></div>}
    </section>
  );
}

function OpenAnswerTraining({
  mode,
  prompt,
  requirements,
  initialAnswer,
  title,
  language,
  dbSessionRef,
  onComplete,
}: {
  mode: "comportamental" | "codigo";
  prompt: string;
  requirements: string[];
  initialAnswer: string;
  title?: string;
  language?: string;
  dbSessionRef: React.RefObject<Promise<string> | null>;
  onComplete: (score: number, difficulty: TrainingDifficulty) => void;
}) {
  const [answer, setAnswer] = useState(initialAnswer);
  const [difficulty, setDifficulty] = useState<TrainingDifficulty>("intermediaria");
  const [evaluation, setEvaluation] = useState<TrainingEvaluation | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    if (answer.trim().length < 30) {
      setErrorMessage("Escreva pelo menos 30 caracteres para receber uma avaliação.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/job-training", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "evaluate", mode, answer, prompt, requirements, difficulty }) });
      const payload = await response.json() as { evaluation?: TrainingEvaluation; error?: string };
      if (!response.ok || !payload.evaluation) throw new Error(payload.error || "Não foi possível avaliar a resposta.");
      setEvaluation(payload.evaluation);
      setDifficulty(payload.evaluation.nextDifficulty);
      onComplete(payload.evaluation.score, payload.evaluation.nextDifficulty);
      dbSessionRef.current
        ?.then((sessionId) =>
          recordOpenAnswer({
            sessionId,
            mode,
            competencySource: language ?? title ?? prompt,
            difficulty,
            prompt,
            score: payload.evaluation!.score,
          }),
        )
        .catch(() => {});
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Não foi possível avaliar a resposta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-3xl border border-[#e7e3ee] bg-white p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-extrabold uppercase tracking-widest text-[#7755e8]">{mode === "codigo" ? language : "Método STAR"}</p><h2 className="mt-1 text-xl font-extrabold text-[#1d1b33]">{title ?? "Resposta comportamental"}</h2></div><span className="rounded-full bg-[#f0ecff] px-3 py-1 text-xs font-extrabold text-[#654bc9]">{difficultyLabels[difficulty]}</span></div>
      <p className="mt-5 leading-relaxed text-[#514c6a]">{prompt}</p>
      <ul className="mt-4 grid gap-2 text-sm text-[#6d698a] sm:grid-cols-2">{requirements.map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#7755e8]" /> {item}</li>)}</ul>
      <form onSubmit={submit} className="mt-5">
        <label htmlFor={`${mode}-answer`} className="text-sm font-extrabold text-[#1d1b33]">Sua resposta</label>
        <textarea id={`${mode}-answer`} rows={mode === "codigo" ? 14 : 9} value={answer} onChange={(event) => { setAnswer(event.target.value); setEvaluation(null); }} spellCheck={mode !== "codigo"} className={`mt-2 w-full resize-y rounded-2xl border-[1.5px] border-[#e4dfd3] px-4 py-3 leading-relaxed focus:border-[#7755e8] focus:outline-none focus:ring-2 focus:ring-[#7755e8]/25 ${mode === "codigo" ? "font-mono text-sm" : ""}`} />
        {errorMessage && <p role="alert" className="mt-3 rounded-xl bg-[#fdf2f2] px-4 py-3 text-sm font-bold text-[#a83030]">{errorMessage}</p>}
        <button type="submit" disabled={loading} className="mt-4 min-h-11 rounded-full bg-gradient-to-r from-[#7755e8] to-[#e8641d] px-6 font-extrabold text-white disabled:opacity-60">{loading ? "Avaliando..." : "Receber feedback"}</button>
      </form>
      {evaluation && <div className="mt-6 rounded-2xl border border-[#d9d0f2] bg-[#faf8ff] p-5"><div className="flex items-center justify-between gap-3"><h3 className="font-extrabold text-[#1d1b33]">Feedback da tentativa</h3><span className="text-2xl font-extrabold text-[#5d43c4]">{evaluation.score}%</span></div><p className="mt-3 text-sm leading-relaxed text-[#514c6a]">{evaluation.feedback}</p><div className="mt-4 grid gap-4 sm:grid-cols-2"><div><p className="text-xs font-extrabold uppercase tracking-wider text-[#247544]">Pontos fortes</p><ul className="mt-2 space-y-1 text-sm text-[#514c6a]">{evaluation.strengths.map((item) => <li key={item}>• {item}</li>)}</ul></div><div><p className="text-xs font-extrabold uppercase tracking-wider text-[#b94d17]">Próximos ajustes</p><ul className="mt-2 space-y-1 text-sm text-[#514c6a]">{evaluation.improvements.map((item) => <li key={item}>• {item}</li>)}</ul></div></div></div>}
    </section>
  );
}

function AttemptHistory({ attempts }: { attempts: TrainingAttempt[] }) {
  return (
    <aside className="h-fit rounded-3xl border border-[#e7e3ee] bg-white p-5">
      <div className="flex items-center gap-2"><History className="h-5 w-5 text-[#7755e8]" /><h2 className="font-extrabold text-[#1d1b33]">Histórico da sessão</h2></div>
      {attempts.length ? <ul className="mt-4 grid gap-3">{attempts.slice(0, 8).map((attempt) => <li key={attempt.id} className="rounded-2xl bg-[#f7f5fa] p-4"><div className="flex items-center justify-between gap-2"><span className="text-xs font-extrabold uppercase tracking-wider text-[#6d698a]">{attempt.mode}</span><span className="text-lg font-extrabold text-[#1d1b33]">{attempt.score}%</span></div><p className="mt-1 text-xs font-semibold text-[#8b8593]">{difficultyLabels[attempt.difficulty]} · {new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(attempt.createdAt))}</p></li>)}</ul> : <p className="mt-4 text-sm leading-relaxed text-[#6d698a]">Suas pontuações aparecerão aqui depois da primeira tentativa.</p>}
    </aside>
  );
}
