// Shared UI for the mini games — keeps markup identical across every game.

export const GameLoadingScreen = ({ emoji }) => (
  <div
    className="relative mx-auto flex select-none flex-col items-center justify-center overflow-hidden rounded-3xl"
    style={{
      maxWidth: 700,
      height: "clamp(280px, 55vh, 370px)",
      background: "linear-gradient(160deg,#1a1a2e,#16213e)",
      border: "3px solid rgba(255,255,255,0.06)",
    }}
  >
    <span className="mb-4 animate-pulse text-6xl">{emoji}</span>
    <p className="mb-6 font-futura text-sm font-bold uppercase tracking-widest text-white/50">Loading</p>
    <div className="w-48 overflow-hidden rounded-full bg-white/10" style={{ height: 4 }}>
      <div
        className="h-full rounded-full bg-[#ffcb05]"
        style={{ animation: "gameLoadBar 1.1s ease-in-out infinite" }}
      />
    </div>
  </div>
);

export const BackButton = ({ onClick, className = "mb-6" }) => (
  <button
    onClick={onClick}
    className={`${className} flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/70 transition-all hover:border-white/30 hover:bg-white/10 hover:text-white`}
  >
    <span className="leading-none">←</span><span>Back to Games</span>
  </button>
);

export const PrimaryButton = ({ className = "", children, ...props }) => (
  <button
    {...props}
    className={`rounded-full bg-primary px-10 py-3 font-futura font-bold uppercase text-white hover:opacity-80 ${className}`}
  >
    {children}
  </button>
);

export const GridOverlay = ({ opacity = 0.04 }) => (
  <svg className="pointer-events-none absolute inset-0 h-full w-full" style={{ opacity }}>
    {[...Array(10)].map((_, i) => (
      <line key={`v${i}`} x1={`${i * 10}%`} y1="0" x2={`${i * 10}%`} y2="100%" stroke="white" strokeWidth="1" />
    ))}
    {[...Array(6)].map((_, i) => (
      <line key={`h${i}`} x1="0" y1={`${i * 20}%`} x2="100%" y2={`${i * 20}%`} stroke="white" strokeWidth="1" />
    ))}
  </svg>
);
