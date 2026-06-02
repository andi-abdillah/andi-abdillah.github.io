import { useEffect, useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import { FaLinkedinIn, FaGithub } from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";
import { IoSend } from "react-icons/io5";

const GREETING = "Hai! Mau tahu apa tentang aku?";

const SUGGESTIONS = [
  {
    q: "Biasanya ngerjain proyek apa aja?",
    a: "Paling sering web app full-stack — company profile, sistem tiket, sampai ERP perusahaan. Andalannya Laravel sama React.",
  },
  {
    q: "Apa sih yang bikin kamu beda?",
    a: "Aku nggak cuma ngejar 'yang penting jalan'. Kodenya aku rapiin, tampilannya aku bikin enak dipakai. Soalnya yang make kan bukan aku doang.",
  },
  {
    q: "Berapa lama ngerjain satu proyek?",
    a: "Tergantung skalanya. Yang simpel bisa seminggu, kalau udah ada database, login, dan banyak fitur ya sebulanan.",
  },
  {
    q: "Gimana cara mulai kerja bareng?",
    a: "Tinggal colek aku lewat email atau LinkedIn di bawah, atau ketik aja di sini. Ceritain mau bikin apa, kita ngobrol santai dulu.",
  },
  {
    q: "🐛 Mau main game dulu?",
    a: "Haha boleh! Ada mini game di bawah — coba tangkep bug sebanyak mungkin dalam 30 detik. Scroll aja ke bawah ya 👇",
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
    { role: "bot", text: "Oh iya, kalau mau aku bisa bales, sertakan email atau nomor WA kamu di pesan ya." },
  ]);
  const [suggestions, setSuggestions] = useState(SUGGESTIONS);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
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

  const [sending, setSending] = useState(false);

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
        "my_portfolio",
        "template_gqerwxr",
        {
          from_name: "Website Chat",
          from_email: "(tidak dicantumkan)",
          to_name: "Amin Abdillah",
          message: text,
          reply_to: "",
        },
        { publicKey: "IbAI6dqRBxQejN0HU" },
      )
      .then(() => {
        setTyping(false);
        setSending(false);
        setMessages((m) => [...m, { role: "bot", text: "Pesan kamu udah masuk ke email aku! Aku usahain bales secepatnya. Kalau belum sempat cantumin kontak kamu di pesan tadi, DM aku aja lewat ikon di bawah ya." }]);
      })
      .catch(() => {
        setTyping(false);
        setSending(false);
        setMessages((m) => [...m, { role: "bot", text: "Aduh, gagal ngirim nih. Coba lagi atau langsung colek aku lewat ikon email/LinkedIn di bawah ya." }]);
      });
  };

  return (
    <section id="contact" className="bg-primary px-8 py-14">
      <style>{`
        @keyframes chatbounce{0%,60%,100%{transform:translateY(0);opacity:.5}30%{transform:translateY(-4px);opacity:1}}
        .chat-scroll{scrollbar-width:none;-ms-overflow-style:none}.chat-scroll::-webkit-scrollbar{display:none}
        @keyframes msgInLeft{from{opacity:0;transform:translateX(-16px) scale(0.92)}to{opacity:1;transform:translateX(0) scale(1)}}
        @keyframes msgInRight{from{opacity:0;transform:translateX(16px) scale(0.92)}to{opacity:1;transform:translateX(0) scale(1)}}
        .msg-bot{animation:msgInLeft 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards}
        .msg-user{animation:msgInRight 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards}
      `}</style>

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
        <div className="flex h-[60vh] flex-col overflow-hidden rounded-3xl bg-[#161616] p-4 lg:col-span-2 lg:h-[520px]">
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
                  <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-left text-sm leading-relaxed text-white" style={{ background: "#5a14b4" }}>
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

          {/* Input + social — satu baris di desktop, icons di bawah di mobile */}
          <form onSubmit={handleSend} className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center">
            {/* Input + send */}
            <div className="flex flex-1 items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message..."
                className="flex-1 rounded-full bg-[#2a2a2a] px-5 py-2.5 text-sm text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                aria-label="Send"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-opacity hover:opacity-80"
              >
                <IoSend className="text-lg" />
              </button>
            </div>
            {/* Social icons — kiri desktop, bawah mobile */}
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
