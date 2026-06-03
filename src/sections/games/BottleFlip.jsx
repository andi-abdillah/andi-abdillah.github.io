import { useEffect, useRef, useState } from "react";

const GRAVITY      = 0.48;
const TRAY_W       = 60;
const TRAY_CENTER  = 90;
const TRAY_AMP     = 75;
const TRAY_SPD     = 0.025;

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
const WIND_STREAKS = [
  { top: 11, width: 38, delay: 0,    dur: 1.5 },
  { top: 24, width: 24, delay: 0.35, dur: 1.2 },
  { top: 38, width: 52, delay: 0.7,  dur: 1.8 },
  { top: 52, width: 30, delay: 0.15, dur: 1.35 },
  { top: 65, width: 44, delay: 0.55, dur: 1.1 },
  { top: 78, width: 20, delay: 0.85, dur: 1.6 },
  { top: 18, width: 16, delay: 0.5,  dur: 1.0 },
  { top: 58, width: 35, delay: 0.9,  dur: 1.4 },
];

const MODES = [
  { id:"default",      label:"Classic",     startX:0,    tableX:0,   tableW:160, ideal:50, window:25, tolerance:52, bonus:1 },
  { id:"table_throw",  label:"Table Throw", startX:-130, tableX:90,  tableW:110, ideal:45, window:18, tolerance:60, bonus:2 },
  { id:"sliding_tray", label:"Sliding Tray",startX:-130, tableX:90,  tableW:120,   ideal:45, window:18, tolerance:52, bonus:3 },
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
  const trayXRef       = useRef(0);
  const trayElRef      = useRef(null);
  const trayRafRef     = useRef(null);
  const trayTickRef    = useRef(0);
  const bottleOnTrayRef = useRef(false);

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
    trayXRef.current = TRAY_CENTER;
    if (modeIdx !== 2) return;
    const animate = () => {
      trayTickRef.current++;
      const x = TRAY_CENTER + Math.sin(trayTickRef.current * TRAY_SPD) * TRAY_AMP;
      trayXRef.current = x;
      if (trayElRef.current) {
        trayElRef.current.style.left = `calc(50% + ${x}px)`;
      }
      if (bottleOnTrayRef.current) {
        setBottle(b => ({ ...b, x }));
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


  const startCharge = () => {
    if (phaseRef.current === "charging" || phaseRef.current === "flipping") return;
    setBottle({ x: mode.startX, y: 0, rot: 0 });
    setResult(null);
    bottleOnTrayRef.current = false;
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

    const windForce = windOn ? (Math.random() > 0.5 ? 1 : -1) * 0.16 * (0.4 + p / 100) : 0;

    if (m.id === "table_throw" || m.id === "sliding_tray") {
      vx        = 3 + (p / 100) * 8 + windForce * 1.8;
      vy        = 4 + (p / 100) * 9;
      spinSpeed = (6 + p / 11) * bc.spin;
    } else {
      vx        = windForce;
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
        const tol   = Math.max(20, m.tolerance * bc.stability - powerMiss * 0.4);
        const rotOK = dist <= tol;

        let posOK = true;
        let failText = "Bad rotation";

        if (m.id === "table_throw") {
          posOK = Math.abs(x - m.tableX) < m.tableW / 2;
          if (!posOK) failText = x < m.tableX ? "Too short" : "Overshot";
        } else if (m.id === "sliding_tray") {
          posOK = Math.abs(x - trayXRef.current) < TRAY_W / 2 - 5;
          if (posOK) bottleOnTrayRef.current = true;
          else failText = "Missed the tray";
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
    table_throw:  "Hold and release to throw to the right table",
    sliding_tray: "Throw right, time the tray to be underneath",
  };
  const TIPS = {
    default:      `Sweet spot: ${mode.ideal - mode.window}–${mode.ideal + mode.window}% power.`,
    table_throw:  "Power controls distance and rotation. Aim for the right table.",
    sliding_tray: "Same throw as Table Throw, but the tray moves. Time it right.",
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

      {/* Controls */}
      <div className="mx-auto mb-3 flex max-w-2xl flex-col gap-2 px-2">
        {/* Mode row */}
        <div className="flex gap-1.5">
          {MODES.map((m, i) => (
            <button
              key={m.id}
              onClick={(e) => changeMode(e, i)}
              className="flex-1 rounded-2xl border py-2 text-[10px] font-bold uppercase sm:text-xs"
              style={selStyle(i === modeIdx, "#ffcb05")}
            >
              {m.label}
            </button>
          ))}
        </div>
        {/* Bottle + wind + reset — all in one row, small enough to fit mobile */}
        <div className="flex justify-center gap-1.5">
          {BOTTLES.map((b, i) => (
            <button
              key={b.id}
              onClick={(e) => { e.stopPropagation(); if (!locked) setBottleIdx(i); }}
              className="rounded-2xl border px-2.5 py-1.5 text-[10px] font-bold uppercase sm:px-3 sm:py-2 sm:text-xs"
              style={selStyle(i === bottleIdx, "#86efac")}
            >
              {b.label}
            </button>
          ))}
          <button
            onClick={(e) => { e.stopPropagation(); if (!locked) setWindOn(w => !w); }}
            className="rounded-2xl border px-2.5 py-1.5 text-[10px] font-bold uppercase sm:px-3 sm:py-2 sm:text-xs"
            style={selStyle(windOn, "#93c5fd")}
          >
            Wind
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
        {/* Wind streaks */}
        {windOn && WIND_STREAKS.map((s, i) => (
          <div
            key={i}
            className="pointer-events-none absolute rounded-full"
            style={{
              top:        `${s.top}%`,
              left:       -64,
              width:      s.width,
              height:     2,
              background: "rgba(147,197,253,0.45)",
              animation:  `windStreak ${s.dur}s linear ${s.delay}s infinite`,
            }}
          />
        ))}

        {/* horizon */}
        <div className="pointer-events-none absolute left-0 right-0 top-[46%] h-px bg-white/[0.05]" />

        {/* Surfaces */}
        {mode.id === "default" && (
          <div className="pointer-events-none absolute bottom-7 left-1/2 h-3 -translate-x-1/2 rounded-full"
            style={{ width: mode.tableW, background: "#8b5a2b", boxShadow: "0 10px 28px rgba(0,0,0,0.45)" }} />
        )}
        {mode.id === "table_throw" && (() => {
          const tX = mode.tableX, tW = mode.tableW;
          return (
            <>
              {/* table top */}
              <div className="pointer-events-none absolute rounded-sm"
                style={{ bottom: 32, left: `calc(50% + ${tX}px)`, transform: "translateX(-50%)", width: tW, height: 12, background: "#7a4825", boxShadow: "0 6px 20px rgba(0,0,0,0.5)" }} />
              {/* left leg */}
              <div className="pointer-events-none absolute rounded-sm"
                style={{ bottom: 4, left: `calc(50% + ${tX - tW / 2 + 4}px)`, width: 9, height: 28, background: "#5a3a1a" }} />
              {/* right leg */}
              <div className="pointer-events-none absolute rounded-sm"
                style={{ bottom: 4, left: `calc(50% + ${tX + tW / 2 - 13}px)`, width: 9, height: 28, background: "#5a3a1a" }} />
            </>
          );
        })()}
        {mode.id === "sliding_tray" && (
          /* moving tray only, no base surface */
          <div
            ref={trayElRef}
            className="pointer-events-none absolute rounded-md"
            style={{ bottom: 32, left: "50%", transform: "translateX(-50%)", width: TRAY_W, height: 10, background: "#b8953a", boxShadow: "0 4px 16px rgba(0,0,0,0.5)" }}
          />
        )}

        {/* bottle shadow */}
        <div
          className="pointer-events-none absolute bottom-[27px] left-1/2 h-2 w-8 rounded-full bg-black/25"
          style={{ transform: `translateX(calc(-50% + ${bottle.x}px))` }}
        />

        <Bottle config={bConfig} x={bottle.x} y={bottle.y} rot={bottle.rot} />

        {/* wind badge */}
        {windOn && (
          <div
            className="pointer-events-none absolute right-4 top-3 flex items-center gap-1.5 rounded-full border border-blue-400/30 bg-black/40 px-3 py-1"
            style={{ animation: "windBadgeSway 2.2s ease-in-out infinite" }}
          >
            <span className="text-sm" style={{ display:"inline-block", animation:"windEmojiPush 1.1s ease-in-out infinite" }}>💨</span>
            <span className="font-futura text-[10px] uppercase text-blue-300/90">Wind</span>
          </div>
        )}

        {/* result */}
        {result && phase === "result" && (
          <div className="pointer-events-none absolute left-1/2 top-24 -translate-x-1/2 rounded-full bg-black/45 px-4 py-1.5 backdrop-blur-sm sm:top-8 sm:px-5 sm:py-2">
            <p className="font-futura text-sm font-extrabold uppercase sm:text-xl"
              style={{ color: result.type === "land" ? "#22c55e" : "#f87171" }}>
              {result.text}
            </p>
          </div>
        )}

        {phase === "idle" && (
          <p className="pointer-events-none absolute left-1/2 top-24 max-w-[200px] -translate-x-1/2 text-center font-futura text-xs uppercase text-white/50 sm:top-8 sm:max-w-none sm:whitespace-nowrap sm:text-sm">
            {HINTS[mode.id]}
          </p>
        )}

        {/* Mobile: info box top-left */}
        <div className="pointer-events-none absolute left-3 top-3 sm:hidden" style={{ width: 128 }}>
          <div className="rounded-xl border border-white/8 bg-black/45 px-2.5 py-2 backdrop-blur-sm">
            <p className="text-[9px] uppercase text-white/35">{mode.label}</p>
            {mode.id === "default" && (
              <p className="font-futura text-xs font-bold text-white">{mode.ideal - mode.window}–{mode.ideal + mode.window}% power</p>
            )}
            {mode.id === "table_throw" && (
              <p className="font-futura text-[10px] font-bold text-white/60">Aim for the table</p>
            )}
            {mode.id === "sliding_tray" && (
              <p className="font-futura text-[10px] font-bold text-white/60">Hit the moving tray</p>
            )}
          </div>
        </div>

        {/* Mobile: vertical power bar below info box */}
        <div className="pointer-events-none absolute left-3 top-16 h-20 w-3 overflow-hidden rounded-full bg-white/10 sm:hidden">
          <div className="absolute bottom-0 w-full rounded-full" style={{
            height: `${power}%`,
            background: power > 72 ? "#ef4444" : power > 38 ? "#ffcb05" : "#22c55e",
          }} />
        </div>

        {/* Desktop: vertical power bar bottom-left */}
        <div className="pointer-events-none absolute bottom-5 left-5 hidden h-32 w-3 overflow-hidden rounded-full bg-white/10 sm:block">
          <div className="absolute bottom-0 w-full rounded-full" style={{
            height: `${power}%`,
            background: power > 72 ? "#ef4444" : power > 38 ? "#ffcb05" : "#22c55e",
          }} />
        </div>

        {/* Desktop: info box bottom-right */}
        <div className="pointer-events-none absolute bottom-4 right-4 hidden rounded-2xl border border-white/8 bg-black/30 px-4 py-3 text-right backdrop-blur-sm sm:block">
          <p className="text-[10px] uppercase text-white/35">{mode.label}</p>
          {mode.id === "default" && (
            <>
              <p className="font-futura text-base font-bold text-white">{mode.ideal - mode.window}–{mode.ideal + mode.window}%</p>
              <p className="text-[9px] uppercase text-white/30">target power</p>
            </>
          )}
          {mode.id === "table_throw" && (
            <p className="font-futura text-xs font-bold text-white/60">Aim for the table</p>
          )}
          {mode.id === "sliding_tray" && (
            <p className="font-futura text-xs font-bold text-white/60">Hit the moving tray</p>
          )}
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-white/35">{TIPS[mode.id]}</p>

      <style>{`
        @keyframes windStreak {
          0%   { transform: translateX(0);     opacity: 0   }
          8%   { opacity: 0.55 }
          85%  { opacity: 0.4  }
          100% { transform: translateX(860px); opacity: 0   }
        }
        @keyframes windBadgeSway {
          0%, 100% { transform: translateX(0px)  }
          50%      { transform: translateX(3px)  }
        }
        @keyframes windEmojiPush {
          0%, 100% { transform: translateX(0px) scaleX(1)    }
          50%      { transform: translateX(2px) scaleX(1.15) }
        }
      `}</style>
    </div>
  );
};

export default BottleFlipGame;
