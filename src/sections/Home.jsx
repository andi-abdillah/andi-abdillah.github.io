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

// "Amin Abdillah" / "Web Developer": 12 non-space chars, last at index 11.
// Last char delay: 11 * 0.045 = 0.495s; ends at 0.495 + 0.65 = 1.145s after mounted.
// mounted fires ~100ms after load → reveal done at ~1245ms.
// META_DELAY: wait 1200ms after mounted fires so metadata fades in after all letters land.
const CHAR_DELAY   = 0.045; // seconds between each letter
const REVEAL_DUR   = 0.65;  // seconds, per letter transition
const META_DELAY   = 1200;  // ms after mounted fires

const Home = () => {
  const [mounted, setMounted]       = useState(false);
  const [metaVisible, setMetaVisible] = useState(false);
  const [cardsInView, setCardsInView] = useState(false);
  const wrapperRefs  = useRef([]);
  const cardsRef     = useRef(null);
  const currentY     = useRef(CARDS.map(() => 0));
  const rafRef       = useRef(null);
  const mousePosRef  = useRef({ x: 0, y: 0 });
  const currentTiltX = useRef(0);
  const currentTiltY = useRef(0);
  const cardsRectRef = useRef(null);

  // Read once at mount; won't trigger re-render if user changes preference later.
  const reducedMotion = useRef(
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false,
  ).current;

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (reducedMotion) { setMetaVisible(true); return; }
    const t = setTimeout(() => setMetaVisible(true), META_DELAY);
    return () => clearTimeout(t);
  }, [mounted, reducedMotion]);

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

  // Renders letter-by-letter masked reveal spans for a single word.
  // globalOffset shifts the stagger index so multi-word reveals flow continuously.
  // Keys use (globalOffset + i) to stay unique when multiple words are siblings.
  const letters = (word, globalOffset) =>
    word.split("").map((char, i) => (
      <span
        key={globalOffset + i}
        aria-hidden="true"
        style={{
          display: "inline-block",
          overflow: "hidden",
          // Extra room below the clip boundary prevents descender/baseline clipping.
          // Negative margin cancels the layout effect so spacing is unchanged.
          paddingBottom: "0.12em",
          marginBottom: "-0.12em",
        }}
      >
        <span
          style={{
            display: "inline-block",
            transform: reducedMotion || mounted ? "translateY(0)" : "translateY(110%)",
            transition:
              !reducedMotion && mounted
                ? `transform ${REVEAL_DUR}s cubic-bezier(0.215,0.61,0.355,1) ${(globalOffset + i) * CHAR_DELAY}s`
                : "none",
          }}
        >
          {char}
        </span>
      </span>
    ));

  // Fade-in style for metadata items that appear after the reveal completes.
  const metaStyle = (extraDelay = 0) => ({
    opacity: metaVisible ? 1 : 0,
    transition: metaVisible ? `opacity 0.5s ease ${extraDelay}s` : "none",
  });

  return (
    <section
      id="home"
      className="relative flex flex-col items-center overflow-hidden bg-primary px-8 pb-16 pt-16 text-center sm:pt-10 md:pt-8"
    >
      {/* TOP + Name — rapat */}
      <div className="relative z-10 flex flex-col items-center gap-6 md:gap-3">
        {/* Location & email: invisible (opacity 0) until reveal completes.
            They keep their layout space so the hero doesn't shift on reveal. */}
        <div className="flex flex-col items-center gap-1" style={metaStyle()}>
          <p className="font-futura text-sm font-bold uppercase tracking-[0.09em] text-white">
            Gresik, East Java, Indonesia
          </p>
          <p className="font-futura text-xs uppercase tracking-[0.09em] text-white/60">
            aminabdillah.id@gmail.com
          </p>
        </div>

        {/* Name — masked letter reveal, staggered left-to-right across both words */}
        <h1
          className="font-futura font-extrabold uppercase text-white"
          style={{ fontSize: "clamp(3.125rem, 10vw, 85px)", letterSpacing: "-0.02em", lineHeight: 0.82 }}
          aria-label="Amin Abdillah"
        >
          {/* "Amin" chars: global indices 0-3; "Abdillah" chars: global indices 4-11 */}
          {["Amin", "Abdillah"].map((word, wi) => (
            <span key={wi} className="block sm:inline-block">
              {wi > 0 && (
                <span className="hidden sm:inline-block sm:w-[0.3ch]" aria-hidden="true" />
              )}
              {letters(word, wi === 0 ? 0 : 4)}
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
      <div className="mt-12 flex flex-col items-center gap-1 lg:mt-6">
        {/* "Web Developer" — same masked reveal timing as "Amin Abdillah" */}
        {/* "Web" chars: global indices 0-2; "Developer" chars: global indices 3-11 */}
        <p
          className="font-futura font-extrabold uppercase"
          style={{ color: "rgba(255,255,255,0.25)", fontSize: "clamp(2rem, 12vw, 130px)", letterSpacing: "-0.02em", lineHeight: 0.9 }}
          aria-label="Web Developer"
        >
          {letters("Web", 0)}
          {" "}
          {letters("Developer", 3)}
        </p>

        {/* Tech labels: fade in after reveal, staggered slightly */}
        <p
          className="mt-2 font-futura text-sm font-bold uppercase tracking-[0.09em] text-white"
          style={metaStyle(0)}
        >
          Technologies Include
        </p>
        <p
          className="font-futura text-xs uppercase tracking-[0.09em] text-white/60"
          style={metaStyle(0.1)}
        >
          Laravel, Next.js, React.js, Tailwind CSS, TypeScript
        </p>
      </div>
    </section>
  );
};

export default Home;
