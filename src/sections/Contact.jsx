import { useEffect, useRef, useState } from "react";
import { IoSend } from "react-icons/io5";
import socialLinks from "../data/socialLinks";

const GREETING = "Hey! What would you like to know about me?";

const SUGGESTIONS = [
  {
    q: "What kind of projects do you work on?",
    a: "Mostly web apps. Company profiles, ticketing systems, ERPs, that kind of thing. I reach for Laravel and React on most projects.",
  },
  {
    q: "What makes you different?",
    a: "I sweat the details. Most devs stop when it works. I stop when it feels right.",
  },
  {
    q: "How long does a project take?",
    a: "Depends on the scope. Simple ones can be done in a week. If it involves databases, auth, and multiple features, expect a month or more.",
  },
  {
    q: "How do we start working together?",
    a: "Just reach out via email or LinkedIn below, or type right here. Tell me what you want to build and we'll take it from there.",
  },
  {
    q: "🐛 Want to play a game first?",
    a: "Sure! There are mini games below, scroll down to check them out. 👇",
    scroll: true,
  },
];

const Avatar = () => (
  <div
    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-futura text-xs font-bold text-white"
    style={{ background: "rgba(255,255,255,0.15)" }}
  >
    AA
  </div>
);

const TypingDots = () => (
  <div className="flex items-center gap-1 px-1 py-1">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="h-1.5 w-1.5 rounded-full bg-white/60"
        style={{ animation: "chatbounce 1s infinite", animationDelay: `${i * 0.15}s` }}
      />
    ))}
  </div>
);

const Contact = () => {
  const [messages, setMessages] = useState([
    { role: "bot", text: GREETING },
    { role: "bot", text: "If you'd like a reply, please include your email or WhatsApp number in your message." },
  ]);
  const [suggestions, setSuggestions] = useState(SUGGESTIONS);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing]);

  const replyAfterDelay = (text) => {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { role: "bot", text }]);
    }, 800);
  };

  const handleAsk = ({ q, a, scroll }) => {
    setMessages((m) => [...m, { role: "user", text: q }]);
    setSuggestions((s) => s.filter((item) => item.q !== q));
    replyAfterDelay(a);
    if (scroll) {
      setTimeout(() => {
        document.getElementById("catch-the-bug")?.scrollIntoView({ behavior: "smooth" });
      }, 1200);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setSending(true);
    setTyping(true);

    try {
      const { default: emailjs } = await import("@emailjs/browser");
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          from_name: "Website Chat",
          from_email: "(not provided)",
          to_name: "Amin Abdillah",
          message: text,
          reply_to: "",
        },
        { publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY },
      );
      setTyping(false);
      setSending(false);
      setMessages((m) => [...m, { role: "bot", text: "Your message has been sent! I'll get back to you as soon as I can. If you forgot to include your contact details, feel free to reach out via the icons below." }]);
    } catch {
      setTyping(false);
      setSending(false);
      setMessages((m) => [...m, { role: "bot", text: "Oops, something went wrong. Please try again or reach out directly via email or LinkedIn below." }]);
    }
  };

  return (
    <section id="contact" className="bg-primary px-8 py-14">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 lg:grid-cols-3">
        {/* Left */}
        <div className="lg:col-span-1">
          <h2 className="font-futura text-5xl font-extrabold uppercase leading-tight text-white">
            Get in touch
          </h2>
          <p className="mt-4 max-w-xs text-white/60">
            Have a project in mind or want to discuss an opportunity? Feel free to reach out.
          </p>
        </div>

        {/* Chat panel */}
        <div className="relative lg:col-span-2">
          {/* Ring — matches Services card language */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ borderRadius: "2.2rem", boxShadow: "0 0 0 2px rgba(255,255,255,0.18)" }}
          />

          <div
            className="flex h-[75vh] flex-col overflow-hidden lg:h-[520px]"
            style={{
              borderRadius: "2.2rem",
              border: "5px solid #1a1a1a",
              background: "linear-gradient(160deg,#020617,#0f172a)",
              boxShadow: "0px 9px 21px rgba(0,0,0,.18),0px 38px 38px rgba(0,0,0,.14),0px 85px 51px rgba(0,0,0,.08)",
            }}
          >
            {/* Messenger header bar */}
            <div
              className="flex shrink-0 items-center gap-3 px-4 py-3"
              style={{ background: "rgba(0,0,0,0.35)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              <Avatar />
              <div className="min-w-0 flex-1">
                <p className="font-futura text-sm font-bold uppercase text-white">Amin Abdillah</p>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-green-400" style={{ boxShadow: "0 0 5px #4ade80" }} />
                  <p className="text-[10px] text-white/40">Usually replies fast</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="chat-scroll flex-1 space-y-4 overflow-y-auto px-4 py-3">
              {messages.map((msg, i) =>
                msg.role === "bot" ? (
                  <div key={i} className="msg-bot flex items-start gap-2.5">
                    <Avatar />
                    <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-[#1e2540] px-4 py-2.5 text-left text-sm leading-relaxed text-white">
                      {msg.text}
                    </div>
                  </div>
                ) : (
                  <div key={i} className="msg-user flex justify-end">
                    <div
                      className="max-w-[80%] rounded-2xl rounded-tr-sm px-4 py-2.5 text-left text-sm leading-relaxed text-white"
                      style={{ background: "var(--color-primary, #741ce8)" }}
                    >
                      {msg.text}
                    </div>
                  </div>
                ),
              )}

              {typing && (
                <div className="flex items-start gap-2.5">
                  <Avatar />
                  <div className="rounded-2xl rounded-tl-sm bg-[#1e2540] px-3 py-2">
                    <TypingDots />
                  </div>
                </div>
              )}
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2 px-4 py-3">
                {suggestions.map((item) => (
                  <button
                    key={item.q}
                    onClick={() => handleAsk(item)}
                    className="rounded-full border border-white/15 px-4 py-2 text-xs text-white/70 transition-colors hover:border-white/40 hover:text-white"
                  >
                    {item.q}
                  </button>
                ))}
              </div>
            )}

            {/* Input + social */}
            <form onSubmit={handleSend} className="flex flex-col gap-2 px-4 pb-4 pt-1 sm:flex-row sm:items-center">
              <div className="flex flex-1 items-center gap-2 rounded-full bg-[#1e2540] py-1.5 pl-5 pr-1.5 focus-within:ring-2 focus-within:ring-primary">
                <label htmlFor="chat-input" className="sr-only">Message</label>
                <input
                  id="chat-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Message..."
                  className="flex-1 bg-transparent text-sm text-white placeholder-white/60 outline-none"
                />
                <button
                  type="submit"
                  aria-label="Send message"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-opacity hover:opacity-80"
                >
                  <IoSend className="text-sm" />
                </button>
              </div>
              <div className="flex items-center justify-center gap-1.5 sm:order-first">
                {socialLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={link.label}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    {link.icon}
                  </a>
                ))}
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
