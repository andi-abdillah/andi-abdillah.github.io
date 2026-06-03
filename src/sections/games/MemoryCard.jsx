import { useCallback, useEffect, useRef, useState } from "react";

const GAME_DURATION = 45;

const CATEGORIES = [
  { id: "see",   label: "See & Hear",  emoji: "👀", color: "#7c3aed" },
  { id: "type",  label: "Type & Play", emoji: "🎮", color: "#1d4ed8" },
  { id: "save",  label: "Save Files",  emoji: "💾", color: "#065f46" },
  { id: "power", label: "Power Up",    emoji: "⚡", color: "#b45309" },
];

const ALL_ITEMS = [
  // See & Hear (10)
  { id: "tv",          emoji: "📺", label: "TV",              category: "see"   },
  { id: "monitor",     emoji: "🖥️", label: "Monitor",         category: "see"   },
  { id: "headphones",  emoji: "🎧", label: "Headphones",      category: "see"   },
  { id: "speaker",     emoji: "🔊", label: "Speaker",         category: "see"   },
  { id: "projector",   emoji: "📽️", label: "Projector",       category: "see"   },
  { id: "smarttv",     emoji: "📺", label: "Smart TV",        category: "see"   },
  { id: "earbuds",     emoji: "🎧", label: "Earbuds",         category: "see"   },
  { id: "radio",       emoji: "📻", label: "Radio",           category: "see"   },
  { id: "subwoofer",   emoji: "🔊", label: "Subwoofer",       category: "see"   },
  { id: "vr",          emoji: "🥽", label: "VR Headset",      category: "see"   },
  // Type & Play (10)
  { id: "keyboard",    emoji: "⌨️", label: "Keyboard",        category: "type"  },
  { id: "mouse",       emoji: "🖱️", label: "Mouse",           category: "type"  },
  { id: "controller",  emoji: "🎮", label: "Game Controller", category: "type"  },
  { id: "microphone",  emoji: "🎤", label: "Microphone",      category: "type"  },
  { id: "webcam",      emoji: "📷", label: "Webcam",          category: "type"  },
  { id: "trackpad",    emoji: "🖱️", label: "Trackpad",        category: "type"  },
  { id: "joystick",    emoji: "🕹️", label: "Joystick",        category: "type"  },
  { id: "stylus",      emoji: "✏️", label: "Stylus",          category: "type"  },
  { id: "scanner",     emoji: "🖨️", label: "Scanner",         category: "type"  },
  { id: "numpad",      emoji: "⌨️", label: "Numeric Keypad",  category: "type"  },
  // Save Files (6)
  { id: "flashdisk",   emoji: "💾", label: "Flash Disk",      category: "save"  },
  { id: "dvd",         emoji: "💿", label: "DVD",             category: "save"  },
  { id: "harddrive",   emoji: "🗄️", label: "Hard Drive",      category: "save"  },
  { id: "sdcard",      emoji: "🗃️", label: "SD Card",         category: "save"  },
  { id: "ssd",         emoji: "💾", label: "SSD",             category: "save"  },
  { id: "cdrom",       emoji: "💿", label: "CD-ROM",          category: "save"  },
  // Power Up (6)
  { id: "powerbank",   emoji: "🔋", label: "Power Bank",      category: "power" },
  { id: "charger",     emoji: "🔌", label: "Charger",         category: "power" },
  { id: "powerstrip",  emoji: "🔌", label: "Power Strip",     category: "power" },
  { id: "batteries",   emoji: "🔋", label: "AA Batteries",    category: "power" },
  { id: "usbcharger",  emoji: "🔌", label: "USB Charger",     category: "power" },
  { id: "solarpanel",  emoji: "🔆", label: "Solar Charger",   category: "power" },
];

const ROUND_SIZE = 16;

const CARD_W = 130;
const CARD_H = 130;

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

const SortItOutGame = ({ onBack }) => {
  const [gameState, setGameState]     = useState("idle");
  const [items, setItems]             = useState([]);
  const [currentIdx, setCurrentIdx]   = useState(0);
  const [correct, setCorrect]         = useState(0);
  const [wrong, setWrong]             = useState(0);
  const [timeLeft, setTimeLeft]       = useState(GAME_DURATION);
  const [dragPos, setDragPos]         = useState(null);
  const [hoveredZone, setHoveredZone] = useState(null);
  const [feedback, setFeedback]       = useState(null);

  const timerRef    = useRef(null);
  const zoneRefs    = useRef({});
  const dragging    = useRef(false);
  const itemsRef    = useRef([]);
  const idxRef      = useRef(0);
  const feedbackRef = useRef(null);

  // keep refs in sync so callbacks don't go stale
  useEffect(() => { itemsRef.current = items; },    [items]);
  useEffect(() => { idxRef.current   = currentIdx; }, [currentIdx]);
  useEffect(() => { feedbackRef.current = feedback; }, [feedback]);

  const getZoneAt = useCallback((x, y) => {
    for (const [id, el] of Object.entries(zoneRefs.current)) {
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return id;
    }
    return null;
  }, []);

  const handleDrop = useCallback((zoneId) => {
    const item = itemsRef.current[idxRef.current];
    if (!item || feedbackRef.current) return;

    const isCorrect = zoneId === item.category;
    const fb = { type: isCorrect ? "correct" : "wrong", zoneId };
    setFeedback(fb);
    feedbackRef.current = fb;

    if (isCorrect) {
      setCorrect((c) => c + 1);
      setTimeout(() => {
        setFeedback(null);
        feedbackRef.current = null;
        setCurrentIdx((i) => {
          const next = i + 1;
          if (next >= ROUND_SIZE) {
            clearInterval(timerRef.current);
            setGameState("over");
          }
          return next;
        });
      }, 380);
    } else {
      setWrong((w) => w + 1);
      setTimeout(() => {
        setFeedback(null);
        feedbackRef.current = null;
      }, 420);
    }
  }, []);

  const onPointerDown = (e) => {
    if (gameState !== "playing" || !itemsRef.current[idxRef.current] || feedbackRef.current) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragging.current = true;
    setDragPos({ x: e.clientX, y: e.clientY });
  };

  const onPointerMove = useCallback((e) => {
    if (!dragging.current) return;
    setDragPos({ x: e.clientX, y: e.clientY });
    setHoveredZone(getZoneAt(e.clientX, e.clientY));
  }, [getZoneAt]);

  const onPointerUp = useCallback((e) => {
    if (!dragging.current) return;
    dragging.current = false;
    const zone = getZoneAt(e.clientX, e.clientY);
    setDragPos(null);
    setHoveredZone(null);
    if (zone) handleDrop(zone);
  }, [getZoneAt, handleDrop]);

  const startGame = () => {
    const shuffled = shuffle(ALL_ITEMS).slice(0, ROUND_SIZE);
    setItems(shuffled);
    itemsRef.current = shuffled;
    setCurrentIdx(0);
    idxRef.current = 0;
    setCorrect(0);
    setWrong(0);
    setTimeLeft(GAME_DURATION);
    setDragPos(null);
    setHoveredZone(null);
    setFeedback(null);
    feedbackRef.current = null;
    dragging.current = false;
    setGameState("playing");
  };

  useEffect(() => {
    if (gameState !== "playing") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setGameState("over");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [gameState]);

  const currentItem = items[currentIdx];
  const totalSorted = correct + wrong;
  const accuracy    = totalSorted > 0 ? Math.round((correct / totalSorted) * 100) : 0;

  const getRating = () => {
    if (correct >= 14 && accuracy >= 85) return { label: "Tech Wizard 🧙",     color: "#ffcb05" };
    if (correct >= 10 && accuracy >= 70) return { label: "Good Sorter 🎯",     color: "#22c55e" };
    if (correct >= 5)                    return { label: "Getting There 💪",   color: "#60a5fa" };
    return                                      { label: "Keep Practicing 📚", color: "#f87171" };
  };

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-white"
      >
        ← Back to Games
      </button>

      {/* ── IDLE ── */}
      {gameState === "idle" && (
        <div className="flex flex-col items-center gap-5 py-10">
          <p className="text-6xl">🗂️</p>
          <p className="font-futura text-lg uppercase text-white/60">
            Drag each device into the right category!
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                <span>{cat.emoji}</span>
                <span className="font-futura font-bold uppercase">{cat.label}</span>
              </div>
            ))}
          </div>
          <button
            onClick={startGame}
            className="rounded-full bg-primary px-10 py-3 font-futura font-bold uppercase text-white hover:opacity-80"
          >
            Start
          </button>
        </div>
      )}

      {/* ── PLAYING / OVER ── */}
      {(gameState === "playing" || gameState === "over") && (
        <div className="mx-auto" style={{ maxWidth: 700 }}>

          {/* Stats */}
          <div className="mb-5 flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40">sorted</span>
              <span className="font-futura text-2xl font-bold text-white">{totalSorted}</span>
              <span className="text-xs text-white/40">/ {ROUND_SIZE}</span>
            </div>
            <div
              className="font-futura text-3xl font-extrabold tabular-nums"
              style={{ color: timeLeft <= 5 ? "#ef4444" : "#ffcb05" }}
            >
              {timeLeft}s
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40">correct</span>
              <span className="font-futura text-2xl font-bold" style={{ color: "#22c55e" }}>
                {correct}
              </span>
            </div>
          </div>

          {/* Draggable card */}
          <div className="mb-6 flex justify-center" style={{ height: CARD_H }}>
            {gameState === "playing" && currentItem && (
              <div
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                className="flex select-none flex-col items-center justify-center gap-2 rounded-2xl"
                style={{
                  width: CARD_W,
                  height: CARD_H,
                  background: feedback
                    ? feedback.type === "correct"
                      ? "rgba(34,197,94,0.18)"
                      : "rgba(239,68,68,0.15)"
                    : "linear-gradient(135deg,#1a1a2e,#16213e)",
                  border: feedback
                    ? `2px solid ${feedback.type === "correct" ? "#22c55e" : "#ef4444"}`
                    : "2px solid rgba(255,255,255,0.10)",
                  cursor:      feedback ? "default" : dragPos ? "grabbing" : "grab",
                  opacity:     dragPos && !feedback ? 0.2 : 1,
                  touchAction: "none",
                  transition:  "background 0.15s, border 0.15s, opacity 0.15s",
                  animation:   feedback?.type === "wrong" ? "shake 0.4s ease" : undefined,
                }}
              >
                <span className="text-5xl">
                  {feedback?.type === "correct" ? "✅" : currentItem.emoji}
                </span>
                <span className="font-futura text-xs font-bold uppercase text-white/80">
                  {feedback?.type === "correct" ? "Nice!" : currentItem.label}
                </span>
              </div>
            )}
          </div>

          {/* Drop zones */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {CATEGORIES.map((cat) => {
              const isHovered     = hoveredZone === cat.id;
              const isCorrectHit  = feedback?.zoneId === cat.id && feedback?.type === "correct";
              const isWrongHit    = feedback?.zoneId === cat.id && feedback?.type === "wrong";

              return (
                <div
                  key={cat.id}
                  ref={(el) => { zoneRefs.current[cat.id] = el; }}
                  className="flex flex-col items-center justify-center gap-2 rounded-2xl py-5 transition-all duration-150"
                  style={{
                    background: isCorrectHit
                      ? "rgba(34,197,94,0.2)"
                      : isWrongHit
                        ? "rgba(239,68,68,0.18)"
                        : isHovered
                          ? `${cat.color}28`
                          : "rgba(255,255,255,0.04)",
                    border: isCorrectHit
                      ? "2px solid #22c55e"
                      : isWrongHit
                        ? "2px solid #ef4444"
                        : isHovered
                          ? `2px solid ${cat.color}`
                          : "2px solid rgba(255,255,255,0.06)",
                    transform: isHovered ? "scale(1.04)" : "scale(1)",
                  }}
                >
                  <span className="text-2xl">{cat.emoji}</span>
                  <span className="font-futura text-xs font-bold uppercase text-white/60">
                    {cat.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Game over results */}
          {gameState === "over" && (
            <div className="mt-8 flex flex-col items-center gap-4">
              <p className="text-5xl">🏁</p>
              <p className="font-futura text-4xl font-extrabold text-white">
                {correct} / {ROUND_SIZE}
              </p>
              <p
                className="font-futura text-base font-bold uppercase"
                style={{ color: getRating().color }}
              >
                {getRating().label}
              </p>
              <div className="flex gap-5 text-sm text-white/55">
                <span>✅ {correct} correct</span>
                <span>❌ {wrong} wrong</span>
                <span>📊 {accuracy}% accuracy</span>
              </div>
              <button
                onClick={startGame}
                className="mt-2 rounded-full bg-primary px-10 py-3 font-futura font-bold uppercase text-white hover:opacity-80"
              >
                Play Again
              </button>
            </div>
          )}
        </div>
      )}

      {/* Ghost card following pointer */}
      {dragPos && currentItem && (
        <div
          className="pointer-events-none fixed z-50 flex select-none flex-col items-center justify-center gap-2 rounded-2xl"
          style={{
            width:      CARD_W,
            height:     CARD_H,
            left:       dragPos.x - CARD_W / 2,
            top:        dragPos.y - CARD_H / 2,
            background: "linear-gradient(135deg,#2a1a4e,#1e1040)",
            border:     "2px solid rgba(116,28,232,0.7)",
            boxShadow:  "0 20px 50px rgba(0,0,0,0.6)",
            transform:  "rotate(4deg) scale(1.06)",
          }}
        >
          <span className="text-5xl">{currentItem.emoji}</span>
          <span className="font-futura text-xs font-bold uppercase text-white">
            {currentItem.label}
          </span>
        </div>
      )}

      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0) }
          20%     { transform: translateX(-8px) }
          40%     { transform: translateX(8px) }
          60%     { transform: translateX(-5px) }
          80%     { transform: translateX(5px) }
        }
      `}</style>
    </div>
  );
};

export default SortItOutGame;
