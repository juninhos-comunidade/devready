"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Eye, EyeOff } from "lucide-react";
import { RequirementItem } from "@/components/RequirementItem";
import { authClient } from "@/lib/auth-client";

export default function RedefinirSenha() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  // as mesmas regras de senha do Cadastro (8+ caracteres, 2 especiais) —
  // já que é a mesma senha da conta, tem que seguir a mesma exigência
  const hasMinLength = password.length >= 8;
  const specialCharCount = (password.match(/[^A-Za-z0-9]/g) ?? []).length;
  const hasSpecialChars = specialCharCount >= 2;
  const confirmTouched = confirm.length > 0;
  const passwordsMatch = confirmTouched && confirm === password;

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");
    if (!hasMinLength || !hasSpecialChars || !passwordsMatch) {
      setErrorMessage("A nova senha ainda não atende aos requisitos.");
      return;
    }

    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setErrorMessage("Este link é inválido ou está incompleto. Solicite uma nova recuperação.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await authClient.resetPassword({
        newPassword: password,
        token,
      });

      if (error) {
        setErrorMessage("O link expirou ou já foi utilizado. Solicite uma nova recuperação.");
        return;
      }

      setCompleted(true);
    } catch {
      setErrorMessage("Não foi possível conectar ao serviço. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
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
          {completed ? (
            <div className="w-full max-w-[460px]">
              <h2 className="font-[family-name:var(--font-display)] text-3xl text-[#1d1b33]">Senha atualizada</h2>
              <p className="mt-3 text-[#59567a]">Sua nova senha já está ativa. Agora você pode entrar novamente.</p>
              <Link href="/login" className="mt-6 flex min-h-[44px] items-center justify-center rounded-full bg-[#7755e8] font-extrabold text-white">Ir para o login</Link>
            </div>
          ) : (
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
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
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
                    {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
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
                disabled={isSubmitting}
                className="mt-2 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-[#7755e8] font-extrabold text-white shadow-[0_14px_32px_-16px_rgba(119,85,232,0.75)] transition hover:-translate-y-0.5 hover:bg-[#6647d1] disabled:cursor-wait disabled:opacity-60"
              >
                {isSubmitting ? "Salvando..." : "Redefinir senha"}
              </button>
            </div>

            {errorMessage && <p role="alert" className="mt-4 rounded-xl bg-[#fdf2f2] px-4 py-3 text-sm font-bold text-[#a83030]">{errorMessage}</p>}

            <div className="mt-4 text-sm text-[#59567a]">
              Lembrou a senha?{" "}
              <Link href="/login" className="font-extrabold text-[#443388]">
                Fazer login
              </Link>
            </div>
          </form>
          )}
        </div>
      </section>
    </main>
  );
}
