export function Logo() {
  return (
    <div className="flex items-center gap-2.5" aria-label="DevReady">
      <svg
        viewBox="0 0 64 48"
        aria-hidden="true"
        className="h-9 w-12 shrink-0 overflow-visible"
        fill="none"
      >
        <defs>
          <linearGradient id="devready-check" x1="18" y1="14" x2="46" y2="36" gradientUnits="userSpaceOnUse">
            <stop stopColor="#7755e8" />
            <stop offset="1" stopColor="#e8641d" />
          </linearGradient>
        </defs>
        <path d="M22 6 7 24l15 18" stroke="#7755e8" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="m42 6 15 18-15 18" stroke="#e8641d" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="m18 25 10 10 18-22" stroke="url(#devready-check)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="bg-gradient-to-r from-[#7755e8] to-[#e8641d] bg-clip-text font-[family-name:var(--font-display)] text-lg font-extrabold tracking-tight text-transparent">
        DevReady
      </span>
    </div>
  );
}
