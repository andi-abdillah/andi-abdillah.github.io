import { useCallback, useEffect, useRef, useState } from "react";
import shuffle from "../../utils/shuffle";

const TRIVIA = [
  {
    question: "Although Ctrl + C copies, what letter do you press with Ctrl to paste?",
    answer: "V",
    options: ["V", "P", "X", "Z"],
  },
  {
    question: "What does PIN stand for?",
    answer: "Personal Identification Number",
    options: ["Personal Identification Number", "Private Internet Number", "Personal Internet Name", "Primary Input Node"],
  },
  {
    question: "What word is often shortened to Fn on a keyboard?",
    answer: "Function",
    options: ["Function", "Format", "Finder", "Forward"],
  },
  {
    question: "What is the small file stored by a website in your browser called?",
    answer: "Cookie",
    options: ["Cookie", "Cache", "Token", "Tag"],
  },
  {
    question: "One gigabyte is commonly equal to how many megabytes?",
    answer: "1,000",
    options: ["1,000", "100", "10,000", "1,024"],
  },
  {
    question: "What key do you press to undo an action on most computers?",
    answer: "Ctrl + Z",
    options: ["Ctrl + Z", "Ctrl + U", "Ctrl + Y", "Ctrl + X"],
  },
  {
    question: "What does Wi-Fi stand for?",
    answer: "Wireless Fidelity",
    options: ["Wireless Fidelity", "Wide Frequency", "Wire-Free Internet", "Wireless File"],
  },
  {
    question: "Which key is used to move between fields in a form, like username to password?",
    answer: "Tab",
    options: ["Tab", "Enter", "Shift", "Space"],
  },
  {
    question: "What does URL stand for?",
    answer: "Uniform Resource Locator",
    options: ["Uniform Resource Locator", "Universal Reference Link", "Unique Resource Label", "User Request Line"],
  },
  {
    question: "What key deletes the character to the left of the cursor?",
    answer: "Backspace",
    options: ["Backspace", "Delete", "Escape", "Clear"],
  },
  {
    question: "What does the @ symbol separate in an email address?",
    answer: "Username and domain",
    options: ["Username and domain", "Subject and body", "Name and password", "Country and city"],
  },
  {
    question: "Which file extension is commonly used for a music file?",
    answer: "MP3",
    options: ["MP3", "JPG", "PDF", "EXE"],
  },
  {
    question: "What shortcut do you use to select all text on a page?",
    answer: "Ctrl + A",
    options: ["Ctrl + A", "Ctrl + S", "Ctrl + F", "Ctrl + E"],
  },
  {
    question: "What does HTTP stand for?",
    answer: "HyperText Transfer Protocol",
    options: ["HyperText Transfer Protocol", "High-Traffic Transfer Page", "Home Tool Text Program", "Hyper Transfer Text Process"],
  },
  {
    question: "Which key hides or shows the desktop on Windows?",
    answer: "Windows key + D",
    options: ["Windows key + D", "Windows key + H", "Windows key + X", "Windows key + E"],
  },
  {
    question: "What is the name of the blinking line that shows where you will type?",
    answer: "Cursor",
    options: ["Cursor", "Pointer", "Marker", "Caret"],
  },
  {
    question: "What does PDF stand for?",
    answer: "Portable Document Format",
    options: ["Portable Document Format", "Printed Display File", "Public Data Form", "Page Design Format"],
  },
  {
    question: "Which key is usually pressed to confirm or submit something?",
    answer: "Enter",
    options: ["Enter", "Space", "Escape", "Shift"],
  },
  {
    question: "What is the term for tricking someone into giving their password via a fake website?",
    answer: "Phishing",
    options: ["Phishing", "Hacking", "Spoofing", "Spamming"],
  },
  {
    question: "Which of these is a keyboard shortcut to take a screenshot on Windows?",
    answer: "Windows key + PrtSc",
    options: ["Windows key + PrtSc", "Ctrl + PrtSc", "Alt + PrtSc", "Shift + PrtSc"],
  },
  {
    question: "What does RAM stand for?",
    answer: "Random Access Memory",
    options: ["Random Access Memory", "Read-only Active Module", "Rapid Application Memory", "Run-time Allocation Module"],
  },
  {
    question: "What is the most common image file format used on the web?",
    answer: "JPG",
    options: ["JPG", "BMP", "TIFF", "RAW"],
  },
  {
    question: "What keyboard shortcut refreshes a web page?",
    answer: "F5",
    options: ["F5", "F2", "F9", "F12"],
  },
  {
    question: "What does the cloud mean when someone says 'save it to the cloud'?",
    answer: "Storage on a remote server via the internet",
    options: [
      "Storage on a remote server via the internet",
      "A backup on a USB drive",
      "A folder on the desktop",
      "A compressed zip file",
    ],
  },
  {
    question: "Which symbol is used at the start of a hashtag?",
    answer: "#",
    options: ["#", "@", "*", "&"],
  },
  {
    question: "What does USB stand for?",
    answer: "Universal Serial Bus",
    options: ["Universal Serial Bus", "United System Board", "Unified Storage Base", "Universal Software Bridge"],
  },
  {
    question: "What key cancels an action or closes a pop-up?",
    answer: "Escape",
    options: ["Escape", "Backspace", "Delete", "Tab"],
  },
  {
    question: "What does GPS stand for?",
    answer: "Global Positioning System",
    options: ["Global Positioning System", "General Purpose Signal", "Geo Point Sensor", "Ground Proximity Scanner"],
  },
  {
    question: "What is the shortcut to save a file on most computers?",
    answer: "Ctrl + S",
    options: ["Ctrl + S", "Ctrl + W", "Ctrl + D", "Ctrl + E"],
  },
  {
    question: "Which of these is a common web browser?",
    answer: "Chrome",
    options: ["Chrome", "Photoshop", "Excel", "Spotify"],
  },
  {
    question: "What does CPU stand for?",
    answer: "Central Processing Unit",
    options: ["Central Processing Unit", "Computer Power Unit", "Core Program Utility", "Central Power Upload"],
  },
  {
    question: "Which file extension is used for a video file?",
    answer: "MP4",
    options: ["MP4", "PNG", "TXT", "ZIP"],
  },
  {
    question: "What does the lock icon in a browser address bar mean?",
    answer: "The connection is secure (HTTPS)",
    options: [
      "The connection is secure (HTTPS)",
      "The page is password-protected",
      "The website is verified by Google",
      "Your Wi-Fi signal is strong",
    ],
  },
  {
    question: "What shortcut opens a new browser tab?",
    answer: "Ctrl + T",
    options: ["Ctrl + T", "Ctrl + N", "Ctrl + B", "Ctrl + G"],
  },
  {
    question: "What is the full name of the 'www' part of a web address?",
    answer: "World Wide Web",
    options: ["World Wide Web", "Worldwide Wireless Web", "Wide Web Window", "Web World Wire"],
  },
  {
    question: "What type of device is a smartwatch?",
    answer: "Wearable",
    options: ["Wearable", "Peripheral", "Server", "Router"],
  },
  {
    question: "What does the shortcut Ctrl + F do?",
    answer: "Find / search on the page",
    options: ["Find / search on the page", "Open a new file", "Format the text", "Full-screen mode"],
  },
  {
    question: "How many bits are in one byte?",
    answer: "8",
    options: ["8", "4", "16", "32"],
  },
  {
    question: "What is the name of Apple's virtual assistant?",
    answer: "Siri",
    options: ["Siri", "Alexa", "Cortana", "Bixby"],
  },
  {
    question: "Which key makes all letters uppercase while held?",
    answer: "Shift",
    options: ["Shift", "Caps Lock", "Alt", "Ctrl"],
  },
];


const TechTriviaGame = ({ onBack }) => {
  const [gameState, setGameState] = useState("idle");
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const timerRef = useRef(null);

  const questions = useRef([]);

  const nextQuestion = useCallback(
    (wasCorrect) => {
      clearInterval(timerRef.current);
      if (wasCorrect) setScore((s) => s + 1);
      setTimeout(() => {
        if (qIndex + 1 >= questions.current.length) {
          setGameState("over");
        } else {
          setQIndex((i) => i + 1);
          setSelected(null);
          setTimeLeft(10);
        }
      }, 800);
    },
    [qIndex],
  );

  useEffect(() => {
    if (gameState !== "playing") return;
    setTimeLeft(10);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          nextQuestion(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [gameState, qIndex, nextQuestion]);

  const startGame = () => {
    questions.current = shuffle(TRIVIA)
      .slice(0, 8)
      .map((q) => ({ ...q, options: shuffle(q.options) }));
    setQIndex(0);
    setScore(0);
    setSelected(null);
    setTimeLeft(10);
    setGameState("playing");
  };

  const answer = (opt) => {
    if (selected) return;
    setSelected(opt);
    nextQuestion(opt === questions.current[qIndex].answer);
  };

  const q = questions.current[qIndex];
  const total = questions.current.length;

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/70 transition-all hover:border-white/30 hover:bg-white/10 hover:text-white"
      >
        <span className="leading-none">←</span><span>Back to Games</span>
      </button>

      {gameState === "idle" && (
        <div className="flex flex-col items-center gap-6 py-12">
          <p className="text-6xl">💡</p>
          <p className="font-futura text-lg uppercase text-white/60">
            How well do you know your tech?
          </p>
          <button
            onClick={startGame}
            className="rounded-full bg-primary px-10 py-3 font-futura font-bold uppercase text-white hover:opacity-80"
          >
            Start
          </button>
        </div>
      )}

      {gameState === "playing" && q && (
        <div className="mx-auto max-w-2xl">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm text-white/40">
              {qIndex + 1} / {total}
            </span>
            <div
              className="font-futura text-2xl font-bold"
              style={{ color: timeLeft <= 3 ? "#ef4444" : "#ffcb05" }}
            >
              {timeLeft}s
            </div>
            <span className="font-futura font-bold text-white">{score} pts</span>
          </div>

          <div
            className="mb-6 rounded-2xl p-5 text-center text-base leading-relaxed text-white"
            style={{
              background: "#0d0d0d",
              border: "2px solid rgba(255,255,255,0.06)",
            }}
          >
            {q.question}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {q.options.map((opt) => {
              let bg = "rgba(255,255,255,0.05)";
              let border = "rgba(255,255,255,0.1)";
              if (selected) {
                if (opt === q.answer) {
                  bg = "rgba(34,197,94,0.2)";
                  border = "#22c55e";
                } else if (opt === selected) {
                  bg = "rgba(239,68,68,0.2)";
                  border = "#ef4444";
                }
              }
              return (
                <button
                  key={opt}
                  aria-label={`Answer: ${opt}`}
                  onClick={() => answer(opt)}
                  className="rounded-xl px-5 py-4 text-left text-sm font-medium text-white transition-all hover:opacity-80"
                  style={{ background: bg, border: `2px solid ${border}` }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {gameState === "over" && (
        <div className="flex flex-col items-center gap-4 py-8">
          <p className="text-5xl">🏆</p>
          <p className="font-futura text-4xl font-extrabold text-white">
            {score} / {total}
          </p>
          <p
            className="font-futura text-base uppercase"
            style={{
              color:
                score >= 7 ? "#ffcb05" : score >= 4 ? "#60a5fa" : "#f87171",
            }}
          >
            {score >= 7
              ? "Tech Genius!"
              : score >= 4
                ? "Not Bad! 💪"
                : "Keep Learning 📚"}
          </p>
          <button
            onClick={startGame}
            className="mt-2 rounded-full bg-primary px-10 py-3 font-futura font-bold uppercase text-white hover:opacity-80"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default TechTriviaGame;
