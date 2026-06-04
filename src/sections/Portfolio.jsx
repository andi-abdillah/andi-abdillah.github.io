import { useEffect, useRef, useState } from "react";
import Data from "../data/portfolioData.json";
import Modal from "../components/Modal";

const images = import.meta.glob("../assets/portfolio/*", { eager: true });

const ProjectItem = ({ item, onNoLink }) => {
  const [inView, setInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.2 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="mx-auto flex flex-col justify-evenly gap-5 lg:mx-0 lg:flex-row"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0px)" : "translateY(40px)",
        transition: "opacity 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      <div>
        {(() => {
          const imgSrc = images[`../assets/portfolio/${item.image}`]?.default || "";
          return (
            <div className="portfolio-item relative m-auto w-fit">
              <img
                className="h-44 md:h-64 lg:h-72"
                draggable="false"
                loading="lazy"
                src={imgSrc}
                alt={item.name}
              />
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
                  className="portfolio-shimmer absolute bottom-0 left-0 top-0 w-1/3 bg-gradient-to-r from-transparent via-white/[0.18] to-transparent"
                />
              </div>
            </div>
          );
        })()}
      </div>

      <div className="my-auto max-w-md space-y-5 text-center lg:text-start">
        <div className="flex flex-col items-center gap-3 lg:flex-row lg:items-center">
          <h3 className="font-futura text-xl font-bold uppercase leading-none md:text-2xl">{item.name}</h3>
          <span className="h-max w-max translate-y-[3px] rounded-lg bg-primary px-2 text-sm text-white">
            {item.year}
          </span>
        </div>
        <p className="font-medium opacity-40 md:text-lg">{item.description}</p>
        <div>
          <button
            onClick={() => item.link ? window.open(item.link, "_blank") : onNoLink()}
            className="rounded-full border border-primary px-7 py-3 font-futura uppercase text-primary hover:bg-primary hover:text-white"
          >
            View Site
          </button>
        </div>
      </div>
    </div>
  );
};

const LINK_NOTE_CONTENT = {
  localhost: {
    title: "Running on Localhost",
    description: "This project is still in development and can only be accessed locally.",
  },
  private: {
    title: "Private Domain",
    description: "This project is deployed on a private internal domain and is not publicly accessible.",
  },
};

const Portfolio = () => {
  const [linkNote, setLinkNote] = useState(null);
  const lastLinkNote = useRef(null);
  if (linkNote !== null) lastLinkNote.current = linkNote;

  const content = LINK_NOTE_CONTENT[lastLinkNote.current] ?? LINK_NOTE_CONTENT.localhost;

  return (
    <section id="portfolio" className="mx-auto max-w-screen-2xl px-8 py-24">
      <h2 className="mb-16 text-center font-futura text-5xl font-extrabold uppercase leading-tight [color:#363636]">
        A Lovely Selection of Work
      </h2>
      <div className="flex flex-col space-y-24">
        {Data.map((item) => (
          <ProjectItem
            key={item.name}
            item={item}
            onNoLink={() => setLinkNote(item.linkNote ?? "localhost")}
          />
        ))}
      </div>

      <Modal show={!!linkNote} onClose={() => setLinkNote(null)} maxWidth="md">
        <div className="p-4">
          <h2 className="text-center text-xl font-semibold text-red-600">
            {content.title}
          </h2>
          <p className="mt-4 text-center">{content.description}</p>
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setLinkNote(null)}
              className="rounded-full bg-primary px-7 py-3 font-futura font-semibold uppercase text-white hover:opacity-50"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
};

export default Portfolio;
