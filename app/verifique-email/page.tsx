"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MailCheck } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Mascot } from "@/components/Mascot";

const RESEND_COOLDOWN_SECONDS = 60;

function VerifiqueEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const curriculumPendente = searchParams.get("curriculumPendente") === "1";
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => setCooldown((current) => Math.max(0, current - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  async function resend() {
    if (!email || cooldown > 0) return;
    setStatus("sending");
    try {
      const response = await fetch("/api/auth/send-verification-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, callbackURL: "/dashboard" }),
      });
      setStatus(response.ok ? "sent" : "error");
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch {
      setStatus("error");
      setCooldown(RESEND_COOLDOWN_SECONDS);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#0d0e24] p-4">
      <section className="w-full max-w-lg rounded-3xl bg-[#f7f5f1] p-7 text-center shadow-2xl sm:p-10">
        <div className="flex justify-center">
          <Logo />
        </div>
        <div className="relative mx-auto mt-5 w-fit">
          <Mascot pose="wave" motion="arrive" priority className="h-40 w-40" />
          <span className="absolute bottom-2 right-1 grid h-12 w-12 place-items-center rounded-2xl bg-[#efeaff] text-[#7755e8] shadow-lg">
            <MailCheck className="h-6 w-6" />
          </span>
        </div>
        <h1 className="mt-5 font-[family-name:var(--font-display)] text-3xl font-bold text-[#1d1b33]">
          Confirme seu e-mail
        </h1>
        <p className="mt-3 leading-relaxed text-[#59567a]">
          Enviamos um link de confirmação para {email ? <strong>{email}</strong> : "o endereço informado"}. A conta só será liberada depois que você confirmar o e-mail.
        </p>
        <p className="mt-3 text-sm font-semibold text-[#8b8593]">
          Não encontrou? Confira também a caixa de spam.
        </p>

        {curriculumPendente && (
          <p className="mt-5 rounded-xl bg-[#fff6e6] px-4 py-3 text-sm font-bold text-[#8a5a00]">
            Sua conta foi criada, mas não conseguimos salvar seu currículo agora. Depois de confirmar o e-mail, envie-o novamente na página de perfil.
          </p>
        )}

        {status === "sent" && (
          <p role="status" className="mt-5 rounded-xl bg-[#eaf7ef] px-4 py-3 text-sm font-bold text-[#247544]">
            E-mail reenviado. Confira sua caixa de entrada.
          </p>
        )}
        {status === "error" && (
          <p role="alert" className="mt-5 rounded-xl bg-[#fdf2f2] px-4 py-3 text-sm font-bold text-[#a83030]">
            Não foi possível enviar o e-mail agora. Tente novamente em instantes ou fale com o suporte.
          </p>
        )}

        {email && (
          <button
            type="button"
            onClick={resend}
            disabled={status === "sending" || cooldown > 0}
            className="mt-5 flex min-h-11 w-full items-center justify-center rounded-full border-[1.5px] border-[#e4dfd3] px-6 font-extrabold text-[#1d1b33] transition hover:border-[#7755e8] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "sending"
              ? "Enviando..."
              : cooldown > 0
                ? `Reenviar em ${cooldown}s`
                : "Reenviar e-mail"}
          </button>
        )}

        <Link
          href="/login"
          className="mt-3 flex min-h-11 items-center justify-center rounded-full bg-[#7755e8] px-6 font-extrabold text-white transition hover:bg-[#6647d1]"
        >
          Ir para o login
        </Link>
      </section>
    </main>
  );
}

export default function VerifiqueEmail() {
  return (
    <Suspense fallback={null}>
      <VerifiqueEmailContent />
    </Suspense>
  );
}
