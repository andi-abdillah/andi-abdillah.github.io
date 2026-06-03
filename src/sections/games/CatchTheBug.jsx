import { useCallback, useEffect, useRef, useState } from "react";

const GAME_DURATION = 30;
const NORMAL_BUGS = ["🐛", "🪲", "🦟", "🪳", "🕷️"];

const getPhase = (timeLeft) => {
  if (timeLeft > 20) return { interval: 700, lifespan: 1200 };
  if (timeLeft > 10) return { interval: 520, lifespan: 970 };
  return { interval: 370, lifespan: 760 };
};

const BUG_CFG = {
  normal: { score: 1, lifespanMult: 1.0,  sizeClass: "text-3xl", label: "+1", color: "#ffffff" },
  fast:   { score: 2, lifespanMult: 0.58, sizeClass: "text-xl",  label: "+2", color: "#60a5fa" },
  golden: { score: 5, lifespanMult: 0.80, sizeClass: "text-3xl", label: "+5", color: "#ffcb05" },
};

const pickType = () => {
  const r = Math.random();
  if (r < 0.05) return "golden";
  if (r < 0.25) return "fast";
  return "normal";
};

let idCounter = 0;

const CatchTheBugGame = ({ onBack }) => {
  const [gameState, setGameState] = useState("idle");
  const [score, setScore]         = useState(0);
  const [caught, setCaught]       = useState(0);
  const [missed, setMissed]       = useState(0);
  const [timeLeft, setTimeLeft]   = useState(GAME_DURATION);
  const [bugs, setBugs]           = useState([]);
  const [splats, setSplats]       = useState([]);
  const [popups, setPopups]       = useState([]);

  const areaRef       = useRef(null);
  const timerRef      = useRef(null);
  const spawnRef      = useRef(null);
  const timeLeftRef   = useRef(GAME_DURATION);
  const gameActiveRef = useRef(false);

  const spawnBug = useCallback(() => {
    if (!areaRef.current || !gameActiveRef.current) return;
    const { width, height } = areaRef.current.getBoundingClientRect();
    const id   = ++idCounter;
    const type = pickType();
    const cfg  = BUG_CFG[type];
    const phase    = getPhase(timeLeftRef.current);
    const lifespan = phase.lifespan * cfg.lifespanMult;
    const emoji    = type === "golden"
      ? "⭐"
      : NORMAL_BUGS[Math.floor(Math.random() * NORMAL_BUGS.length)];

    setBugs((b) => [
      ...b,
      { id, x: Math.random() * (width - 60) + 10, y: Math.random() * (height - 60) + 10, emoji, type },
    ]);

    setTimeout(() => {
      setBugs((b) => {
        const exists = b.find((bug) => bug.id === id);
        if (exists) setMissed((m) => m + 1);
        return b.filter((bug) => bug.id !== id);
      });
    }, lifespan);
  }, []);

  const scheduleSpawn = useCallback(() => {
    if (!gameActiveRef.current) return;
    const phase = getPhase(timeLeftRef.current);
    spawnRef.current = setTimeout(() => {
      if (!gameActiveRef.current) return;
      spawnBug();
      scheduleSpawn();
    }, phase.interval);
  }, [spawnBug]);

  const startGame = () => {
    setScore(0);
    setCaught(0);
    setMissed(0);
    setTimeLeft(GAME_DURATION);
    timeLeftRef.current   = GAME_DURATION;
    gameActiveRef.current = true;
    setBugs([]);
    setSplats([]);
    setPopups([]);
    setGameState("playing");
  };

  useEffect(() => {
    if (gameState !== "playing") return;

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        const next = t - 1;
        timeLeftRef.current = next;
        if (next <= 0) {
          clearInterval(timerRef.current);
          clearTimeout(spawnRef.current);
          gameActiveRef.current = false;
          setBugs([]);
          setGameState("over");
          return 0;
        }
        return next;
      });
    }, 1000);

    scheduleSpawn();

    return () => {
      clearInterval(timerRef.current);
      clearTimeout(spawnRef.current);
      gameActiveRef.current = false;
    };
  }, [gameState, scheduleSpawn]);

  const catchBug = (id, x, y, type) => {
    const cfg = BUG_CFG[type];
    setScore((s) => s + cfg.score);
    setCaught((c) => c + 1);
    setBugs((b) => b.filter((bug) => bug.id !== id));

    const sid = ++idCounter;
    setSplats((s) => [...s, { id: sid, x, y }]);
    setPopups((p) => [...p, { id: sid, x, y, label: cfg.label, color: cfg.color }]);
    setTimeout(() => {
      setSplats((s) => s.filter((sp) => sp.id !== sid));
      setPopups((p) => p.filter((pp) => pp.id !== sid));
    }, 600);
  };

  const getRating = (sc) => {
    if (sc >= 30) return { label: "Bug Exterminator 🏆", color: "#ffcb05" };
    if (sc >= 18) return { label: "Senior Dev 🧑‍💻",      color: "#22c55e" };
    if (sc >= 8)  return { label: "Junior Dev 💻",        color: "#60a5fa" };
    return           { label: "Needs More Coffee ☕",     color: "#f87171" };
  };

  const accuracy = caught + missed > 0 ? Math.round((caught / (caught + missed)) * 100) : 0;

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/70 transition-all hover:border-white/30 hover:bg-white/10 hover:text-white"
      >
        ← Back to Games
      </button>

      <div className="mx-auto mb-4 flex max-w-2xl items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          <span className="font-futura text-2xl font-bold text-white">{score}</span>
          <span className="text-xs text-white/40">pts</span>
        </div>
        <div
          className="font-futura text-3xl font-extrabold tabular-nums"
          style={{ color: timeLeft <= 5 ? "#ef4444" : "#ffcb05" }}
        >
          {timeLeft}s
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/40">missed</span>
          <span className="font-futura text-2xl font-bold text-red-400">{missed}</span>
          <span className="text-2xl">💨</span>
        </div>
      </div>

      <div
        ref={areaRef}
        className="relative mx-auto overflow-hidden rounded-3xl"
        style={{
          maxWidth: 700,
          height: 360,
          background: "linear-gradient(160deg,#1a1a2e,#16213e)",
          border: "3px solid rgba(255,255,255,0.06)",
          cursor: gameState === "playing" ? "crosshair" : "default",
        }}
      >
        <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.04]">
          {[...Array(10)].map((_, i) => (
            <line key={`v${i}`} x1={`${i * 10}%`} y1="0" x2={`${i * 10}%`} y2="100%" stroke="white" strokeWidth="1" />
          ))}
          {[...Array(6)].map((_, i) => (
            <line key={`h${i}`} x1="0" y1={`${i * 20}%`} x2="100%" y2={`${i * 20}%`} stroke="white" strokeWidth="1" />
          ))}
        </svg>

        {gameState === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <p className="text-6xl">🐛</p>
            <p className="font-futura text-lg uppercase text-white/60">Ready to squash some bugs?</p>
            <div className="flex gap-5 text-xs text-white/35">
              <span>🐛 normal = +1</span>
              <span style={{ color: "#60a5fa" }}>fast = +2</span>
              <span style={{ color: "#ffcb05" }}>⭐ golden = +5</span>
            </div>
            <button
              onClick={startGame}
              className="rounded-full bg-primary px-10 py-3 font-futura font-bold uppercase text-white hover:opacity-80"
            >
              Start
            </button>
          </div>
        )}

        {gameState === "over" &&
          (() => {
            const { label, color } = getRating(score);
            return (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
              >
                <p className="text-5xl">🏁</p>
                <p className="font-futura text-4xl font-extrabold text-white">{caught} bugs</p>
                <p className="font-futura text-sm text-white/40">{score} pts total</p>
                <p className="font-futura text-base font-bold uppercase" style={{ color }}>
                  {label}
                </p>
                <div className="mt-1 grid w-48 grid-cols-3 text-center">
                  <div>
                    <p className="font-futura text-base font-bold text-white">{caught}</p>
                    <p className="text-[10px] text-white/40">caught</p>
                  </div>
                  <div>
                    <p className="font-futura text-base font-bold text-white">{missed}</p>
                    <p className="text-[10px] text-white/40">missed</p>
                  </div>
                  <div>
                    <p className="font-futura text-base font-bold text-white">{accuracy}%</p>
                    <p className="text-[10px] text-white/40">accuracy</p>
                  </div>
                </div>
                <button
                  onClick={startGame}
                  className="mt-2 rounded-full bg-primary px-10 py-3 font-futura font-bold uppercase text-white hover:opacity-80"
                >
                  Play Again
                </button>
              </div>
            );
          })()}

        {bugs.map((bug) => {
          const cfg      = BUG_CFG[bug.type];
          const isGolden = bug.type === "golden";
          const isFast   = bug.type === "fast";
          return (
            <button
              key={bug.id}
              onClick={() => catchBug(bug.id, bug.x, bug.y, bug.type)}
              className={`absolute flex select-none items-center justify-center ${cfg.sizeClass} hover:scale-125 active:scale-75`}
              style={{
                left:      bug.x,
                top:       bug.y,
                width:     44,
                height:    44,
                animation: "bugIn 0.2s cubic-bezier(0.34,1.56,0.64,1) forwards",
                filter:    isGolden
                  ? "drop-shadow(0 0 7px #ffcb05)"
                  : isFast
                    ? "drop-shadow(0 0 5px #60a5fa)"
                    : undefined,
              }}
            >
              {bug.emoji}
            </button>
          );
        })}

        {splats.map((sp) => (
          <div
            key={sp.id}
            className="pointer-events-none absolute text-2xl"
            style={{ left: sp.x, top: sp.y, animation: "splatOut 0.5s ease forwards" }}
          >
            💥
          </div>
        ))}

        {popups.map((pp) => (
          <div
            key={pp.id}
            className="pointer-events-none absolute font-futura text-sm font-bold"
            style={{
              left:      pp.x + 22,
              top:       pp.y - 8,
              color:     pp.color,
              animation: "popupUp 0.6s ease forwards",
            }}
          >
            {pp.label}
          </div>
        ))}

        <style>{`
          @keyframes bugIn    { from { opacity:0; transform:scale(0) } to { opacity:1; transform:scale(1) } }
          @keyframes splatOut { 0%  { opacity:1; transform:scale(1.5) } 100% { opacity:0; transform:scale(0.5) } }
          @keyframes popupUp  { 0%  { opacity:1; transform:translateY(0) } 100% { opacity:0; transform:translateY(-28px) } }
        `}</style>
      </div>
    </div>
  );
};

export default CatchTheBugGame;
