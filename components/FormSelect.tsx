"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export function FormSelect({
  id,
  required,
  placeholder,
  options,
  value = "",
  onChange,
}: {
  id: string;
  required?: boolean;
  placeholder: string;
  options: string[];
  value?: string;
  onChange?: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function select(option: string) {
    onChange?.(option);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        id={id}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={`${id}-listbox`}
        aria-required={required}
        onClick={() => setOpen((current) => !current)}
        className={`flex w-full items-center justify-between gap-2 rounded-xl border-[1.5px] bg-white px-4 py-3 text-left font-semibold transition ${
          open ? "border-[#7755e8] ring-2 ring-[#7755e8]/30" : "border-[#e4dfd3] hover:border-[#c8bdf0]"
        } ${value ? "text-[#1d1b33]" : "text-[#8b8593]"}`}
      >
        <span className="truncate">{value || placeholder}</span>
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#efeaff] text-[#7755e8]">
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </span>
      </button>

      {open && (
        <ul
          id={`${id}-listbox`}
          role="listbox"
          aria-labelledby={id}
          className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border-[1.5px] border-[#e4dfd3] bg-white p-1.5 shadow-[0_18px_45px_-24px_rgba(29,27,51,0.45)]"
        >
          {options.map((option) => {
            const selected = option === value;
            return (
              <li key={option}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => select(option)}
                  className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition ${
                    selected ? "bg-[#efeaff] text-[#5d43c4]" : "text-[#1d1b33] hover:bg-[#f7f5fa]"
                  }`}
                >
                  {option}
                  {selected && <Check className="h-4 w-4 shrink-0" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
