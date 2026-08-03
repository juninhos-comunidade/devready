"use client";

import { useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";

// Mesma lógica do Dashboard: dado mocado só pra tela não ficar vazia. Aqui
// especificamente é o resultado de UMA sessão (a vaga "Frontend Pleno —
// Empresa X"), diferente do Dashboard, que mostra a média de todas as sessões.
const compatibilidade = [
  { nome: "React", porcentagem: 88, testado: true },
  { nome: "TypeScript", porcentagem: 74, testado: true },
  { nome: "Jest", porcentagem: 38, testado: true },
  { nome: "SQL", porcentagem: null, testado: false },
];

const proximaAcao = [
  {
    badge: "Prioridade alta",
    titulo: "Treinar testes automatizados",
    descricao: "Lacuna explícita na vaga",
  },
  {
    badge: "Validar",
    titulo: "Fazer diagnóstico de SQL",
    descricao: "Ainda não testado",
  },
];

const descricaoVagaOriginal = `Vaga para Frontend Pleno na Empresa X. Buscamos alguém com sólida experiência em React e TypeScript, que já tenha trabalhado com testes automatizados (Jest). Conhecimento em SQL é um diferencial.`;

export default function Resultado() {
  // a tela de Nova Sessão (onde a vaga foi originalmente colada) vive numa
  // branch separada, ainda não mesclada — por isso a edição acontece aqui
  // mesmo, sem depender de navegar pra outra tela. Isso também bate com o
  // requisito 4.3: "substituir o texto da vaga na mesma sessão"
  const [editando, setEditando] = useState(false);
  const [descricaoVaga, setDescricaoVaga] = useState(descricaoVagaOriginal);

  function handleSalvarEdicao(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO: reenviar a descrição atualizada pra IA reprocessar a análise
    // (seção 4.3: "o sistema reprocessa a análise automaticamente") e
    // atualizar o percentual/lista de compatibilidade com o resultado novo
    setEditando(false);
  }

  return (
    <div className="flex min-h-screen bg-[#eef0f3]">
      <Sidebar />

      <main className="flex-1 p-6 md:p-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold tracking-widest text-[#7755e8] uppercase">
              Resultado da sessão
            </span>
            <h1 className="font-[family-name:var(--font-display)] mt-1 text-3xl md:text-4xl text-[#1d1b33]">
              Frontend Pleno — Empresa X
            </h1>
            <p className="mt-1 text-[#59567a]">
              Comparação entre os requisitos da vaga e seu perfil atual.
            </p>
          </div>

          {!editando && (
            <button
              type="button"
              onClick={() => setEditando(true)}
              className="rounded-full border-[1.5px] border-[#e4dfd3] bg-white px-5 py-2.5 text-sm font-extrabold text-[#1d1b33] transition hover:border-[#7755e8]"
            >
              Editar vaga
            </button>
          )}
        </div>

        {editando ? (
          <form
            onSubmit={handleSalvarEdicao}
            className="mt-6 rounded-2xl bg-white p-6 md:p-8"
          >
            <label htmlFor="descricao-vaga" className="text-sm font-extrabold text-[#1d1b33]">
              Descrição da vaga
            </label>
            <textarea
              id="descricao-vaga"
              rows={6}
              value={descricaoVaga}
              onChange={(e) => setDescricaoVaga(e.target.value)}
              className="mt-1.5 w-full resize-none rounded-xl border-[1.5px] border-[#e4dfd3] bg-white px-4 py-3 text-[#1d1b33] focus:border-[#7755e8] focus:outline-none focus:ring-2 focus:ring-[#7755e8]/30"
            />
            <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  setDescricaoVaga(descricaoVagaOriginal);
                  setEditando(false);
                }}
                className="flex-1 rounded-full border-[1.5px] border-[#e4dfd3] px-5 py-2.5 font-extrabold text-[#1d1b33] transition hover:border-[#7755e8] sm:flex-none"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 rounded-full bg-gradient-to-r from-[#7755e8] to-[#e8641d] px-6 py-2.5 font-extrabold text-white shadow-[0_14px_32px_-16px_rgba(119,85,232,0.75)] transition hover:-translate-y-0.5 sm:flex-none"
              >
                Salvar e reanalisar
              </button>
            </div>
          </form>
        ) : (
          <div className="relative mt-6 overflow-hidden rounded-2xl bg-gradient-to-r from-[#7755e8] to-[#e8641d] p-8 text-white">
            <div className="pointer-events-none absolute -right-8 -top-10 h-48 w-48 rounded-full border border-white/20" />
            <div className="relative flex flex-wrap items-center justify-between gap-6">
              <div className="max-w-lg">
                <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold md:text-3xl">
                  Boa compatibilidade, com lacunas claras.
                </h2>
                <p className="mt-2 text-white/85">
                  Você já cobre os principais requisitos de React. Priorize
                  testes e SQL antes da entrevista.
                </p>
              </div>
              <div className="text-right">
                <div className="font-[family-name:var(--font-display)] text-5xl font-extrabold">
                  78%
                </div>
                <div className="mt-1 text-xs font-extrabold uppercase tracking-widest text-white/80">
                  Compatibilidade
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 grid gap-5 md:grid-cols-[1.3fr_1fr]">
          <div className="rounded-2xl bg-white p-6">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#8b8593]">
              Compatibilidade por tecnologia
            </span>

            <ul className="mt-4 grid gap-4">
              {compatibilidade.map(({ nome, porcentagem, testado }) => (
                <li key={nome} className="flex items-center gap-4">
                  <div className="flex w-32 shrink-0 items-center gap-2">
                    <span className="font-bold text-[#1d1b33]">{nome}</span>
                    {!testado && (
                      <span className="whitespace-nowrap rounded-full bg-[#eef0f3] px-2 py-0.5 text-[10px] font-bold uppercase text-[#8b8593]">
                        não testado
                      </span>
                    )}
                  </div>
                  <div className="h-2 flex-1 rounded-full bg-[#eef0f3]">
                    {testado && (
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-[#7755e8] to-[#e8641d]"
                        style={{ width: `${porcentagem}%` }}
                      />
                    )}
                  </div>
                  <span className="w-10 text-right font-bold text-[#1d1b33]">
                    {testado ? `${porcentagem}%` : "–"}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col rounded-2xl bg-white p-6">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#8b8593]">
              Próxima ação
            </span>

            {/* cada lacuna leva pra Trilha de Estudo (seção 4.5), que consolida
                todas as lacunas dessa sessão numa trilha só */}
            <ul className="mt-4 grid divide-y divide-[#eef0f3]">
              {proximaAcao.map(({ badge, titulo, descricao }) => (
                <li key={titulo} className="py-3 first:pt-0 last:pb-0">
                  <Link href="/dashboard/trilha" className="block">
                    <span className="inline-block rounded-full bg-[#eef0f3] px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-[#8b8593]">
                      {badge}
                    </span>
                    <p className="mt-1.5 font-bold text-[#1d1b33] hover:text-[#5d43c4]">{titulo}</p>
                    <p className="text-sm text-[#8b8593]">{descricao}</p>
                  </Link>
                </li>
              ))}
            </ul>

            {/* TODO: "Modalidades de treino" (quiz, desafio de código, perguntas
                comportamentais — seção 4.4) ainda não existe como tela. Por
                enquanto o link só aponta pra rota prevista, que dá 404 */}
            <Link
              href="/dashboard/resultado/treino"
              className="mt-4 flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#7755e8] to-[#e8641d] px-6 font-extrabold text-white shadow-[0_14px_32px_-16px_rgba(119,85,232,0.75)] transition hover:-translate-y-0.5"
            >
              Começar treino →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
