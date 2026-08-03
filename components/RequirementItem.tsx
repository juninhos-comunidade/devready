import { Check, X } from "lucide-react";

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
