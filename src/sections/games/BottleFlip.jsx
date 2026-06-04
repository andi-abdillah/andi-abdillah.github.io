import { useEffect, useRef, useState, memo, forwardRef } from "react";
import { BackButton, GridOverlay } from "./ui";

const GRAVITY     = 0.48;
const TRAY_W      = 60;
const TRAY_CENTER = 90;
const TRAY_AMP    = 75;
const TRAY_SPD    = 0.025;

const BASE_SENS   = 3.2;
const BASE_JITTER = 3;
const PERFECT_TOL = 7;
const TOL_MIN     = 10;

const BOTTLES = [
  { id:"classic", label:"Half Full", fill:"60%", body:"rgba(125,211,252,0.25)", liquid:"linear-gradient(180deg,#38bdf8,#0ea5e9)", cap:"#1e3a8a", stability:1.08, spin:1.0  },
  { id:"small",   label:"Small",    fill:"45%", body:"rgba(167,243,208,0.22)", liquid:"linear-gradient(180deg,#86efac,#22c55e)", cap:"#166534", stability:0.9,  spin:1.18 },
  { id:"heavy",   label:"Jumbo",    fill:"70%", body:"rgba(254,240,138,0.2)",  liquid:"linear-gradient(180deg,#fde047,#f97316)", cap:"#9a3412", stability:1.18, spin:0.86 },
];

const MODES = [
  { id:"default",      label:"Classic",      startX:0,    tableX:0,  tableW:160, ideal:50, tolerance:16, turns:1, bonus:1 },
  { id:"table_throw",  label:"Table Throw",  startX:-130, tableX:90, tableW:110, ideal:45, tolerance:18, turns:1, bonus:2 },
  { id:"sliding_tray", label:"Sliding Tray", startX:-130, tableX:90, tableW:120, ideal:45, tolerance:16, turns:1, bonus:3 },
];

const HINTS = {
  default:      "Hold to charge, release to flip",
  table_throw:  "Hold and release to throw to the right table",
  sliding_tray: "Throw right, time the tray to be underneath",
};

const TIPS = {
  default:      "Hit close to 50% power. The closer you are, the straighter it lands.",
  table_throw:  "Power controls distance and rotation. Aim for the right table.",
  sliding_tray: "Same throw as Table Throw, but the tray moves. Time it right.",
};

const WIND_LABEL = { none:"Calm", light:"Breezy", medium:"Windy", strong:"Strong" };
const WIND_COLOR = { none:"rgba(147,197,253,0.35)", light:"rgba(147,197,253,0.75)", medium:"#93c5fd", strong:"#bfdbfe" };

// forwardRef so parent can update transform directly without setState
const Bottle = memo(forwardRef(({ config, x, y, rot }, ref) => (
  <div ref={ref} className="absolute bottom-8 left-1/2" style={{ transformOrigin:"50% 76%", transform:`translateX(calc(-50% + ${x}px)) translateY(${-y}px) rotate(${rot}deg)` }}>
    <div className="relative" style={{ width:34, height:70 }}>
      <div className="absolute left-1/2 top-0 -translate-x-1/2 rounded-sm" style={{ width:16, height:9, background:config.cap }} />
      <div className="absolute left-1/2 -translate-x-1/2" style={{ top:8, width:12, height:12, background:config.body }} />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 overflow-hidden rounded-xl" style={{ width:34, height:50, background:config.body, border:"2px solid rgba(255,255,255,0.35)", boxShadow:"inset 0 0 18px rgba(255,255,255,0.12)" }}>
        <div className="absolute bottom-0 w-full" style={{ height:config.fill, background:config.liquid }} />
      </div>
    </div>
  </div>
)));

const BottleFlipGame = ({ onBack }) => {
  const [phase, setPhase]         = useState("idle");
  const [bottle, setBottle]       = useState({ x:0, y:0, rot:0 });
  const [result, setResult]       = useState(null);
  const [score, setScore]         = useState(0);
  const [attempts, setAttempts]   = useState(0);
  const [streak, setStreak]       = useState(0);
  const [best, setBest]           = useState(0);
  const [modeIdx, setModeIdx]     = useState(0);
  const [bottleIdx, setBottleIdx] = useState(0);
  const [windOn, setWindOn]       = useState(false);

  const dirRef          = useRef(1);
  const powerRef        = useRef(0);
  const phaseRef        = useRef("idle");
  const chargeRaf       = useRef(null);
  const flipRaf         = useRef(null);
  const trayXRef        = useRef(0);
  const trayElRef       = useRef(null);
  const trayRafRef      = useRef(null);
  const trayTickRef     = useRef(0);
  const bottleOnTrayRef = useRef(false);
  const gustSpawnRef    = useRef(null);
  const gustsRef        = useRef([]);

  // DOM refs — direct style updates avoid React re-renders inside rAF loops
  const bottleElRef        = useRef(null);
  const bottleShadowRef    = useRef(null);
  const powerBarMobileRef  = useRef(null);
  const powerBarDesktopRef = useRef(null);
  const gustContainerRef   = useRef(null);
  const windBadgeRef       = useRef(null);
  const windBadgeLabelRef  = useRef(null);
  const windEmojiRef       = useRef(null);

  const mode    = MODES[modeIdx];
  const bConfig = BOTTLES[bottleIdx];
  const locked  = phase === "charging" || phase === "flipping";

  // --- Direct DOM helpers (zero React re-renders) ---

  const updatePowerBar = (val) => {
    const h  = `${val}%`;
    const bg = val > 72 ? "#ef4444" : val > 38 ? "#ffcb05" : "#22c55e";
    if (powerBarMobileRef.current)  { powerBarMobileRef.current.style.height  = h; powerBarMobileRef.current.style.background  = bg; }
    if (powerBarDesktopRef.current) { powerBarDesktopRef.current.style.height = h; powerBarDesktopRef.current.style.background = bg; }
  };

  const updateBottleTransform = (x, y, rot) => {
    if (bottleElRef.current) {
      bottleElRef.current.style.transform = `translateX(calc(-50% + ${x}px)) translateY(${-y}px) rotate(${rot}deg)`;
    }
    if (bottleShadowRef.current) {
      bottleShadowRef.current.style.transform = `translateX(calc(-50% + ${x}px))`;
    }
  };

  const updateWindBadgeDOM = (gustList) => {
    if (!windBadgeRef.current) return;
    const strongest = gustList.some(g => g.strength === "strong") ? "strong"
      : gustList.some(g => g.strength === "medium") ? "medium"
      : gustList.length > 0 ? "light" : "none";
    if (windBadgeLabelRef.current) {
      windBadgeLabelRef.current.textContent = WIND_LABEL[strongest];
      windBadgeLabelRef.current.style.color  = WIND_COLOR[strongest];
    }
    const active = gustList.length > 0;
    windBadgeRef.current.style.animation = active ? "windBadgeSway 2.2s ease-in-out infinite" : "";
    if (windEmojiRef.current) {
      windEmojiRef.current.style.animation = active ? "windEmojiPush 1.1s ease-in-out infinite" : "";
    }
  };

  // --- Lifecycle ---

  useEffect(() => () => {
    cancelAnimationFrame(chargeRaf.current);
    cancelAnimationFrame(flipRaf.current);
    cancelAnimationFrame(trayRafRef.current);
    clearTimeout(gustSpawnRef.current);
  }, []);

  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // Wind: spawn streaks as raw DOM nodes — no React state, no re-renders
  useEffect(() => {
    if (!windOn) {
      clearTimeout(gustSpawnRef.current);
      if (gustContainerRef.current) gustContainerRef.current.innerHTML = "";
      gustsRef.current = [];
      return;
    }
    let alive = true;
    const spawn = () => {
      if (!alive) return;
      const r           = Math.random();
      const strength    = r < 0.5 ? "light" : r < 0.85 ? "medium" : "strong";
      const dir         = Math.random() > 0.5 ? 1 : -1;
      const vxPush      = strength === "light" ? 0.05 : strength === "medium" ? 0.12 : 0.20;
      const rotPush     = strength === "light" ? 0.35 : strength === "medium" ? 0.75 : 1.30;
      const duration    = 700 + Math.random() * 500;
      const id          = Date.now() + Math.random();
      const streamCount = strength === "strong" ? 4 : strength === "medium" ? 3 : 2;
      const streaks     = Array.from({ length: streamCount }, () => ({
        top:   10 + Math.random() * 80,
        width: 20 + Math.random() * 40,
        delay: Math.random() * 0.15,
      }));

      gustsRef.current.push({ id, dir, vxPush, rotPush, strength });

      const container = gustContainerRef.current;
      if (container) {
        const bgColor   = strength === "strong" ? "rgba(147,197,253,0.70)" : strength === "medium" ? "rgba(147,197,253,0.50)" : "rgba(147,197,253,0.28)";
        const h         = strength === "strong" ? 3 : 2;
        const animName  = dir === 1 ? "windStreak" : "windStreakRTL";
        const durSec    = (duration / 1000).toFixed(2);
        for (const s of streaks) {
          const el = document.createElement("div");
          el.className    = "pointer-events-none absolute rounded-full";
          el.dataset.gustId = String(id);
          el.style.cssText  = `top:${s.top}%;${dir === 1 ? `left:${-Math.ceil(s.width)}px` : `right:${-Math.ceil(s.width)}px`};width:${Math.ceil(s.width)}px;height:${h}px;background:${bgColor};animation:${animName} ${durSec}s linear ${s.delay}s forwards;`;
          container.appendChild(el);
        }
      }

      updateWindBadgeDOM(gustsRef.current);

      setTimeout(() => {
        container?.querySelectorAll(`[data-gust-id="${id}"]`).forEach(el => el.remove());
        gustsRef.current = gustsRef.current.filter(g => g.id !== id);
        updateWindBadgeDOM(gustsRef.current);
      }, duration + 200);

      gustSpawnRef.current = setTimeout(spawn, 500 + Math.random() * 1800);
    };
    gustSpawnRef.current = setTimeout(spawn, 300 + Math.random() * 500);
    return () => {
      alive = false;
      clearTimeout(gustSpawnRef.current);
      if (gustContainerRef.current) gustContainerRef.current.innerHTML = "";
      gustsRef.current = [];
    };
  }, [windOn]);

  // Sliding tray: direct DOM for both tray and bottle-on-tray
  useEffect(() => {
    cancelAnimationFrame(trayRafRef.current);
    trayXRef.current = TRAY_CENTER;
    if (modeIdx !== 2) return;
    const animate = () => {
      trayTickRef.current++;
      const x = TRAY_CENTER + Math.sin(trayTickRef.current * TRAY_SPD) * TRAY_AMP;
      trayXRef.current = x;
      if (trayElRef.current) trayElRef.current.style.left = `calc(50% + ${x}px)`;
      if (bottleOnTrayRef.current) updateBottleTransform(x, 0, 0);
      trayRafRef.current = requestAnimationFrame(animate);
    };
    trayRafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(trayRafRef.current);
  }, [modeIdx]);

  // --- Game actions ---

  const changeMode = (e, i) => {
    e.stopPropagation();
    if (locked) return;
    cancelAnimationFrame(flipRaf.current);
    const m = MODES[i];
    setModeIdx(i);
    setBottle({ x: m.startX, y: 0, rot: 0 });
    updateBottleTransform(m.startX, 0, 0);
    setResult(null);
    phaseRef.current = "idle";
    setPhase("idle");
  };

  const startCharge = () => {
    if (phaseRef.current === "charging" || phaseRef.current === "flipping") return;
    cancelAnimationFrame(flipRaf.current);
    setBottle({ x: mode.startX, y: 0, rot: 0 });
    updateBottleTransform(mode.startX, 0, 0);
    setResult(null);
    bottleOnTrayRef.current = false;
    powerRef.current = 0; dirRef.current = 1;
    updatePowerBar(0);
    phaseRef.current = "charging"; setPhase("charging");

    const loop = () => {
      let n = powerRef.current + dirRef.current * 2;
      if (n >= 100) { n = 100; dirRef.current = -1; }
      if (n <= 0)   { n = 0;   dirRef.current = 1;  }
      powerRef.current = n;
      updatePowerBar(n);
      chargeRaf.current = requestAnimationFrame(loop);
    };
    chargeRaf.current = requestAnimationFrame(loop);
  };

  const release = () => {
    if (phaseRef.current !== "charging") return;
    cancelAnimationFrame(chargeRaf.current);
    phaseRef.current = "flipping"; setPhase("flipping");

    const p  = powerRef.current;
    const m  = mode;
    const bc = bConfig;
    let vx, vy, x, rot, spinSpeed;

    x = m.startX; rot = 0;

    if (m.id === "table_throw" || m.id === "sliding_tray") {
      vx = 3 + (p / 100) * 8;
      vy = 4 + (p / 100) * 9;
    } else {
      vx = 0;
      vy = 5 + (p / 100) * 12;
    }

    const powerOff   = p - m.ideal;
    const sens       = BASE_SENS * bc.spin;
    const jitterAmp  = BASE_JITTER + Math.abs(powerOff) * 0.06;
    const jitter     = (Math.random() * 2 - 1) * jitterAmp;
    const landingErr = powerOff * sens + jitter;
    const totalRot   = 360 * m.turns + landingErr;

    let simVy = vy, simY = 0, flightFrames = 0;
    do {
      simVy -= GRAVITY;
      simY  += simVy;
      flightFrames++;
    } while (simY > 0 && flightFrames < 1000);
    spinSpeed = totalRot / flightFrames;

    let y = 0;

    const loop = () => {
      vy -= GRAVITY;
      for (const gust of gustsRef.current) {
        vx  += gust.dir * gust.vxPush;
        rot += gust.rotPush;
      }
      y   += vy;
      x   += vx;
      rot += spinSpeed;

      if (y <= 0) {
        const mod   = ((rot % 360) + 360) % 360;
        const base  = Math.round(rot / 360) * 360;
        const dist  = Math.min(mod, 360 - mod);
        const tol   = Math.max(TOL_MIN, m.tolerance * bc.stability);
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

        const landed  = rotOK && posOK;
        const perfect = landed && dist <= PERFECT_TOL;
        const restRot = landed ? base : base + (mod < 180 ? 88 : 272);

        setAttempts(a => a + 1);
        phaseRef.current = "result"; setPhase("result");
        updatePowerBar(0);

        if (landed) {
          setStreak(st => {
            const ns = st + 1;
            setBest(b => Math.max(b, ns));
            setScore(sc => sc + (perfect ? m.bonus * 2 : m.bonus) + (ns > 1 ? ns - 1 : 0));
            return ns;
          });
          setResult({ type:"land", text: perfect ? "Perfect!" : "Landed!" });
        } else {
          setStreak(0);
          setResult({ type:"fall", text: failText });
        }

        if (landed && m.id !== "sliding_tray") {
          const wobbleAmp = Math.min(12, 4 + dist * 0.7);
          let wt = 0;
          const wobble = () => {
            wt++;
            const decay = Math.max(0, 1 - wt / 26);
            const off   = Math.sin(wt * 0.65) * wobbleAmp * decay;
            updateBottleTransform(x, 0, base + off);
            if (wt < 26) {
              flipRaf.current = requestAnimationFrame(wobble);
            } else {
              setBottle({ x, y: 0, rot: base });
            }
          };
          flipRaf.current = requestAnimationFrame(wobble);
        } else {
          setBottle({ x, y: 0, rot: restRot });
        }
        return;
      }

      updateBottleTransform(x, y, rot);
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

  return (
    <div>
      <BackButton className="mb-4" onClick={(e) => { e.stopPropagation(); onBack(); }} />

      {/* Stats */}
      <div className="mx-auto mb-4 grid max-w-2xl grid-cols-4 gap-3 px-2 text-center">
        <div><p className="text-xs uppercase text-white/35">Score</p><p className="font-futura text-2xl font-bold text-[#ffcb05]">{score}</p></div>
        <div><p className="text-xs uppercase text-white/35">Tries</p><p className="font-futura text-2xl font-bold text-white">{attempts}</p></div>
        <div><p className="text-xs uppercase text-white/35">Streak</p><p className="font-futura text-2xl font-bold text-green-400">{streak}</p></div>
        <div><p className="text-xs uppercase text-white/35">Best</p><p className="font-futura text-2xl font-bold text-white">{best}</p></div>
      </div>

      {/* Controls */}
      <div className="mx-auto mb-3 flex max-w-2xl flex-col gap-2 px-2">
        <div className="flex gap-1.5">
          {MODES.map((m, i) => (
            <button key={m.id} onClick={(e) => changeMode(e, i)}
              className="flex-1 rounded-2xl border py-2 text-[10px] font-bold uppercase sm:text-xs"
              style={selStyle(i === modeIdx, "#ffcb05")}>
              {m.label}
            </button>
          ))}
        </div>
        <div className="flex justify-center gap-1.5">
          {BOTTLES.map((b, i) => (
            <button key={b.id}
              onClick={(e) => { e.stopPropagation(); if (!locked) setBottleIdx(i); }}
              className="rounded-2xl border px-2.5 py-1.5 text-[10px] font-bold uppercase sm:px-3 sm:py-2 sm:text-xs"
              style={selStyle(i === bottleIdx, "#86efac")}>
              {b.label}
            </button>
          ))}
          <button
            onClick={(e) => { e.stopPropagation(); if (!locked) setWindOn(w => !w); }}
            className="rounded-2xl border px-2.5 py-1.5 text-[10px] font-bold uppercase sm:px-3 sm:py-2 sm:text-xs"
            style={selStyle(windOn, "#93c5fd")}>
            Wind
          </button>
        </div>
      </div>

      {/* Arena */}
      <div
        className="relative mx-auto select-none overflow-hidden rounded-3xl"
        style={{
          maxWidth: 700,
          height: "clamp(280px, 55vh, 370px)",
          background: "linear-gradient(180deg,#1a1a2e 0%,#16213e 45%,#13231c 46%,#0d1a12 100%)",
          border: "3px solid rgba(255,255,255,0.06)",
          cursor: locked ? "grabbing" : "pointer",
          boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
        }}
        onPointerDown={startCharge}
        onPointerUp={release}
        onPointerLeave={release}
        onPointerCancel={release}
      >
        <GridOverlay />

        {/* Wind streak container — populated directly as DOM nodes, not React state */}
        {windOn && <div ref={gustContainerRef} className="pointer-events-none absolute inset-0" />}

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
              <div className="pointer-events-none absolute rounded-sm"
                style={{ bottom:32, left:`calc(50% + ${tX}px)`, transform:"translateX(-50%)", width:tW, height:12, background:"#7a4825", boxShadow:"0 6px 20px rgba(0,0,0,0.5)" }} />
              <div className="pointer-events-none absolute rounded-sm"
                style={{ bottom:4, left:`calc(50% + ${tX - tW/2 + 4}px)`, width:9, height:28, background:"#5a3a1a" }} />
              <div className="pointer-events-none absolute rounded-sm"
                style={{ bottom:4, left:`calc(50% + ${tX + tW/2 - 13}px)`, width:9, height:28, background:"#5a3a1a" }} />
            </>
          );
        })()}
        {mode.id === "sliding_tray" && (
          <div ref={trayElRef} className="pointer-events-none absolute rounded-md"
            style={{ bottom:32, left:"50%", transform:"translateX(-50%)", width:TRAY_W, height:10, background:"#b8953a", boxShadow:"0 4px 16px rgba(0,0,0,0.5)" }} />
        )}

        {/* Bottle shadow — updated via ref during animation */}
        <div ref={bottleShadowRef}
          className="pointer-events-none absolute bottom-[27px] left-1/2 h-2 w-8 rounded-full bg-black/25"
          style={{ transform:`translateX(calc(-50% + ${bottle.x}px))` }} />

        <Bottle ref={bottleElRef} config={bConfig} x={bottle.x} y={bottle.y} rot={bottle.rot} />

        {/* Wind badge — content updated via DOM refs */}
        {windOn && (
          <div ref={windBadgeRef}
            className="pointer-events-none absolute right-4 top-3 flex items-center gap-1.5 rounded-full border border-blue-400/30 bg-black/40 px-3 py-1">
            <span ref={windEmojiRef} className="text-sm" style={{ display:"inline-block" }}>💨</span>
            <span ref={windBadgeLabelRef} className="font-futura text-[10px] uppercase" style={{ color: WIND_COLOR.none }}>
              {WIND_LABEL.none}
            </span>
          </div>
        )}

        {/* Result */}
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

        {/* Mobile: info box */}
        <div className="pointer-events-none absolute left-3 top-3 sm:hidden" style={{ width:128 }}>
          <div className="rounded-xl border border-white/8 bg-black/45 px-2.5 py-2 backdrop-blur-sm">
            <p className="text-[9px] uppercase text-white/35">{mode.label}</p>
            {mode.id === "default"      && <p className="font-futura text-xs font-bold text-white">Hit {mode.ideal}% power</p>}
            {mode.id === "table_throw"  && <p className="font-futura text-[10px] font-bold text-white/60">Aim for the table</p>}
            {mode.id === "sliding_tray" && <p className="font-futura text-[10px] font-bold text-white/60">Hit the moving tray</p>}
          </div>
        </div>

        {/* Mobile: power bar — height/color driven by DOM ref */}
        <div className="pointer-events-none absolute left-3 top-16 h-20 w-3 overflow-hidden rounded-full bg-white/10 sm:hidden">
          <div ref={powerBarMobileRef} className="absolute bottom-0 w-full rounded-full" style={{ height:"0%", background:"#22c55e" }} />
        </div>

        {/* Desktop: power bar */}
        <div className="pointer-events-none absolute bottom-5 left-5 hidden h-32 w-3 overflow-hidden rounded-full bg-white/10 sm:block">
          <div ref={powerBarDesktopRef} className="absolute bottom-0 w-full rounded-full" style={{ height:"0%", background:"#22c55e" }} />
        </div>

        {/* Desktop: info box */}
        <div className="pointer-events-none absolute bottom-4 right-4 hidden rounded-2xl border border-white/8 bg-black/30 px-4 py-3 text-right backdrop-blur-sm sm:block">
          <p className="text-[10px] uppercase text-white/35">{mode.label}</p>
          {mode.id === "default" && (
            <>
              <p className="font-futura text-base font-bold text-white">{mode.ideal}%</p>
              <p className="text-[9px] uppercase text-white/30">target power</p>
            </>
          )}
          {mode.id === "table_throw"  && <p className="font-futura text-xs font-bold text-white/60">Aim for the table</p>}
          {mode.id === "sliding_tray" && <p className="font-futura text-xs font-bold text-white/60">Hit the moving tray</p>}
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-white/35">{TIPS[mode.id]}</p>
    </div>
  );
};

export default BottleFlipGame;
