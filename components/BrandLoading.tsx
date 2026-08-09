"use client";

import { Logo } from "@/components/Logo";
import { Mascot } from "@/components/Mascot";

export function BrandLoading({
  label = "Preparando sua experiência...",
  overlay = false,
}: {
  label?: string;
  overlay?: boolean;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={`${overlay ? "fixed inset-0 z-[100] bg-[#0d0e24]/90 backdrop-blur-md" : "min-h-screen bg-[#0d0e24]"} grid place-items-center p-6`}
    >
      <div className="text-center text-white">
        <div className="flex justify-center">
          <Logo />
        </div>
        <div className="relative mx-auto mt-5 h-44 w-44 sm:h-52 sm:w-52">
          <span className="absolute inset-8 rounded-full bg-[#7755e8]/25 blur-2xl" />
          <Mascot pose="launch" motion="launch" priority className="relative h-full w-full" />
        </div>
        <p className="mt-3 text-sm font-extrabold text-[#f7f5f1]">{label}</p>
        <div className="mx-auto mt-4 flex w-fit gap-1.5" aria-hidden="true">
          <span className="brand-loading-dot" />
          <span className="brand-loading-dot [animation-delay:160ms]" />
          <span className="brand-loading-dot [animation-delay:320ms]" />
        </div>
      </div>
    </div>
  );
}
