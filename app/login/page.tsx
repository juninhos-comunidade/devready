"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Eye, EyeOff } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { demoModeEnabled } from "@/lib/demo-mode";

export default function Login() {
  // "senha visível ou não" é um estadinho simples: começa escondida (false)
  // e vira true quando a pessoa clica no olhinho, só isso
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const rememberMe = formData.get("rememberMe") === "on";

    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
        rememberMe,
      });

      if (error) {
        setErrorMessage(
          error.status === 403
            ? "Confirme seu e-mail antes de entrar. Enviamos um novo link de verificação."
            : "E-mail ou senha inválidos. Confira os dados e tente novamente.",
        );
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setErrorMessage("Não foi possível conectar ao serviço. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    // Mesma "casca" visual do Cadastro (fundo escuro com gradiente + card
    // claro flutuando no meio) — repetir esse layout em toda tela de
    // autenticação é o que dá a sensação de "é o mesmo site" pra quem navega
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

          {/* sem a citação lá embaixo, essa div não precisa mais do justify-between
              pra se espalhar pelo aside inteiro — um mt fixo já cria o respiro
              entre o logo e o título, igual ao print que você mandou */}
          <div className="mt-12 md:mt-20">
            <h1 className="font-[family-name:var(--font-display)] max-w-[420px] text-3xl md:text-5xl leading-[1.02] font-semibold">
              Descubra exatamente o que falta para a sua próxima vaga.
            </h1>
            <p className="mt-4 max-w-[380px] text-[#aaa6d6] leading-relaxed">
              Compare seu currículo e GitHub com requisitos reais e
              transforme insegurança em um plano de treino claro.
            </p>
          </div>
        </aside>

        <div className="grid place-items-center p-6 md:p-12">
          <form className="w-full max-w-[460px]" onSubmit={handleSubmit}>
            <span className="text-xs font-extrabold tracking-widest text-[#7755e8] uppercase">
              Bem-vindo de volta
            </span>
            <h2 className="font-[family-name:var(--font-display)] mt-1 mb-1 text-2xl md:text-4xl text-[#1d1b33]">
              Entrar na sua conta
            </h2>
            <p className="mb-7 text-[#59567a] leading-relaxed">
              Continue de onde parou nas suas sessões de treino.
            </p>

            <div className="grid gap-5 sm:gap-4">
              <div className="grid gap-1.5">
                <label htmlFor="email" className="text-sm font-extrabold text-[#1d1b33]">
                  E-mail
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="ex: maria.silva@email.com"
                  className="w-full rounded-xl border-[1.5px] border-[#e4dfd3] bg-white px-4 py-3 text-[#1d1b33] placeholder:text-[#8b8593] focus:border-[#7755e8] focus:outline-none focus:ring-2 focus:ring-[#7755e8]/30"
                />
              </div>

              <div className="grid gap-1.5">
                <label htmlFor="password" className="text-sm font-extrabold text-[#1d1b33]">
                  Senha
                </label>
                {/* o campo de senha do login não precisa do checklist de regras
                    (mínimo de caracteres etc.) que colocamos no Cadastro — aqui
                    a senha já existe, só estamos conferindo, não criando */}
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
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
              </div>

              <label className="flex items-center gap-2.5 text-sm text-[#59567a]">
                <input name="rememberMe" type="checkbox" className="h-4 w-4" />
                Manter conectado neste dispositivo
              </label>

              {errorMessage && (
                <p role="alert" className="rounded-xl bg-[#fdf2f2] px-4 py-3 text-sm font-bold text-[#a83030]">
                  {errorMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-[#7755e8] font-extrabold text-white shadow-[0_14px_32px_-16px_rgba(119,85,232,0.75)] transition hover:-translate-y-0.5 hover:bg-[#6647d1] disabled:cursor-wait disabled:opacity-60"
              >
                {isSubmitting ? "Entrando..." : "Entrar"}
              </button>

              {demoModeEnabled && (
                <>
                  <div className="flex items-center gap-3 py-1" aria-hidden="true">
                    <span className="h-px flex-1 bg-[#e4dfd3]" />
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#8b8593]">ou</span>
                    <span className="h-px flex-1 bg-[#e4dfd3]" />
                  </div>
                  <Link
                    href="/dashboard"
                    className="flex min-h-[44px] w-full items-center justify-center rounded-full border-[1.5px] border-[#7755e8] font-extrabold text-[#5d43c4] transition hover:bg-[#f2eeff]"
                  >
                    Explorar demonstração
                  </Link>
                  <p className="text-center text-xs leading-relaxed text-[#8b8593]">
                    A demonstração usa somente informações fictícias.
                  </p>
                </>
              )}
            </div>

            <div className="mt-4 flex flex-col gap-2 text-sm text-[#59567a] sm:flex-row sm:justify-between">
              <Link href="/esqueci-senha" className="font-extrabold text-[#443388]">
                Esqueci minha senha
              </Link>
              <span>
                Sem conta?{" "}
                <Link href="/cadastro" className="font-extrabold text-[#443388]">
                  Criar conta
                </Link>
              </span>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
