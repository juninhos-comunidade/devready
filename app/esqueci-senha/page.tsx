"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { BrandLoading } from "@/components/BrandLoading";
import { Mascot } from "@/components/Mascot";
import { authClient } from "@/lib/auth-client";
import { demoModeEnabled } from "@/lib/demo-mode";

export default function EsqueciSenha() {
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") ?? "");

    if (demoModeEnabled) {
      await new Promise((resolve) => window.setTimeout(resolve, 500));
      setSent(true);
      setIsSubmitting(false);
      return;
    }

    try {
      const { error } = await authClient.requestPasswordReset({
        email,
        redirectTo: "/redefinir-senha",
      });

      if (error) {
        setErrorMessage("Não foi possível processar a solicitação agora. Tente novamente.");
        return;
      }

      setSent(true);
    } catch {
      setErrorMessage("Não foi possível processar a solicitação agora. Tente novamente.");
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
      {isSubmitting && <BrandLoading overlay label="Preparando a recuperação..." />}
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
              Recupere o acesso à sua conta.
            </h1>
            <p className="mt-4 max-w-[380px] text-[#aaa6d6] leading-relaxed">
              Informe o e-mail da conta para receber o link de redefinição.
            </p>
          </div>
          <Mascot pose="wave" className="pointer-events-none absolute -bottom-10 right-0 hidden h-60 w-60 md:block" />
        </aside>

        <div className="grid place-items-center p-6 md:p-12">
          <div className="w-full max-w-[460px]">
            {sent ? (
              <div key="sent">
                <Mascot pose="wave" motion="arrive" className="mx-auto mb-2 h-32 w-32" />
                <h2 className="font-[family-name:var(--font-display)] mb-1 text-2xl md:text-4xl text-[#1d1b33]">
                  Verifique seu e-mail
                </h2>
                <p className="text-[#59567a] leading-relaxed">
                  Se o e-mail estiver cadastrado, enviaremos um link de recuperação. Verifique também a pasta de spam.
                </p>
                <Link
                  href="/login"
                  className="mt-6 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-[#7755e8] font-extrabold text-white shadow-[0_14px_32px_-16px_rgba(119,85,232,0.75)] transition hover:-translate-y-0.5 hover:bg-[#6647d1]"
                >
                  Voltar para o login
                </Link>
              </div>
            ) : (
              <form key="form" onSubmit={handleSubmit}>
                <h2 className="font-[family-name:var(--font-display)] mb-1 text-2xl md:text-4xl text-[#1d1b33]">
                  Esqueci minha senha
                </h2>
                <p className="mb-7 text-[#59567a] leading-relaxed">
                  Digite o e-mail usado no cadastro.
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
                    {isSubmitting ? "Enviando..." : "Enviar link de recuperação"}
                  </button>
                </div>

                <div className="mt-4 text-sm text-[#59567a]">
                  Lembrou a senha?{" "}
                  <Link href="/login" className="font-extrabold text-[#443388]">
                    Fazer login
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
