import { useCallback, useEffect, useRef, useState } from "react";

const portfolioImages = import.meta.glob("../assets/portfolio/*", { eager: true });

// Card 0 = paling bawah/belakang, card 3 = paling atas/depan
const CARDS = [
  { src: "csirt-bangkalankab.webp", rotate: -12, ty: "5%",  phase: 0.0 },
  { src: "tiket-bangkalankab.webp", rotate: -2,  ty: "-6%", phase: 1.2 },
  { src: "pen-paper.webp",          rotate: 8,   ty: "5%",  phase: 2.4 },
  { src: "puspetindo.webp",         rotate: 12,  ty: "-4%", phase: 3.6 },
];

const lerp = (a, b, t) => a + (b - a) * t;

const TITLE_WORDS = ["Amin", "Abdillah"];
const TITLE_BASE_DELAY = 0.28;
const TITLE_LETTER_DELAY = 0.045;
const ROLE_REVEAL_DELAY = TITLE_BASE_DELAY;
const META_REVEAL_DELAY =
  TITLE_BASE_DELAY + Math.max(TITLE_WORDS.join("").length, "WebDeveloper".length) * TITLE_LETTER_DELAY + 0.28;

const RevealCharacters = ({ text, mounted, baseDelay, letterDelay = TITLE_LETTER_DELAY }) => {
  let characterIndex = 0;

  return text.split("").map((character, index) => {
    if (character === " ") {
      return <span key={`${character}-${index}`} className="inline-block w-[0.3em]" />;
    }

    const delay = baseDelay + characterIndex * letterDelay;
    characterIndex += 1;

    return (
      <span
        key={`${character}-${index}`}
        className="inline-block will-change-transform"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(115%)",
          transition: mounted
            ? `transform 0.82s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, opacity 0.45s ease ${delay}s`
            : "none",
        }}
      >
        {character}
      </span>
    );
  });
};

const Home = () => {
  const [mounted, setMounted] = useState(false);
  const [cardsInView, setCardsInView] = useState(false);
  const wrapperRefs  = useRef([]);
  const cardsRef     = useRef(null);
  const currentY     = useRef(CARDS.map(() => 0));
  const rafRef       = useRef(null);
  const mousePosRef  = useRef({ x: 0, y: 0 });
  const currentTiltX = useRef(0);
  const currentTiltY = useRef(0);
  const cardsRectRef = useRef(null);

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
    // Parallax tilt — whole fan follows cursor
    const cont = cardsRef.current;
    if (cont) {
      currentTiltX.current = lerp(currentTiltX.current, mousePosRef.current.y * -5, 0.06);
      currentTiltY.current = lerp(currentTiltY.current, mousePosRef.current.x * 8,  0.06);
      cont.style.transform = `perspective(900px) rotateX(${currentTiltX.current.toFixed(2)}deg) rotateY(${currentTiltY.current.toFixed(2)}deg)`;
    }
    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (!cardsInView) return;
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [animate, cardsInView]);

  useEffect(() => {
    const update = () => {
      if (cardsRef.current) cardsRectRef.current = cardsRef.current.getBoundingClientRect();
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <section
      id="home"
      className="relative flex flex-col items-center overflow-hidden bg-primary px-8 pb-16 pt-16 text-center sm:pt-10 md:pt-8"
    >
{/* TOP + Name — rapat */}
      <div
        className="relative z-10 flex flex-col items-center gap-6 md:gap-3"
      >
        <div
          className="flex flex-col items-center gap-1"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(0.75rem)",
            transition: mounted
              ? `opacity 0.45s ease ${META_REVEAL_DELAY}s, transform 0.45s cubic-bezier(0.16, 1, 0.3, 1) ${META_REVEAL_DELAY}s`
              : "none",
          }}
        >
          <p className="font-futura text-sm font-bold uppercase tracking-[0.09em] text-white">
            Gresik, East Java, Indonesia
          </p>
          <p className="font-futura text-xs uppercase tracking-[0.09em] text-white/60">
            aminabdillah.id@gmail.com
          </p>
        </div>

        {/* Name */}
        <h1
          aria-label="Amin Abdillah"
          className="font-futura font-extrabold uppercase text-white"
          style={{ fontSize: "clamp(3.125rem, 10vw, 85px)", letterSpacing: "-0.02em", lineHeight: 0.92 }}
        >
          <span aria-hidden="true" className="block sm:hidden">
            {TITLE_WORDS.map((word, i) => (
              <span key={word} className="block overflow-hidden pb-[0.1em] leading-[1.02]">
                <span className="inline-flex items-baseline whitespace-nowrap">
                  <RevealCharacters
                    text={word}
                    mounted={mounted}
                    baseDelay={TITLE_BASE_DELAY + TITLE_WORDS.slice(0, i).join("").length * TITLE_LETTER_DELAY}
                  />
                </span>
              </span>
            ))}
          </span>
          <span aria-hidden="true" className="hidden overflow-hidden pb-[0.1em] leading-[1.02] sm:inline-block">
            <span className="inline-flex items-baseline whitespace-nowrap">
              <RevealCharacters text="Amin Abdillah" mounted={mounted} baseDelay={TITLE_BASE_DELAY} />
            </span>
          </span>
        </h1>

      </div>

      {/* Cards — satu container, CSS handles mobile 2x2 vs desktop 4-in-a-row */}
      <div
        ref={cardsRef}
        className="relative z-10 mt-14 flex flex-wrap justify-center md:flex-nowrap"
        onMouseMove={(e) => {
          const rect = cardsRectRef.current;
          if (!rect) return;
          mousePosRef.current = {
            x: (e.clientX - rect.left) / rect.width  * 2 - 1,
            y: (e.clientY - rect.top)  / rect.height * 2 - 1,
          };
        }}
        onMouseLeave={() => { mousePosRef.current = { x: 0, y: 0 }; }}
      >
        {CARDS.map((card, i) => (
          <div
            key={i}
            ref={(el) => (wrapperRefs.current[i] = el)}
            className={i >= 2 ? "mt-[-8vw] md:mt-0" : ""}
            style={{
              width: "55%",
              maxWidth: "clamp(200px, 24vw, 380px)",
              flexShrink: 0,
              marginRight: i < CARDS.length - 1 ? "-18%" : 0,
              zIndex: i + 1,
              transformOrigin: "50% 90%",
            }}
          >
            {(() => {
              const imgSrc = portfolioImages[`../assets/portfolio/${card.src}`]?.default;
              return (
                <div style={{ position: "relative", width: "100%", transform: cardsInView ? "scale(1)" : "scale(0)", transition: `transform 1s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.08}s` }}>
                  <img
                    draggable="false"
                    src={imgSrc}
                    alt="Portfolio project screenshot"
                    width="800"
                    height="460"
                    style={{ width: "100%", height: "auto", display: "block", userSelect: "none", filter: "drop-shadow(0px 20px 40px rgba(0,0,0,0.4))" }}
                  />
                  {/* Shimmer masked to laptop shape via the PNG itself */}
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      WebkitMaskImage: `url(${imgSrc})`,
                      maskImage:       `url(${imgSrc})`,
                      WebkitMaskSize:  "100% 100%",
                      maskSize:        "100% 100%",
                    }}
                  >
                    <div
                      className="absolute bottom-0 left-0 top-0 w-1/3 bg-gradient-to-r from-transparent via-white/[0.18] to-transparent"
                      style={{ animation: `laptopShimmer 8s ease-in-out ${i * 2}s infinite` }}
                    />
                  </div>
                </div>
              );
            })()}
          </div>
        ))}
      </div>

      {/* BOT */}
      <div
        className="mt-12 flex flex-col items-center gap-1 lg:mt-6"
      >
        <p
          aria-label="Web Developer"
          className="font-futura font-extrabold uppercase"
          style={{ color: "rgba(255,255,255,0.25)", fontSize: "clamp(2rem, 12vw, 130px)", letterSpacing: "-0.02em", lineHeight: 0.96 }}
        >
          <span aria-hidden="true" className="inline-block overflow-hidden pb-[0.1em] leading-[1.02]">
            <span className="inline-flex items-baseline whitespace-nowrap">
              <RevealCharacters text="Web Developer" mounted={mounted} baseDelay={ROLE_REVEAL_DELAY} />
            </span>
          </span>
        </p>
        <div
          className="mt-2 flex flex-col items-center gap-1"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(0.75rem)",
            transition: mounted
              ? `opacity 0.45s ease ${META_REVEAL_DELAY}s, transform 0.45s cubic-bezier(0.16, 1, 0.3, 1) ${META_REVEAL_DELAY}s`
              : "none",
          }}
        >
          <p className="font-futura text-sm font-bold uppercase tracking-[0.09em] text-white">
            Technologies Include
          </p>
          <p className="font-futura text-xs uppercase tracking-[0.09em] text-white/60">
            Laravel, Next.js, React.js, Tailwind CSS, TypeScript
          </p>
        </div>

      </div>
    </section>
  );
};

export default Home;
