export function Logo() {
  return (
    <div className="flex items-center gap-2.5" aria-label="DevReady">
      <svg
        viewBox="0 0 64 48"
        aria-hidden="true"
        className="h-9 w-12 shrink-0"
        fill="none"
      >
        <defs>
          <linearGradient id="devready-check" x1="20" y1="25" x2="45" y2="16" gradientUnits="userSpaceOnUse">
            <stop stopColor="#7755e8" />
            <stop offset="1" stopColor="#e8641d" />
          </linearGradient>
        </defs>
        <path d="M24 7 9 24l15 17" stroke="#7755e8" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="m40 7 15 17-15 17" stroke="#e8641d" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="m19.5 25 9 9 16-18" stroke="url(#devready-check)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="bg-gradient-to-r from-[#7755e8] to-[#e8641d] bg-clip-text font-[family-name:var(--font-display)] text-lg font-extrabold tracking-tight text-transparent">
        DevReady
      </span>
    </div>
  );
}
