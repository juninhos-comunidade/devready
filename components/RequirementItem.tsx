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
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        {met ? <path d="M20 6 9 17l-5-5" /> : <path d="M18 6 6 18M6 6l12 12" />}
      </svg>
      {label}
    </li>
  );
}
