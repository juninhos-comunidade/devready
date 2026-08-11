"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, CheckCircle2, ExternalLink, PlayCircle, RotateCcw, Sparkles } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { PreparationJourney } from "@/components/PreparationJourney";
import { Mascot } from "@/components/Mascot";
import { MOCK_SESSION_KEY, parseMockSession, persistMockSession, type MockSession } from "@/lib/mock-session";
import type { PreparationPlan } from "@/lib/preparation-journey";

type Material = { title: string; type: string; duration: string; url: string };

const resources: Array<{ terms: string[]; materials: Material[] }> = [
  { terms: ["react", "frontend", "hooks"], materials: [{ title: "Aprenda React", type: "Documentação oficial", duration: "25 min", url: "https://react.dev/learn" }] },
  { terms: ["typescript", "tipagem"], materials: [{ title: "TypeScript para novos programadores", type: "Documentação oficial", duration: "20 min", url: "https://www.typescriptlang.org/docs/handbook/typescript-from-scratch.html" }] },
  { terms: ["teste", "jest", "qa"], materials: [{ title: "Começando com Jest", type: "Documentação oficial", duration: "20 min", url: "https://jestjs.io/pt-BR/docs/getting-started" }] },
  { terms: ["sql", "postgres", "banco"], materials: [{ title: "Tutorial PostgreSQL", type: "Documentação oficial", duration: "35 min", url: "https://www.postgresql.org/docs/current/tutorial.html" }] },
  { terms: ["node", "backend", "api"], materials: [{ title: "Introdução ao Node.js", type: "Documentação oficial", duration: "25 min", url: "https://nodejs.org/en/learn/getting-started/introduction-to-nodejs" }] },
  { terms: ["python", "dados", "ia"], materials: [{ title: "Tutorial Python", type: "Documentação oficial", duration: "35 min", url: "https://docs.python.org/pt-br/3/tutorial/" }] },
  { terms: ["docker", "container"], materials: [{ title: "Docker: primeiros passos", type: "Documentação oficial", duration: "30 min", url: "https://docs.docker.com/get-started/" }] },
  { terms: ["javascript", "web", "fundamentos"], materials: [{ title: "Guia JavaScript", type: "Documentação MDN", duration: "30 min", url: "https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Guide" }] },
];

const fallbackMaterial: Material = {
  title: "Competências essenciais para a web",
  type: "Currículo MDN",
  duration: "30 min",
  url: "https://developer.mozilla.org/en-US/curriculum/core/",
};

function createPlan(session: MockSession): PreparationPlan {
  const priority = session.analysis.priority;
  const id = `plan:${session.id}:${priority}`;
  return {
    id,
    priority,
    sourceScore: session.analysis.compatibility,
    createdAt: new Date().toISOString(),
    tasks: [
      { id: `${id}:1`, period: "Dias 1–2", action: `Revisar os fundamentos de ${priority} e registrar três conceitos essenciais.`, completed: false },
      { id: `${id}:2`, period: "Dias 3–4", action: `Resolver um exercício de ${priority} e explicar as decisões tomadas.`, completed: false },
      { id: `${id}:3`, period: "Dias 5–6", action: "Praticar uma resposta técnica e uma comportamental com evidências.", completed: false },
      { id: `${id}:4`, period: "Dia 7", action: "Refazer a entrevista e comparar clareza, conteúdo e evidências.", completed: false },
    ],
  };
}

function materialsFor(competency: string) {
  const normalized = competency.toLocaleLowerCase("pt-BR");
  return resources.find((resource) => resource.terms.some((term) => normalized.includes(term)))?.materials ?? [fallbackMaterial];
}

export default function TrilhaDeEstudo() {
  const [session, setSession] = useState<MockSession | null>(null);
  const [plan, setPlan] = useState<PreparationPlan | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const current = parseMockSession(window.sessionStorage.getItem(MOCK_SESSION_KEY));
      const currentPlan = current.progress.plan ?? createPlan(current);
      const updated = { ...current, progress: { ...current.progress, plan: currentPlan } };
      setSession(updated);
      setPlan(currentPlan);
      persistMockSession(updated);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const competencies = useMemo(() => {
    if (!session) return [];
    return [session.analysis.priority, ...session.analysis.requirements]
      .filter((item, index, list) => item && list.indexOf(item) === index)
      .slice(0, 3);
  }, [session]);

  function updatePlan(next: PreparationPlan) {
    if (!session) return;
    const updatedSession = { ...session, progress: { ...session.progress, plan: next } };
    setPlan(next);
    setSession(updatedSession);
    persistMockSession(updatedSession);
  }

  function toggleTask(taskId: string) {
    if (!plan) return;
    updatePlan({ ...plan, tasks: plan.tasks.map((task) => task.id === taskId ? { ...task, completed: !task.completed } : task) });
  }

  const completed = plan?.tasks.filter((task) => task.completed).length ?? 0;
  const progress = plan ? Math.round((completed / plan.tasks.length) * 100) : 0;

  return (
    <div className="flex min-h-screen bg-[#f4f3f8]">
      <Sidebar />
      <main className="min-w-0 flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:py-8">
        <div className="mx-auto max-w-6xl">
          <header className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#7755e8]">Plano de preparação</p>
              <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold text-[#1d1b33] sm:text-4xl">Transforme lacunas em ações</h1>
              <p className="mt-2 max-w-2xl leading-relaxed text-[#6d698a]">Um ciclo curto, ligado à vaga e ao que ainda precisa ser demonstrado.</p>
            </div>
            <Mascot pose="coach" className="hidden h-28 w-28 sm:block" />
          </header>

          <PreparationJourney current="plano" sessionName={session ? `${session.name} · ${session.company}` : undefined} />

          {plan && (
            <section className="mt-6 rounded-3xl bg-[#17172f] p-6 text-white sm:p-8" aria-labelledby="cycle-title">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#bcb6ec]"><Sparkles className="h-4 w-4" /> Ciclo de 7 dias</span>
                  <h2 id="cycle-title" className="mt-2 text-2xl font-extrabold">Foco em {plan.priority}</h2>
                  <p className="mt-1 text-sm text-[#c2bfd7]">Marque cada ação conforme concluir. O progresso fica vinculado a esta preparação.</p>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-2 text-sm font-extrabold">{progress}% concluído</span>
              </div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-label="Progresso do plano" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
                <div className="h-full rounded-full bg-gradient-to-r from-[#8b6cff] to-[#f27a35] transition-all" style={{ width: `${progress}%` }} />
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {plan.tasks.map((task) => (
                  <label key={task.id} className={`flex cursor-pointer gap-3 rounded-2xl border p-4 ${task.completed ? "border-[#78ddb0]/40 bg-[#78ddb0]/10" : "border-white/10 bg-white/[0.05]"}`}>
                    <input type="checkbox" checked={task.completed} onChange={() => toggleTask(task.id)} className="mt-0.5 h-5 w-5 shrink-0 accent-[#8b6cff]" />
                    <span><span className="block text-xs font-extrabold text-[#bcb6ec]">{task.period}</span><span className={`mt-1 block text-sm leading-relaxed ${task.completed ? "text-[#9eddbb] line-through" : "text-white"}`}>{task.action}</span></span>
                  </label>
                ))}
              </div>
              {progress === 100 && <p role="status" className="mt-5 flex items-center gap-2 rounded-xl bg-[#78ddb0]/10 px-4 py-3 text-sm font-extrabold text-[#9eddbb]"><CheckCircle2 className="h-4 w-4" /> Plano concluído. Refaça a entrevista para comparar sua evolução.</p>}
            </section>
          )}

          <section className="mt-6 rounded-3xl border border-[#e7e3ee] bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div><p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#8b8593]">Curadoria confiável</p><h2 className="mt-1 text-xl font-extrabold text-[#1d1b33]">Materiais para as prioridades da vaga</h2></div>
              <span className="text-xs font-bold text-[#6d698a]">Links oficiais e gratuitos</span>
            </div>
            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              {competencies.map((competency, index) => (
                <article key={competency} className="rounded-2xl border border-[#ece9f1] p-4">
                  <div className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-[#7755e8]" /><h3 className="font-extrabold text-[#1d1b33]">{competency}</h3></div>
                  <span className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase ${index === 0 ? "bg-[#fff0e7] text-[#b65015]" : "bg-[#efeaff] text-[#654bc9]"}`}>{index === 0 ? "Prioridade" : "Reforço"}</span>
                  <ul className="mt-4 space-y-3">
                    {materialsFor(competency).map((material) => (
                      <li key={material.url}>
                        <a href={material.url} target="_blank" rel="noopener noreferrer" className="group block rounded-xl bg-[#f7f5fa] p-3 hover:bg-[#f0ecfb]">
                          <p className="flex items-center gap-2 text-sm font-extrabold text-[#1d1b33]"><PlayCircle className="h-4 w-4 text-[#7755e8]" /> {material.title}<ExternalLink className="ml-auto h-3.5 w-3.5" /></p>
                          <p className="mt-1 text-xs font-semibold text-[#8b8593]">{material.type} · {material.duration}</p>
                        </a>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/dashboard/agente" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-gradient-to-r from-[#7755e8] to-[#e8641d] px-5 font-extrabold text-white"><RotateCcw className="h-4 w-4" /> Refazer entrevista</Link>
            <Link href="/dashboard/resultado" className="inline-flex min-h-11 items-center rounded-full border border-[#dcd7e6] bg-white px-5 font-extrabold text-[#1d1b33]">Rever diagnóstico</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
