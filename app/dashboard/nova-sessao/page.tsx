"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { ImageDropzone } from "@/components/ImageDropzone";
import { RequirementItem } from "@/components/RequirementItem";

export default function NovaSessao() {
  const router = useRouter();

  // a vaga pode chegar de dois jeitos (texto colado OU imagem) — por isso os
  // dois campos guardam estado: precisamos saber, na hora de enviar, se pelo
  // menos UM dos dois foi preenchido, já que o HTML não tem um jeito nativo
  // de dizer "esses dois campos são obrigatórios, mas só um dos dois"
  const [descricao, setDescricao] = useState("");
  const [imagem, setImagem] = useState<File | null>(null);
  const [vagaVazia, setVagaVazia] = useState(false);

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    if (descricao.trim() === "" && !imagem) {
      setVagaVazia(true);
      return;
    }
    setVagaVazia(false);

    // TODO: enviar nome da sessão + descrição/imagem pra IA extrair os requisitos
    // da vaga (seção 4.3) e comparar com o perfil salvo. Por enquanto só simula
    // que a sessão foi criada e leva direto pra tela de resultado
    router.push("/dashboard/resultado");
  }

  return (
    <div className="flex min-h-screen bg-[#eef0f3]">
      <Sidebar />

      <main className="flex-1 p-6 md:p-10">
        <span className="text-xs font-extrabold tracking-widest text-[#7755e8] uppercase">
          Treino por vaga
        </span>
        <h1 className="font-[family-name:var(--font-display)] mt-1 text-3xl md:text-4xl text-[#1d1b33]">
          Criar nova sessão
        </h1>
        <p className="mt-1 text-[#59567a]">
          Cada vaga vira uma sessão independente, sem misturar resultados.
        </p>

        <form onSubmit={handleSubmit} className="mx-auto mt-6 max-w-2xl rounded-2xl bg-white p-6 md:p-8">
          <div className="grid gap-5">
            <div className="grid gap-1.5">
              <label htmlFor="nome" className="text-sm font-extrabold text-[#1d1b33]">
                Nome da sessão <span className="text-[#e8641d]">*</span>
              </label>
              <input
                id="nome"
                required
                placeholder="Ex.: Frontend Pleno — Empresa X"
                className="w-full rounded-xl border-[1.5px] border-[#e4dfd3] bg-white px-4 py-3 text-[#1d1b33] placeholder:text-[#8b8593] focus:border-[#7755e8] focus:outline-none focus:ring-2 focus:ring-[#7755e8]/30"
              />
            </div>

            <div className="grid gap-1.5">
              <label htmlFor="descricao" className="text-sm font-extrabold text-[#1d1b33]">
                Descrição da vaga
              </label>
              <textarea
                id="descricao"
                rows={6}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Cole aqui a descrição completa da vaga"
                className="w-full resize-none rounded-xl border-[1.5px] border-[#e4dfd3] bg-white px-4 py-3 text-[#1d1b33] placeholder:text-[#8b8593] focus:border-[#7755e8] focus:outline-none focus:ring-2 focus:ring-[#7755e8]/30"
              />
            </div>

            <div className="grid gap-1.5">
              <label className="text-sm font-extrabold text-[#1d1b33]">
                Ou envie uma imagem da vaga{" "}
                <span className="text-xs font-semibold text-[#59567a]">opcional</span>
              </label>
              <ImageDropzone onFileChange={setImagem} />
            </div>

            {/* aviso só aparece depois de tentar enviar sem nenhum dos dois —
                não faz sentido acusar erro antes da pessoa sequer tentar */}
            {vagaVazia && (
              <ul className="grid gap-1 text-xs font-semibold">
                <RequirementItem met={false} label="Cole o texto da vaga ou envie uma imagem" />
              </ul>
            )}

            <div className="grid gap-1.5">
              <label htmlFor="especifico" className="text-sm font-extrabold text-[#1d1b33]">
                Algo específico que deseja treinar?{" "}
                <span className="text-xs font-semibold text-[#59567a]">opcional</span>
              </label>
              <input
                id="especifico"
                placeholder="Ex.: React, testes e SQL"
                className="w-full rounded-xl border-[1.5px] border-[#e4dfd3] bg-white px-4 py-3 text-[#1d1b33] placeholder:text-[#8b8593] focus:border-[#7755e8] focus:outline-none focus:ring-2 focus:ring-[#7755e8]/30"
              />
            </div>

            <button
              type="submit"
              className="mt-2 flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#7755e8] to-[#e8641d] px-6 font-extrabold text-white shadow-[0_14px_32px_-16px_rgba(119,85,232,0.75)] transition hover:-translate-y-0.5"
            >
              Analisar vaga e criar sessão →
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
