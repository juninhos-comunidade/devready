"use client";

import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export function ImageDropzone({
  onFileChange,
}: {
  onFileChange?: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!["image/png", "image/jpeg"].includes(file.type) || file.size > MAX_IMAGE_SIZE) {
      setErrorMessage("Envie uma imagem PNG ou JPG com no máximo 5 MB.");
      event.target.value = "";
      return;
    }

    setErrorMessage("");
    setFileName(file.name);
    onFileChange?.(file);
  }

  function removeFile() {
    setFileName(null);
    setErrorMessage("");
    if (inputRef.current) inputRef.current.value = "";
    onFileChange?.(null);
  }

  return (
    <div className="grid gap-2">
      <div className={`relative grid min-h-32 place-items-center rounded-2xl border-[1.5px] border-dashed p-5 text-center transition ${errorMessage ? "border-[#c23b3b] bg-[#fdf2f2]" : "border-[#c8c0b0] bg-[#fbf9f4] hover:border-[#7755e8] hover:bg-[#f7f3ff]"}`}>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg"
          aria-label="Selecionar imagem da vaga"
          onChange={handleFile}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
        {fileName && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              removeFile();
            }}
            aria-label="Remover imagem da vaga"
            className="absolute right-3 top-3 z-10 rounded-full bg-white p-2 text-[#8b8593] shadow-sm transition hover:text-[#c23b3b]"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <div className="pointer-events-none">
          <ImagePlus className="mx-auto h-6 w-6 text-[#7755e8]" />
          <p className="mt-2 text-sm font-extrabold text-[#1d1b33]">
            {fileName ?? "Arraste um print ou clique para selecionar"}
          </p>
          <p className="mt-1 text-xs text-[#8b8593]">PNG ou JPG · até 5 MB</p>
        </div>
      </div>
      {errorMessage && <p role="alert" className="text-xs font-bold text-[#c23b3b]">{errorMessage}</p>}
    </div>
  );
}
