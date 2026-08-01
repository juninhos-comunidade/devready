"use client";

import { useState } from "react";
import { RequirementItem } from "./RequirementItem";

// Irmão do PdfDropzone, só que pra imagem (PNG/JPG) em vez de PDF — a vaga
// pode ser colada como texto OU enviada como print, então esse campo é
// sempre opcional (diferente do currículo, que é obrigatório no Cadastro).
export function ImageDropzone({
  onFileChange,
}: {
  onFileChange?: (file: File | null) => void;
}) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState(false);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFileError(true);
      setFileName(null);
      e.target.value = "";
      onFileChange?.(null);
      return;
    }

    setFileError(false);
    setFileName(file.name);
    onFileChange?.(file);
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
        <input
          type="file"
          accept="image/png,image/jpeg"
          onChange={handleFile}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
        <strong className={`block mb-1 ${fileError ? "text-[#c23b3b]" : "text-[#1d1b33]"}`}>
          {fileName ?? "Arraste PNG/JPG ou clique para selecionar"}
        </strong>
        <span className="text-sm">A imagem será usada para extrair o texto da vaga.</span>
      </div>
      {fileError && (
        <ul className="mt-0.5 grid gap-1 text-xs font-semibold">
          <RequirementItem met={false} label="Esse arquivo precisa ser PNG ou JPG" />
        </ul>
      )}
    </div>
  );
}
