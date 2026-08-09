import { Sparkles } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { TrilhaContent } from "./TrilhaContent";

// Página em si é um Server Component só de "casca" — quem busca os dados
// de verdade é o TrilhaContent (client component), porque ele precisa ler
// os ids de TrainingSession guardados no navegador (sessionStorage) pra
// saber quais respostas dessa pessoa consultar no banco. Ver
// lib/training/client-sessions.ts e lib/training/trilha.ts.
export default function TrilhaDeEstudo() {
  return (
    <div className="flex min-h-screen bg-[#f4f3f8]">
      <Sidebar />

      <main className="min-w-0 flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:py-8 xl:px-10">
        <div className="mx-auto max-w-[1440px]">
          <header>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#7755e8]">
              Trilha de estudo
            </p>
            <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold text-[#1d1b33] sm:text-4xl">
              O que estudar pra fechar suas lacunas
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#6d698a] sm:text-base">
              Montada a partir do seu desempenho nas questões de treino —
              quanto mais você pratica, mais precisa ela fica.
            </p>
          </header>

          <TrilhaContent />

          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#e7e3ee] bg-white p-5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#e7f7ef] text-[#1f9d73]">
              <Sparkles className="h-4.5 w-4.5" />
            </span>
            <p className="text-sm leading-relaxed text-[#6d698a]">
              Essa trilha reúne os erros das suas questões de treino num
              lugar só — conforme você pratica mais, ela é recalculada
              automaticamente.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
