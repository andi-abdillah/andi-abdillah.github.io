import { useEffect, useRef, useState } from "react";

const GRAVITY    = 0.5;
const ROT_SPEED  = 12;
const TOLERANCE  = 55;

const Bottle = ({ y, rot }) => (
  <div
    className="absolute bottom-3 left-1/2"
    style={{
      transformOrigin: "50% 75%",
      transform: `translateX(-50%) translateY(${-y}px) rotate(${rot}deg)`,
    }}
  >
    <div className="relative" style={{ width: 32, height: 66 }}>
      <div className="absolute left-1/2 top-0 -translate-x-1/2 rounded-sm" style={{ width: 16, height: 8, background: "#1e3a8a" }} />
      <div className="absolute left-1/2 -translate-x-1/2" style={{ top: 8, width: 12, height: 10, background: "rgba(125,211,252,0.5)" }} />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 overflow-hidden rounded-xl" style={{ width: 32, height: 48, background: "rgba(125,211,252,0.25)", border: "2px solid rgba(125,211,252,0.6)" }}>
        <div className="absolute bottom-0 w-full" style={{ height: "60%", background: "linear-gradient(180deg,#38bdf8,#0ea5e9)" }} />
      </div>
    </div>
  </div>
);

const BottleFlipGame = ({ onBack }) => {
  const [phase, setPhase]       = useState("idle");
  const [power, setPower]       = useState(0);
  const [bottle, setBottle]     = useState({ y: 0, rot: 0 });
  const [result, setResult]     = useState(null);
  const [score, setScore]       = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [streak, setStreak]     = useState(0);
  const [best, setBest]         = useState(0);

  const dirRef    = useRef(1);
  const chargeRaf = useRef(null);
  const flipRaf   = useRef(null);

  useEffect(() => () => { cancelAnimationFrame(chargeRaf.current); cancelAnimationFrame(flipRaf.current); }, []);

  const startCharge = () => {
    if (phase === "charging" || phase === "flipping") return;
    setBottle({ y: 0, rot: 0 });
    setResult(null);
    setPower(0);
    setPhase("charging");
    dirRef.current = 1;
    const loop = () => {
      setPower((p) => {
        let np = p + dirRef.current * 2;
        if (np >= 100) { np = 100; dirRef.current = -1; }
        if (np <= 0)   { np = 0;   dirRef.current = 1; }
        return np;
      });
      chargeRaf.current = requestAnimationFrame(loop);
    };
    chargeRaf.current = requestAnimationFrame(loop);
  };

  const release = () => {
    if (phase !== "charging") return;
    cancelAnimationFrame(chargeRaf.current);
    setPhase("flipping");

    let vy  = 5 + (power / 100) * 12;
    let y   = 0;
    let rot = 0;

    const loop = () => {
      vy -= GRAVITY;
      y  += vy;
      rot += ROT_SPEED;
      if (y <= 0) {
        const base = Math.round(rot / 360) * 360;
        const mod  = ((rot % 360) + 360) % 360;
        const dist = Math.min(mod, 360 - mod);
        const landed = dist <= TOLERANCE;
        const finalRot = landed ? base : base + (mod < 180 ? 90 : 270);
        setBottle({ y: 0, rot: finalRot });
        setResult(landed ? "land" : "fall");
        setPhase("result");
        setAttempts((a) => a + 1);
        if (landed) {
          setScore((s) => s + 1);
          setStreak((st) => { const ns = st + 1; setBest((b) => Math.max(b, ns)); return ns; });
        } else {
          setStreak(0);
        }
        return;
      }
      setBottle({ y, rot });
      flipRaf.current = requestAnimationFrame(loop);
    };
    flipRaf.current = requestAnimationFrame(loop);
  };

  return (
    <div>
      <button onClick={onBack} className="mb-6 flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm">← Back to Games</button>

      <div className="mx-auto mb-4 flex max-w-2xl items-center justify-between px-2">
        <div className="flex items-center gap-2"><span className="text-white/40 text-sm">Landed</span><span className="font-futura text-2xl font-bold text-[#ffcb05]">{score}</span><span className="text-white/40 text-sm">/ {attempts}</span></div>
        <div className="flex items-center gap-2"><span className="text-white/40 text-sm">Streak</span><span className="font-futura text-2xl font-bold text-white">{streak}</span></div>
        <div className="flex items-center gap-2"><span className="text-white/40 text-sm">Best</span><span className="font-futura text-2xl font-bold text-green-400">{best}</span></div>
      </div>

      <div
        className="relative mx-auto select-none overflow-hidden rounded-3xl"
        style={{ maxWidth: 700, height: 360, background: "linear-gradient(160deg,#1a1a2e,#16213e)", border: "3px solid rgba(255,255,255,0.06)", cursor: "pointer" }}
        onPointerDown={startCharge}
        onPointerUp={release}
        onPointerLeave={release}
      >
        <div className="absolute bottom-3 left-1/2 h-2 w-40 -translate-x-1/2 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }} />
        <Bottle y={bottle.y} rot={bottle.rot} />
        {phase === "result" && (
          <div className="pointer-events-none absolute left-1/2 top-8 -translate-x-1/2 text-center">
            <p className="font-futura text-2xl font-extrabold uppercase" style={{ color: result === "land" ? "#22c55e" : "#f87171" }}>
              {result === "land" ? (streak >= 3 ? `🔥 ${streak} in a row!` : "Nailed it! ✅") : "Oops! ❌"}
            </p>
          </div>
        )}
        {phase === "idle" && (
          <p className="pointer-events-none absolute left-1/2 top-8 -translate-x-1/2 font-futura text-sm uppercase text-white/50">
            Hold to charge, release to flip
          </p>
        )}
        <div className="absolute bottom-4 left-4 h-32 w-3 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
          <div className="absolute bottom-0 w-full rounded-full transition-none" style={{ height: `${power}%`, background: power > 70 ? "#f87171" : power > 35 ? "#ffcb05" : "#22c55e" }} />
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-white/30">Tip: aim for a medium charge to land a single flip 🍾</p>
    </div>
  );
};

export default BottleFlipGame;
