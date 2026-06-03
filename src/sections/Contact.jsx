import { useEffect, useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import { FaLinkedinIn, FaGithub } from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";
import { IoSend } from "react-icons/io5";

const GREETING = "Hey! What would you like to know about me?";

const SUGGESTIONS = [
  {
    q: "What kind of projects do you work on?",
    a: "Mostly full-stack web apps: company profiles, ticketing systems, and ERPs. My go-to stack is Laravel and React.",
  },
  {
    q: "What makes you different?",
    a: "I don't just make things work. I make them clean and enjoyable to use, because the end user isn't me.",
  },
  {
    q: "How long does a project take?",
    a: "Depends on the scope. Simple ones can be done in a week. If it involves databases, auth, and multiple features, expect around a month.",
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

const socialLinks = [
  { href: "https://www.linkedin.com/in/amin-abdillah-099225208/", icon: <FaLinkedinIn />, label: "LinkedIn" },
  { href: "mailto:aminabdillah.id@gmail.com?subject=Mail from our Website", icon: <HiOutlineMail />, label: "Email" },
  { href: "https://github.com/andi-abdillah", icon: <FaGithub />, label: "GitHub" },
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

  const handleSend = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setSending(true);
    setTyping(true);

    emailjs
      .send(
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
      )
      .then(() => {
        setTyping(false);
        setSending(false);
        setMessages((m) => [...m, { role: "bot", text: "Your message has been sent! I'll get back to you as soon as I can. If you forgot to include your contact details, feel free to reach out via the icons below." }]);
      })
      .catch(() => {
        setTyping(false);
        setSending(false);
        setMessages((m) => [...m, { role: "bot", text: "Oops, something went wrong. Please try again or reach out directly via email or LinkedIn below." }]);
      });
  };

  return (
    <section id="contact" className="bg-primary px-8 py-14">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        {/* Left */}
        <div className="lg:col-span-1">
          <h1 className="font-futura text-5xl font-extrabold uppercase leading-tight text-white">
            Get in touch
          </h1>
          <p className="mt-4 max-w-xs text-white/60">
            Have a project in mind or want to discuss an opportunity? Feel free to reach out.
          </p>
        </div>

        {/* Chat panel */}
        <div className="flex h-[75vh] flex-col overflow-hidden rounded-3xl bg-[#161616] p-4 lg:col-span-2 lg:h-[520px]">
          {/* Messages */}
          <div ref={scrollRef} className="chat-scroll flex-1 space-y-4 overflow-y-auto px-1 py-2">
            {messages.map((msg, i) =>
              msg.role === "bot" ? (
                <div key={i} className="msg-bot flex items-start gap-2.5">
                  <Avatar />
                  <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-[#2a2a2a] px-4 py-2.5 text-left text-sm leading-relaxed text-white">
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
                <div className="rounded-2xl rounded-tl-sm bg-[#2a2a2a] px-3 py-2">
                  <TypingDots />
                </div>
              </div>
            )}
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2 px-1 py-3">
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
          <form onSubmit={handleSend} className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center gap-2 rounded-full bg-[#2a2a2a] pl-5 pr-1.5 py-1.5 focus-within:ring-2 focus-within:ring-primary">
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
    </section>
  );
};

export default Contact;
