"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Bot,
  CheckCircle2,
  Gauge,
  Info,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { Mascot } from "@/components/Mascot";
import { PreparationJourney } from "@/components/PreparationJourney";
import { PreparationCycle } from "@/components/interview/PreparationCycle";
import { MOCK_SESSION_KEY, parseMockSession, persistMockSession, type MockSession } from "@/lib/mock-session";
import type { PreparationPlan } from "@/lib/preparation-journey";
import {
  buildInterviewSummary,
  detectInterviewArea,
  evaluateInterviewAnswer,
  getInterviewQuestions,
  getQuestionBankSize,
  getQuestionReason,
  interviewAreaOptions,
  pickInterviewQuestion,
  type InterviewArea,
  type InterviewDifficulty,
  type InterviewEvaluation,
  type InterviewQuestion,
  type InterviewTrack,
} from "@/lib/interview-agent";
import { recordOpenAnswer, startTrainingSession } from "@/lib/training/actions";

type InterviewTurn = {
  question: InterviewQuestion;
  answer: string;
  evaluation: InterviewEvaluation;
};

type SavedPreparationPlan = PreparationPlan;

const difficultyLabels: Record<InterviewDifficulty, string> = {
  iniciante: "Iniciante",
  intermediaria: "Intermediária",
  avancada: "Avançada",
};

const trackLabels: Record<InterviewTrack, string> = {
  tecnica: "Técnica",
  comportamental: "Comportamental",
  mista: "Entrevista mista",
};

const sessionSizeOptions = [
  { amount: 5, label: "Rápida", duration: "~10 min" },
  { amount: 10, label: "Essencial", duration: "~20 min" },
  { amount: 20, label: "Completa", duration: "~40 min" },
  { amount: 35, label: "Banco inteiro", duration: "~70 min" },
] as const;

export default function AgenteEntrevista() {
  const [started, setStarted] = useState(false);
  const [track, setTrack] = useState<InterviewTrack>("mista");
  const [areaChoice, setAreaChoice] = useState<InterviewArea | "auto">("frontend");
  const [jobDescription, setJobDescription] = useState("");
  const [questionLimit, setQuestionLimit] = useState(5);
  const [difficulty, setDifficulty] = useState<InterviewDifficulty>("iniciante");
  const [answer, setAnswer] = useState("");
  const [turns, setTurns] = useState<InterviewTurn[]>([]);
  const [currentEvaluation, setCurrentEvaluation] = useState<InterviewEvaluation | null>(null);
  const [replayIds, setReplayIds] = useState<string[] | null>(null);
  const [focusKeywords, setFocusKeywords] = useState<string[]>([]);
  const [previousScore, setPreviousScore] = useState<number | null>(null);
  const [savedPlan, setSavedPlan] = useState<SavedPreparationPlan | null>(null);
  const [configurationError, setConfigurationError] = useState("");
  const [activeSession, setActiveSession] = useState<MockSession | null>(null);
  const dbSessionRef = useRef<Promise<string | null> | null>(null);
  const effectiveArea = areaChoice === "auto" ? detectInterviewArea(jobDescription) : areaChoice;
  const effectiveAreaLabel = interviewAreaOptions.find(({ value }) => value === effectiveArea)?.label ?? "Frontend";

  const question = useMemo(() => {
    const replayId = replayIds?.[turns.length];
    if (replayId) {
      return getInterviewQuestions(track, effectiveArea, jobDescription).find((item) => item.id === replayId) ?? null;
    }
    return pickInterviewQuestion(track, effectiveArea, difficulty, turns.map((turn) => turn.question.id), jobDescription, focusKeywords);
  }, [difficulty, effectiveArea, focusKeywords, jobDescription, replayIds, track, turns]);

  const completed = started && turns.length >= questionLimit;
  const averageScore = turns.length
    ? Math.round(turns.reduce((total, turn) => total + turn.evaluation.score, 0) / turns.length)
    : 0;
  const summary = useMemo(() => buildInterviewSummary(turns), [turns]);

  useEffect(() => {
    const loadSavedPlan = window.setTimeout(() => {
      try {
        const preparation = parseMockSession(window.sessionStorage.getItem(MOCK_SESSION_KEY));
        setActiveSession(preparation);
        setJobDescription((current) => current || preparation.description);
        setAreaChoice("auto");
        if (preparation.progress.plan) {
          setSavedPlan(preparation.progress.plan);
        }
      } catch {}
    }, 0);
    return () => window.clearTimeout(loadSavedPlan);
  }, []);

  function persistJourney(plan: PreparationPlan, interview?: MockSession["progress"]["interview"]) {
    const current = parseMockSession(window.sessionStorage.getItem(MOCK_SESSION_KEY));
    const updated: MockSession = {
      ...current,
      progress: {
        ...current.progress,
        plan,
        interview: interview ?? current.progress.interview,
      },
    };
    setActiveSession(updated);
    persistMockSession(updated);
  }

  function togglePreparationTask(taskId: string) {
    setSavedPlan((current) => {
      if (!current) return current;
      const updated = {
        ...current,
        tasks: current.tasks.map((task) => task.id === taskId ? { ...task, completed: !task.completed } : task),
      };
      persistJourney(updated);
      return updated;
    });
  }

  function submitAnswer(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!question || answer.trim().length < 30 || currentEvaluation) return;
    setCurrentEvaluation(evaluateInterviewAnswer(answer.trim(), question));
  }

  async function recordInterviewTurn(turnQuestion: InterviewQuestion, answerText: string, evaluation: InterviewEvaluation) {
    const dbSessionId = await dbSessionRef.current;
    if (!dbSessionId) return;
    try {
      await recordOpenAnswer({
        sessionId: dbSessionId,
        mode: "entrevista",
        competencyText: turnQuestion.competency,
        difficulty: turnQuestion.difficulty,
        prompt: turnQuestion.prompt,
        answerText,
        score: evaluation.score,
        criteria: evaluation.criteria,
      });
    } catch {}
  }

  function nextQuestion() {
    if (!question || !currentEvaluation) return;
    const trimmedAnswer = answer.trim();
    const nextTurns = [
      ...turns,
      { question, answer: trimmedAnswer, evaluation: currentEvaluation },
    ];
    setTurns(nextTurns);
    recordInterviewTurn(question, trimmedAnswer, currentEvaluation);
    if (nextTurns.length >= questionLimit) {
      const finalSummary = buildInterviewSummary(nextTurns);
      const finalScore = Math.round(nextTurns.reduce((total, turn) => total + turn.evaluation.score, 0) / nextTurns.length);
      const planId = nextTurns.map((turn) => `${turn.question.id}:${turn.evaluation.score}`).join("|");
      const plan: PreparationPlan = {
        id: planId,
        priority: finalSummary.priority.name,
        sourceScore: finalScore,
        createdAt: new Date().toISOString(),
        tasks: finalSummary.plan.map((item, index) => ({
          id: `${planId}:${index}`,
          period: item.period,
          action: item.action,
          completed: false,
        })),
      };
      setSavedPlan(plan);
      persistJourney(plan, {
        score: finalScore,
        strongest: finalSummary.strongest.name,
        priority: finalSummary.priority.name,
        completedAt: new Date().toISOString(),
      });
    }
    setDifficulty(currentEvaluation.nextDifficulty);
    setFocusKeywords(currentEvaluation.score < 70 ? question.keywords : []);
    setAnswer("");
    setCurrentEvaluation(null);
  }

  function startInterview() {
    if (areaChoice === "auto" && jobDescription.trim().length < 30) {
      setConfigurationError("Cole uma descrição de vaga com pelo menos 30 caracteres para detectarmos a área.");
      return;
    }
    setConfigurationError("");
    setStarted(true);
    setTurns([]);
    setAnswer("");
    setCurrentEvaluation(null);
    setReplayIds(null);
    setFocusKeywords([]);
    setPreviousScore(null);
    dbSessionRef.current = startTrainingSession({
      jobTitle: `Entrevista ${trackLabels[track]} · ${effectiveAreaLabel}`,
      jobSessionId: activeSession?.id,
    }).catch(() => null);
  }

  function replayInterview() {
    setPreviousScore(averageScore);
    setReplayIds(turns.map((turn) => turn.question.id));
    setDifficulty(turns[0]?.question.difficulty ?? "iniciante");
    setTurns([]);
    setAnswer("");
    setCurrentEvaluation(null);
    setFocusKeywords([]);
  }

  function trainPriorityCompetencies() {
    const priorityTurn = turns.find((turn) => turn.question.competency === summary.priority.name);
    setPreviousScore(averageScore);
    setQuestionLimit(5);
    setDifficulty("iniciante");
    setReplayIds(null);
    setFocusKeywords(priorityTurn?.question.keywords ?? []);
    setTurns([]);
    setAnswer("");
    setCurrentEvaluation(null);
  }

  return (
    <div className="flex min-h-screen bg-[#f4f3f8]">
      <Sidebar />
      <main className="min-w-0 flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:py-8">
        <div className="mx-auto max-w-5xl">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#7755e8]">
                <Sparkles className="h-3.5 w-3.5" /> Preparação para entrevistas
              </span>
              <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold text-[#1d1b33] sm:text-4xl">
                Agente de entrevista
              </h1>
              <p className="mt-2 max-w-2xl leading-relaxed text-[#6d698a]">
                Simule entrevistas alinhadas à vaga e receba feedback acionável sobre cada resposta.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#ece8f8] px-3 py-2 text-xs font-extrabold text-[#654bc9]">
              <ShieldCheck className="h-4 w-4" /> Avaliação automática
            </span>
          </header>
          <PreparationJourney current="entrevista" sessionName={activeSession ? `${activeSession.name} · ${activeSession.company}` : undefined} />

          {!started && savedPlan && (
            <div className="mt-7">
              <PreparationCycle plan={savedPlan} onToggleTask={togglePreparationTask} />
            </div>
          )}

          {!started ? (
            <section className="mt-7 grid overflow-hidden rounded-3xl border border-[#e7e3ee] bg-white shadow-[0_24px_70px_-48px_rgba(29,27,51,0.55)] lg:grid-cols-[1fr_320px]">
              <div className="p-6 sm:p-8">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#8b8593]">Configure a simulação</p>
                <h2 className="mt-2 text-2xl font-extrabold text-[#1d1b33]">Que entrevista você quer treinar?</h2>

                <div className="mt-6 grid gap-1.5">
                  <label htmlFor="interview-area" className="text-sm font-extrabold text-[#1d1b33]">Área da entrevista</label>
                  <select id="interview-area" value={areaChoice} onChange={(event) => { setAreaChoice(event.target.value as InterviewArea | "auto"); setConfigurationError(""); }} className="min-h-12 rounded-xl border-[1.5px] border-[#e4dfd3] bg-white px-4 font-bold text-[#1d1b33] focus:border-[#7755e8] focus:outline-none focus:ring-2 focus:ring-[#7755e8]/25">
                    <option value="auto">Detectar pela descrição da vaga</option>
                    {interviewAreaOptions.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </div>

                <div className="mt-5 grid gap-1.5">
                  <label htmlFor="job-description" className="text-sm font-extrabold text-[#1d1b33]">Descrição da vaga <span className="text-xs font-semibold text-[#8b8593]">({areaChoice === "auto" ? "necessária para detectar a área" : "opcional"})</span></label>
                  <textarea id="job-description" rows={5} value={jobDescription} onChange={(event) => { setJobDescription(event.target.value); setConfigurationError(""); }} placeholder="Cole requisitos, responsabilidades e tecnologias da vaga. O agente priorizará perguntas relacionadas ao texto." className="resize-y rounded-xl border-[1.5px] border-[#e4dfd3] px-4 py-3 leading-relaxed focus:border-[#7755e8] focus:outline-none focus:ring-2 focus:ring-[#7755e8]/25" />
                  <div className="flex flex-wrap justify-between gap-2 text-xs font-semibold text-[#8b8593]"><span>{areaChoice === "auto" && jobDescription.trim().length >= 30 ? `Área detectada: ${effectiveAreaLabel}` : null}</span><span>{jobDescription.length} caracteres</span></div>
                </div>

                <fieldset className="mt-6">
                  <legend className="text-sm font-extrabold text-[#1d1b33]">Tipo de conversa</legend>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    {(Object.keys(trackLabels) as InterviewTrack[]).map((item) => (
                      <button key={item} type="button" onClick={() => setTrack(item)} aria-pressed={track === item} className={`min-h-14 rounded-2xl border px-4 text-left text-sm font-extrabold transition ${track === item ? "border-[#7755e8] bg-[#f3efff] text-[#5d43c4] ring-2 ring-[#7755e8]/15" : "border-[#e7e3ee] text-[#514c6a] hover:border-[#b8abe8]"}`}>
                        {trackLabels[item]}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <fieldset className="mt-6">
                  <legend className="text-sm font-extrabold text-[#1d1b33]">Nível inicial</legend>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    {(Object.keys(difficultyLabels) as InterviewDifficulty[]).map((item) => (
                      <button key={item} type="button" onClick={() => setDifficulty(item)} aria-pressed={difficulty === item} className={`min-h-12 rounded-2xl border px-4 text-sm font-extrabold transition ${difficulty === item ? "border-[#e8641d] bg-[#fff3eb] text-[#b94d17] ring-2 ring-[#e8641d]/15" : "border-[#e7e3ee] text-[#514c6a] hover:border-[#e2ab8d]"}`}>
                        {difficultyLabels[item]}
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-[#8b8593]">A dificuldade se adapta à clareza e à profundidade das suas respostas.</p>
                </fieldset>

                <fieldset className="mt-6">
                  <legend className="text-sm font-extrabold text-[#1d1b33]">Quantas perguntas você quer responder?</legend>
                  <p className="mt-1 text-xs leading-relaxed text-[#8b8593]">Selecione uma sessão objetiva ou responda às 35 perguntas da área.</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {sessionSizeOptions.map(({ amount, label, duration }) => (
                      <button key={amount} type="button" onClick={() => setQuestionLimit(amount)} aria-pressed={questionLimit === amount} className={`min-h-20 rounded-2xl border px-3 py-3 text-left transition ${questionLimit === amount ? "border-[#7755e8] bg-[#f3efff] text-[#5d43c4] ring-2 ring-[#7755e8]/15" : "border-[#e7e3ee] text-[#514c6a] hover:border-[#b8abe8]"}`}>
                        <span className="block text-sm font-extrabold">{amount} perguntas</span>
                        <span className="mt-1 block text-[11px] font-semibold opacity-75">{label} · {duration}</span>
                      </button>
                    ))}
                  </div>
                </fieldset>

                {configurationError && <p role="alert" className="mt-5 rounded-xl bg-[#fdf2f2] px-4 py-3 text-sm font-bold text-[#a83030]">{configurationError}</p>}

                <button type="button" onClick={startInterview} className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#7755e8] to-[#e8641d] px-6 font-extrabold text-white shadow-[0_16px_35px_-18px_rgba(119,85,232,0.8)] sm:w-auto">
                  Iniciar entrevista <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <aside className="bg-[#17172f] p-6 text-white sm:p-8">
                <Mascot pose="coach" motion="float" priority className="mx-auto h-40 w-40" />
                <h2 className="mt-3 text-xl font-extrabold">Entrevista personalizada</h2>
                <ul className="mt-5 space-y-4 text-sm leading-relaxed text-[#c2bfd7]">
                  <li className="flex gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#78ddb0]" /> {areaChoice === "auto" && jobDescription.trim().length < 30 ? "35 perguntas técnicas na área detectada pela vaga." : `${getQuestionBankSize(effectiveArea)} perguntas técnicas em ${effectiveAreaLabel}.`}</li>
                  <li className="flex gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#78ddb0]" /> Feedback sobre conteúdo, clareza e estrutura.</li>
                  <li className="flex gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#78ddb0]" /> Dificuldade ajustada ao desempenho.</li>
                </ul>
                <p className="mt-7 rounded-xl border border-white/10 bg-white/[0.06] p-3 text-xs leading-relaxed text-[#aaa6d6]">Suas respostas ficam salvas na sua conta, disponíveis em qualquer dispositivo.</p>
              </aside>
            </section>
          ) : completed ? (
            <section className="mt-7 rounded-3xl border border-[#e7e3ee] bg-white p-7 text-center shadow-[0_24px_70px_-48px_rgba(29,27,51,0.55)] sm:p-10">
              <Mascot pose="wave" motion="arrive" priority className="mx-auto h-40 w-40" />
              <p className="mt-5 text-sm font-extrabold uppercase tracking-widest text-[#7755e8]">Simulação concluída</p>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold text-[#1d1b33]">Desempenho geral: {averageScore}/100</h2>
              <p className="mx-auto mt-3 max-w-xl leading-relaxed text-[#6d698a]">Sua devolutiva conecta as respostas às competências avaliadas e indica onde concentrar a preparação.</p>
              {previousScore !== null && (
                <p className={`mx-auto mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-extrabold ${averageScore >= previousScore ? "bg-[#edf8f1] text-[#247544]" : "bg-[#fff3eb] text-[#b94d17]"}`}>
                  <TrendingUp className="h-4 w-4" /> {averageScore >= previousScore ? "+" : ""}{averageScore - previousScore} pontos desde a tentativa anterior
                </p>
              )}
              <div className="mx-auto mt-6 grid max-w-3xl gap-3 text-left sm:grid-cols-2">
                <div className="rounded-2xl bg-[#edf8f1] p-4"><p className="text-xs font-extrabold uppercase tracking-wide text-[#247544]">Competência mais evidente</p><p className="mt-1 text-sm font-bold text-[#1d1b33]">{summary.strongest.name} · {summary.strongest.score}/100</p></div>
                <div className="rounded-2xl bg-[#fff3eb] p-4"><p className="text-xs font-extrabold uppercase tracking-wide text-[#b94d17]">Prioridade de desenvolvimento</p><p className="mt-1 text-sm font-bold text-[#1d1b33]">{summary.priority.name} · {summary.priority.score}/100</p></div>
              </div>
              <div className="mx-auto mt-4 grid max-w-3xl grid-cols-2 gap-3 text-left sm:grid-cols-4">
                {Object.entries({ Conteúdo: summary.criteria.content, Clareza: summary.criteria.clarity, Evidências: summary.criteria.evidence, Estrutura: summary.criteria.structure }).map(([label, score]) => (
                  <div key={label} className="rounded-2xl border border-[#e7e3ee] p-4"><p className="text-xs font-bold text-[#8b8593]">{label}</p><p className="mt-1 text-xl font-extrabold text-[#1d1b33]">{score}</p></div>
                ))}
              </div>
              <div className="mx-auto mt-6 max-w-3xl">
                {savedPlan ? (
                  <PreparationCycle plan={savedPlan} onToggleTask={togglePreparationTask} />
                ) : (
                  <div className="rounded-2xl border border-[#e7e3ee] p-5 text-left">
                    <p className="flex items-center gap-2 font-extrabold text-[#1d1b33]"><BookOpen className="h-4 w-4 text-[#7755e8]" /> Preparando seu ciclo de 7 dias...</p>
                  </div>
                )}
              </div>
              <div className="mt-7 flex flex-col items-center gap-4">
                <div className="flex flex-col justify-center gap-3 sm:flex-row">
                  <button type="button" onClick={trainPriorityCompetencies} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#7755e8] to-[#e8641d] px-6 font-extrabold text-white"><Target className="h-4 w-4" /> Treinar pontos prioritários</button>
                  <button type="button" onClick={replayInterview} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#dcd7e6] px-5 font-extrabold text-[#1d1b33]"><RotateCcw className="h-4 w-4" /> Refazer mesmas perguntas</button>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                  <button type="button" onClick={() => setStarted(false)} className="text-sm font-extrabold text-[#5d43c4] underline decoration-[#e8641d] decoration-2 underline-offset-4">Nova configuração</button>
                  <Link href="/dashboard" className="text-sm font-extrabold text-[#5d43c4] underline decoration-[#e8641d] decoration-2 underline-offset-4">Voltar ao dashboard</Link>
                </div>
              </div>
            </section>
          ) : question ? (
            <section className="mt-7 overflow-hidden rounded-3xl border border-[#e7e3ee] bg-white shadow-[0_24px_70px_-48px_rgba(29,27,51,0.55)]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ece9f1] px-5 py-4 sm:px-7">
                <div className="flex items-center gap-2 text-sm font-extrabold text-[#1d1b33]"><Bot className="h-4 w-4 text-[#7755e8]" /> Pergunta {turns.length + 1} de {questionLimit}</div>
                <div className="flex flex-wrap gap-2"><span className="rounded-full bg-[#ece8f8] px-3 py-1 text-xs font-extrabold text-[#654bc9]">{effectiveAreaLabel}</span><span className="inline-flex items-center gap-1.5 rounded-full bg-[#f0eef4] px-3 py-1 text-xs font-extrabold text-[#6d698a]"><Gauge className="h-3.5 w-3.5" /> {difficultyLabels[question.difficulty]}</span></div>
              </div>
              <div className="p-5 sm:p-7">
                <div className="flex gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#17172f] text-white"><Bot className="h-5 w-5" /></span>
                  <div className="max-w-3xl rounded-2xl rounded-tl-sm bg-[#f3f0f8] p-4">
                    <p className="text-lg font-extrabold leading-relaxed text-[#1d1b33]">{question.prompt}</p>
                    <p className="mt-2 text-xs leading-relaxed text-[#777286]"><strong>Dica:</strong> {question.hint}</p>
                    <p className="mt-3 flex items-start gap-2 border-t border-[#ded8e8] pt-3 text-xs leading-relaxed text-[#625c7c]"><Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#7755e8]" /><span><strong>Por que esta pergunta:</strong> {getQuestionReason(question, jobDescription)}</span></p>
                  </div>
                  <Mascot pose="coach" className="ml-auto hidden h-28 w-28 shrink-0 xl:block" />
                </div>

                <form onSubmit={submitAnswer} className="mt-6">
                  <label htmlFor="interview-answer" className="text-sm font-extrabold text-[#1d1b33]">Sua resposta</label>
                  <textarea id="interview-answer" rows={7} value={answer} onChange={(event) => setAnswer(event.target.value)} disabled={Boolean(currentEvaluation)} placeholder="Responda como se estivesse conversando com a pessoa entrevistadora..." className="mt-2 w-full resize-y rounded-2xl border-[1.5px] border-[#e4dfd3] px-4 py-3 leading-relaxed focus:border-[#7755e8] focus:outline-none focus:ring-2 focus:ring-[#7755e8]/25 disabled:bg-[#f7f6f8]" />
                  <div className="mt-2 flex items-center justify-between gap-4 text-xs font-semibold text-[#8b8593]"><span>Mínimo de 30 caracteres para um feedback útil.</span><span>{answer.trim().length} caracteres</span></div>
                  {!currentEvaluation && <button type="submit" disabled={answer.trim().length < 30} className="mt-5 ml-auto flex min-h-11 items-center gap-2 rounded-full bg-[#7755e8] px-6 font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-40">Analisar resposta <Send className="h-4 w-4" /></button>}
                </form>

                {currentEvaluation && (
                  <div role="status" className="mt-5 rounded-2xl border border-[#ded8ed] bg-[#f7f4fc] p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3"><p className="flex items-center gap-2 font-extrabold text-[#1d1b33]"><Sparkles className="h-4 w-4 text-[#7755e8]" /> Feedback do agente</p><span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-[#5d43c4]">{currentEvaluation.score}/100</span></div>
                    <p className="mt-3 text-sm leading-relaxed text-[#514c6a]">{currentEvaluation.feedback}</p>
                    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {Object.entries({ Conteúdo: currentEvaluation.criteria.content, Clareza: currentEvaluation.criteria.clarity, Evidências: currentEvaluation.criteria.evidence, Estrutura: currentEvaluation.criteria.structure }).map(([label, score]) => (
                        <div key={label} className="rounded-xl bg-white p-3"><p className="text-[10px] font-extrabold uppercase tracking-wide text-[#8b8593]">{label}</p><p className="mt-1 text-lg font-extrabold text-[#1d1b33]">{score}</p></div>
                      ))}
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl bg-[#edf8f1] p-3"><p className="text-xs font-extrabold text-[#247544]">Evidências identificadas</p><p className="mt-1 text-xs leading-relaxed text-[#3d654d]">{currentEvaluation.evidenceFound.length ? currentEvaluation.evidenceFound.join(" · ") : "Nenhuma evidência específica identificada."}</p></div>
                      <div className="rounded-xl bg-[#fff3eb] p-3"><p className="text-xs font-extrabold text-[#b94d17]">Ainda não demonstrado</p><p className="mt-1 text-xs leading-relaxed text-[#7a4d35]">{currentEvaluation.missingEvidence.slice(0, 3).join(" · ") || "Competência demonstrada com boa cobertura."}</p></div>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-[#514c6a]"><strong>Para melhorar:</strong> {currentEvaluation.nextStep}</p>
                    {currentEvaluation.score < 70 && <p className="mt-2 text-xs font-bold text-[#7755e8]">A próxima pergunta priorizará esta lacuna.</p>}
                    <button type="button" onClick={nextQuestion} className="mt-5 ml-auto flex min-h-11 items-center gap-2 rounded-full bg-[#1d1b33] px-6 font-extrabold text-white">{turns.length + 1 === questionLimit ? "Ver devolutiva" : "Próxima pergunta"} <ArrowRight className="h-4 w-4" /></button>
                  </div>
                )}
              </div>
            </section>
          ) : null}
        </div>
      </main>
    </div>
  );
}
