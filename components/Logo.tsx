import Image from "next/image";

// Tentamos antes "esconder" o fundo branco do logo.png com mix-blend-multiply,
// mas isso escurece as cores por cima de qualquer fundo colorido — o roxo e o
// laranja perdiam o brilho. A solução certa é usar uma versão do ícone com
// fundo já transparente de verdade (public/logo-icon.png, recortado a partir
// do logo.png original), e escrever "DevReady" como texto normal do site ao
// lado — assim as cores saem vivas, do jeito que aparecem no design original.
export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <Image
        src="/logo-icon.png"
        alt=""
        width={744}
        height={425}
        className="h-8 w-auto"
      />
      {/* bg-clip-text + text-transparent é o truque de CSS pra "pintar" texto com
          gradiente: em vez de colorir o texto direto, a gente desenha um fundo
          gradiente atrás e deixa só as letras visíveis por cima dele */}
      <span className="bg-gradient-to-r from-[#7755e8] to-[#e8641d] bg-clip-text font-[family-name:var(--font-display)] text-lg font-extrabold tracking-tight text-transparent">
        DevReady
      </span>
    </div>
  );
}
