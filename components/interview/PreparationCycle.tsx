import { CalendarDays, CheckCircle2 } from "lucide-react";
import type { PreparationPlan } from "@/lib/preparation-journey";

export function PreparationCycle({ plan, onToggleTask }: { plan: PreparationPlan; onToggleTask: (taskId: string) => void }) {
  const completedTasks = plan.tasks.filter((task) => task.completed).length;
  const progress = Math.round((completedTasks / plan.tasks.length) * 100);
  const createdDate = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(plan.createdAt));

  return (
    <section aria-labelledby="preparation-plan-title" className="rounded-2xl border border-[#e7e3ee] bg-white p-5 text-left">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 font-extrabold text-[#1d1b33]"><CalendarDays className="h-4 w-4 text-[#7755e8]" /><span id="preparation-plan-title">Ciclo de preparação · 7 dias</span></p>
          <p className="mt-1 text-xs leading-relaxed text-[#6d698a]">Foco em {plan.priority} · iniciado em {createdDate}</p>
        </div>
        <span className="rounded-full bg-[#f0ecff] px-3 py-1 text-xs font-extrabold text-[#654bc9]">{completedTasks} de {plan.tasks.length} etapas</span>
      </div>
      <div className="mt-4" aria-label={`${progress}% do plano concluído`}>
        <div className="h-2 overflow-hidden rounded-full bg-[#ece9f1]"><div className="h-full rounded-full bg-gradient-to-r from-[#7755e8] to-[#e8641d] transition-all" style={{ width: `${progress}%` }} /></div>
        <p className="mt-2 text-right text-xs font-bold text-[#6d698a]">{progress}% concluído</p>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {plan.tasks.map((task) => (
          <label key={task.id} className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition ${task.completed ? "border-[#bfe5cf] bg-[#edf8f1]" : "border-[#e7e3ee] bg-[#f7f5fa] hover:border-[#c8bdeb]"}`}>
            <input type="checkbox" checked={task.completed} onChange={() => onToggleTask(task.id)} className="mt-0.5 h-5 w-5 shrink-0 accent-[#7755e8]" />
            <span><span className={`block text-xs font-extrabold ${task.completed ? "text-[#247544]" : "text-[#7755e8]"}`}>{task.period}</span><span className={`mt-1 block text-sm leading-relaxed ${task.completed ? "text-[#52705e] line-through" : "text-[#514c6a]"}`}>{task.action}</span></span>
          </label>
        ))}
      </div>
      {progress === 100 && <p role="status" className="mt-4 flex items-center gap-2 rounded-xl bg-[#edf8f1] px-4 py-3 text-sm font-extrabold text-[#247544]"><CheckCircle2 className="h-4 w-4" /> Ciclo concluído. Você já pode refazer a entrevista e comparar sua evolução.</p>}
    </section>
  );
}
