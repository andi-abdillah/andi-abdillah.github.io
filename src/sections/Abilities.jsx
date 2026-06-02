import { useEffect, useRef, useState } from "react";
import { TbBrandHtml5, TbServer, TbBrandGithub, TbCloud } from "react-icons/tb";

const formatNow = () => {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
};

const SkillCard = ({ title, items, icon, inView, gradient, textColor, time }) => (
  <div
    className="group relative h-full w-full"
    style={{
      transition: `transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)`,
      transform: inView ? "scale(1)" : "scale(0.7)",
      opacity: inView ? 1 : 0,
    }}
  >
    {/* Charging ring — gradient fades ke transparent */}
    <div className="pointer-events-none absolute inset-[-5px] rounded-[2.8rem] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      style={{
        padding: "3px",
        background: "conic-gradient(from 180deg, transparent 0%, rgba(255,203,5,0.9) 20%, rgba(255,255,255,1) 40%, rgba(116,28,232,0.9) 60%, transparent 80%, transparent 100%)",
        WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        WebkitMaskComposite: "xor",
        maskComposite: "exclude",
      }}
    />
    {/* Glow blur */}
    <div className="pointer-events-none absolute inset-[-5px] rounded-[2.8rem] opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-40"
      style={{ background: "conic-gradient(from 180deg, transparent 0%, #ffcb05 20%, #fff 40%, #741ce8 60%, transparent 80%)" }}
    />
    {/* Lightning bolt */}
    <div className="absolute right-4 top-10 z-20 translate-y-1 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
      <svg viewBox="0 0 24 24" className="h-6 w-6 drop-shadow-lg" fill="#ffcb05">
        <path d="M13 2L4.5 13.5H11L10 22L20 10H13.5L13 2Z"/>
      </svg>
    </div>

    <div
      className="relative flex min-h-[420px] flex-col overflow-hidden rounded-[2.5rem] text-center transition-all duration-500 ease-in-out group-hover:-translate-y-3"
      style={{
        border: "5px solid #1a1a1a",
        background: gradient,
        boxShadow: "0px 9px 21px rgba(0,0,0,.12), 0px 38px 38px rgba(0,0,0,.08), 0px 85px 51px rgba(0,0,0,.04)",
      }}
    >
      {/* Status bar + Dynamic Island */}
      <div className="relative flex items-center justify-between px-5 pt-2 pb-1" style={{ color: textColor }}>
        <span className="text-[10px] font-bold">{time}</span>
        {/* Dynamic Island — nempel ke atas */}
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{ top: "6px" }}
        >
          <div className="h-5 w-[36%] min-w-[75px] rounded-[10px] bg-black" />
        </div>
        <div className="flex items-center gap-1.5">
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill={textColor}><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>
          <svg className="h-3 w-3.5" viewBox="0 0 24 24" fill={textColor}><rect x="2" y="7" width="15" height="10" rx="2"/><path d="M19 10h1a2 2 0 0 1 0 4h-1"/></svg>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col items-center justify-center px-5 pb-8 pt-4">
        <div className="mb-4 flex justify-center text-5xl transition-all duration-500 group-hover:scale-110" style={{ color: textColor }}>
          {icon}
        </div>
        <h2 className="mb-3 font-futura text-lg font-bold uppercase" style={{ color: textColor }}>{title}</h2>
        <ul className="space-y-0.5 text-sm" style={{ color: textColor + "cc" }}>
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

const Abilities = () => {
  const [inView, setInView] = useState(false);
  const [time, setTime] = useState(formatNow);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.15 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTime(formatNow()), 1000);
    return () => clearInterval(id);
  }, []);

  const frontendSkills = [
    "HTML", "CSS", "Sass / SCSS", "Bootstrap", "Tailwind CSS",
    "JavaScript", "TypeScript", "React.js", "Inertia.js", "Next.js",
  ];

  const backendSkills = [
    "PHP", "Laravel", "Express.js", "Hapi.js", "Sequelize", "Prisma", "MySQL",
  ];

  const devTools = [
    "VSCode", "Git", "GitHub", "Atlassian (Jira)", "Google Cloud Platform", "Terminal",
  ];

  const otherSkills = ["Cloud Computing", "Scrum"];

  const cards = [
    { title: "Frontend",  items: frontendSkills, icon: <TbBrandHtml5 />, gradient: "linear-gradient(160deg, #0f0c29, #302b63, #24243e)", textColor: "#ffffff" },
    { title: "Backend",   items: backendSkills,  icon: <TbServer />,     gradient: "linear-gradient(160deg, #134e5e, #71b280)", textColor: "#ffffff" },
    { title: "Dev Tools", items: devTools,       icon: <TbBrandGithub />,gradient: "linear-gradient(160deg, #f7971e, #ffd200)", textColor: "#1a1a1a" },
    { title: "Other",     items: otherSkills,    icon: <TbCloud />,      gradient: "linear-gradient(160deg, #c94b4b, #4b134f)", textColor: "#ffffff" },
  ];

  return (
    <section id="abilities" ref={sectionRef} className="bg-primary px-10 py-24">
      <style>{``}</style>
      <h1 className="mb-16 text-center font-futura text-5xl font-extrabold uppercase leading-tight text-white">
        Expertise
      </h1>
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => (
          <div key={index} className="mx-auto w-full max-w-[230px] lg:max-w-none">
            <SkillCard
              title={card.title}
              items={card.items}
              icon={card.icon}
              inView={inView}
              gradient={card.gradient}
              textColor={card.textColor}
              time={time}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default Abilities;
