"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { FormSelect } from "@/components/FormSelect";
import { PdfDropzone } from "@/components/PdfDropzone";
import { RequirementItem } from "@/components/RequirementItem";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Check } from "lucide-react";

// Assim como no Dashboard, esses valores são só um exemplo pra gente ver a
// tela preenchida de verdade — quando o backend existir, isso vem do usuário
// logado (a mesma pessoa que preencheu o Cadastro), não de uma constante fixa.
const perfilMocado = {
  nome: "Isabela Duarte",
  email: "isabela.duarte@email.com",
  github: "https://github.com/isabeladuarte",
  curriculo: "curriculo-isabela-duarte.pdf",
  areaInteresse: "Frontend",
  nivelExperiencia: "Júnior",
};

export default function Perfil() {
  const router = useRouter();
  const [github, setGithub] = useState(perfilMocado.github);
  const [saved, setSaved] = useState(false);
  // controla só se o popup de "tem certeza?" está aberto — o popup em si
  // não sabe nada sobre "conta", ele só avisa quando foi confirmado ou cancelado
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const githubTouched = github.length > 0;
  const isValidGithubUrl = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/?$/i.test(github);

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO: enviar os campos atualizados pro backend (Prisma/Better Auth) e,
    // se o currículo tiver sido trocado, disparar de novo a análise de perfil
    // (seção 4.2 dos requisitos: refazer a análise quando o PDF ou o GitHub mudam)
    setSaved(true);
  }

  function handleDeleteAccount() {
    // TODO: chamar o Better Auth/Prisma pra apagar de verdade a conta e os
    // dados associados (currículo, análises, sessões), como pede a seção 5
    // (privacidade) dos requisitos. Por enquanto só fecha o popup e manda
    // a pessoa de volta pro login, simulando a saída da conta excluída
    setConfirmingDelete(false);
    router.push("/login");
  }

  return (
    <div className="flex min-h-screen bg-[#eef0f3]">
      <Sidebar />

      <main className="flex-1 p-6 md:p-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold tracking-widest text-[#7755e8] uppercase">
              Meu perfil
            </span>
            <h1 className="font-[family-name:var(--font-display)] mt-1 text-3xl md:text-4xl text-[#1d1b33]">
              Seus dados
            </h1>
            <p className="mt-1 text-[#59567a]">
              Essas informações alimentam a análise de perfil e todas as suas
              sessões de treino.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 lg:col-span-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#8b8593]">
              Conta
            </span>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <label htmlFor="nome" className="text-sm font-extrabold text-[#1d1b33]">
                  Nome
                </label>
                <input
                  id="nome"
                  defaultValue={perfilMocado.nome}
                  className="w-full rounded-xl border-[1.5px] border-[#e4dfd3] bg-white px-4 py-3 text-[#1d1b33] focus:border-[#7755e8] focus:outline-none focus:ring-2 focus:ring-[#7755e8]/30"
                />
              </div>

              <div className="grid gap-1.5">
                <label htmlFor="email" className="text-sm font-extrabold text-[#1d1b33]">
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  defaultValue={perfilMocado.email}
                  className="w-full rounded-xl border-[1.5px] border-[#e4dfd3] bg-white px-4 py-3 text-[#1d1b33] focus:border-[#7755e8] focus:outline-none focus:ring-2 focus:ring-[#7755e8]/30"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#8b8593]">
              Perfil técnico
            </span>

            <div className="mt-4 grid gap-4">
              <div className="grid gap-1.5">
                <label htmlFor="github" className="text-sm font-extrabold text-[#1d1b33]">
                  GitHub{" "}
                  <span className="text-xs font-semibold text-[#59567a]">(opcional)</span>
                </label>
                <input
                  id="github"
                  type="url"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="https://github.com/seu-usuario"
                  className="w-full rounded-xl border-[1.5px] border-[#e4dfd3] bg-white px-4 py-3 text-[#1d1b33] placeholder:text-[#8b8593] focus:border-[#7755e8] focus:outline-none focus:ring-2 focus:ring-[#7755e8]/30"
                />
                {githubTouched && !isValidGithubUrl && (
                  <ul className="mt-0.5 grid gap-1 text-xs font-semibold">
                    <RequirementItem met={false} label="Isso não parece um link válido do GitHub" />
                  </ul>
                )}
              </div>

              <div className="grid gap-1.5">
                <label className="text-sm font-extrabold text-[#1d1b33]">
                  Currículo em PDF
                </label>
                {/* sem `required` aqui — diferente do Cadastro, trocar o currículo
                    no Perfil é opcional, a pessoa já tem um enviado */}
                <PdfDropzone initialFileName={perfilMocado.curriculo} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#8b8593]">
              Preferências
            </span>

            <div className="mt-4 grid gap-4">
              <div className="grid gap-1.5">
                <label htmlFor="interesse" className="text-sm font-extrabold text-[#1d1b33]">
                  Área de interesse
                </label>
                <FormSelect
                  id="interesse"
                  placeholder="Selecione sua área..."
                  options={["Frontend", "Backend", "Mobile", "Dados"]}
                  defaultValue={perfilMocado.areaInteresse}
                />
              </div>

              <div className="grid gap-1.5">
                <label htmlFor="nivel" className="text-sm font-extrabold text-[#1d1b33]">
                  Nível de experiência
                </label>
                <FormSelect
                  id="nivel"
                  placeholder="Onde você está hoje?"
                  options={["Estudante", "Estagiário", "Júnior", "Pretendendo migrar de carreira"]}
                  defaultValue={perfilMocado.nivelExperiencia}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 lg:col-span-2">
            <button
              type="submit"
              className="flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-[#7755e8] px-6 font-extrabold text-white shadow-[0_14px_32px_-16px_rgba(119,85,232,0.75)] transition hover:-translate-y-0.5 hover:bg-[#6647d1]"
            >
              Salvar alterações
            </button>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm font-bold text-[#1f9d55]">
                <Check className="h-4 w-4" strokeWidth={3} />
                Alterações salvas
              </span>
            )}
          </div>
        </form>

        {/* exclusão de conta é um requisito de privacidade (seção 5), não só um
            botão a mais — por isso fica separada visualmente do resto do form */}
        <div className="mt-5 rounded-2xl border-[1.5px] border-[#f3d9d9] bg-white p-6">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#c23b3b]">
            Zona de risco
          </span>
          <p className="mt-2 text-sm text-[#59567a]">
            Excluir sua conta remove permanentemente seu currículo, suas
            análises e todas as suas sessões de treino.
          </p>
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="mt-4 rounded-full border-[1.5px] border-[#c23b3b] px-5 py-2.5 text-sm font-extrabold text-[#c23b3b] transition hover:bg-[#fdf2f2]"
          >
            Excluir minha conta
          </button>
        </div>

        <ConfirmDialog
          open={confirmingDelete}
          title="Excluir sua conta?"
          description="Essa ação não pode ser desfeita. Seu currículo, suas análises e todas as suas sessões de treino serão apagados permanentemente."
          confirmLabel="Sim, excluir conta"
          onConfirm={handleDeleteAccount}
          onCancel={() => setConfirmingDelete(false)}
        />
      </main>
    </div>
  );
}
