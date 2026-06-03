import { useState } from "react";
import CatchTheBugGame from "./CatchTheBug";
import MemoryCardGame  from "./MemoryCard";
import CodeBreakerGame from "./CodeBreaker";
import BottleFlipGame  from "./BottleFlip";
const GAME_LIST = [
  { id:"bottle", emoji:"🍾", title:"Bottle Flip Plus", desc:"Pick a bottle, choose a target, then land through wind and tilt." },
  { id:"bug",    emoji:"🐛", title:"Catch the Bug",   desc:"Tap bugs before they escape. 30 sec, how many can you catch?" },
  { id:"memory", emoji:"🃏", title:"Memory Card",     desc:"Flip and match all emoji pairs as fast as you can." },
  { id:"code",   emoji:"🔍", title:"Code Breaker",    desc:"Guess the programming language from a code snippet." },
];

const Games = () => {
  const [activeGame, setActiveGame] = useState(null);

  return (
    <section id="catch-the-bug" className="bg-[#0d0d0d] px-8 py-24">
      <h1 className="mb-2 text-center font-futura text-5xl font-extrabold uppercase text-white">Mini Games</h1>
      <p className="mb-12 text-center text-sm text-white/40">Take a break, pick a game</p>

      {!activeGame && (
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
        {activeGame==="bug"    && <CatchTheBugGame onBack={()=>setActiveGame(null)} />}
        {activeGame==="memory" && <MemoryCardGame  onBack={()=>setActiveGame(null)} />}
        {activeGame==="code"   && <CodeBreakerGame onBack={()=>setActiveGame(null)} />}
        {activeGame==="bottle" && <BottleFlipGame  onBack={()=>setActiveGame(null)} />}
      </div>
    </section>
  );
};

export default Games;
