import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Mascot } from "@/components/Mascot";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#0d0e24] p-5">
      <section className="w-full max-w-xl rounded-3xl bg-[#f7f5f1] p-7 text-center shadow-2xl sm:p-10">
        <div className="flex justify-center"><Logo /></div>
        <Mascot pose="wave" motion="arrive" priority className="mx-auto mt-4 h-48 w-48" />
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#e8641d]">Erro 404</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold text-[#1d1b33]">Esta rota saiu da órbita</h1>
        <p className="mx-auto mt-3 max-w-md leading-relaxed text-[#59567a]">A página não foi encontrada. Volte ao painel para continuar sua preparação.</p>
        <Link href="/dashboard" className="mt-7 inline-flex min-h-11 items-center justify-center rounded-full bg-gradient-to-r from-[#7755e8] to-[#e8641d] px-6 font-extrabold text-white">Voltar ao dashboard</Link>
      </section>
    </main>
  );
}
