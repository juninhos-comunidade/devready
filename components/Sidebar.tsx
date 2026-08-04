"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  Bot,
  CirclePlus,
  CircleUser,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { Logo } from "./Logo";
import { Mascot } from "./Mascot";
import { authClient } from "@/lib/auth-client";
import { demoModeEnabled } from "@/lib/demo-mode";
import { MOCK_SESSION_KEY } from "@/lib/mock-session";

const navItems = [
  { href: "/dashboard", label: "Dashboard", shortLabel: "Início", icon: LayoutDashboard },
  { href: "/dashboard/nova-sessao", label: "Nova sessão", shortLabel: "Treinar", icon: CirclePlus },
  { href: "/dashboard/resultado", label: "Último resultado", shortLabel: "Resultado", icon: BarChart3 },
  { href: "/dashboard/agente", label: "Agente de entrevista", shortLabel: "Agente", icon: Bot },
  { href: "/dashboard/perfil", label: "Meu perfil", shortLabel: "Perfil", icon: CircleUser },
];

function isCurrentRoute(pathname: string, href: string) {
  return href === "/dashboard"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);
    if (demoModeEnabled) {
      window.sessionStorage.removeItem(MOCK_SESSION_KEY);
    } else {
      await authClient.signOut().catch(() => undefined);
    }
    router.replace("/login");
    router.refresh();
    setIsSigningOut(false);
  }

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-[#151632] px-5 py-8 lg:flex">
        <div className="px-2">
          <Logo />
        </div>

        <p className="mb-3 mt-12 px-3 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#6f6b99]">
          Sua jornada
        </p>
        <nav className="flex flex-col gap-1.5" aria-label="Navegação principal">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = isCurrentRoute(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#aaa6d6] ${
                  active
                    ? "bg-[#f7f5f1] text-[#1d1b33]"
                    : "text-[#aaa6d6] hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${active ? "bg-[#e8641d]" : "bg-[#4a4766] group-hover:bg-[#7755e8]"}`} />
                <Icon className="h-[18px] w-[18px] shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="relative mt-auto rounded-2xl border border-white/10 bg-white/[0.05] p-4 pt-14">
          <Mascot pose="wave" className="pointer-events-none absolute -right-1 -top-16 h-28 w-28" />
          <p className="text-xs font-extrabold text-white">Continue evoluindo</p>
          <p className="mt-1 text-xs leading-relaxed text-[#8f8ab8]">Cada treino deixa sua próxima entrevista mais previsível.</p>
          <button type="button" onClick={handleSignOut} disabled={isSigningOut} aria-label="Sair da conta" className="mt-4 flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/10 text-xs font-extrabold text-[#c7c3e5] transition hover:bg-white/[0.07] hover:text-white disabled:opacity-50">
            <LogOut className="h-4 w-4" /> {isSigningOut ? "Saindo..." : "Sair"}
          </button>
        </div>
      </aside>

      <nav
        className="fixed inset-x-3 bottom-3 z-40 grid rounded-2xl border border-white/10 bg-[#151632]/95 p-1.5 shadow-[0_18px_50px_-20px_rgba(21,22,50,0.9)] backdrop-blur-xl lg:hidden"
        style={{ gridTemplateColumns: `repeat(${navItems.length + 1}, minmax(0, 1fr))` }}
        aria-label="Navegação principal"
      >
        {navItems.map(({ href, shortLabel, icon: Icon }) => {
          const active = isCurrentRoute(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-extrabold transition ${
                active ? "bg-white text-[#1d1b33]" : "text-[#aaa6d6]"
              }`}
            >
              <Icon className="h-[18px] w-[18px]" />
              {shortLabel}
            </Link>
          );
        })}
        <button type="button" onClick={handleSignOut} disabled={isSigningOut} className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-extrabold text-[#aaa6d6] disabled:opacity-50">
          <LogOut className="h-[18px] w-[18px]" /> Sair
        </button>
      </nav>
    </>
  );
}
