import { useCallback, useEffect, useRef, useState } from "react";

const portfolioImages = import.meta.glob("../assets/portfolio/*", { eager: true });

// Card 0 = paling bawah/belakang, card 3 = paling atas/depan
const CARDS = [
  { src: "csirt-bangkalankab.png", rotate: -12, ty: "5%",  phase: 0.0 },
  { src: "tiket-bangkalankab.png", rotate: -2,  ty: "-6%", phase: 1.2 },
  { src: "pen-paper.png",          rotate: 8,   ty: "5%",  phase: 2.4 },
  { src: "puspetindo.png",         rotate: 12,  ty: "-4%", phase: 3.6 },
];

const lerp = (a, b, t) => a + (b - a) * t;

const Home = () => {
  const [mounted, setMounted] = useState(false);
  const [cardsInView, setCardsInView] = useState(false);
  const wrapperRefs = useRef([]);
  const cardsRef    = useRef(null);
  const currentY    = useRef(CARDS.map(() => 0));
  const rafRef      = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setCardsInView(entry.isIntersecting),
      { threshold: 0.2 },
    );
    if (cardsRef.current) observer.observe(cardsRef.current);
    return () => observer.disconnect();
  }, []);

  const animate = useCallback(() => {
    const t = Date.now() / 1000;
    CARDS.forEach((card, i) => {
      const el = wrapperRefs.current[i];
      if (!el) return;
      const targetY = Math.sin(t * 0.7 + card.phase) * 10;
      currentY.current[i] = lerp(currentY.current[i], targetY, 0.05);
      el.style.transform = `rotate(${card.rotate}deg) translateY(${currentY.current[i].toFixed(2)}px)`;
    });
    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [animate]);

  return (
    <section
      id="home"
      className="relative flex h-auto min-h-screen flex-col items-center overflow-hidden bg-primary px-8 pb-16 pt-16 text-center sm:min-h-0 sm:pt-10 md:pt-8 lg:min-h-screen"
    >
      {/* TOP + Name — rapat */}
      <div
        className="relative z-10 flex flex-col items-center gap-6 md:gap-3"
        style={{ opacity: mounted ? 1 : 0, transition: "opacity 1.2s ease 0.25s" }}
      >
        <div className="flex flex-col items-center gap-1">
          <p className="font-futura text-sm font-bold uppercase tracking-[0.09em] text-white">
            Gresik, East Java, Indonesia
          </p>
          <p className="font-futura text-xs uppercase tracking-[0.09em] text-white/60">
            aminabdillah.id@gmail.com
          </p>
        </div>

        {/* Name */}
        <h1
          className="font-futura font-extrabold uppercase text-white"
          style={{ fontSize: "max(3.8rem, 7vw)", letterSpacing: "-0.02em", lineHeight: 0.82 }}
        >
          {["Amin", "Abdillah"].map((word, i) => (
            <span key={i} className="inline-block">
              {i > 0 && <span className="inline-block w-[0.3ch]" />}
              <span
                className="inline-block"
                style={{
                  transformOrigin: "bottom",
                  transform: mounted ? "scaleY(1) translateY(0)" : "scaleY(0) translateY(0.25ch)",
                  transition: mounted
                    ? `transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.1}s`
                    : "none",
                }}
              >
                {word}
              </span>
            </span>
          ))}
        </h1>

      </div>

      {/* Cards — satu container, CSS handles mobile 2x2 vs desktop 4-in-a-row */}
      <div ref={cardsRef} className="relative z-10 mt-14 flex flex-wrap justify-center md:flex-nowrap">
        {CARDS.map((card, i) => (
          <div
            key={i}
            ref={(el) => (wrapperRefs.current[i] = el)}
            className={i >= 2 ? "mt-[-8vw] md:mt-0" : ""}
            style={{
              width: "50%",
              maxWidth: "clamp(200px, 24vw, 380px)",
              flexShrink: 0,
              marginRight: i < CARDS.length - 1 ? "-12%" : 0,
              zIndex: i + 1,
              transformOrigin: "50% 90%",
            }}
          >
            <div style={{ width: "100%", transform: cardsInView ? "scale(1)" : "scale(0)", transition: `transform 1s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.08}s` }}>
              <img
                draggable="false"
                src={portfolioImages[`../assets/portfolio/${card.src}`]?.default}
                alt=""
                style={{ width: "100%", display: "block", userSelect: "none", filter: "drop-shadow(0px 20px 40px rgba(0,0,0,0.4))" }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* BOT */}
      <div
        className="mt-14 flex flex-col items-center gap-1 lg:mt-auto"
        style={{ opacity: mounted ? 1 : 0, transition: "opacity 1.2s ease 0.25s" }}
      >
        <p
          className="font-futura font-extrabold uppercase"
          style={{ color: "rgba(255,255,255,0.25)", fontSize: "max(3rem, 10vw)", letterSpacing: "-0.02em", lineHeight: 0.9 }}
        >
          Web Developer
        </p>
        <p className="mt-2 font-futura text-sm font-bold uppercase tracking-[0.09em] text-white">
          Technologies Include
        </p>
        <p className="font-futura text-xs uppercase tracking-[0.09em] text-white/60">
          Laravel, Next.js, React.js, Tailwind CSS, TypeScript
        </p>
      </div>
    </section>
  );
};

export default Home;
