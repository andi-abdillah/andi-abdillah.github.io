import { useCallback, useEffect, useRef, useState } from "react";

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

const shuffle = (arr) => [...arr].sort(()=>Math.random()-0.5);

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

export default CodeBreakerGame;
