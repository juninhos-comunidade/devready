"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Mascot } from "@/components/Mascot";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center bg-[#0d0e24] p-5">
      <section className="w-full max-w-xl rounded-3xl bg-[#f7f5f1] p-7 text-center shadow-2xl sm:p-10">
        <div className="flex justify-center"><Logo /></div>
        <Mascot pose="coach" motion="arrive" priority className="mx-auto mt-4 h-48 w-48" />
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#e8641d]">Algo não saiu como esperado</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold text-[#1d1b33]">Vamos tentar novamente</h1>
        <p className="mx-auto mt-3 max-w-md leading-relaxed text-[#59567a]">Se o problema continuar, volte ao painel e reinicie o fluxo.</p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" onClick={reset} className="min-h-11 rounded-full bg-gradient-to-r from-[#7755e8] to-[#e8641d] px-6 font-extrabold text-white">Tentar novamente</button>
          <Link href="/dashboard" className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#dcd7e6] px-6 font-extrabold text-[#1d1b33]">Voltar ao dashboard</Link>
        </div>
      </section>
    </main>
  );
}
