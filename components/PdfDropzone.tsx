"use client";

import { useRef, useState } from "react";
import { X } from "lucide-react";
import { RequirementItem } from "./RequirementItem";

const MAX_PDF_SIZE = 2.5 * 1024 * 1024;

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

    if (file.type !== "application/pdf" || file.size > MAX_PDF_SIZE) {
      setFileError(true);
      e.target.value = "";
      return;
    }

    setFileError(false);
    setFileName(file.name);
    onFileChange?.(file);
  }

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
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          aria-label="Selecionar currículo em PDF"
          required={required && !fileName}
          onChange={handleFile}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
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
        <span className="text-sm">Máximo: 2,5 MB</span>
      </div>
      {fileError && (
        <ul className="mt-0.5 grid gap-1 text-xs font-semibold">
          <RequirementItem met={false} label="Envie um PDF com no máximo 2,5 MB" />
        </ul>
      )}
    </div>
  );
}
