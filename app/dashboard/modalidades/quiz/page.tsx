"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Gauge, ListChecks, RotateCcw, X } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import {
  nextQuizDifficulty,
  pickQuizQuestion,
  type QuizDifficulty,
  type QuizQuestion,
} from "@/lib/mock-quiz";

const difficultyLabels: Record<QuizDifficulty, string> = {
  iniciante: "Iniciante",
  intermediaria: "Intermediária",
  avancada: "Avançada",
};

const QUESTION_LIMIT = 6;

export default function QuizMultiplaEscolha() {
  const [difficulty, setDifficulty] = useState<QuizDifficulty>("iniciante");
  const [askedIds, setAskedIds] = useState<string[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  // começa como null de propósito: sortear a pergunta (Math.random) direto
  // no render faria o servidor e o navegador sortearem números diferentes,
  // e o React reclama de "hydration mismatch". Sorteando só depois de montado
  // (useEffect), o servidor nunca chega a desenhar uma pergunta aleatória
  const [question, setQuestion] = useState<QuizQuestion | null>(null);

  useEffect(() => {
    // exceção deliberada à regra: isso não é "estado derivado" comum — é
    // sorteio (Math.random), que só pode rodar depois que o HTML do servidor
    // já foi exibido, senão volta o problema de hydration mismatch acima
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuestion(pickQuizQuestion(difficulty, askedIds));
  }, [difficulty, askedIds]);

  const answered = selected !== null;
  const finished = askedIds.length >= QUESTION_LIMIT || (!question && askedIds.length > 0);
  const isCorrect = answered && question ? selected === question.correctIndex : false;

  function handleSelect(index: number) {
    if (answered) return;
    setSelected(index);
    if (question && index === question.correctIndex) {
      setCorrectCount((count) => count + 1);
    }
  }

  function handleNext() {
    if (!question || selected === null) return;
    setDifficulty((current) => nextQuizDifficulty(current, selected === question.correctIndex));
    setAskedIds((ids) => [...ids, question.id]);
    setSelected(null);
  }

  function handleRestart() {
    setDifficulty("iniciante");
    setAskedIds([]);
    setSelected(null);
    setCorrectCount(0);
  }

  return (
    <div className="flex min-h-screen bg-[#f4f3f8]">
      <Sidebar />

      <main className="min-w-0 flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:py-8">
        <div className="mx-auto max-w-3xl">
          <span className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#7755e8]">
            <ListChecks className="h-3.5 w-3.5" /> Quiz de múltipla escolha
          </span>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold text-[#1d1b33] sm:text-4xl">
            Teste seus conhecimentos
          </h1>
          <p className="mt-2 leading-relaxed text-[#6d698a]">
            A cada acerto, a próxima pergunta fica um pouco mais difícil; a
            cada erro, um pouco mais fácil.
          </p>

          {finished ? (
            <section className="mt-7 rounded-3xl border border-[#e7e3ee] bg-white p-7 text-center shadow-[0_24px_70px_-48px_rgba(29,27,51,0.55)] sm:p-10">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#efeaff] text-[#7755e8]">
                <ListChecks className="h-8 w-8" />
              </span>
              <p className="mt-5 text-sm font-extrabold uppercase tracking-widest text-[#7755e8]">
                Quiz concluído
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold text-[#1d1b33]">
                {correctCount} de {askedIds.length} corretas
              </h2>
              <p className="mx-auto mt-3 max-w-md leading-relaxed text-[#6d698a]">
                {correctCount / askedIds.length >= 0.7
                  ? "Boa! Sua base teórica está sólida."
                  : "Vale revisar a trilha de estudo antes de repetir o quiz."}
              </p>
              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleRestart}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#7755e8] to-[#e8641d] px-6 font-extrabold text-white"
                >
                  <RotateCcw className="h-4 w-4" /> Refazer quiz
                </button>
                <Link
                  href="/dashboard/trilha"
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#dcd7e6] px-5 font-extrabold text-[#1d1b33]"
                >
                  Ver trilha de estudo
                </Link>
                <Link
                  href="/dashboard/modalidades"
                  className="inline-flex min-h-11 items-center justify-center rounded-full px-5 font-extrabold text-[#5d43c4]"
                >
                  Voltar
                </Link>
              </div>
            </section>
          ) : question ? (
            <section className="mt-7 overflow-hidden rounded-3xl border border-[#e7e3ee] bg-white shadow-[0_24px_70px_-48px_rgba(29,27,51,0.55)]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ece9f1] px-5 py-4 sm:px-7">
                <span className="text-sm font-extrabold text-[#1d1b33]">
                  Pergunta {askedIds.length + 1} de {QUESTION_LIMIT}
                </span>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#ece8f8] px-3 py-1 text-xs font-extrabold text-[#654bc9]">
                    {question.topic}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f0eef4] px-3 py-1 text-xs font-extrabold text-[#6d698a]">
                    <Gauge className="h-3.5 w-3.5" /> {difficultyLabels[question.difficulty]}
                  </span>
                </div>
              </div>

              <div className="p-5 sm:p-7">
                <p className="text-lg font-extrabold leading-relaxed text-[#1d1b33]">{question.prompt}</p>

                <div className="mt-5 grid gap-3">
                  {question.options.map((option, index) => {
                    const isSelected = selected === index;
                    const isRightAnswer = index === question.correctIndex;
                    // depois de responder, sempre mostra qual era a certa —
                    // mesmo se a pessoa não tiver escolhido ela
                    const showAsCorrect = answered && isRightAnswer;
                    const showAsWrong = answered && isSelected && !isRightAnswer;

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleSelect(index)}
                        disabled={answered}
                        className={`flex items-center justify-between gap-3 rounded-2xl border p-4 text-left text-sm font-bold transition disabled:cursor-default ${
                          showAsCorrect
                            ? "border-[#78ddb0] bg-[#edf8f1] text-[#247544]"
                            : showAsWrong
                              ? "border-[#f0b3ab] bg-[#fdf2f2] text-[#a83030]"
                              : isSelected
                                ? "border-[#7755e8] bg-[#f3efff] text-[#5d43c4]"
                                : "border-[#e7e3ee] text-[#1d1b33] hover:border-[#b8abe8]"
                        }`}
                      >
                        {option}
                        {showAsCorrect && <Check className="h-4 w-4 shrink-0" />}
                        {showAsWrong && <X className="h-4 w-4 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {answered && (
                  <div
                    role="status"
                    className={`mt-5 rounded-2xl border p-4 text-sm leading-relaxed ${
                      isCorrect ? "border-[#bfe5cf] bg-[#edf8f1] text-[#247544]" : "border-[#e7e3ee] bg-[#f7f5fa] text-[#514c6a]"
                    }`}
                  >
                    <p className="font-extrabold">{isCorrect ? "Certinho!" : "Não foi dessa vez."}</p>
                    <p className="mt-1">{question.explanation}</p>
                  </div>
                )}

                {answered && (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="mt-5 ml-auto flex min-h-11 items-center gap-2 rounded-full bg-[#1d1b33] px-6 font-extrabold text-white"
                  >
                    {askedIds.length + 1 === QUESTION_LIMIT ? "Ver resultado" : "Próxima pergunta"}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </section>
          ) : (
            <p className="mt-7 text-sm font-bold text-[#8b8593]">Preparando sua próxima pergunta...</p>
          )}
        </div>
      </main>
    </div>
  );
}
