export function Logo() {
  return (
    <div className="flex items-center gap-2" aria-label="DevReady">
      <svg
        viewBox="0 0 54 48"
        aria-hidden="true"
        className="h-10 w-[45px] shrink-0"
        fill="none"
      >
        <defs>
          <linearGradient id="devready-check" x1="16" y1="32" x2="35" y2="19" gradientUnits="userSpaceOnUse">
            <stop stopColor="#7755e8" />
            <stop offset="1" stopColor="#e8641d" />
          </linearGradient>
        </defs>
        <path d="M20 8 7 24l13 16" stroke="#7755e8" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="m34 8 13 16-13 16" stroke="#e8641d" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="m16 24 8 8 11-13" stroke="url(#devready-check)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="bg-gradient-to-r from-[#7755e8] to-[#e8641d] bg-clip-text font-[family-name:var(--font-display)] text-xl font-extrabold tracking-tight text-transparent">
        DevReady
      </span>
    </div>
  );
}
