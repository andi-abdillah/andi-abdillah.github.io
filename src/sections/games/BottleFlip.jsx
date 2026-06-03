import { useEffect, useRef, useState } from "react";

const GRAVITY   = 0.48;
const TRAY_W    = 84;
const TRAY_AMP  = 85;
const TRAY_SPD  = 0.022;

const BOTTLES = [
  { id:"classic", label:"Half Full", fill:"60%", body:"rgba(125,211,252,0.25)", liquid:"linear-gradient(180deg,#38bdf8,#0ea5e9)", cap:"#1e3a8a", stability:1.08, spin:1.0  },
  { id:"small",   label:"Small",    fill:"45%", body:"rgba(167,243,208,0.22)", liquid:"linear-gradient(180deg,#86efac,#22c55e)", cap:"#166534", stability:0.9,  spin:1.18 },
  { id:"heavy",   label:"Jumbo",    fill:"70%", body:"rgba(254,240,138,0.2)",  liquid:"linear-gradient(180deg,#fde047,#f97316)", cap:"#9a3412", stability:1.18, spin:0.86 },
];

// startX: bottle x at idle/charge (offset from arena center)
// tableX: landing surface center offset
// tableW: landing surface width
// ideal/window: power guidance
// tolerance: rotation tolerance in degrees
// bonus: score per land
const MODES = [
  { id:"default",      label:"Classic",     startX:0,    tableX:0,   tableW:160, ideal:50, window:25, tolerance:52, bonus:1 },
  { id:"table_throw",  label:"Table Throw", startX:-130, tableX:90,  tableW:110, ideal:45, window:18, tolerance:60, bonus:2 },
  { id:"sliding_tray", label:"Sliding Tray",startX:0,    tableX:0,   tableW:TRAY_W, ideal:50, window:25, tolerance:62, bonus:3 },
];

const Bottle = ({ config, x, y, rot }) => (
  <div className="absolute bottom-8 left-1/2" style={{ transformOrigin:"50% 76%", transform:`translateX(calc(-50% + ${x}px)) translateY(${-y}px) rotate(${rot}deg)` }}>
    <div className="relative" style={{ width:34, height:70 }}>
      <div className="absolute left-1/2 top-0 -translate-x-1/2 rounded-sm" style={{ width:16, height:9, background:config.cap }} />
      <div className="absolute left-1/2 -translate-x-1/2" style={{ top:8, width:12, height:12, background:config.body }} />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 overflow-hidden rounded-xl" style={{ width:34, height:50, background:config.body, border:"2px solid rgba(255,255,255,0.35)", boxShadow:"inset 0 0 18px rgba(255,255,255,0.12)" }}>
        <div className="absolute bottom-0 w-full" style={{ height:config.fill, background:config.liquid }} />
      </div>
    </div>
  </div>
);

const BottleFlipGame = ({ onBack }) => {
  const [phase, setPhase]       = useState("idle");
  const [power, setPower]       = useState(0);
  const [bottle, setBottle]     = useState({ x:0, y:0, rot:0 });
  const [result, setResult]     = useState(null);
  const [score, setScore]       = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [streak, setStreak]     = useState(0);
  const [best, setBest]         = useState(0);
  const [modeIdx, setModeIdx]   = useState(0);
  const [bottleIdx, setBottleIdx] = useState(0);
  const [windOn, setWindOn]     = useState(false);

  const dirRef      = useRef(1);
  const powerRef    = useRef(0);
  const phaseRef    = useRef("idle");
  const chargeRaf   = useRef(null);
  const flipRaf     = useRef(null);
  const trayXRef    = useRef(0);
  const trayElRef   = useRef(null);
  const trayRafRef  = useRef(null);
  const trayTickRef = useRef(0);

  const mode    = MODES[modeIdx];
  const bConfig = BOTTLES[bottleIdx];
  const locked  = phase === "charging" || phase === "flipping";

  useEffect(() => () => {
    cancelAnimationFrame(chargeRaf.current);
    cancelAnimationFrame(flipRaf.current);
    cancelAnimationFrame(trayRafRef.current);
  }, []);

  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // Sliding tray: animate via direct DOM to avoid per-frame re-renders
  useEffect(() => {
    cancelAnimationFrame(trayRafRef.current);
    trayXRef.current = 0;
    if (modeIdx !== 2) return;
    const animate = () => {
      trayTickRef.current++;
      const x = Math.sin(trayTickRef.current * TRAY_SPD) * TRAY_AMP;
      trayXRef.current = x;
      if (trayElRef.current) {
        trayElRef.current.style.left = `calc(50% + ${x}px)`;
      }
      trayRafRef.current = requestAnimationFrame(animate);
    };
    trayRafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(trayRafRef.current);
  }, [modeIdx]);

  const changeMode = (e, i) => {
    e.stopPropagation();
    if (locked) return;
    const m = MODES[i];
    setModeIdx(i);
    setBottle({ x: m.startX, y: 0, rot: 0 });
    setResult(null);
    phaseRef.current = "idle";
    setPhase("idle");
  };

  const resetStats = (e) => {
    e.stopPropagation();
    if (locked) return;
    setScore(0); setAttempts(0); setStreak(0); setBest(0);
    setResult(null);
    setBottle({ x: mode.startX, y: 0, rot: 0 });
    phaseRef.current = "idle";
    setPhase("idle");
  };

  const startCharge = () => {
    if (phaseRef.current === "charging" || phaseRef.current === "flipping") return;
    setBottle({ x: mode.startX, y: 0, rot: 0 });
    setResult(null);
    setPower(0); powerRef.current = 0; dirRef.current = 1;
    phaseRef.current = "charging"; setPhase("charging");
    const loop = () => {
      setPower(cur => {
        let n = cur + dirRef.current * 2;
        if (n >= 100) { n = 100; dirRef.current = -1; }
        if (n <= 0)   { n = 0;   dirRef.current = 1;  }
        powerRef.current = n;
        return n;
      });
      chargeRaf.current = requestAnimationFrame(loop);
    };
    chargeRaf.current = requestAnimationFrame(loop);
  };

  const release = () => {
    if (phaseRef.current !== "charging") return;
    cancelAnimationFrame(chargeRaf.current);
    phaseRef.current = "flipping"; setPhase("flipping");

    const p   = powerRef.current;
    const m   = mode;
    const bc  = bConfig;
    let vx, vy, x, rot, spinSpeed;

    x = m.startX; rot = 0;

    if (m.id === "table_throw") {
      vx        = 3 + (p / 100) * 8;
      vy        = 4 + (p / 100) * 9;
      spinSpeed = (6 + p / 11) * bc.spin;
    } else {
      const wind = (m.id === "default" && windOn) ? ((Math.random() > 0.5 ? 1 : -1) * 0.18 * (0.5 + p / 100)) : 0;
      vx        = wind;
      vy        = 5 + (p / 100) * 12;
      spinSpeed = (7.2 + p / 9) * bc.spin;
    }

    let y = 0;

    const loop = () => {
      vy -= GRAVITY;
      y  += vy;
      x  += vx;
      rot += spinSpeed;

      if (y <= 0) {
        const mod  = ((rot % 360) + 360) % 360;
        const base = Math.round(rot / 360) * 360;
        const dist = Math.min(mod, 360 - mod);
        const powerMiss = Math.abs(p - m.ideal);
        const tol = m.id === "default"
          ? Math.max(20, m.tolerance * bc.stability - powerMiss * 0.4)
          : Math.max(20, m.tolerance * bc.stability);
        const rotOK = dist <= tol;

        let posOK = true;
        let failText = "Bad rotation";

        if (m.id === "table_throw") {
          posOK = Math.abs(x - m.tableX) < m.tableW / 2;
          if (!posOK) failText = x < m.tableX ? "Too short" : "Overshot";
        } else if (m.id === "sliding_tray") {
          posOK = Math.abs(trayXRef.current) < TRAY_W / 2 - 5;
          if (!posOK) failText = "Missed the tray";
        }

        if (posOK && !rotOK) failText = "Bad rotation";

        const landed   = rotOK && posOK;
        const finalRot = landed ? base : base + (mod < 180 ? 88 : 272);

        setBottle({ x, y: 0, rot: finalRot });
        setAttempts(a => a + 1);
        phaseRef.current = "result"; setPhase("result");

        if (landed) {
          setStreak(st => {
            const ns = st + 1;
            setBest(b => Math.max(b, ns));
            setScore(sc => sc + m.bonus + (ns > 1 ? ns - 1 : 0));
            return ns;
          });
          setResult({ type:"land", text: dist <= tol * 0.35 ? "Perfect!" : "Landed!" });
        } else {
          setStreak(0);
          setResult({ type:"fall", text: failText });
        }
        return;
      }

      setBottle({ x, y, rot });
      flipRaf.current = requestAnimationFrame(loop);
    };
    flipRaf.current = requestAnimationFrame(loop);
  };

  const selStyle = (active, col) => ({
    borderColor: active ? col : "rgba(255,255,255,0.12)",
    color:       active ? col : "rgba(255,255,255,0.55)",
    background:  active ? `${col}20` : "rgba(255,255,255,0.05)",
    opacity:     locked ? 0.45 : 1,
    transition:  "all 0.2s",
  });

  const HINTS = {
    default:      "Hold to charge, release to flip",
    table_throw:  "Hold and release to throw right",
    sliding_tray: "Flip when the tray lines up",
  };
  const TIPS = {
    default:      `Sweet spot: ${mode.ideal - mode.window}–${mode.ideal + mode.window}% power.`,
    table_throw:  "Power controls distance and rotation. Aim for the right table.",
    sliding_tray: "Watch the tray, flip when it's near center.",
  };

  return (
    <div>
      <button
        onClick={(e) => { e.stopPropagation(); onBack(); }}
        className="mb-4 flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-white"
      >
        ← Back to Games
      </button>

      {/* Stats */}
      <div className="mx-auto mb-4 grid max-w-2xl grid-cols-4 gap-3 px-2 text-center">
        <div><p className="text-xs uppercase text-white/35">Score</p><p className="font-futura text-2xl font-bold text-[#ffcb05]">{score}</p></div>
        <div><p className="text-xs uppercase text-white/35">Tries</p><p className="font-futura text-2xl font-bold text-white">{attempts}</p></div>
        <div><p className="text-xs uppercase text-white/35">Streak</p><p className="font-futura text-2xl font-bold text-green-400">{streak}</p></div>
        <div><p className="text-xs uppercase text-white/35">Best</p><p className="font-futura text-2xl font-bold text-white">{best}</p></div>
      </div>

      {/* Controls — all outside arena, all stopPropagation */}
      <div className="mx-auto mb-3 flex max-w-2xl flex-col gap-2 px-2 sm:flex-row sm:items-center">
        {/* Mode */}
        <div className="flex flex-1 gap-2">
          {MODES.map((m, i) => (
            <button
              key={m.id}
              onClick={(e) => changeMode(e, i)}
              className="flex-1 rounded-2xl border px-2 py-2 text-xs font-bold uppercase"
              style={selStyle(i === modeIdx, "#ffcb05")}
            >
              {m.label}
            </button>
          ))}
        </div>
        {/* Bottle + wind + reset */}
        <div className="flex flex-wrap gap-2">
          {BOTTLES.map((b, i) => (
            <button
              key={b.id}
              onClick={(e) => { e.stopPropagation(); if (!locked) setBottleIdx(i); }}
              className="rounded-2xl border px-3 py-2 text-xs font-bold uppercase"
              style={selStyle(i === bottleIdx, "#86efac")}
            >
              {b.label}
            </button>
          ))}
          {mode.id === "default" && (
            <button
              onClick={(e) => { e.stopPropagation(); if (!locked) setWindOn(w => !w); }}
              className="rounded-2xl border px-3 py-2 text-xs font-bold uppercase"
              style={selStyle(windOn, "#93c5fd")}
            >
              Wind
            </button>
          )}
          <button
            onClick={resetStats}
            disabled={locked}
            className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold uppercase text-white/55 transition hover:bg-white/10 disabled:opacity-45"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Arena — pointer events only here */}
      <div
        className="relative mx-auto select-none overflow-hidden rounded-3xl"
        style={{
          maxWidth: 700,
          height: 370,
          background: "linear-gradient(180deg,#111827 0%,#1e3a5f 45%,#1a3a28 46%,#0d1f14 100%)",
          border: "3px solid rgba(255,255,255,0.06)",
          cursor: locked ? "grabbing" : "pointer",
          boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
        }}
        onPointerDown={startCharge}
        onPointerUp={release}
        onPointerLeave={release}
        onPointerCancel={release}
      >
        {/* horizon */}
        <div className="pointer-events-none absolute left-0 right-0 top-[46%] h-px bg-white/[0.05]" />

        {/* Surfaces */}
        {mode.id === "default" && (
          <div className="pointer-events-none absolute bottom-7 left-1/2 h-3 -translate-x-1/2 rounded-full"
            style={{ width: mode.tableW, background: "#8b5a2b", boxShadow: "0 10px 28px rgba(0,0,0,0.45)" }} />
        )}
        {mode.id === "table_throw" && (
          <>
            {/* left stand */}
            <div className="pointer-events-none absolute bottom-7 rounded-full"
              style={{ left: `calc(50% + ${mode.startX}px)`, transform: "translateX(-50%)", width: 52, height: 7, background: "#5a3a1a", boxShadow: "0 8px 18px rgba(0,0,0,0.4)" }} />
            {/* right table */}
            <div className="pointer-events-none absolute bottom-7 rounded-full"
              style={{ left: `calc(50% + ${mode.tableX}px)`, transform: "translateX(-50%)", width: mode.tableW, height: 10, background: "#7a4825", boxShadow: "0 12px 28px rgba(0,0,0,0.5)" }} />
          </>
        )}
        {mode.id === "sliding_tray" && (
          <>
            {/* center target marker */}
            <div className="pointer-events-none absolute bottom-7 left-1/2 h-1.5 -translate-x-1/2 rounded-full"
              style={{ width: 200, background: "rgba(255,255,255,0.06)" }} />
            {/* moving tray — DOM-animated via ref */}
            <div
              ref={trayElRef}
              className="pointer-events-none absolute bottom-7 rounded-md"
              style={{ left: "50%", transform: "translateX(-50%)", width: TRAY_W, height: 9, background: "#b8953a", boxShadow: "0 8px 22px rgba(0,0,0,0.5)" }}
            />
          </>
        )}

        {/* bottle shadow */}
        <div
          className="pointer-events-none absolute bottom-[27px] left-1/2 h-2 w-8 rounded-full bg-black/25"
          style={{ transform: `translateX(calc(-50% + ${bottle.x}px))` }}
        />

        <Bottle config={bConfig} x={bottle.x} y={bottle.y} rot={bottle.rot} />

        {/* wind badge */}
        {windOn && mode.id === "default" && (
          <div className="pointer-events-none absolute right-4 top-3 flex items-center gap-1.5 rounded-full border border-blue-400/20 bg-black/30 px-3 py-1">
            <span className="text-sm">💨</span>
            <span className="font-futura text-[10px] uppercase text-blue-300">Wind</span>
          </div>
        )}

        {/* result */}
        {result && phase === "result" && (
          <div className="pointer-events-none absolute left-1/2 top-8 -translate-x-1/2 rounded-full bg-black/45 px-5 py-2 backdrop-blur-sm">
            <p className="font-futura text-xl font-extrabold uppercase"
              style={{ color: result.type === "land" ? "#22c55e" : "#f87171" }}>
              {result.text}
            </p>
          </div>
        )}

        {phase === "idle" && (
          <p className="pointer-events-none absolute left-1/2 top-8 -translate-x-1/2 whitespace-nowrap font-futura text-sm uppercase text-white/50">
            {HINTS[mode.id]}
          </p>
        )}

        {/* power meter */}
        <div className="pointer-events-none absolute bottom-5 left-5 h-32 w-3 overflow-hidden rounded-full bg-white/10">
          <div className="absolute bottom-0 w-full rounded-full" style={{
            height: `${power}%`,
            background: power > 72 ? "#ef4444" : power > 38 ? "#ffcb05" : "#22c55e",
          }} />
        </div>

        {/* info box */}
        <div className="pointer-events-none absolute bottom-4 right-4 rounded-2xl border border-white/8 bg-black/30 px-4 py-3 text-right backdrop-blur-sm">
          <p className="text-[10px] uppercase text-white/35">{mode.label}</p>
          {mode.id !== "table_throw" && (
            <>
              <p className="font-futura text-base font-bold text-white">{mode.ideal - mode.window}–{mode.ideal + mode.window}%</p>
              <p className="text-[9px] uppercase text-white/30">target power</p>
            </>
          )}
          {mode.id === "table_throw" && (
            <p className="font-futura text-xs font-bold text-white/60">Aim for the table</p>
          )}
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-white/35">{TIPS[mode.id]}</p>
    </div>
  );
};

export default BottleFlipGame;
