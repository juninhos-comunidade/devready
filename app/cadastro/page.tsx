"use client";

import { useState } from "react";
import Link from "next/link";

function StepDots({ step }: { step: 1 | 2 }) {
  // aria-label descreve o passo pra leitor de tela, já que a info aqui é 100% visual (bolinhas/cores)
  return (
    <div className="flex items-center gap-2" aria-label={`Passo ${step} de 2`}>
      <span className="h-2.5 w-2.5 rounded-full bg-[#7755e8]" />
      <span
        className={`h-[2px] w-8 ${step === 2 ? "bg-[#7755e8]" : "bg-[#e4dfd3]"}`}
      />
      <span
        className={`h-2.5 w-2.5 rounded-full ${
          step === 2 ? "bg-[#7755e8]" : "border-2 border-[#e4dfd3]"
        }`}
      />
    </div>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a20.3 20.3 0 0 1 5.06-5.94M9.9 4.24A10.4 10.4 0 0 1 12 4c7 0 11 8 11 8a20.3 20.3 0 0 1-3.22 4.44M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <path d="M1 1l22 22" />
    </svg>
  );
}

function RequirementItem({ met, label }: { met: boolean; label: string }) {
  return (
    <li
      className={`flex items-center gap-1.5 ${
        met ? "text-[#1f9d55]" : "text-[#c23b3b]"
      }`}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        {met ? <path d="M20 6 9 17l-5-5" /> : <path d="M18 6 6 18M6 6l12 12" />}
      </svg>
      {label}
    </li>
  );
}

function ChevronIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8b8593]"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

// select nativo (sem lib) estilizado igual aos inputs de texto — `invalid:` pega a opção
// placeholder (value="") enquanto ela estiver selecionada, simulando um placeholder cinza
function FormSelect({
  id,
  required,
  placeholder,
  options,
}: {
  id: string;
  required?: boolean;
  placeholder: string;
  options: string[];
}) {
  return (
    <div className="relative">
      <select
        id={id}
        required={required}
        defaultValue=""
        className="w-full appearance-none rounded-xl border-[1.5px] border-[#e4dfd3] bg-white px-4 py-3 pr-10 text-[#1d1b33] invalid:text-[#8b8593] focus:border-[#7755e8] focus:outline-none focus:ring-2 focus:ring-[#7755e8]/30"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronIcon />
    </div>
  );
}

export default function Cadastro() {
  const [step, setStep] = useState<1 | 2>(1);

  const [fileName, setFileName] = useState(
    "Arraste o PDF ou clique para selecionar"
  );
  const [fileError, setFileError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [github, setGithub] = useState("");

  // formato bem permissivo: só precisa começar com o domínio do github.com
  const githubTouched = github.length > 0;
  const isValidGithubUrl = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/?$/i.test(github);

  const hasMinLength = password.length >= 8;
  // regex conta qualquer char fora de A-Z/a-z/0-9 como "especial" — cobre a regra
  // de senha do documento de requisitos (8+ caracteres, 2 especiais) sem whitelist manual
  const specialCharCount = (password.match(/[^A-Za-z0-9]/g) ?? []).length;
  const hasSpecialChars = specialCharCount >= 2;
  // só mostra "senhas não coincidem" depois que o usuário começa a digitar no campo,
  // pra não acusar erro num campo que ele ainda nem tocou
  const confirmTouched = confirm.length > 0;
  const passwordsMatch = confirmTouched && confirm === password;

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // accept="application/pdf" só filtra o seletor do SO, não impede o usuário de
    // escolher "todos os arquivos" e mandar outra coisa — por isso o check aqui também
    if (file.type !== "application/pdf") {
      setFileError(true);
      setFileName("Arraste o PDF ou clique para selecionar");
      e.target.value = ""; // limpa o input pra permitir reselecionar o mesmo arquivo depois de corrigir
      return;
    }

    setFileError(false);
    setFileName(file.name);
  }

  // form único controla os 2 passos por estado local — evita ter que persistir os
  // dados do passo 1 em algum lugar (localStorage, rota separada) antes de existir backend
  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
      return;
    }
    // TODO: envio final do cadastro (nome, e-mail, senha, github, pdf, área, nível)
    // quando a integração com o Better Auth/Prisma estiver pronta
  }

  return (
    <main
      className="min-h-screen grid place-items-center p-4 md:p-8"
      style={{
        backgroundImage:
          "radial-gradient(circle at 10% 10%, rgba(119,85,232,0.25), transparent 30%), radial-gradient(circle at 90% 90%, rgba(232,100,29,0.18), transparent 32%)",
        backgroundColor: "#0d0e24",
      }}
    >
      <section className="w-full max-w-[1080px] grid grid-cols-1 overflow-hidden rounded-2xl border border-[#a7a2d9]/20 bg-[#f7f5f1] shadow-2xl sm:rounded-3xl md:min-h-[650px] md:grid-cols-[0.82fr_1.18fr]">
        <aside
          className="relative flex flex-col justify-between p-8 md:p-11 text-[#f7f5f1] overflow-hidden"
          style={{
            backgroundImage:
              "radial-gradient(120% 120% at 0 0, rgba(119,85,232,0.6), transparent 55%), radial-gradient(120% 120% at 100% 100%, rgba(232,100,29,0.42), transparent 55%)",
            backgroundColor: "#151632",
          }}
        >
          <span className="font-[family-name:var(--font-display)] text-lg font-extrabold tracking-tight">
            {"</>"} DevReady
          </span>

          <div>
            <h1 className="font-[family-name:var(--font-display)] max-w-[420px] text-3xl md:text-5xl leading-[1.02] font-semibold">
              Seu diagnóstico começa com um perfil único.
            </h1>
            <p className="mt-4 max-w-[380px] text-[#aaa6d6] leading-relaxed">
              Seu perfil evolui com você. A gente te ajuda a traçar o melhor
              caminho para a sua vaga.
            </p>
          </div>

          <StepDots step={step} />
        </aside>

        <div className="grid place-items-center p-6 md:p-12">
          <form className="w-full max-w-[460px]" onSubmit={handleSubmit}>
            {step === 1 ? (
              // key força o React a desmontar/remontar ao trocar de passo — sem isso, os
              // inputs (mesma posição na árvore, mesmo tipo) eram reaproveitados entre os
              // passos e o valor digitado em "Nome" vazava pro campo de GitHub do passo 2
              <div key="step-1">
                <h2 className="font-[family-name:var(--font-display)] mt-3 mb-1 text-2xl md:text-4xl text-[#1d1b33]">
                  Crie sua conta
                </h2>
                <p className="mb-7 text-[#59567a] leading-relaxed">
                  Comece com suas informações de acesso.
                </p>

                <div className="grid gap-5 sm:gap-4">
                  <div className="grid gap-1.5">
                    <label htmlFor="name" className="text-sm font-extrabold text-[#1d1b33]">
                      Nome <span className="text-[#e8641d]">*</span>
                    </label>
                    <input
                      id="name"
                      required
                      placeholder="Como podemos te chamar?"
                      className="w-full rounded-xl border-[1.5px] border-[#e4dfd3] bg-white px-4 py-3 text-[#1d1b33] placeholder:text-[#8b8593] focus:border-[#7755e8] focus:outline-none focus:ring-2 focus:ring-[#7755e8]/30"
                    />
                  </div>

                  <div className="grid gap-1.5">
                    <label htmlFor="email" className="text-sm font-extrabold text-[#1d1b33]">
                      E-mail <span className="text-[#e8641d]">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      placeholder="ex: maria.silva@email.com"
                      className="w-full rounded-xl border-[1.5px] border-[#e4dfd3] bg-white px-4 py-3 text-[#1d1b33] placeholder:text-[#8b8593] focus:border-[#7755e8] focus:outline-none focus:ring-2 focus:ring-[#7755e8]/30"
                    />
                  </div>

                  <div className="grid gap-1.5">
                    <label htmlFor="password" className="text-sm font-extrabold text-[#1d1b33]">
                      Senha <span className="text-[#e8641d]">*</span>
                    </label>
                    <div className="relative">
                      {/* controlado (value + onChange) pra alimentar o checklist de requisitos
                          em tempo real logo abaixo, os outros campos do form são uncontrolled */}
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-xl border-[1.5px] border-[#e4dfd3] bg-white px-4 py-3 pr-11 text-[#1d1b33] placeholder:text-[#8b8593] focus:border-[#7755e8] focus:outline-none focus:ring-2 focus:ring-[#7755e8]/30"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-[#8b8593] hover:text-[#7755e8]"
                      >
                        <EyeIcon open={showPassword} />
                      </button>
                    </div>
                    <ul className="mt-0.5 grid gap-1 text-xs font-semibold">
                      <RequirementItem met={hasMinLength} label="Mínimo de 8 caracteres" />
                      <RequirementItem met={hasSpecialChars} label="2 caracteres especiais" />
                    </ul>
                  </div>

                  <div className="grid gap-1.5">
                    <label htmlFor="confirm" className="text-sm font-extrabold text-[#1d1b33]">
                      Confirmar senha <span className="text-[#e8641d]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="confirm"
                        type={showConfirm ? "text" : "password"}
                        required
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-xl border-[1.5px] border-[#e4dfd3] bg-white px-4 py-3 pr-11 text-[#1d1b33] placeholder:text-[#8b8593] focus:border-[#7755e8] focus:outline-none focus:ring-2 focus:ring-[#7755e8]/30"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        aria-label={showConfirm ? "Ocultar senha" : "Mostrar senha"}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-[#8b8593] hover:text-[#7755e8]"
                      >
                        <EyeIcon open={showConfirm} />
                      </button>
                    </div>
                    {confirmTouched && (
                      <ul className="mt-0.5 grid gap-1 text-xs font-semibold">
                        <RequirementItem
                          met={passwordsMatch}
                          label={passwordsMatch ? "Senhas coincidem" : "As senhas não coincidem"}
                        />
                      </ul>
                    )}
                  </div>

                  <label className="flex items-start gap-2.5 text-sm text-[#59567a] leading-relaxed">
                    <input type="checkbox" required className="mt-1" />
                    <span>
                      Autorizo o uso do currículo e do GitHub para gerar meu
                      diagnóstico, conforme a{" "}
                      <Link
                        href="/politica-de-privacidade"
                        className="font-extrabold text-[#443388] underline underline-offset-2"
                      >
                        política de privacidade
                      </Link>
                      . <span className="text-[#e8641d]">*</span>
                    </span>
                  </label>

                  <button
                    type="submit"
                    className="mt-2 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-[#7755e8] font-extrabold text-white shadow-[0_14px_32px_-16px_rgba(119,85,232,0.75)] transition hover:-translate-y-0.5 hover:bg-[#6647d1]"
                  >
                    Continuar →
                  </button>
                </div>

                <div className="mt-4 flex justify-between text-sm text-[#59567a]">
                  <span>
                    Já tem conta?{" "}
                    <Link href="/" className="font-extrabold text-[#443388]">
                      Fazer login
                    </Link>
                  </span>
                </div>
              </div>
            ) : (
              <div key="step-2">
                <h2 className="font-[family-name:var(--font-display)] mt-3 mb-1 text-2xl md:text-4xl text-[#1d1b33]">
                  Configure seu perfil
                </h2>
                <p className="mb-7 text-[#59567a] leading-relaxed">
                  Quanto mais contexto você der, mais precisa a análise fica.
                </p>

                <div className="grid gap-5 sm:gap-4">
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
                    {/* aviso só visual — GitHub continua opcional, então isso nunca bloqueia o cadastro */}
                    {githubTouched && !isValidGithubUrl && (
                      <ul className="mt-0.5 grid gap-1 text-xs font-semibold">
                        <RequirementItem met={false} label="Isso não parece um link válido do GitHub" />
                      </ul>
                    )}
                  </div>

                  <div className="grid gap-1.5">
                    <label className="text-sm font-extrabold text-[#1d1b33]">
                      Currículo em PDF <span className="text-[#e8641d]">*</span>
                    </label>
                    <div
                      className={`relative rounded-xl border-[1.5px] border-dashed p-6 text-center transition ${
                        fileError
                          ? "border-[#c23b3b] bg-[#fdf2f2] text-[#c23b3b]"
                          : "border-[#c8c0b0] bg-[#fbf9f4] text-[#59567a] hover:border-[#7755e8] hover:bg-[#f7f3ff]"
                      }`}
                    >
                      {/* input file nativo fica invisível e por cima de tudo (opacity-0 + inset-0)
                          pra herdar o clique/drag do card estilizado, já que <input type="file">
                          não é estilizável diretamente */}
                      <input
                        type="file"
                        accept="application/pdf"
                        required
                        onChange={handleFile}
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      />
                      <strong className={`block mb-1 ${fileError ? "text-[#c23b3b]" : "text-[#1d1b33]"}`}>
                        {fileName}
                      </strong>
                      <span className="text-sm">Máximo recomendado: 5 MB</span>
                    </div>
                    {fileError && (
                      <ul className="mt-0.5 grid gap-1 text-xs font-semibold">
                        <RequirementItem met={false} label="Esse arquivo não é um PDF" />
                      </ul>
                    )}
                  </div>

                  <div className="grid gap-1.5">
                    <label htmlFor="interesse" className="text-sm font-extrabold text-[#1d1b33]">
                      Área de interesse <span className="text-[#e8641d]">*</span>
                    </label>
                    <FormSelect
                      id="interesse"
                      required
                      placeholder="Selecione sua área..."
                      options={["Frontend", "Backend", "Mobile", "Dados"]}
                    />
                  </div>

                  <div className="grid gap-1.5">
                    <label htmlFor="nivel" className="text-sm font-extrabold text-[#1d1b33]">
                      Nível de experiência <span className="text-[#e8641d]">*</span>
                    </label>
                    <FormSelect
                      id="nivel"
                      required
                      placeholder="Onde você está hoje?"
                      options={["Estudante", "Estagiário", "Júnior", "Pretendendo migrar de carreira"]}
                    />
                  </div>

                  <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-full border-[1.5px] border-[#e4dfd3] bg-white font-extrabold text-[#1d1b33] transition hover:border-[#7755e8]"
                    >
                      ← Voltar
                    </button>
                    <button
                      type="submit"
                      className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-full bg-[#7755e8] font-extrabold text-white shadow-[0_14px_32px_-16px_rgba(119,85,232,0.75)] transition hover:-translate-y-0.5 hover:bg-[#6647d1]"
                    >
                      Começar →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </section>
    </main>
  );
}
