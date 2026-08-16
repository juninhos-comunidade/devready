import Link from "next/link";
import { BriefcaseBusiness, FileCheck2, GraduationCap } from "lucide-react";
import type { Prisma } from "@/app/generated/prisma/client";

type CurriculumAnalysisCardProps = {
  curriculum: { status: string; extractedData: Prisma.JsonValue | null } | null;
  demoMode?: boolean;
};

function stringList(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : [];
}

export function CurriculumAnalysisCard({ curriculum, demoMode = false }: CurriculumAnalysisCardProps) {
  const data = curriculum?.extractedData && typeof curriculum.extractedData === "object" && !Array.isArray(curriculum.extractedData)
    ? curriculum.extractedData as Record<string, unknown>
    : null;
  const skills = demoMode
    ? ["React", "TypeScript", "JavaScript", "Node.js", "APIs REST", "Testes", "SQL", "Docker"]
    : stringList(data?.skills).slice(0, 12);
  const experiences = demoMode ? 2 : Array.isArray(data?.experiences) ? data.experiences.length : 0;
  const education = demoMode ? 1 : Array.isArray(data?.formacao) ? data.formacao.length : 0;
  const certifications = demoMode ? 2 : Array.isArray(data?.certificacoes) ? data.certificacoes.length : 0;
  const completed = demoMode || (curriculum?.status === "COMPLETED" && data !== null);

  return (
    <section className="overflow-hidden rounded-3xl border border-[#e7e3ee] bg-white shadow-[0_18px_55px_-42px_rgba(29,27,51,0.45)]">
      <div className="bg-[#1d1b33] p-5 text-white sm:p-6">
        <span className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#aaa6d6]"><FileCheck2 className="h-4 w-4" /> Análise do currículo{demoMode ? " · demonstração" : ""}</span>
        <p className="mt-3 text-sm leading-relaxed text-[#d0cde0]">{demoMode ? "Perfil fictício preparado para apresentar o cruzamento de competências com segurança." : "Competências extraídas do PDF e usadas no cruzamento com cada vaga."}</p>
      </div>
      <div className="p-5 sm:p-6">
        {completed ? (
          <>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-[#f7f5fa] p-3"><p className="text-lg font-extrabold text-[#1d1b33]">{skills.length}</p><p className="text-[11px] font-semibold text-[#8b8593]">Competências</p></div>
              <div className="rounded-xl bg-[#f7f5fa] p-3"><p className="flex items-center gap-1 text-lg font-extrabold text-[#1d1b33]"><BriefcaseBusiness className="h-4 w-4" />{experiences}</p><p className="text-[11px] font-semibold text-[#8b8593]">Experiências</p></div>
              <div className="rounded-xl bg-[#f7f5fa] p-3"><p className="flex items-center gap-1 text-lg font-extrabold text-[#1d1b33]"><GraduationCap className="h-4 w-4" />{education + certifications}</p><p className="text-[11px] font-semibold text-[#8b8593]">Formações e certificados</p></div>
            </div>
            {skills.length > 0 ? <ul className="mt-4 flex flex-wrap gap-2">{skills.map((skill) => <li key={skill} className="rounded-full bg-[#ece8f8] px-3 py-1 text-xs font-extrabold text-[#654bc9]">{skill}</li>)}</ul> : <p className="mt-4 text-sm font-semibold text-[#6d698a]">Nenhuma competência explícita foi identificada no PDF.</p>}
            {!demoMode && <Link href="/dashboard/perfil" className="mt-5 inline-flex text-sm font-extrabold text-[#5d43c4] underline underline-offset-4">Atualizar currículo</Link>}
          </>
        ) : (
          <div>
            <p className="text-sm font-bold text-[#6d698a]">Envie um currículo legível para ativar a análise de competências.</p>
            <Link href="/dashboard/perfil" className="mt-4 inline-flex text-sm font-extrabold text-[#5d43c4] underline underline-offset-4">Ir para o perfil</Link>
          </div>
        )}
      </div>
    </section>
  );
}
