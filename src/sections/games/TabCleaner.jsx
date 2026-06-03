import { useCallback, useEffect, useRef, useState } from "react";

const GAME_DURATION = 45;

const GOOD_TABS = [
  { emoji: "📧", label: "Email: Job Interview Confirmation" },
  { emoji: "🏦", label: "BCA: Transfer Receipt" },
  { emoji: "📦", label: "Shopee: Order on the Way" },
  { emoji: "🏥", label: "BPJS Appointment, Monday 9am" },
  { emoji: "✈️", label: "Flight Booking, Step 2 of 3" },
  { emoji: "🧾", label: "Monthly Electricity Bill" },
  { emoji: "🎓", label: "Online Course, Chapter 4" },
  { emoji: "🛒", label: "Tokopedia: Flash Sale Checkout" },
  { emoji: "📱", label: "Compare Smartphones" },
  { emoji: "🗺️", label: "Google Maps: Route to Home" },
  { emoji: "🍔", label: "GoFood Order, Arriving Soon" },
  { emoji: "💳", label: "OVO: Top-Up Successful" },
];

const BAD_TABS = [
  { emoji: "🎰", label: "WIN $1,000 NOW!!!" },
  { emoji: "🦠", label: "Your PC has 47 viruses" },
  { emoji: "🎵", label: "Just one more TikTok..." },
  { emoji: "🔔", label: "Allow Notifications? ALLOW?" },
  { emoji: "💊", label: "Cheap meds, no prescription!" },
  { emoji: "👻", label: "You've been selected!" },
  { emoji: "💰", label: "Make $500/day GUARANTEED" },
  { emoji: "🏆", label: "You are visitor #1,000,000!" },
  { emoji: "🎁", label: "Claim your FREE gift now!" },
  { emoji: "📢", label: "Your account expires TODAY!" },
  { emoji: "🕹️", label: "Candy Crush wants you back!" },
  { emoji: "😍", label: "Hot singles in your area" },
  { emoji: "🔄", label: "This page is reloading... (47x)" },
  { emoji: "🎬", label: "Just one more YouTube video..." },
  { emoji: "🛍️", label: "Shopee voucher expires in 5 mins!" },
  { emoji: "🎲", label: "Online Slots - 100% Bonus!" },
  { emoji: "📲", label: "Download this app, earn money!" },
];

const getPhase = (timeLeft) => {
  if (timeLeft > 30) return { interval: 2000, lifespan: 4500 };
  if (timeLeft > 15) return { interval: 1400, lifespan: 3500 };
  return                    { interval: 850,  lifespan: 2600 };
};

const badChance = (timeLeft) =>
  timeLeft > 30 ? 0.55 : timeLeft > 15 ? 0.65 : 0.72;

const MiniTabCard = ({ emoji, label, isSpam }) => (
  <div
    className="flex items-center gap-1.5 rounded-lg px-2 py-1.5"
    style={{
      background: isSpam ? "rgba(239,68,68,0.08)" : "rgba(34,197,94,0.08)",
      border: `1.5px solid ${isSpam ? "rgba(239,68,68,0.35)" : "rgba(34,197,94,0.35)"}`,
    }}
  >
    <span className="flex-shrink-0 text-sm leading-none">{emoji}</span>
    <span className="min-w-0 flex-1 truncate text-[10px] text-white/65">{label}</span>
    <span className={`flex-shrink-0 text-[10px] font-bold ${isSpam ? "text-red-400" : "text-white/20"}`}>
      {isSpam ? "✕" : "–"}
    </span>
  </div>
);

const TabCleanerGame = ({ onBack }) => {
  const idCounter = useRef(0);
  const [gameState, setGameState]   = useState("idle");
  const [tabs, setTabs]             = useState([]);
  const [score, setScore]           = useState(0);
  const [missed, setMissed]         = useState(0);
  const [wrongClose, setWrongClose] = useState(0);
  const [timeLeft, setTimeLeft]     = useState(GAME_DURATION);
  const [wrongFlash, setWrongFlash] = useState(false);
  const [oopsTab, setOopsTab]       = useState(null);

  const areaRef       = useRef(null);
  const timerRef      = useRef(null);
  const spawnRef      = useRef(null);
  const timeLeftRef   = useRef(GAME_DURATION);
  const gameActiveRef = useRef(false);
  const tabsRef       = useRef([]);

  useEffect(() => { tabsRef.current = tabs; }, [tabs]);

  const spawnTab = useCallback(() => {
    if (!areaRef.current || !gameActiveRef.current) return;
    const { width, height } = areaRef.current.getBoundingClientRect();
    const id    = ++idCounter.current;
    const isBad = Math.random() < badChance(timeLeftRef.current);
    const pool  = isBad ? BAD_TABS : GOOD_TABS;
    const tmpl  = pool[Math.floor(Math.random() * pool.length)];
    const phase = getPhase(timeLeftRef.current);
    const TAB_W = Math.min(240, Math.floor(width * 0.65));
    const TAB_H = 56;
    const GAP   = 8;

    const maxX = Math.max(10, width  - TAB_W - 8);
    const maxY = Math.max(10, height - TAB_H - 8);

    let x = Math.random() * maxX + 4;
    let y = Math.random() * maxY + 4;

    for (let i = 0; i < 12; i++) {
      const candidate = { x, y };
      const overlaps = tabsRef.current.some(
        (t) =>
          candidate.x < t.x + t.w + GAP &&
          candidate.x + TAB_W + GAP > t.x &&
          candidate.y < t.y + TAB_H + GAP &&
          candidate.y + TAB_H + GAP > t.y,
      );
      if (!overlaps) break;
      x = Math.random() * maxX + 4;
      y = Math.random() * maxY + 4;
    }

    const tab = {
      id,
      ...tmpl,
      type:     isBad ? "bad" : "good",
      x,
      y,
      lifespan: phase.lifespan,
      w:        TAB_W,
    };

    setTabs((t) => [...t, tab]);

    setTimeout(() => {
      setTabs((current) => {
        const exists = current.find((t) => t.id === id);
        if (exists && exists.type === "bad") setMissed((m) => m + 1);
        return current.filter((t) => t.id !== id);
      });
    }, phase.lifespan);
  }, []);

  const scheduleSpawn = useCallback(() => {
    if (!gameActiveRef.current) return;
    const phase = getPhase(timeLeftRef.current);
    spawnRef.current = setTimeout(() => {
      if (!gameActiveRef.current) return;
      spawnTab();
      scheduleSpawn();
    }, phase.interval);
  }, [spawnTab]);

  const startGame = () => {
    setTabs([]);
    setScore(0);
    setMissed(0);
    setWrongClose(0);
    setTimeLeft(GAME_DURATION);
    setWrongFlash(false);
    setOopsTab(null);
    timeLeftRef.current   = GAME_DURATION;
    gameActiveRef.current = true;
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
          setTabs([]);
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

  const closeTab = (id, type, emoji, label) => {
    setTabs((t) => t.filter((tab) => tab.id !== id));
    if (type === "bad") {
      setScore((s) => s + 1);
    } else {
      setWrongClose((w) => w + 1);
      setScore((s) => Math.max(0, s - 1));
      setWrongFlash(true);
      setOopsTab({ emoji, label });
      setTimeout(() => {
        setWrongFlash(false);
        setOopsTab(null);
      }, 950);
    }
  };

  const getRating = () => {
    if (score >= 20 && wrongClose === 0) return { label: "Spam Slayer 🏆",    color: "#ffcb05" };
    if (score >= 14 && wrongClose <= 2)  return { label: "Clean Inbox ✨",    color: "#22c55e" };
    if (score >= 7)                      return { label: "Getting There 💪",  color: "#60a5fa" };
    return                                      { label: "Tab Hoarder 😬",    color: "#f87171" };
  };

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/70 transition-all hover:border-white/30 hover:bg-white/10 hover:text-white"
      >
        <span className="leading-none">←</span><span>Back to Games</span>
      </button>

      {/* Stats */}
      <div className="mx-auto mb-4 flex max-w-2xl items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">✅</span>
          <span className="font-futura text-2xl font-bold text-white">{score}</span>
          <span className="text-xs text-white/40">closed</span>
        </div>
        <div
          className="font-futura text-3xl font-extrabold tabular-nums"
          style={{ color: timeLeft <= 5 ? "#ef4444" : "#ffcb05" }}
        >
          {gameState === "idle" ? `${GAME_DURATION}s` : `${timeLeft}s`}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/40">escaped</span>
          <span className="font-futura text-2xl font-bold text-red-400">{missed}</span>
          <span className="text-2xl">💨</span>
        </div>
      </div>

      {/* Browser frame */}
      <div
        className="mx-auto overflow-hidden rounded-2xl"
        style={{ maxWidth: 700, border: "3px solid rgba(255,255,255,0.07)" }}
      >
        {/* Chrome bar */}
        <div
          className="flex items-center gap-3 px-4 py-2.5 transition-colors duration-200"
          style={{
            background:   wrongFlash ? "#2a0a0a" : "#1e1e2e",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500 opacity-80" />
            <div className="h-3 w-3 rounded-full bg-yellow-400 opacity-80" />
            <div className="h-3 w-3 rounded-full bg-green-500 opacity-80" />
          </div>
          <div
            className="flex flex-1 items-center gap-2 rounded-md px-3 py-1 text-xs text-white/25"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <span>🔒</span>
            <span className="truncate">
              my-browser.local ·{" "}
              {gameState === "playing"
                ? `${tabs.length} tab${tabs.length !== 1 ? "s" : ""} open`
                : "ready"}
            </span>
          </div>
          {wrongClose > 0 && (
            <span className="flex-shrink-0 text-xs text-red-400/70">
              ❌ {wrongClose}
            </span>
          )}
        </div>

        {/* Persistent hint strip (playing only) */}
        {gameState === "playing" && (
          <div
            className="flex items-center justify-center gap-4 px-4 py-1.5 text-xs"
            style={{ background: "#13132a", borderBottom: "1px solid rgba(255,255,255,0.04)" }}
          >
            <span className="text-red-400/80">✕ Close spam tabs</span>
            <span className="text-white/15">|</span>
            <span className="text-green-400/60">Leave important ones alone</span>
          </div>
        )}

        {/* Arena */}
        <div
          ref={areaRef}
          className="relative overflow-hidden"
          style={{ height: "clamp(280px, 55vh, 370px)", background: "linear-gradient(160deg,#0f0f1a,#0a0a12)" }}
        >
          {/* Grid overlay */}
          <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.025]">
            {[...Array(10)].map((_, i) => (
              <line key={`v${i}`} x1={`${i * 10}%`} y1="0" x2={`${i * 10}%`} y2="100%" stroke="white" strokeWidth="1" />
            ))}
            {[...Array(6)].map((_, i) => (
              <line key={`h${i}`} x1="0" y1={`${i * 20}%`} x2="100%" y2={`${i * 20}%`} stroke="white" strokeWidth="1" />
            ))}
          </svg>

          {/* Arena flash on wrong close */}
          {wrongFlash && (
            <div
              className="pointer-events-none absolute inset-0 z-20"
              style={{ background: "rgba(239,68,68,0.14)", animation: "arenaFlash 0.45s ease forwards" }}
            />
          )}

          {/* Oops popup on wrong close */}
          {oopsTab && (
            <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
              <div
                className="flex flex-col items-center gap-1.5 rounded-2xl px-6 py-4 text-center"
                style={{
                  background: "rgba(18,4,4,0.97)",
                  border:     "2px solid rgba(239,68,68,0.55)",
                  boxShadow:  "0 0 40px rgba(239,68,68,0.25)",
                  animation:  "oopsPopup 0.95s ease forwards",
                  maxWidth:   220,
                }}
              >
                <span className="text-3xl">{oopsTab.emoji}</span>
                <p className="font-futura text-sm font-bold uppercase text-red-400">
                  Oops! That was important!
                </p>
                <p className="mt-0.5 w-full truncate text-xs text-white/40">
                  {oopsTab.label}
                </p>
              </div>
            </div>
          )}

          {/* ── IDLE ── */}
          {gameState === "idle" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-5">
              <p className="text-5xl">🧹</p>
              <p className="font-futura text-base uppercase text-white/60">
                Close the spam tabs!
              </p>

              {/* Legend:2-col grid, each col gets exactly half */}
              <div className="grid w-full max-w-xs grid-cols-2 gap-2">
                <div className="flex flex-col gap-1.5">
                  <p className="text-center text-[10px] font-bold uppercase text-red-400">
                    ✕ Close
                  </p>
                  <MiniTabCard emoji="🎰" label="WIN $1,000 NOW!!!" isSpam={true} />
                  <MiniTabCard emoji="🦠" label="PC has 47 viruses" isSpam={true} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <p className="text-center text-[10px] font-bold uppercase text-green-400">
                    ✓ Keep
                  </p>
                  <MiniTabCard emoji="📧" label="Email Confirmation" isSpam={false} />
                  <MiniTabCard emoji="🏦" label="Bank Transfer" isSpam={false} />
                </div>
              </div>

              <button
                onClick={startGame}
                className="rounded-full bg-primary px-10 py-3 font-futura font-bold uppercase text-white hover:opacity-80"
              >
                Start
              </button>
            </div>
          )}

          {/* ── GAME OVER ── */}
          {gameState === "over" &&
            (() => {
              const { label, color } = getRating();
              return (
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                  style={{ background: "rgba(0,0,0,0.82)", backdropFilter: "blur(6px)" }}
                >
                  <p className="text-5xl">🏁</p>
                  <p className="font-futura text-4xl font-extrabold text-white">
                    {score} tabs closed
                  </p>
                  <p className="font-futura text-base font-bold uppercase" style={{ color }}>
                    {label}
                  </p>
                  <div className="flex gap-5 text-sm text-white/50">
                    <span>✅ {score} closed</span>
                    <span>💨 {missed} escaped</span>
                    <span>❌ {wrongClose} wrong</span>
                  </div>
                  <button
                    onClick={startGame}
                    className="mt-1 rounded-full bg-primary px-10 py-3 font-futura font-bold uppercase text-white hover:opacity-80"
                  >
                    Play Again
                  </button>
                </div>
              );
            })()}

          {/* ── TABS ── */}
          {tabs.map((tab) => (
            <button
              key={tab.id}
              aria-label={`Close tab: ${tab.label}`}
              onClick={() => closeTab(tab.id, tab.type, tab.emoji, tab.label)}
              className="absolute overflow-hidden rounded-xl text-left transition-transform hover:scale-[1.03] active:scale-95"
              style={{
                left:       tab.x,
                top:        tab.y,
                width:      tab.w,
                background: "#1c1c2e",
                border:     "1.5px solid rgba(255,255,255,0.09)",
                boxShadow:  "0 4px 24px rgba(0,0,0,0.5)",
                animation:  "tabIn 0.22s cubic-bezier(0.34,1.56,0.64,1) forwards",
                cursor:     "pointer",
              }}
            >
              <div className="flex items-center gap-2 px-3 py-2">
                <span className="flex-shrink-0 text-lg leading-none">{tab.emoji}</span>
                <span
                  className="flex-1 truncate text-xs text-white/80"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {tab.label}
                </span>
                <span className="ml-1 flex-shrink-0 text-xs text-white/30">✕</span>
              </div>
              <div className="h-[3px]" style={{ background: "rgba(255,255,255,0.05)" }}>
                <div
                  className="h-full"
                  style={{
                    background:              "rgba(116,28,232,0.7)",
                    animationName:           "drainBar",
                    animationDuration:       `${tab.lifespan}ms`,
                    animationTimingFunction: "linear",
                    animationFillMode:       "forwards",
                  }}
                />
              </div>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};

export default TabCleanerGame;
