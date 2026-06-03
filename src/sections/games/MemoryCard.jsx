import { useEffect, useRef, useState } from "react";

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

export default MemoryCardGame;
