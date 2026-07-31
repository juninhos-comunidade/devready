"use client";

import { useState } from "react";
import { RequirementItem } from "./RequirementItem";

// Campo de upload de currículo, usado tanto no Cadastro (onde o PDF é
// obrigatório) quanto no Perfil (onde a pessoa só troca o arquivo se quiser).
// `initialFileName` é o texto mostrado antes de qualquer arquivo ser escolhido
// — no Perfil, a gente passa o nome do arquivo que a pessoa já enviou antes.
export function PdfDropzone({
  required = false,
  initialFileName = "Arraste o PDF ou clique para selecionar",
}: {
  required?: boolean;
  initialFileName?: string;
}) {
  const [fileName, setFileName] = useState(initialFileName);
  const [fileError, setFileError] = useState(false);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // accept="application/pdf" só filtra o seletor do SO, não impede o usuário de
    // escolher "todos os arquivos" e mandar outra coisa — por isso o check aqui também
    if (file.type !== "application/pdf") {
      setFileError(true);
      setFileName(initialFileName);
      e.target.value = ""; // limpa o input pra permitir reselecionar o mesmo arquivo depois de corrigir
      return;
    }

    setFileError(false);
    setFileName(file.name);
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
          type="file"
          accept="application/pdf"
          required={required}
          onChange={handleFile}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
        <strong className={`block mb-1 ${fileError ? "text-[#c23b3b]" : "text-[#1d1b33]"}`}>
          {fileName}
        </strong>
        <span className="text-sm">Máximo recomendado: 5 MB</span>
      </div>
      {fileError && (
        <ul className="mt-0.5 grid gap-1 text-xs font-semibold">
          <RequirementItem met={false} label="Esse arquivo não é um PDF" />
        </ul>
      )}
    </div>
  );
}
