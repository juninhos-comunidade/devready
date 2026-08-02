import Link from "next/link";
import { MailCheck } from "lucide-react";
import { Logo } from "@/components/Logo";

export default function VerifiqueEmail() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#0d0e24] p-4">
      <section className="w-full max-w-lg rounded-3xl bg-[#f7f5f1] p-7 text-center shadow-2xl sm:p-10">
        <div className="flex justify-center">
          <Logo />
        </div>
        <span className="mx-auto mt-8 grid h-16 w-16 place-items-center rounded-2xl bg-[#efeaff] text-[#7755e8]">
          <MailCheck className="h-8 w-8" />
        </span>
        <h1 className="mt-5 font-[family-name:var(--font-display)] text-3xl font-bold text-[#1d1b33]">
          Confirme seu e-mail
        </h1>
        <p className="mt-3 leading-relaxed text-[#59567a]">
          Enviamos um link de confirmação para o endereço informado. A conta só
          será liberada depois que você confirmar o e-mail.
        </p>
        <p className="mt-3 text-sm font-semibold text-[#8b8593]">
          Não encontrou? Confira também a caixa de spam.
        </p>
        <Link
          href="/login"
          className="mt-7 flex min-h-11 items-center justify-center rounded-full bg-[#7755e8] px-6 font-extrabold text-white transition hover:bg-[#6647d1]"
        >
          Ir para o login
        </Link>
      </section>
    </main>
  );
}
