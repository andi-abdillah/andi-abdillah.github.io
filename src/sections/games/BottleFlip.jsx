import { useEffect, useRef, useState } from "react";

const GRAVITY = 0.5;

const BOTTLES = [
  {
    id: "classic",
    label: "Half Full",
    fill: "60%",
    body: "rgba(125,211,252,0.25)",
    liquid: "linear-gradient(180deg,#38bdf8,#0ea5e9)",
    cap: "#1e3a8a",
    stability: 1.08,
    spin: 1,
  },
  {
    id: "small",
    label: "Small",
    fill: "45%",
    body: "rgba(167,243,208,0.22)",
    liquid: "linear-gradient(180deg,#86efac,#22c55e)",
    cap: "#166534",
    stability: 0.9,
    spin: 1.18,
  },
  {
    id: "heavy",
    label: "Jumbo",
    fill: "70%",
    body: "rgba(254,240,138,0.2)",
    liquid: "linear-gradient(180deg,#fde047,#f97316)",
    cap: "#9a3412",
    stability: 1.18,
    spin: 0.86,
  },
];

const TARGETS = [
  {
    id: "table",
    label: "Warung Table",
    width: 160,
    tilt: 0,
    wind: 0,
    ideal: 50,
    window: 27,
    tolerance: 58,
    bonus: 1,
    surface: "#8b5a2b",
  },
  {
    id: "stool",
    label: "Plastic Stool",
    width: 112,
    tilt: 5,
    wind: 0.13,
    ideal: 58,
    window: 22,
    tolerance: 48,
    bonus: 2,
    surface: "#0ea5e9",
  },
  {
    id: "rack",
    label: "Narrow Rack",
    width: 82,
    tilt: -7,
    wind: -0.18,
    ideal: 64,
    window: 18,
    tolerance: 38,
    bonus: 3,
    surface: "#64748b",
  },
];

const Bottle = ({ config, x, y, rot }) => (
  <div
    className="absolute bottom-8 left-1/2"
    style={{
      transformOrigin: "50% 76%",
      transform: `translateX(calc(-50% + ${x}px)) translateY(${-y}px) rotate(${rot}deg)`,
    }}
  >
    <div className="relative" style={{ width: 34, height: 70 }}>
      <div
        className="absolute left-1/2 top-0 -translate-x-1/2 rounded-sm"
        style={{ width: 16, height: 9, background: config.cap }}
      />
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{ top: 8, width: 12, height: 12, background: config.body }}
      />
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 overflow-hidden rounded-xl"
        style={{
          width: 34,
          height: 50,
          background: config.body,
          border: "2px solid rgba(255,255,255,0.35)",
          boxShadow: "inset 0 0 18px rgba(255,255,255,0.12)",
        }}
      >
        <div className="absolute bottom-0 w-full" style={{ height: config.fill, background: config.liquid }} />
      </div>
    </div>
  </div>
);

const BottleFlipGame = ({ onBack }) => {
  const [phase, setPhase] = useState("idle");
  const [power, setPower] = useState(0);
  const [bottle, setBottle] = useState({ x: 0, y: 0, rot: 0 });
  const [result, setResult] = useState(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [targetIndex, setTargetIndex] = useState(0);
  const [bottleIndex, setBottleIndex] = useState(0);

  const dirRef = useRef(1);
  const powerRef = useRef(0);
  const phaseRef = useRef("idle");
  const chargeRaf = useRef(null);
  const flipRaf = useRef(null);

  const selectedBottle = BOTTLES[bottleIndex];
  const selectedTarget = TARGETS[targetIndex];
  const locked = phase === "charging" || phase === "flipping";

  useEffect(
    () => () => {
      cancelAnimationFrame(chargeRaf.current);
      cancelAnimationFrame(flipRaf.current);
    },
    [],
  );

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const startCharge = () => {
    if (phaseRef.current === "charging" || phaseRef.current === "flipping") return;

    setBottle({ x: 0, y: 0, rot: 0 });
    setResult(null);
    setPower(0);
    powerRef.current = 0;
    dirRef.current = 1;
    phaseRef.current = "charging";
    setPhase("charging");

    const loop = () => {
      setPower((current) => {
        let next = current + dirRef.current * 2;
        if (next >= 100) {
          next = 100;
          dirRef.current = -1;
        }
        if (next <= 0) {
          next = 0;
          dirRef.current = 1;
        }
        powerRef.current = next;
        return next;
      });
      chargeRaf.current = requestAnimationFrame(loop);
    };

    chargeRaf.current = requestAnimationFrame(loop);
  };

  const release = () => {
    if (phaseRef.current !== "charging") return;

    cancelAnimationFrame(chargeRaf.current);
    phaseRef.current = "flipping";
    setPhase("flipping");

    const launchPower = powerRef.current;
    const target = selectedTarget;
    const bottleConfig = selectedBottle;
    let vy = 5 + (launchPower / 100) * 12;
    let y = 0;
    let x = 0;
    let rot = 0;
    let vx = target.wind * (0.45 + launchPower / 130);
    const spinSpeed = (7.2 + launchPower / 9) * bottleConfig.spin;

    const loop = () => {
      vy -= GRAVITY;
      y += vy;
      x += vx;
      rot += spinSpeed;

      if (y <= 0) {
        const mod = ((rot % 360) + 360) % 360;
        const base = Math.round(rot / 360) * 360;
        const dist = Math.min(mod, 360 - mod);
        const powerMiss = Math.abs(launchPower - target.ideal);
        const targetLimit = target.width / 2 - 14;
        const tolerance = Math.max(24, target.tolerance * bottleConfig.stability - powerMiss * 0.35);
        const landed = dist <= tolerance && powerMiss <= target.window && Math.abs(x) <= targetLimit;
        const finalRot = landed ? base : base + (mod < 180 ? 88 : 272);

        setBottle({ x, y: 0, rot: finalRot });
        setAttempts((current) => current + 1);
        phaseRef.current = "result";
        setPhase("result");

        if (landed) {
          setResult({
            type: "land",
            text: powerMiss <= 5 ? "Perfect landing" : "Clean landing",
          });
          setStreak((current) => {
            const next = current + 1;
            setBest((bestScore) => Math.max(bestScore, next));
            setScore((scoreValue) => scoreValue + target.bonus + next - 1);
            return next;
          });
        } else {
          setResult({
            type: "fall",
            text:
              Math.abs(x) > targetLimit
                ? "Drifted away"
                : powerMiss > target.window
                  ? "Power missed"
                  : "Bad rotation",
          });
          setStreak(0);
        }
        return;
      }

      setBottle({ x, y, rot });
      flipRaf.current = requestAnimationFrame(loop);
    };

    flipRaf.current = requestAnimationFrame(loop);
  };

  const resetStats = () => {
    if (locked) return;
    setScore(0);
    setAttempts(0);
    setStreak(0);
    setBest(0);
    setPower(0);
    powerRef.current = 0;
    setResult(null);
    setBottle({ x: 0, y: 0, rot: 0 });
    phaseRef.current = "idle";
    setPhase("idle");
  };

  const hitRate = attempts === 0 ? "0" : Math.round((score / attempts) * 10) / 10;

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-white"
      >
        {"<-"} Back to Games
      </button>

      <div className="mx-auto mb-4 grid max-w-2xl grid-cols-4 gap-3 px-2 text-center">
        <div>
          <p className="text-xs uppercase text-white/35">Score</p>
          <p className="font-futura text-2xl font-bold text-[#ffcb05]">{score}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-white/35">Tries</p>
          <p className="font-futura text-2xl font-bold text-white">{attempts}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-white/35">Streak</p>
          <p className="font-futura text-2xl font-bold text-green-400">{streak}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-white/35">Best</p>
          <p className="font-futura text-2xl font-bold text-white">{best}</p>
        </div>
      </div>

      <div className="mx-auto mb-4 grid max-w-2xl gap-3 px-2 sm:grid-cols-[1fr,1fr,auto]">
        <div className="grid grid-cols-3 gap-2">
          {TARGETS.map((target, index) => (
            <button
              key={target.id}
              onClick={() => setTargetIndex(index)}
              disabled={locked}
              className="rounded-2xl border px-3 py-2 text-xs font-bold uppercase transition disabled:opacity-45"
              style={{
                borderColor: index === targetIndex ? "#ffcb05" : "rgba(255,255,255,0.12)",
                color: index === targetIndex ? "#ffcb05" : "rgba(255,255,255,0.62)",
                background: index === targetIndex ? "rgba(255,203,5,0.12)" : "rgba(255,255,255,0.05)",
              }}
            >
              {target.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {BOTTLES.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setBottleIndex(index)}
              disabled={locked}
              className="rounded-2xl border px-3 py-2 text-xs font-bold uppercase transition disabled:opacity-45"
              style={{
                borderColor: index === bottleIndex ? "#22c55e" : "rgba(255,255,255,0.12)",
                color: index === bottleIndex ? "#86efac" : "rgba(255,255,255,0.62)",
                background: index === bottleIndex ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.05)",
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        <button
          onClick={resetStats}
          disabled={locked}
          className="rounded-2xl border border-white/10 bg-white/5 px-5 py-2 font-futura text-sm font-bold uppercase text-white/70 transition hover:bg-white/10 disabled:opacity-45"
        >
          Reset
        </button>
      </div>

      <div
        className="relative mx-auto select-none overflow-hidden rounded-3xl"
        style={{
          maxWidth: 700,
          height: 370,
          background: "linear-gradient(180deg,#111827 0%,#23385f 47%,#284736 48%,#13251c 100%)",
          border: "3px solid rgba(255,255,255,0.06)",
          cursor: locked ? "grabbing" : "pointer",
          boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
        }}
        onPointerDown={startCharge}
        onPointerUp={release}
        onPointerLeave={release}
        onPointerCancel={release}
      >
        <div className="absolute left-0 right-0 top-[47%] h-4 bg-black/20" />
        <div
          className="absolute bottom-7 left-1/2 h-3 -translate-x-1/2 rounded-full shadow-2xl"
          style={{
            width: selectedTarget.width,
            background: selectedTarget.surface,
            transform: `translateX(-50%) rotate(${selectedTarget.tilt}deg)`,
            boxShadow: "0 16px 36px rgba(0,0,0,0.38)",
          }}
        />
        <div
          className="absolute bottom-3 left-1/2 h-2 -translate-x-1/2 rounded-full bg-black/35"
          style={{ width: selectedTarget.width + 24 }}
        />

        {Math.abs(selectedTarget.wind) > 0 && (
          <div
            className="absolute top-20 flex flex-col items-center gap-2"
            style={{ right: selectedTarget.wind > 0 ? 24 : "auto", left: selectedTarget.wind < 0 ? 24 : "auto" }}
          >
            <div className="relative h-14 w-14 rounded-full border border-white/20 bg-white/10">
              <div className="absolute left-1/2 top-1/2 h-2 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/35" />
              <div className="absolute left-1/2 top-1/2 h-10 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/35" />
            </div>
            <p className="text-[10px] font-bold uppercase text-white/45">Wind</p>
          </div>
        )}

        <Bottle config={selectedBottle} x={bottle.x} y={bottle.y} rot={bottle.rot} />

        {result && phase === "result" && (
          <div className="pointer-events-none absolute left-1/2 top-8 -translate-x-1/2 rounded-full bg-black/40 px-5 py-2 text-center backdrop-blur-sm">
            <p
              className="font-futura text-xl font-extrabold uppercase"
              style={{ color: result.type === "land" ? "#22c55e" : "#f87171" }}
            >
              {result.text}
            </p>
          </div>
        )}

        {phase === "idle" && (
          <p className="pointer-events-none absolute left-1/2 top-8 -translate-x-1/2 whitespace-nowrap font-futura text-sm uppercase text-white/55">
            Hold to charge, release to flip
          </p>
        )}

        <div className="absolute bottom-5 left-5 h-32 w-3 overflow-hidden rounded-full bg-white/10">
          <div
            className="absolute bottom-0 w-full rounded-full"
            style={{
              height: `${power}%`,
              background: power > 72 ? "#ef4444" : power > 38 ? "#ffcb05" : "#22c55e",
            }}
          />
        </div>

        <div className="absolute bottom-5 right-5 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-right backdrop-blur-sm">
          <p className="text-[10px] uppercase text-white/35">Target power</p>
          <p className="font-futura text-lg font-bold text-white">
            {selectedTarget.ideal - selectedTarget.window}-{selectedTarget.ideal + selectedTarget.window}
          </p>
          <p className="text-[10px] uppercase text-white/35">Avg score {hitRate}</p>
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-white/35">
        Tip: target rotation, power, and drift all matter. Harder surfaces pay bigger bonuses.
      </p>
    </div>
  );
};

export default BottleFlipGame;
