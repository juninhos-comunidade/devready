"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { PrivacyPolicyContent } from "./PrivacyPolicyContent";

export function PrivacyPolicyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCloseRef.current();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#0d0e24]/60 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-modal-title"
        onClick={(event) => event.stopPropagation()}
        className="grid max-h-[85vh] w-full max-w-2xl grid-rows-[auto_1fr] rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#ece9f1] p-6">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#7755e8]">Privacidade e LGPD</p>
            <h2 id="privacy-modal-title" className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold text-[#1d1b33]">Política de privacidade</h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Fechar política de privacidade"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[#8b8593] transition hover:bg-[#f0eef4] hover:text-[#1d1b33]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto p-6">
          <PrivacyPolicyContent />
        </div>
      </div>
    </div>
  );
}
