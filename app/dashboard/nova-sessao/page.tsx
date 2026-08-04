"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { ImageDropzone } from "@/components/ImageDropzone";
import { FormSelect } from "@/components/FormSelect";
import { MOCK_SESSION_KEY, type MockSession } from "@/lib/mock-session";

const focusOptions = [
  "Entrevista completa",
  "Conhecimentos técnicos",
  "Perguntas comportamentais",
  "Desafio prático",
  "Comunicação e apresentação",
];

export default function NovaSessao() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [focus, setFocus] = useState("Entrevista completa");
  const [image, setImage] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (!description.trim() && !image) {
      setErrorMessage("Cole a descrição da vaga ou adicione um print para continuar.");
      return;
    }

    setIsAnalyzing(true);
    const session: MockSession = {
      name: name.trim(),
      company: company.trim() || "Empresa não informada",
      description: description.trim() || "Vaga enviada por imagem com foco em desenvolvimento, APIs, testes e trabalho em equipe.",
      focus,
      source: image ? "image" : "text",
    };

    window.sessionStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(session));
    await new Promise((resolve) => window.setTimeout(resolve, 700));
    router.push("/dashboard/resultado");
  }

  return (
    <div className="flex min-h-screen bg-[#f4f3f8]">
      <Sidebar />
      <main className="min-w-0 flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:py-8">
        <div className="mx-auto max-w-5xl">
          <header>
            <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#7755e8]">Treino por vaga</span>
            <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold text-[#1d1b33] sm:text-4xl">Analisar uma nova vaga</h1>
            <p className="mt-2 max-w-2xl leading-relaxed text-[#6d698a]">Informe os requisitos para comparar a vaga ao seu perfil técnico.</p>
          </header>

          <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_300px]">
            <form onSubmit={handleSubmit} className="rounded-3xl border border-[#e7e3ee] bg-white p-5 shadow-[0_20px_60px_-45px_rgba(29,27,51,0.5)] sm:p-7">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <label htmlFor="session-name" className="text-sm font-extrabold text-[#1d1b33]">Nome da sessão <span className="text-[#e8641d]">*</span></label>
                  <input id="session-name" required value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Frontend Júnior" className="rounded-xl border-[1.5px] border-[#e4dfd3] px-4 py-3 focus:border-[#7755e8] focus:outline-none focus:ring-2 focus:ring-[#7755e8]/25" />
                </div>
                <div className="grid gap-1.5">
                  <label htmlFor="company" className="text-sm font-extrabold text-[#1d1b33]">Empresa <span className="text-xs font-semibold text-[#8b8593]">(opcional)</span></label>
                  <input id="company" value={company} onChange={(event) => setCompany(event.target.value)} placeholder="Ex.: Empresa Aurora" className="rounded-xl border-[1.5px] border-[#e4dfd3] px-4 py-3 focus:border-[#7755e8] focus:outline-none focus:ring-2 focus:ring-[#7755e8]/25" />
                </div>
              </div>

              <div className="mt-5 grid gap-1.5">
                <label htmlFor="description" className="text-sm font-extrabold text-[#1d1b33]">Descrição da vaga</label>
                <textarea id="description" rows={8} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Cole aqui responsabilidades, requisitos e diferenciais da vaga..." className="resize-y rounded-xl border-[1.5px] border-[#e4dfd3] px-4 py-3 leading-relaxed focus:border-[#7755e8] focus:outline-none focus:ring-2 focus:ring-[#7755e8]/25" />
                <div className="text-right text-xs font-semibold text-[#8b8593]">{description.length} caracteres</div>
              </div>

              <div className="my-5 flex items-center gap-3" aria-hidden="true"><span className="h-px flex-1 bg-[#ece9f1]" /><span className="text-[10px] font-extrabold uppercase tracking-widest text-[#8b8593]">ou envie um print</span><span className="h-px flex-1 bg-[#ece9f1]" /></div>
              <ImageDropzone onFileChange={setImage} />

              <div className="mt-5 grid gap-1.5">
                <label htmlFor="focus" className="text-sm font-extrabold text-[#1d1b33]">O que você quer priorizar?</label>
                <FormSelect id="focus" placeholder="Escolha um foco" options={focusOptions} value={focus} onChange={(event) => setFocus(event.target.value)} />
              </div>

              {errorMessage && <p role="alert" className="mt-5 rounded-xl bg-[#fdf2f2] px-4 py-3 text-sm font-bold text-[#a83030]">{errorMessage}</p>}

              <button type="submit" disabled={isAnalyzing} className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#7755e8] to-[#e8641d] px-6 font-extrabold text-white shadow-[0_16px_35px_-18px_rgba(119,85,232,0.8)] transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-65">
                {isAnalyzing ? <><Sparkles className="h-4 w-4 animate-pulse" /> Analisando requisitos...</> : <>Analisar vaga <ArrowRight className="h-4 w-4" /></>}
              </button>
            </form>

            <aside className="space-y-4">
              <div className="rounded-2xl bg-[#17172f] p-5 text-white">
                <Sparkles className="h-5 w-5 text-[#d1c8ff]" />
                <h2 className="mt-3 font-extrabold">Análise da sessão</h2>
                <ol className="mt-3 space-y-3 text-sm leading-relaxed text-[#c2bfd7]">
                  <li className="flex gap-2"><span className="font-extrabold text-[#e8641d]">1.</span> Identificamos as tecnologias da vaga.</li>
                  <li className="flex gap-2"><span className="font-extrabold text-[#e8641d]">2.</span> Cruzamos os requisitos com seu perfil.</li>
                  <li className="flex gap-2"><span className="font-extrabold text-[#e8641d]">3.</span> Priorizamos as principais lacunas.</li>
                </ol>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
