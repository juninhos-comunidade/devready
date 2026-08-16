import { CheckCircle2, CircleDashed, TrendingUp } from "lucide-react";
import type { CompetencyEvidence, EvidenceStatus } from "@/lib/preparation-journey";

const statusConfig: Record<EvidenceStatus, { label: string; className: string; icon: typeof CheckCircle2 }> = {
  demonstrated: { label: "Demonstrado", className: "bg-[#e7f7ef] text-[#247544]", icon: CheckCircle2 },
  developing: { label: "Em desenvolvimento", className: "bg-[#fff4e8] text-[#a65318]", icon: TrendingUp },
  "not-evidenced": { label: "Não evidenciado", className: "bg-[#f0eef4] text-[#686274]", icon: CircleDashed },
};

export function EvidenceMatrix({ items }: { items: CompetencyEvidence[] }) {
  return (
    <section className="rounded-3xl border border-[#e7e3ee] bg-white p-5 sm:p-6" aria-labelledby="evidence-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#8b8593]">Matriz de evidências</p>
          <h2 id="evidence-title" className="mt-1 text-xl font-extrabold text-[#1d1b33]">O que você já consegue demonstrar</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#6d698a]">Cada conclusão mostra a evidência utilizada e uma ação prática. Ausência de evidência não significa ausência de conhecimento.</p>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-[#ece9f1]">
        <ul className="divide-y divide-[#ece9f1]">
          {items.map((item) => {
            const config = statusConfig[item.status];
            const Icon = config.icon;
            return (
              <li key={item.competency} className="grid gap-3 p-4 lg:grid-cols-[180px_170px_1fr_1fr] lg:items-start">
                <div>
                  <p className="font-extrabold text-[#1d1b33]">{item.competency}</p>
                  <p className="mt-1 text-[11px] font-bold text-[#8b8593]">Confiança {item.confidence}</p>
                </div>
                <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${config.className}`}>
                  <Icon className="h-3.5 w-3.5" /> {config.label}
                </span>
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#8b8593]">Evidências</p>
                  <p className="mt-1 text-xs leading-relaxed text-[#5b5674]">{item.evidence.join(" · ")}</p>
                </div>
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#8b8593]">Próxima ação</p>
                  <p className="mt-1 text-xs leading-relaxed text-[#5b5674]">{item.nextAction}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
