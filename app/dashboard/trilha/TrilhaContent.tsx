"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Code2, ExternalLink, FileText, GraduationCap, ListChecks, PlayCircle } from "lucide-react";
import { getTrilhaForVaga, type TrilhaItem } from "@/lib/training/trilha";
import { BrandLoading } from "@/components/BrandLoading";
import { Mascot } from "@/components/Mascot";

const statusConfig = {
  ausente: { label: "Recomendação principal", badgeClass: "bg-[#fff0e7] text-[#e8641d]" },
  parcial: { label: "Reforço", badgeClass: "bg-[#efeaff] text-[#7755e8]" },
} as const;

const tipoIcon: Record<string, typeof FileText> = {
  Artigo: FileText,
  Curso: PlayCircle,
  Exercício: Code2,
};

function messageFor(item: TrilhaItem): string {
  if (item.status === "ausente") {
    return `Você acertou ${item.correct} de ${item.total} nessa competência. É o seu maior ganho possível antes da próxima entrevista.`;
  }
  return `Você já tem uma boa base (${item.correct} de ${item.total} corretas). Hora de aprofundar em pontos específicos.`;
}

type LoadState = "loading" | "empty" | "ready";

export function TrilhaContent({ vagaId }: { vagaId: string }) {
  const [items, setItems] = useState<TrilhaItem[]>([]);
  const [state, setState] = useState<LoadState>("loading");

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      getTrilhaForVaga(vagaId)
        .then((result) => {
          if (cancelled) return;
          setItems(result);
          setState(result.length === 0 ? "empty" : "ready");
        })
        .catch(() => {
          if (!cancelled) setState("empty");
        });
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [vagaId]);

  if (state === "loading") {
    return <BrandLoading label="Montando sua trilha personalizada..." />;
  }

  if (state === "empty") {
    return (
      <section className="mt-7 rounded-3xl border border-[#e7e3ee] bg-white p-7 text-center sm:p-10">
        <Mascot pose="coach" motion="float" className="mx-auto h-28 w-28" />
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#efeaff] text-[#7755e8]">
          <ListChecks className="h-8 w-8" />
        </span>
        <h2 className="mt-5 font-[family-name:var(--font-display)] text-2xl font-bold text-[#1d1b33]">Ainda não temos o que recomendar</h2>
        <p className="mx-auto mt-3 max-w-md leading-relaxed text-[#6d698a]">
          A trilha é montada a partir dos seus erros no treino. Faça o quiz, a resposta STAR, o desafio de código ou a entrevista simulada pra começar a receber recomendações.
        </p>
        <Link
          href="/dashboard/treino-vaga"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-gradient-to-r from-[#7755e8] to-[#e8641d] px-6 font-extrabold text-white"
        >
          Ir treinar
        </Link>
      </section>
    );
  }

  return (
    <div className="mt-7 grid gap-5">
      {items.map((item) => {
        const config = statusConfig[item.status as "ausente" | "parcial"];
        return (
          <section key={item.competency} className="rounded-3xl border border-[#e7e3ee] bg-white p-5 shadow-[0_18px_55px_-42px_rgba(29,27,51,0.45)] sm:p-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#eeeef4] text-[#1d1b33]">
                <GraduationCap className="h-4.5 w-4.5" />
              </span>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[#1d1b33]">{item.competencyLabel}</h2>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${config.badgeClass}`}>{config.label}</span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[#6d698a]">{messageFor(item)}</p>

            {item.materials.length === 0 ? (
              <p className="mt-4 text-xs font-semibold text-[#8b8593]">Ainda não temos material curado pra essa competência.</p>
            ) : (
              <ul className="mt-4 grid gap-3">
                {item.materials.map((material) => {
                  const Icon = tipoIcon[material.contentType] ?? FileText;
                  return (
                    <li key={material.url} className="flex items-center justify-between gap-4 rounded-2xl border border-[#ece9f1] p-4 transition hover:border-[#d7d0e8]">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#efeaff] text-[#7755e8]">
                          <Icon className="h-4.5 w-4.5" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-extrabold text-[#1d1b33]">{material.title}</p>
                          <p className="text-xs font-semibold text-[#8b8593]">{material.contentType}</p>
                        </div>
                      </div>
                      <a href={material.url} target="_blank" rel="noopener noreferrer" className="flex shrink-0 items-center gap-1.5 text-sm font-extrabold text-[#5d43c4] hover:underline">
                        Abrir material <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
