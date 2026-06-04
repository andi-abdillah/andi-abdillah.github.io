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

const Home = () => {
  const [mounted, setMounted]       = useState(false);
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
    // Wait for fonts before showing text — prevents font-swap CLS.
    let triggered = false;
    const trigger = () => { if (!triggered) { triggered = true; setMounted(true); } };
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(trigger);
    }
    const t = setTimeout(trigger, 700);
    return () => { triggered = true; clearTimeout(t); };
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
        style={{ opacity: mounted ? 1 : 0, transition: mounted ? "opacity 1.2s ease" : "none" }}
      >
        <div className="flex flex-col items-center gap-1">
          <p className="font-futura text-sm font-bold uppercase tracking-[0.09em] text-white">
            Gresik, East Java, Indonesia
          </p>
          <p className="font-futura text-xs uppercase tracking-[0.09em] text-white/80">
            aminabdillah.id@gmail.com
          </p>
        </div>

        {/* Name */}
        <h1
          className="font-futura font-extrabold uppercase text-white"
          style={{ fontSize: "clamp(3.125rem, 10vw, 85px)", letterSpacing: "-0.02em", lineHeight: 0.82 }}
        >
          {["Amin", "Abdillah"].map((word, i) => (
            <span key={i} className="block sm:inline-block">
              {i > 0 && <span className="hidden sm:inline-block sm:w-[0.3ch]" />}
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
                    width="796"
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
        style={{ opacity: mounted ? 1 : 0, transition: mounted ? "opacity 1.2s ease" : "none" }}
      >
        <p
          className="font-futura font-extrabold uppercase"
          style={{ color: "rgba(255,255,255,0.25)", fontSize: "clamp(2rem, 12vw, 130px)", letterSpacing: "-0.02em", lineHeight: 0.9 }}
        >
          Web Developer
        </p>
        <p className="mt-2 font-futura text-sm font-bold uppercase tracking-[0.09em] text-white">
          Technologies Include
        </p>
        <p className="font-futura text-xs uppercase tracking-[0.09em] text-white/80">
          Laravel, Next.js, React.js, Tailwind CSS, TypeScript
        </p>

      </div>
    </section>
  );
};

export default Home;
