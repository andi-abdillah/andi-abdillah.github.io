import { useCallback, useEffect, useRef, useState } from "react";

/* ────────────────────────────────────────────────
   CATCH THE BUG
──────────────────────────────────────────────── */
const GAME_DURATION  = 30;
const BUG_LIFESPAN   = 1200;
const SPAWN_INTERVAL = 700;
const BUGS = ["🐛","🪲","🦟","🪳","🕷️"];
let idCounter = 0;

const CatchTheBugGame = ({ onBack }) => {
  const [gameState, setGameState] = useState("idle");
  const [score, setScore]         = useState(0);
  const [missed, setMissed]       = useState(0);
  const [timeLeft, setTimeLeft]   = useState(GAME_DURATION);
  const [bugs, setBugs]           = useState([]);
  const [splats, setSplats]       = useState([]);
  const areaRef  = useRef(null);
  const timerRef = useRef(null);
  const spawnRef = useRef(null);

  const spawnBug = useCallback(() => {
    if (!areaRef.current) return;
    const { width, height } = areaRef.current.getBoundingClientRect();
    const id = ++idCounter;
    setBugs((b) => [...b, { id, x: Math.random()*(width-60)+10, y: Math.random()*(height-60)+10, emoji: BUGS[Math.floor(Math.random()*BUGS.length)] }]);
    setTimeout(() => {
      setBugs((b) => { const s = b.find(bug => bug.id===id); if(s) setMissed(m=>m+1); return b.filter(bug=>bug.id!==id); });
    }, BUG_LIFESPAN);
  }, []);

  const startGame = () => { setScore(0); setMissed(0); setTimeLeft(GAME_DURATION); setBugs([]); setSplats([]); setGameState("playing"); };

  useEffect(() => {
    if (gameState !== "playing") return;
    timerRef.current = setInterval(() => setTimeLeft(t => { if(t<=1){ clearInterval(timerRef.current); clearInterval(spawnRef.current); setBugs([]); setGameState("over"); return 0; } return t-1; }), 1000);
    spawnRef.current = setInterval(spawnBug, SPAWN_INTERVAL);
    return () => { clearInterval(timerRef.current); clearInterval(spawnRef.current); };
  }, [gameState, spawnBug]);

  const catchBug = (id, x, y) => {
    setScore(s=>s+1); setBugs(b=>b.filter(bug=>bug.id!==id));
    const sid = ++idCounter;
    setSplats(s=>[...s,{id:sid,x,y}]);
    setTimeout(()=>setSplats(s=>s.filter(sp=>sp.id!==sid)),500);
  };

  const getRating = () => {
    if (score>=25) return {label:"Bug Exterminator 🏆",color:"#ffcb05"};
    if (score>=15) return {label:"Senior Dev 🧑‍💻",color:"#22c55e"};
    if (score>=8)  return {label:"Junior Dev 💻",color:"#60a5fa"};
    return {label:"Needs More Coffee ☕",color:"#f87171"};
  };

  return (
    <div>
      <button onClick={onBack} className="mb-6 flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm">
        ← Back to Games
      </button>
      <div className="mx-auto mb-4 flex max-w-2xl items-center justify-between px-2">
        <div className="flex items-center gap-2"><span className="text-2xl">🎯</span><span className="font-futura text-2xl font-bold text-white">{score}</span><span className="text-xs text-white/40">caught</span></div>
        <div className="font-futura text-3xl font-extrabold tabular-nums" style={{color:timeLeft<=5?"#ef4444":"#ffcb05"}}>{timeLeft}s</div>
        <div className="flex items-center gap-2"><span className="text-xs text-white/40">missed</span><span className="font-futura text-2xl font-bold text-red-400">{missed}</span><span className="text-2xl">💨</span></div>
      </div>
      <div ref={areaRef} className="relative mx-auto overflow-hidden rounded-3xl" style={{maxWidth:700,height:360,background:"linear-gradient(160deg,#1a1a2e,#16213e)",border:"3px solid rgba(255,255,255,0.06)",cursor:gameState==="playing"?"crosshair":"default"}}>
        <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.04]">
          {[...Array(10)].map((_,i)=><line key={`v${i}`} x1={`${i*10}%`} y1="0" x2={`${i*10}%`} y2="100%" stroke="white" strokeWidth="1"/>)}
          {[...Array(6)].map((_,i)=><line key={`h${i}`} x1="0" y1={`${i*20}%`} x2="100%" y2={`${i*20}%`} stroke="white" strokeWidth="1"/>)}
        </svg>
        {gameState==="idle"&&<div className="absolute inset-0 flex flex-col items-center justify-center gap-4"><p className="text-6xl">🐛</p><p className="font-futura text-lg uppercase text-white/60">Ready to squash some bugs?</p><button onClick={startGame} className="rounded-full bg-primary px-10 py-3 font-futura font-bold uppercase text-white hover:opacity-80">Start</button></div>}
        {gameState==="over"&&(()=>{const{label,color}=getRating();return(<div className="absolute inset-0 flex flex-col items-center justify-center gap-3" style={{background:"rgba(0,0,0,0.75)",backdropFilter:"blur(4px)"}}><p className="text-5xl">🏁</p><p className="font-futura text-4xl font-extrabold text-white">{score} bugs caught</p><p className="font-futura text-base font-bold uppercase" style={{color}}>{label}</p><button onClick={startGame} className="mt-2 rounded-full bg-primary px-10 py-3 font-futura font-bold uppercase text-white hover:opacity-80">Play Again</button></div>);})()}
        {bugs.map(bug=><button key={bug.id} onClick={()=>catchBug(bug.id,bug.x,bug.y)} className="absolute flex select-none items-center justify-center text-3xl hover:scale-125 active:scale-75" style={{left:bug.x,top:bug.y,width:44,height:44,animation:"bugIn 0.2s cubic-bezier(0.34,1.56,0.64,1) forwards"}}>{bug.emoji}</button>)}
        {splats.map(sp=><div key={sp.id} className="pointer-events-none absolute text-2xl" style={{left:sp.x,top:sp.y,animation:"splatOut 0.5s ease forwards"}}>💥</div>)}
        <style>{`@keyframes bugIn{from{opacity:0;transform:scale(0)}to{opacity:1;transform:scale(1)}}@keyframes splatOut{0%{opacity:1;transform:scale(1.5)}100%{opacity:0;transform:scale(0.5)}}`}</style>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────────
   MEMORY CARD
──────────────────────────────────────────────── */
const EMOJI_CARDS = [
  { id:"pizza",    emoji:"🍕", bg:"#c2410c" },
  { id:"rocket",   emoji:"🚀", bg:"#1d4ed8" },
  { id:"lion",     emoji:"🦁", bg:"#b45309" },
  { id:"rainbow",  emoji:"🌈", bg:"#7c3aed" },
  { id:"guitar",   emoji:"🎸", bg:"#065f46" },
  { id:"butterfly",emoji:"🦋", bg:"#be185d" },
  { id:"trophy",   emoji:"🏆", bg:"#92400e" },
  { id:"globe",    emoji:"🌍", bg:"#155e75" },
];

const shuffle = (arr) => [...arr].sort(()=>Math.random()-0.5);

const MemoryCardGame = ({ onBack }) => {
  const [cards, setCards]           = useState([]);
  const [flipped, setFlipped]       = useState([]);
  const [matched, setMatched]       = useState([]);
  const [attempts, setAttempts]     = useState(0);
  const [gameState, setGameState]   = useState("idle");
  const [time, setTime]             = useState(0);
  const timerRef = useRef(null);

  const startGame = () => {
    const deck = shuffle([...EMOJI_CARDS, ...EMOJI_CARDS].map((c,i)=>({...c,uid:i})));
    setCards(deck); setFlipped([]); setMatched([]); setAttempts(0); setTime(0); setGameState("playing");
    timerRef.current = setInterval(()=>setTime(t=>t+1), 1000);
  };

  useEffect(()=>()=>clearInterval(timerRef.current),[]);

  const flip = (uid) => {
    if (flipped.length===2 || flipped.includes(uid) || matched.includes(cards.find(c=>c.uid===uid)?.id)) return;
    const newFlipped = [...flipped, uid];
    setFlipped(newFlipped);
    if (newFlipped.length===2) {
      setAttempts(a=>a+1);
      const [a,b] = newFlipped.map(u=>cards.find(c=>c.uid===u));
      if (a.id===b.id) {
        const newMatched = [...matched, a.id];
        setMatched(newMatched);
        setFlipped([]);
        if (newMatched.length===EMOJI_CARDS.length) { clearInterval(timerRef.current); setGameState("over"); }
      } else {
        setTimeout(()=>setFlipped([]),900);
      }
    }
  };

  const isFlipped = (uid) => flipped.includes(uid) || matched.includes(cards.find(c=>c.uid===uid)?.id);

  return (
    <div>
      <button onClick={onBack} className="mb-6 flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm">← Back to Games</button>
      {gameState==="idle" && (
        <div className="flex flex-col items-center gap-6 py-12">
          <p className="text-6xl">🃏</p>
          <p className="font-futura text-lg uppercase text-white/60">Find all matching pairs!</p>
          <button onClick={startGame} className="rounded-full bg-primary px-10 py-3 font-futura font-bold uppercase text-white hover:opacity-80">Start</button>
        </div>
      )}
      {gameState!=="idle" && (
        <>
          <div className="mx-auto mb-5 flex max-w-2xl justify-between px-2">
            <div className="flex items-center gap-2"><span className="text-white/40 text-sm">Attempts</span><span className="font-futura text-2xl font-bold text-white">{attempts}</span></div>
            <div className="flex items-center gap-2"><span className="text-white/40 text-sm">Matched</span><span className="font-futura text-2xl font-bold text-[#ffcb05]">{matched.length}/{EMOJI_CARDS.length}</span></div>
            <div className="flex items-center gap-2"><span className="font-futura text-2xl font-bold text-white">{time}s</span></div>
          </div>
          <div className="mx-auto grid max-w-2xl grid-cols-4 gap-3 md:grid-cols-8">
            {cards.map(card=>{
              const show = isFlipped(card.uid);
              return (
              <button key={card.uid} onClick={()=>flip(card.uid)}
                className="h-16 w-full rounded-xl text-3xl transition-all duration-300 hover:scale-105"
                style={{
                  background: show ? card.bg : "#1a1a2e",
                  border: show ? `2px solid ${card.bg}` : "2px solid rgba(255,255,255,0.08)",
                  transform: show ? "scale(1.05)" : "scale(1)",
                }}>
                {show ? card.emoji : <span className="text-white/20">?</span>}
              </button>
            )})}
          </div>
          {gameState==="over"&&(
            <div className="mt-8 flex flex-col items-center gap-3">
              <p className="font-futura text-3xl font-extrabold text-white">🎉 Completed in {time}s!</p>
              <p className="text-white/50">{attempts} attempts</p>
              <button onClick={startGame} className="mt-2 rounded-full bg-primary px-10 py-3 font-futura font-bold uppercase text-white hover:opacity-80">Play Again</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

/* ────────────────────────────────────────────────
   CODE BREAKER
──────────────────────────────────────────────── */
const SNIPPETS = [
  { code: `echo "Hello World";`, answer:"PHP", options:["PHP","Ruby","Bash","Perl"] },
  { code: `console.log("hello")`, answer:"JavaScript", options:["TypeScript","JavaScript","Dart","Swift"] },
  { code: `fmt.Println("Hello")`, answer:"Go", options:["Go","Rust","Java","Kotlin"] },
  { code: `print("hello")`, answer:"Python", options:["Ruby","Python","Lua","Haskell"] },
  { code: `Route::get('/users', [UserController::class, 'index']);`, answer:"PHP", options:["PHP","Ruby","Python","Java"] },
  { code: `const x: string = "hello"`, answer:"TypeScript", options:["TypeScript","JavaScript","Dart","Kotlin"] },
  { code: `SELECT * FROM users WHERE id = 1;`, answer:"SQL", options:["SQL","MongoDB","GraphQL","Redis"] },
  { code: `fn main() { println!("hi"); }`, answer:"Rust", options:["Rust","Go","C++","Swift"] },
  { code: `System.out.println("Hi");`, answer:"Java", options:["Java","Kotlin","C#","Scala"] },
  { code: `@Component\nexport class App {}`, answer:"TypeScript", options:["TypeScript","JavaScript","Dart","Java"] },
];

const CodeBreakerGame = ({ onBack }) => {
  const [gameState, setGameState] = useState("idle");
  const [qIndex, setQIndex]       = useState(0);
  const [score, setScore]         = useState(0);
  const [selected, setSelected]   = useState(null);
  const [timeLeft, setTimeLeft]   = useState(10);
  const timerRef = useRef(null);

  const questions = useRef(shuffle(SNIPPETS).slice(0,8));

  const nextQuestion = useCallback((wasCorrect) => {
    clearInterval(timerRef.current);
    if (wasCorrect) setScore(s=>s+1);
    setTimeout(()=>{
      if (qIndex+1>=questions.current.length) { setGameState("over"); }
      else { setQIndex(i=>i+1); setSelected(null); setTimeLeft(10); }
    }, 800);
  }, [qIndex]);

  useEffect(()=>{
    if (gameState!=="playing") return;
    setTimeLeft(10);
    timerRef.current = setInterval(()=>{
      setTimeLeft(t=>{
        if(t<=1){ nextQuestion(false); return 0; }
        return t-1;
      });
    },1000);
    return ()=>clearInterval(timerRef.current);
  },[gameState, qIndex, nextQuestion]);

  const startGame = () => {
    questions.current = shuffle(SNIPPETS).slice(0,8).map(q=>({...q, options: shuffle(q.options)}));
    setQIndex(0); setScore(0); setSelected(null); setTimeLeft(10); setGameState("playing");
  };

  const answer = (opt) => {
    if (selected) return;
    setSelected(opt);
    nextQuestion(opt===questions.current[qIndex].answer);
  };

  const q = questions.current[qIndex];
  const total = questions.current.length;

  return (
    <div>
      <button onClick={onBack} className="mb-6 flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm">← Back to Games</button>
      {gameState==="idle"&&(
        <div className="flex flex-col items-center gap-6 py-12">
          <p className="text-6xl">🔍</p>
          <p className="font-futura text-lg uppercase text-white/60">Guess the programming language!</p>
          <button onClick={startGame} className="rounded-full bg-primary px-10 py-3 font-futura font-bold uppercase text-white hover:opacity-80">Start</button>
        </div>
      )}
      {gameState==="playing"&&q&&(
        <div className="mx-auto max-w-2xl">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-white/40 text-sm">{qIndex+1} / {total}</span>
            <div className="font-futura text-2xl font-bold" style={{color:timeLeft<=3?"#ef4444":"#ffcb05"}}>{timeLeft}s</div>
            <span className="font-futura font-bold text-white">{score} pts</span>
          </div>
          <pre className="mb-6 overflow-x-auto rounded-2xl p-5 font-mono text-sm text-green-400" style={{background:"#0d0d0d",border:"2px solid rgba(255,255,255,0.06)"}}>{q.code}</pre>
          <div className="grid grid-cols-2 gap-3">
            {q.options.map(opt=>{
              let bg = "rgba(255,255,255,0.05)";
              let border = "rgba(255,255,255,0.1)";
              if (selected) {
                if (opt===q.answer) { bg="rgba(34,197,94,0.2)"; border="#22c55e"; }
                else if (opt===selected) { bg="rgba(239,68,68,0.2)"; border="#ef4444"; }
              }
              return (
                <button key={opt} onClick={()=>answer(opt)} className="rounded-xl px-6 py-4 font-futura font-bold uppercase text-white transition-all hover:opacity-80" style={{background:bg, border:`2px solid ${border}`}}>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {gameState==="over"&&(
        <div className="flex flex-col items-center gap-4 py-8">
          <p className="text-5xl">🏆</p>
          <p className="font-futura text-4xl font-extrabold text-white">{score} / {total}</p>
          <p className="font-futura text-base uppercase" style={{color:score>=7?"#ffcb05":score>=4?"#60a5fa":"#f87171"}}>
            {score>=7?"Language Master!":score>=4?"Getting There 💪":"Keep Coding 📚"}
          </p>
          <button onClick={startGame} className="mt-2 rounded-full bg-primary px-10 py-3 font-futura font-bold uppercase text-white hover:opacity-80">Play Again</button>
        </div>
      )}
    </div>
  );
};

/* ────────────────────────────────────────────────
   BOTTLE FLIP
──────────────────────────────────────────────── */
const GRAVITY    = 0.5;
const ROT_SPEED  = 12;
const TOLERANCE  = 55; // deg from upright that still counts

const Bottle = ({ y, rot }) => (
  <div
    className="absolute bottom-3 left-1/2"
    style={{
      transformOrigin: "50% 75%",
      transform: `translateX(-50%) translateY(${-y}px) rotate(${rot}deg)`,
    }}
  >
    <div className="relative" style={{ width: 32, height: 66 }}>
      {/* cap */}
      <div className="absolute left-1/2 top-0 -translate-x-1/2 rounded-sm" style={{ width: 16, height: 8, background: "#1e3a8a" }} />
      {/* neck */}
      <div className="absolute left-1/2 -translate-x-1/2" style={{ top: 8, width: 12, height: 10, background: "rgba(125,211,252,0.5)" }} />
      {/* body */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 overflow-hidden rounded-xl" style={{ width: 32, height: 48, background: "rgba(125,211,252,0.25)", border: "2px solid rgba(125,211,252,0.6)" }}>
        {/* water */}
        <div className="absolute bottom-0 w-full" style={{ height: "60%", background: "linear-gradient(180deg,#38bdf8,#0ea5e9)" }} />
      </div>
    </div>
  </div>
);

const BottleFlipGame = ({ onBack }) => {
  const [phase, setPhase]       = useState("idle"); // idle | charging | flipping | result
  const [power, setPower]       = useState(0);
  const [bottle, setBottle]     = useState({ y: 0, rot: 0 });
  const [result, setResult]     = useState(null); // "land" | "fall"
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

    let vy  = 5 + (power / 100) * 12; // 5..17
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
        {/* table / ground */}
        <div className="absolute bottom-3 left-1/2 h-2 w-40 -translate-x-1/2 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }} />

        <Bottle y={bottle.y} rot={bottle.rot} />

        {/* result text */}
        {phase === "result" && (
          <div className="pointer-events-none absolute left-1/2 top-8 -translate-x-1/2 text-center">
            <p className="font-futura text-2xl font-extrabold uppercase" style={{ color: result === "land" ? "#22c55e" : "#f87171" }}>
              {result === "land" ? (streak >= 3 ? `🔥 ${streak} in a row!` : "Nailed it! ✅") : "Oops! ❌"}
            </p>
          </div>
        )}

        {/* hint */}
        {phase === "idle" && (
          <p className="pointer-events-none absolute left-1/2 top-8 -translate-x-1/2 font-futura text-sm uppercase text-white/50">
            Hold to charge, release to flip
          </p>
        )}

        {/* power meter */}
        <div className="absolute bottom-4 left-4 h-32 w-3 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
          <div className="absolute bottom-0 w-full rounded-full transition-none" style={{ height: `${power}%`, background: power > 70 ? "#f87171" : power > 35 ? "#ffcb05" : "#22c55e" }} />
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-white/30">Tip: aim for a medium charge to land a single flip 🍾</p>
    </div>
  );
};

/* ────────────────────────────────────────────────
   GAME SELECTION
──────────────────────────────────────────────── */
const GAME_LIST = [
  { id:"bottle", emoji:"🍾", title:"Bottle Flip",    desc:"Hold to charge, release to flip — land it standing up!" },
  { id:"bug",    emoji:"🐛", title:"Catch the Bug",  desc:"Tap bugs before they escape — 30 sec, how many can you catch?" },
  { id:"memory", emoji:"🃏", title:"Memory Card",    desc:"Flip and match all emoji pairs as fast as you can." },
  { id:"code",   emoji:"🔍", title:"Code Breaker",   desc:"Guess the programming language from a code snippet." },
];

const Games = () => {
  const [activeGame, setActiveGame] = useState(null);

  return (
    <section id="catch-the-bug" className="bg-[#0d0d0d] px-8 py-24">
      <h1 className="mb-2 text-center font-futura text-5xl font-extrabold uppercase text-white">Mini Games</h1>
      <p className="mb-12 text-center text-sm text-white/40">Take a break — pick a game</p>

      {!activeGame && (
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {GAME_LIST.map(g=>(
            <button key={g.id} onClick={()=>setActiveGame(g.id)}
              className="group flex flex-col items-center gap-4 rounded-3xl p-8 text-center transition-all duration-300 hover:-translate-y-2"
              style={{background:"linear-gradient(160deg,#1a1a2e,#16213e)",border:"3px solid rgba(255,255,255,0.06)",boxShadow:"0 10px 40px rgba(0,0,0,0.3)"}}>
              <span className="text-6xl transition-transform duration-300 group-hover:scale-110">{g.emoji}</span>
              <h3 className="font-futura text-lg font-bold uppercase text-white">{g.title}</h3>
              <p className="text-xs text-white/50 leading-relaxed">{g.desc}</p>
              <div className="mt-2 rounded-full bg-primary px-6 py-2 font-futura text-sm font-bold uppercase text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                Play
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="mx-auto max-w-3xl">
        {activeGame==="bug"    && <CatchTheBugGame  onBack={()=>setActiveGame(null)} />}
        {activeGame==="memory" && <MemoryCardGame   onBack={()=>setActiveGame(null)} />}
        {activeGame==="code"   && <CodeBreakerGame  onBack={()=>setActiveGame(null)} />}
        {activeGame==="bottle" && <BottleFlipGame   onBack={()=>setActiveGame(null)} />}
      </div>
    </section>
  );
};

export default Games;
