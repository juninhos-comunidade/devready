import { ChevronDown } from "lucide-react";

// select nativo (sem lib) estilizado igual aos inputs de texto — `invalid:` pega a opção
// placeholder (value="") enquanto ela estiver selecionada, simulando um placeholder cinza
export function FormSelect({
  id,
  required,
  placeholder,
  options,
  defaultValue = "",
}: {
  id: string;
  required?: boolean;
  placeholder: string;
  options: string[];
  defaultValue?: string;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        required={required}
        defaultValue={defaultValue}
        className="w-full appearance-none rounded-xl border-[1.5px] border-[#e4dfd3] bg-white px-4 py-3 pr-10 text-[#1d1b33] invalid:text-[#8b8593] focus:border-[#7755e8] focus:outline-none focus:ring-2 focus:ring-[#7755e8]/30"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#8b8593]" />
    </div>
  );
}
