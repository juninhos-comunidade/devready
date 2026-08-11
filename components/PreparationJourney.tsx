import Link from "next/link";
import { Check, ChevronRight } from "lucide-react";
import { journeyStages, type JourneyStage } from "@/lib/preparation-journey";

export function PreparationJourney({
  current,
  sessionName,
}: {
  current: JourneyStage;
  sessionName?: string;
}) {
  const currentIndex = journeyStages.findIndex((stage) => stage.id === current);

  return (
    <section className="mt-6 rounded-2xl border border-[#e2ddeb] bg-white px-4 py-4 sm:px-5" aria-label="Etapas da preparação">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#7755e8]">Preparação ativa</p>
          <p className="mt-0.5 text-sm font-extrabold text-[#1d1b33]">{sessionName || "Sua próxima oportunidade"}</p>
        </div>
        <p className="text-xs font-bold text-[#6d698a]">Etapa {currentIndex + 1} de {journeyStages.length}</p>
      </div>

      <ol className="mt-4 grid grid-cols-5 gap-1" aria-label="Progresso da preparação">
        {journeyStages.map((stage, index) => {
          const completed = index < currentIndex;
          const active = index === currentIndex;
          return (
            <li key={stage.id} className="min-w-0">
              <Link
                href={stage.href}
                aria-current={active ? "step" : undefined}
                className={`group flex min-h-12 items-center justify-center gap-1 rounded-xl px-1.5 text-center text-[10px] font-extrabold transition sm:text-xs ${active ? "bg-[#7755e8] text-white" : completed ? "bg-[#edf8f1] text-[#247544]" : "bg-[#f4f2f7] text-[#6d698a] hover:bg-[#eee9fa]"}`}
              >
                {completed ? <Check className="hidden h-3.5 w-3.5 sm:block" /> : index > 0 ? <ChevronRight className="hidden h-3 w-3 sm:block" /> : null}
                <span className="truncate">{stage.label}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
