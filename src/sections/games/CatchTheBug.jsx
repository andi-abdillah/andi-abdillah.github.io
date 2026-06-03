import { useCallback, useEffect, useRef, useState } from "react";

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

export default CatchTheBugGame;
