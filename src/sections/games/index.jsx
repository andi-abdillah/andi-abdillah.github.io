import { lazy, Suspense, useState, useRef, useEffect } from "react";
import { GameLoadingScreen } from "./ui";

const CatchTheBugGame = lazy(() => import("./CatchTheBug"));
const SortItOutGame   = lazy(() => import("./SortItOut"));
const TechTriviaGame  = lazy(() => import("./TechTrivia"));
const BottleFlipGame  = lazy(() => import("./BottleFlip"));
const TabCleanerGame  = lazy(() => import("./TabCleaner"));

const GAME_LIST = [
  { id:"bottle", emoji:"🍾", title:"Bottle Flip",      desc:"Pick a bottle, choose a target, then land through wind and tilt." },
  { id:"bug",    emoji:"🐛", title:"Catch the Bug",    desc:"Tap bugs before they escape. 30 sec, how many can you catch?" },
  { id:"memory", emoji:"🗂️", title:"Sort It Out",      desc:"Drag each device into the right category before time runs out!" },
  { id:"code",   emoji:"💡", title:"Tech Trivia",      desc:"Answer quick questions about everyday tech. How much do you know?" },
  { id:"tabs",   emoji:"🧹", title:"Tab Cleaner",      desc:"Close the spam tabs before they escape. Don't touch the good ones!" },
];

const MIN_LOAD_MS = 1000;

const Games = () => {
  const [activeGame, setActiveGame] = useState(null);
  const [loading, setLoading]       = useState(false);
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const selectGame = (id) => {
    clearTimeout(timerRef.current);
    setActiveGame(id);
    setLoading(true);
    timerRef.current = setTimeout(() => setLoading(false), MIN_LOAD_MS);
  };

  const activeGameData = GAME_LIST.find(g => g.id === activeGame);

  return (
    <section id="catch-the-bug" className="bg-[#0d0d0d] px-8 py-24">
      <h2 className="mb-2 text-center font-futura text-5xl font-extrabold uppercase text-white">Mini Games</h2>
      <p className="mb-12 text-center text-sm text-white/40">Take a break, pick a game</p>

      {!activeGame && (
        <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-5">
          {GAME_LIST.map(g=>(
            <button key={g.id} onClick={()=>selectGame(g.id)}
              className="group flex w-full flex-col items-center gap-4 rounded-3xl p-8 text-center transition-all duration-300 hover:-translate-y-2 sm:w-72 lg:w-80"
              style={{background:"linear-gradient(160deg,#1a1a2e,#16213e)",border:"3px solid rgba(255,255,255,0.06)",boxShadow:"0 10px 40px rgba(0,0,0,0.3)"}}>
              <span className="text-6xl transition-transform duration-300 group-hover:scale-110">{g.emoji}</span>
              <h3 className="font-futura text-lg font-bold uppercase text-white">{g.title}</h3>
              <p className="text-xs leading-relaxed text-white/50">{g.desc}</p>
              <div className="mt-2 rounded-full bg-primary px-6 py-2 font-futura text-sm font-bold uppercase text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                Play
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="mx-auto max-w-3xl">
        {loading && activeGameData && (
          <GameLoadingScreen emoji={activeGameData.emoji} />
        )}
        <Suspense fallback={activeGameData ? <GameLoadingScreen emoji={activeGameData.emoji} /> : null}>
          {!loading && activeGame==="bug"    && <CatchTheBugGame onBack={()=>{ setActiveGame(null); setLoading(false); }} />}
          {!loading && activeGame==="memory" && <SortItOutGame   onBack={()=>{ setActiveGame(null); setLoading(false); }} />}
          {!loading && activeGame==="code"   && <TechTriviaGame  onBack={()=>{ setActiveGame(null); setLoading(false); }} />}
          {!loading && activeGame==="bottle" && <BottleFlipGame  onBack={()=>{ setActiveGame(null); setLoading(false); }} />}
          {!loading && activeGame==="tabs"   && <TabCleanerGame  onBack={()=>{ setActiveGame(null); setLoading(false); }} />}
        </Suspense>
      </div>
    </section>
  );
};

export default Games;
