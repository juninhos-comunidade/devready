"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { LayoutDashboard, CirclePlus, BarChart3, CircleUser } from "lucide-react";

// Cada item do menu guarda seu próprio ícone (componente do lucide-react), não
// uma string — assim, na hora de desenhar a lista, a gente só troca o nome do
// componente dentro do <Icon />, sem precisar de um "switch/case" pra escolher
// o ícone certo
const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/nova-sessao", label: "Nova sessão", icon: CirclePlus },
  { href: "/dashboard/resultado", label: "Último resultado", icon: BarChart3 },
  { href: "/dashboard/perfil", label: "Meu perfil", icon: CircleUser },
];

export function Sidebar() {
  // usePathname existe justamente pra isso: saber em qual página a gente está
  // AGORA, sem precisar que cada página avise manualmente qual item destacar
  const pathname = usePathname();

  return (
    <aside className="flex w-60 shrink-0 flex-col gap-10 bg-[#151632] px-5 py-8">
      <div className="px-2">
        <Logo />
      </div>

      <nav className="flex flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition ${
                active
                  ? "bg-[#f7f5f1] text-[#1d1b33]"
                  : "text-[#aaa6d6] hover:bg-white/5 hover:text-white"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                  active ? "bg-[#e8641d]" : "bg-[#4a4766]"
                }`}
              />
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
