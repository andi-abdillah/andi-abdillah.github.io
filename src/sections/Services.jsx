import { useEffect, useRef, useState } from "react";

const SERVICES = [
  {
    num: "01", title: "Design & Development",
    description: "Modern, fast-loading websites with clean UI and clean code, optimized for SEO and performance.",
    gradient: "linear-gradient(160deg, #0d0a1e, #1a0a38)",
    textColor: "#fff",
    device: "ipad",
    cols: "lg:col-span-3",
    visual: () => (
      <div className="p-4">
        <p className="mb-3 text-[9px] text-white/30 uppercase tracking-widest font-mono">design-system.config.js</p>
        <div className="mb-3 flex gap-2">
          {["#741ce8","#ffcb05","#fff","#0d0d0d"].map((c,i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="h-6 w-6 rounded-md" style={{ background:c, border:c==="#fff"?"1px solid rgba(255,255,255,0.15)":"none" }} />
              <span className="text-[7px] text-white/20 font-mono">{c}</span>
            </div>
          ))}
        </div>
        <div className="rounded-lg overflow-hidden" style={{ background:"rgba(255,255,255,0.05)" }}>
          <div className="h-1.5 w-full" style={{ background:"rgba(116,28,232,0.6)" }} />
          <div className="grid grid-cols-3 gap-1 p-2">
            <div className="col-span-2 h-7 rounded bg-white/5" />
            <div className="h-7 rounded bg-white/5" />
            <div className="h-4 rounded bg-white/5" />
            <div className="h-4 rounded bg-white/5" />
            <div className="h-4 rounded bg-white/5" />
          </div>
        </div>
      </div>
    ),
  },
  {
    num: "02", title: "Mobile-First Design",
    description: "Your website will look and function perfectly on all devices, responsive from the start.",
    gradient: "linear-gradient(160deg, #1e1b4b, #4338ca)",
    textColor: "#fff",
    device: "iphone",
    cols: "lg:col-span-2",
    visual: () => (
      <div className="flex items-center justify-center py-4">
        <div className="flex items-end gap-2">
          {[{w:22,h:38,c:"rgba(255,255,255,0.5)"},{w:34,h:46,c:"rgba(255,255,255,0.35)"},{w:50,h:36,c:"rgba(255,255,255,0.25)"}].map((d,i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="rounded overflow-hidden" style={{ width:d.w, height:d.h, border:`1.5px solid ${d.c}` }}>
                <div className="h-1 w-full" style={{ background:d.c }} />
                <div className="p-0.5 space-y-0.5">
                  {[...Array(3)].map((_,j) => <div key={j} className="h-1 w-full rounded-sm bg-white/20" />)}
                </div>
              </div>
              <span className="text-[7px] text-white/40 font-mono">{["375","768","1280"][i]}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    num: "03", title: "Personal Branding",
    description: "A custom website that elevates your brand, showcases your skills, and builds online credibility.",
    gradient: "linear-gradient(160deg, #78350f, #d97706)",
    textColor: "#fff",
    device: "iphone",
    cols: "lg:col-span-1",
    visual: () => (
      <div className="flex items-center justify-center py-4 px-3">
        <div className="w-full rounded-xl p-3" style={{ background:"rgba(255,255,255,0.15)", backdropFilter:"blur(4px)" }}>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/25 font-futura text-xs font-bold text-white">AA</div>
            <div>
              <div className="h-2 w-14 rounded-full bg-white/50" />
              <div className="mt-1 h-1.5 w-10 rounded-full bg-white/25" />
            </div>
          </div>
          <div className="mt-2.5 flex gap-1.5">
            {[...Array(3)].map((_,i) => <div key={i} className="h-5 w-5 rounded-full bg-white/20" />)}
          </div>
        </div>
      </div>
    ),
  },
  {
    num: "04", title: "Next.js Development",
    description: "Fast, SEO-friendly, and scalable web apps using Next.js and modern web standards.",
    gradient: "linear-gradient(160deg, #020617, #0f172a)",
    textColor: "#fff",
    device: "server",
    cols: "lg:col-span-2",
    visual: () => (
      <div className="flex">
        <div className="w-28 shrink-0 border-r border-white/5 p-3" style={{ background:"rgba(0,0,0,0.2)" }}>
          <p className="mb-2 text-[8px] text-white/25 uppercase tracking-widest font-mono">Project</p>
          {["app/","├ page.tsx","├ layout.tsx","components/","└ Button.tsx"].map((f,i) => (
            <p key={i} className="text-[9px] text-white/35 leading-4 font-mono">{f}</p>
          ))}
        </div>
        <div className="flex-1 p-3 font-mono text-[9px] leading-4">
          <p><span className="text-purple-400">export default </span><span className="text-blue-400">function </span><span className="text-yellow-300">Page</span><span className="text-white/50">() {"{"}</span></p>
          <p className="ml-3 text-white/40">return (</p>
          <p className="ml-5 text-green-400">&lt;main&gt;</p>
          <p className="ml-7 text-white/30">&lt;Hero /&gt;</p>
          <p className="ml-7 text-white/30">&lt;Features /&gt;</p>
          <p className="ml-5 text-green-400">&lt;/main&gt;</p>
          <p className="ml-3 text-white/40">)</p>
          <p className="text-purple-400">{"}"}</p>
        </div>
      </div>
    ),
  },
  {
    num: "05", title: "Laravel Back-End",
    description: "Powerful, secure APIs and backend logic using Laravel, perfect for dashboards and data apps.",
    gradient: "linear-gradient(160deg, #1a0505, #2d0808)",
    textColor: "#fff",
    device: "server",
    cols: "lg:col-span-4",
    visual: () => (
      <div className="p-4 font-mono">
        <p className="mb-3 text-[9px] text-white/25 uppercase tracking-widest">routes/api.php</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { method:"GET",    route:"/api/users",        color:"#22c55e" },
            { method:"POST",   route:"/api/users",        color:"#3b82f6" },
            { method:"PUT",    route:"/api/users/{id}",   color:"#f59e0b" },
            { method:"DELETE", route:"/api/users/{id}",   color:"#ef4444" },
            { method:"GET",    route:"/api/auth/me",      color:"#22c55e" },
            { method:"POST",   route:"/api/auth/login",   color:"#3b82f6" },
          ].map((r,i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-14 rounded px-1.5 py-0.5 text-center text-[8px] font-bold shrink-0" style={{ background:r.color+"22", color:r.color }}>{r.method}</span>
              <span className="text-[9px] text-white/40 truncate">{r.route}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

const shimmerStyle = `
  @keyframes shimmer {
    0% { transform: translateX(-100%) skewX(-15deg); }
    100% { transform: translateX(200%) skewX(-15deg); }
  }
  .service-card:hover .shimmer { animation: shimmer 0.8s ease forwards; }
`;

const CardWrapper = ({ service, inView }) => {
  const Visual = service.visual;
  const isPhone = service.device === "iphone";
  const isServer = service.device === "server";
  const tc = "#fff";
  const borderRadius = "2.2rem";

  return (
    <div
      className={`group relative h-full w-full ${service.cols}`}
      style={{
        transition: "transform 0.6s cubic-bezier(0.34,1.56,0.64,1), opacity 0.5s ease",
        transform: inView ? "scale(1)" : "scale(0.7)",
        opacity: inView ? 1 : 0,
      }}
    >
      {/* Ring like Abilities */}
      <div
        className="absolute inset-0 transition-all duration-500 ease-in-out group-hover:scale-105 group-hover:rotate-[10deg]"
        style={{ borderRadius, boxShadow: "0 0 0 2px rgba(255,255,255,0.25)" }}
      />

      {/* Card */}
      <div
        className="relative flex h-full flex-col overflow-hidden transition-all duration-500 ease-in-out group-hover:-translate-y-3"
        style={{
          borderRadius,
          border: "5px solid #1a1a1a",
          background: service.gradient,
          boxShadow: "0px 9px 21px rgba(0,0,0,.18), 0px 38px 38px rgba(0,0,0,.14), 0px 85px 51px rgba(0,0,0,.08)",
        }}
      >
        {/* shimmer on hover */}
        <div className="shimmer pointer-events-none absolute inset-0 z-10 w-1/3 bg-gradient-to-r from-transparent via-white/6 to-transparent" style={{ transform: "translateX(-100%) skewX(-15deg)" }} />

        {/* Device top bar */}
        {isPhone && <StatusBar tc={tc} />}
        {!isPhone && !isServer && (
          <div className="flex items-center gap-2 px-4 py-2" style={{ background:"rgba(0,0,0,0.25)" }}>
            <div className="h-1.5 w-1.5 rounded-full bg-[#333]" />
            <div className="h-1 w-8 rounded-full bg-white/10" />
            <div className="ml-auto flex gap-1">
              <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="rgba(255,255,255,0.3)"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>
              <svg className="h-2.5 w-3" viewBox="0 0 24 24" fill="rgba(255,255,255,0.3)"><rect x="2" y="7" width="15" height="10" rx="2"/><path d="M19 10h1a2 2 0 0 1 0 4h-1"/></svg>
            </div>
          </div>
        )}
        {isServer && service.num === "04" && (
          <div className="flex items-center gap-2 px-4 py-2.5" style={{ background:"rgba(0,0,0,0.3)" }}>
            <div className="h-2 w-2 rounded-full bg-[#818cf8] shadow-[0_0_6px_#818cf8]" />
            <div className="h-2 w-2 rounded-full bg-[#818cf8]/20" />
            <div className="ml-auto flex gap-1">
              {[...Array(4)].map((_,i) => <div key={i} className="h-2 w-5 rounded-sm bg-white/5 border border-white/10" />)}
            </div>
          </div>
        )}
        {isServer && service.num === "05" && (
          <div className="flex items-center gap-2 px-4 py-2.5" style={{ background:"rgba(0,0,0,0.3)" }}>
            <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_6px_#22c55e]" />
            <div className="h-2 w-2 rounded-full bg-green-500/20" />
            <span className="ml-2 text-[8px] font-mono text-green-500/60">ONLINE</span>
            <div className="ml-auto flex gap-1">
              {[...Array(6)].map((_,i) => <div key={i} className="h-2 w-5 rounded-sm bg-white/5 border border-white/10" />)}
            </div>
          </div>
        )}

        <Visual />
        <Label service={service} />
        {isPhone && <div className="flex justify-center pb-2"><div className="h-1 w-16 rounded-full bg-white/15" /></div>}
      </div>
    </div>
  );
};

const StatusBar = ({ tc }) => (
  <div className="relative flex items-center justify-between px-4 pt-2 pb-1">
    <span className="text-[9px] font-bold" style={{ color: tc }}>
      {new Date().getHours()}:{String(new Date().getMinutes()).padStart(2,"0")}
    </span>
    <div className="absolute left-1/2 -translate-x-1/2 top-[6px] h-4 w-[38%] rounded-[8px] bg-black" />
    <div className="flex gap-1">
      <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill={tc}><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>
      <svg className="h-2.5 w-3" viewBox="0 0 24 24" fill={tc}><rect x="2" y="7" width="15" height="10" rx="2"/><path d="M19 10h1a2 2 0 0 1 0 4h-1"/></svg>
    </div>
  </div>
);

const Label = ({ service }) => (
  <div className="mt-auto border-t border-white/8 px-4 py-4">
    <p className="font-futura text-[9px] font-bold uppercase tracking-widest text-white/30">{service.num}</p>
    <h3 className="font-futura text-sm font-bold uppercase text-white">{service.title}</h3>
    <p className="mt-1 text-[10px] leading-relaxed text-white/55">{service.description}</p>
  </div>
);

const Services = () => {
  const [inView, setInView] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.08 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="services" ref={sectionRef} className="bg-primary px-8 py-24">
      <style>{shimmerStyle}</style>
      <h1 className="mb-16 text-center font-futura text-5xl font-extrabold uppercase leading-tight text-white">
        What I Offer
      </h1>
      {/* Row 1 — full width */}
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-3 lg:grid-cols-6">
        {SERVICES.slice(0, 3).map((s) => (
          <CardWrapper key={s.num} service={s} inView={inView} />
        ))}
      </div>

      {/* Row 2 — centered, tidak full width */}
      <div className="mx-auto mt-6 flex max-w-5xl flex-col justify-center gap-6 sm:flex-row">
        <div className="w-full sm:w-[52%]">
          <CardWrapper service={SERVICES[3]} inView={inView} />
        </div>
        <div className="w-full sm:w-[32%]">
          <CardWrapper service={SERVICES[4]} inView={inView} />
        </div>
      </div>
    </section>
  );
};

export default Services;
