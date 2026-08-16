import Link from "next/link";
import { Logo } from "@/components/Logo";
import { PrivacyPolicyContent } from "@/components/PrivacyPolicyContent";

export default function PoliticaDePrivacidade() {
  return (
    <main className="min-h-screen bg-[#f4f3f8] px-4 py-8 sm:px-6 sm:py-12">
      <article className="mx-auto max-w-3xl rounded-3xl border border-[#e7e3ee] bg-white p-6 shadow-[0_22px_70px_-50px_rgba(29,27,51,0.5)] sm:p-10">
        <Logo />
        <p className="mt-8 text-xs font-extrabold uppercase tracking-[0.18em] text-[#7755e8]">
          Privacidade e LGPD
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold text-[#1d1b33] sm:text-4xl">
          Política de privacidade
        </h1>
        <p className="mt-3 leading-relaxed text-[#59567a]">
          O DevReady utiliza os dados fornecidos pelo próprio usuário somente
          para criar o diagnóstico técnico, personalizar treinos e acompanhar a
          evolução na plataforma.
        </p>

        <div className="mt-8">
          <PrivacyPolicyContent />
        </div>

        <Link href="/cadastro" className="mt-9 inline-flex font-extrabold text-[#5d43c4] underline underline-offset-4">
          Voltar ao cadastro
        </Link>
      </article>
    </main>
  );
}
