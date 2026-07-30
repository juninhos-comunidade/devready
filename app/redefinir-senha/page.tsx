"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { EyeIcon } from "@/components/EyeIcon";
import { RequirementItem } from "@/components/RequirementItem";

export default function RedefinirSenha() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  // as mesmas regras de senha do Cadastro (8+ caracteres, 2 especiais) —
  // já que é a mesma senha da conta, tem que seguir a mesma exigência
  const hasMinLength = password.length >= 8;
  const specialCharCount = (password.match(/[^A-Za-z0-9]/g) ?? []).length;
  const hasSpecialChars = specialCharCount >= 2;
  const confirmTouched = confirm.length > 0;
  const passwordsMatch = confirmTouched && confirm === password;

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO: quando o backend existir, essa tela recebe um token pela URL
    // (algo como /redefinir-senha?token=abc123, mandado no link do e-mail).
    // O Better Auth usa esse token pra confirmar que é a mesma pessoa que
    // pediu a recuperação, sem precisar pedir a senha antiga
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
          className="relative flex flex-col p-8 md:p-11 text-[#f7f5f1] overflow-hidden"
          style={{
            backgroundImage:
              "radial-gradient(120% 120% at 0 0, rgba(119,85,232,0.6), transparent 55%), radial-gradient(120% 120% at 100% 100%, rgba(232,100,29,0.42), transparent 55%)",
            backgroundColor: "#151632",
          }}
        >
          <Logo />

          <div className="mt-12 md:mt-20">
            <h1 className="font-[family-name:var(--font-display)] max-w-[420px] text-3xl md:text-5xl leading-[1.02] font-semibold">
              Quase lá — só falta a nova senha.
            </h1>
            <p className="mt-4 max-w-[380px] text-[#aaa6d6] leading-relaxed">
              Escolha uma senha nova pra continuar de onde parou nas suas
              sessões de treino.
            </p>
          </div>
        </aside>

        <div className="grid place-items-center p-6 md:p-12">
          <form className="w-full max-w-[460px]" onSubmit={handleSubmit}>
            <h2 className="font-[family-name:var(--font-display)] mb-1 text-2xl md:text-4xl text-[#1d1b33]">
              Redefinir senha
            </h2>
            <p className="mb-7 text-[#59567a] leading-relaxed">
              Crie uma nova senha para sua conta.
            </p>

            <div className="grid gap-5 sm:gap-4">
              <div className="grid gap-1.5">
                <label htmlFor="password" className="text-sm font-extrabold text-[#1d1b33]">
                  Nova senha
                </label>
                <div className="relative">
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
                  Confirmar nova senha
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

              <button
                type="submit"
                className="mt-2 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-[#7755e8] font-extrabold text-white shadow-[0_14px_32px_-16px_rgba(119,85,232,0.75)] transition hover:-translate-y-0.5 hover:bg-[#6647d1]"
              >
                Redefinir senha
              </button>
            </div>

            <div className="mt-4 text-sm text-[#59567a]">
              Lembrou a senha?{" "}
              <Link href="/login" className="font-extrabold text-[#443388]">
                Fazer login
              </Link>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
