"use client";

import { useRef, useState } from "react";
import { X } from "lucide-react";
import { RequirementItem } from "./RequirementItem";

// Campo de upload de currículo, usado tanto no Cadastro (onde o PDF é
// obrigatório) quanto no Perfil (onde já existe um currículo enviado antes).
// `initialFileName` é o nome do arquivo que a pessoa já tinha — no Perfil, ela
// pode REMOVER esse arquivo (botão "x"), mas não pode salvar sem colocar um
// novo no lugar: por isso `onFileChange` avisa o componente pai sempre que o
// estado "tem arquivo ou não" muda, pra quem usa esse componente decidir se
// bloqueia o envio.
export function PdfDropzone({
  required = false,
  initialFileName,
  onFileChange,
}: {
  required?: boolean;
  initialFileName?: string;
  onFileChange?: (file: File | null) => void;
}) {
  const [fileName, setFileName] = useState<string | null>(initialFileName ?? null);
  const [fileError, setFileError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // accept="application/pdf" só filtra o seletor do SO, não impede o usuário de
    // escolher "todos os arquivos" e mandar outra coisa — por isso o check aqui também
    if (file.type !== "application/pdf" || file.size > 5 * 1024 * 1024) {
      setFileError(true);
      e.target.value = ""; // limpa o input pra permitir reselecionar o mesmo arquivo depois de corrigir
      return; // não mexe no fileName atual — um arquivo inválido não deve apagar o que já estava lá
    }

    setFileError(false);
    setFileName(file.name);
    onFileChange?.(file);
  }

  // remover não é a mesma coisa que "escolher e cancelar" — é uma ação explícita
  // da pessoa dizendo "não quero mais esse arquivo", então avisamos pra fora com `null`
  function handleRemove() {
    setFileName(null);
    setFileError(false);
    if (inputRef.current) inputRef.current.value = "";
    onFileChange?.(null);
  }

  return (
    <div className="grid gap-1.5">
      <div
        className={`relative rounded-xl border-[1.5px] border-dashed p-6 text-center transition ${
          fileError
            ? "border-[#c23b3b] bg-[#fdf2f2] text-[#c23b3b]"
            : "border-[#c8c0b0] bg-[#fbf9f4] text-[#59567a] hover:border-[#7755e8] hover:bg-[#f7f3ff]"
        }`}
      >
        {/* input file nativo fica invisível e por cima de tudo (opacity-0 + inset-0)
            pra herdar o clique/drag do card estilizado, já que <input type="file">
            não é estilizável diretamente */}
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          aria-label="Selecionar currículo em PDF"
          required={required && !fileName}
          onChange={handleFile}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
        {/* o botão de remover é desenhado DEPOIS do input no código — por isso ele
            fica "por cima" e recebe o clique sozinho, sem abrir o seletor de arquivo
            que está por baixo dele */}
        {fileName && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleRemove();
            }}
            aria-label="Remover currículo"
            className="absolute right-3 top-3 z-10 rounded-full bg-white p-1.5 text-[#8b8593] shadow-sm transition hover:text-[#c23b3b]"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <strong className={`block mb-1 ${fileError ? "text-[#c23b3b]" : "text-[#1d1b33]"}`}>
          {fileName ?? "Arraste o PDF ou clique para selecionar"}
        </strong>
        <span className="text-sm">Máximo recomendado: 5 MB</span>
      </div>
      {fileError && (
        <ul className="mt-0.5 grid gap-1 text-xs font-semibold">
          <RequirementItem met={false} label="Envie um PDF com no máximo 5 MB" />
        </ul>
      )}
    </div>
  );
}
