import { Check, X } from "lucide-react";

// Uma linha de "regra atendida ou não" — usada nos avisos de senha, GitHub
// e upload de PDF. Em vez de criar um componente diferente pra cada aviso,
// esse aqui recebe só um booleano (`met`) e decide sozinho se mostra o ✓
// verde ou o ✕ vermelho, e qual texto exibir do lado.
export function RequirementItem({ met, label }: { met: boolean; label: string }) {
  return (
    <li
      className={`flex items-center gap-1.5 ${
        met ? "text-[#1f9d55]" : "text-[#c23b3b]"
      }`}
    >
      {met ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <X className="h-3.5 w-3.5" strokeWidth={3} />}
      {label}
    </li>
  );
}
