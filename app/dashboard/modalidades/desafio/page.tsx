"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Code2, Gauge, RotateCcw, X } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { codeChallenges, evaluateChallengeCode } from "@/lib/mock-code-challenges";

const difficultyLabels = {
  iniciante: "Iniciante",
  intermediaria: "Intermediária",
  avancada: "Avançada",
};

// aprovação é heurística (seção 4.4 não pede nota mínima fixa) — 70% dos
// trechos esperados encontrados no código já mostra que o conceito foi aplicado
const PASS_THRESHOLD = 70;

export default function DesafioDeCodigo() {
  const [index, setIndex] = useState(0);
  const challenge = codeChallenges[index];
  const [code, setCode] = useState(challenge.starterCode);
  const [evaluation, setEvaluation] = useState<ReturnType<typeof evaluateChallengeCode> | null>(null);

  const isLast = index === codeChallenges.length - 1;
  const passed = evaluation ? evaluation.score >= PASS_THRESHOLD : false;

  function handleAnalyze(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setEvaluation(evaluateChallengeCode(code, challenge));
  }

  function goToChallenge(nextIndex: number) {
    setIndex(nextIndex);
    setCode(codeChallenges[nextIndex].starterCode);
    setEvaluation(null);
  }

  function handleRetry() {
    setCode(challenge.starterCode);
    setEvaluation(null);
  }

  return (
    <div className="flex min-h-screen bg-[#f4f3f8]">
      <Sidebar />

      <main className="min-w-0 flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:py-8">
        <div className="mx-auto max-w-4xl">
          <span className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#7755e8]">
            <Code2 className="h-3.5 w-3.5" /> Desafio de código
          </span>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold text-[#1d1b33] sm:text-4xl">
            Resolva o problema
          </h1>
          <p className="mt-2 leading-relaxed text-[#6d698a]">
            Escreva sua solução no editor abaixo e clique em &ldquo;Analisar
            código&rdquo; — não precisa rodar nada, a análise procura os
            conceitos esperados no que você escreveu.
          </p>

          <section className="mt-7 overflow-hidden rounded-3xl border border-[#e7e3ee] bg-white shadow-[0_24px_70px_-48px_rgba(29,27,51,0.55)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ece9f1] px-5 py-4 sm:px-7">
              <span className="text-sm font-extrabold text-[#1d1b33]">
                Desafio {index + 1} de {codeChallenges.length}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f0eef4] px-3 py-1 text-xs font-extrabold text-[#6d698a]">
                <Gauge className="h-3.5 w-3.5" /> {difficultyLabels[challenge.difficulty]}
              </span>
            </div>

            <div className="p-5 sm:p-7">
              <h2 className="text-xl font-extrabold text-[#1d1b33]">{challenge.title}</h2>
              <p className="mt-2 leading-relaxed text-[#6d698a]">{challenge.prompt}</p>

              <form onSubmit={handleAnalyze} className="mt-5">
                <label htmlFor="challenge-code" className="text-sm font-extrabold text-[#1d1b33]">
                  Sua solução
                </label>
                {/* fonte monoespaçada só nesse campo — ajuda a ler código,
                    sem precisar trocar a fonte do site inteiro */}
                <textarea
                  id="challenge-code"
                  rows={10}
                  value={code}
                  onChange={(event) => { setCode(event.target.value); setEvaluation(null); }}
                  spellCheck={false}
                  className="mt-2 w-full resize-y rounded-2xl border-[1.5px] border-[#e4dfd3] bg-[#1d1b33] px-4 py-3 font-mono text-sm leading-relaxed text-[#e7e3ee] focus:border-[#7755e8] focus:outline-none focus:ring-2 focus:ring-[#7755e8]/25"
                />
                <button
                  type="submit"
                  className="mt-4 flex min-h-11 items-center gap-2 rounded-full bg-[#7755e8] px-6 font-extrabold text-white"
                >
                  Analisar código
                </button>
              </form>

              {evaluation && (
                <div
                  role="status"
                  className={`mt-6 rounded-2xl border p-5 ${passed ? "border-[#bfe5cf] bg-[#edf8f1]" : "border-[#e7e3ee] bg-[#f7f5fa]"}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className={`font-extrabold ${passed ? "text-[#247544]" : "text-[#1d1b33]"}`}>
                      {passed ? "Boa! Sua solução cobre o essencial." : "Quase lá — falta cobrir alguns pontos."}
                    </p>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-[#5d43c4]">
                      {evaluation.score}/100
                    </span>
                  </div>

                  {evaluation.matched.length > 0 && (
                    <ul className="mt-4 grid gap-1.5">
                      {evaluation.matched.map(({ label }) => (
                        <li key={label} className="flex items-center gap-2 text-sm font-bold text-[#247544]">
                          <Check className="h-4 w-4 shrink-0" /> {label}
                        </li>
                      ))}
                    </ul>
                  )}
                  {evaluation.missing.length > 0 && (
                    <ul className="mt-2 grid gap-1.5">
                      {evaluation.missing.map(({ label }) => (
                        <li key={label} className="flex items-center gap-2 text-sm font-bold text-[#a83030]">
                          <X className="h-4 w-4 shrink-0" /> {label}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={handleRetry}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#dcd7e6] px-5 font-extrabold text-[#1d1b33]"
                    >
                      <RotateCcw className="h-4 w-4" /> Tentar de novo
                    </button>
                    {isLast ? (
                      <Link
                        href="/dashboard/modalidades"
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#7755e8] to-[#e8641d] px-6 font-extrabold text-white"
                      >
                        Concluir
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => goToChallenge(index + 1)}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#7755e8] to-[#e8641d] px-6 font-extrabold text-white"
                      >
                        Próximo desafio <ArrowRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
