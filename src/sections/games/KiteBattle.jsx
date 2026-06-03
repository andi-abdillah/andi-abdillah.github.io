import { useCallback, useEffect, useRef, useState } from "react";

const CW = 680, CH = 400;
const PA = { x: Math.round(CW * 0.33), y: CH - 6 };
const EA = { x: Math.round(CW * 0.67), y: CH - 6 };
const MAX_STR = 248;

const WAVES = [
  { name: "Si Merah", color: "#ef4444", dark: "#7f1d1d", speed: 0.72, reactF: 55, aggr: 0.38 },
  { name: "Si Hitam", color: "#6b7280", dark: "#111827", speed: 1.05, reactF: 30, aggr: 0.62 },
  { name: "Si Api",   color: "#f97316", dark: "#7c2d12", speed: 1.40, reactF: 16, aggr: 0.88 },
];

const segsIntersect = (a1, a2, b1, b2) => {
  const dx1=a2.x-a1.x, dy1=a2.y-a1.y, dx2=b2.x-b1.x, dy2=b2.y-b1.y;
  const d = dx1*dy2 - dy1*dx2;
  if (!d) return false;
  const ox=b1.x-a1.x, oy=b1.y-a1.y;
  const t=(ox*dy2-oy*dx2)/d, u=(ox*dy1-oy*dx1)/d;
  return t>0&&t<1&&u>0&&u<1;
};

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

const makeState = (wi=0, lives=3, score=0, streak=0) => ({
  tick: 0, wi,
  p: { x:PA.x-25, y:CH*0.25, vx:0, vy:0, pulling:false },
  e: { x:EA.x+25, y:CH*0.25, vx:0, vy:0, pulling:false, tX:EA.x, reactCtr:0 },
  wind: { dx:0.5, str:0.85, timer:280 },
  clash: null,
  eKilled: null,
  pDip: 0,
  clouds: Array.from({length:5}, () => ({
    x: Math.random()*CW, y: 25+Math.random()*90,
    w: 50+Math.random()*65, spd: 0.12+Math.random()*0.18,
  })),
  lives, score, streak,
});

const KiteBattleGame = ({ onBack }) => {
  const canvasRef = useRef(null);
  const sRef      = useRef(null);
  const rafRef    = useRef(null);
  const keysRef   = useRef({ left:false, right:false, pull:false });
  const [phase, setPhase] = useState("idle");
  const [ui, setUi]       = useState({ lives:3, wi:0, score:0, clashing:false });

  const loop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx  = canvas.getContext("2d");
    const s    = sRef.current;
    const keys = keysRef.current;
    const W    = WAVES[s.wi];
    s.tick++;

    /* ── enemy fly-away animation ── */
    if (s.eKilled) {
      s.eKilled.x += s.eKilled.vx;
      s.eKilled.y += s.eKilled.vy;
      s.eKilled.vy -= 0.2;
      if (s.eKilled.x < -100 || s.eKilled.x > CW+100 || s.eKilled.y < -100) {
        const { lives, score, streak } = s;
        const nextWi = s.wi + 1;
        if (nextWi >= WAVES.length) {
          cancelAnimationFrame(rafRef.current);
          setPhase("won");
          setUi({ lives, wi: s.wi, score, clashing: false });
          return;
        }
        sRef.current = makeState(nextWi, lives, score, streak);
        setUi({ lives, wi: nextWi, score, clashing: false });
        rafRef.current = requestAnimationFrame(loop);
        return;
      }
    }

    /* ── player dip recovery ── */
    if (s.pDip > 0) s.pDip = Math.max(0, s.pDip - 2.5);

    /* ── wind ── */
    s.wind.timer--;
    if (s.wind.timer <= 0) {
      s.wind.dx  = (Math.random()-0.5) * 2.8;
      s.wind.str = 0.5 + Math.random() * 1.0;
      s.wind.timer = 180 + Math.random() * 220;
    }
    const wPush = s.wind.dx * s.wind.str * 0.036;

    /* ── player physics ── */
    const p = s.p;
    p.pulling = keys.pull;
    if (keys.left)  p.vx -= 0.42;
    if (keys.right) p.vx += 0.42;
    p.vx += wPush;
    p.vx *= 0.865;
    p.vy -= p.pulling ? 0.52 : 0.22;
    p.vy += 0.09;
    p.vy *= 0.88;
    p.x += p.vx; p.y += p.vy;
    const pd = Math.hypot(p.x-PA.x, p.y-PA.y);
    const pMax = p.pulling ? MAX_STR*0.70 : MAX_STR;
    if (pd > pMax) { const sc=pMax/pd; p.x=PA.x+(p.x-PA.x)*sc; p.y=PA.y+(p.y-PA.y)*sc; }
    p.x = clamp(p.x, 18, CW-18); p.y = clamp(p.y, 18, CH-55);

    /* ── enemy physics ── */
    if (!s.eKilled) {
      const e = s.e;
      if (s.tick % 45 === 0) {
        const pRelX = p.x - PA.x;
        e.tX = clamp(EA.x - pRelX*W.aggr*0.85 + (Math.random()-0.5)*50, 70, CW-70);
      }
      const eTargY = CH*0.22 - W.aggr*28;
      e.vx += (e.tX - e.x)*0.028*W.speed + wPush*0.65;
      e.vx *= 0.865;
      e.vy += (eTargY - e.y)*0.024*W.speed - 0.22*W.speed;
      e.vy *= 0.88;
      e.x += e.vx; e.y += e.vy;
      const ed = Math.hypot(e.x-EA.x, e.y-EA.y);
      const eMax = e.pulling ? MAX_STR*0.70 : MAX_STR;
      if (ed > eMax) { const sc=eMax/ed; e.x=EA.x+(e.x-EA.x)*sc; e.y=EA.y+(e.y-EA.y)*sc; }
      e.x = clamp(e.x, 18, CW-18); e.y = clamp(e.y, 18, CH-55);

      /* ── clash detection ── */
      const crossing = segsIntersect(PA, {x:p.x,y:p.y}, EA, {x:e.x,y:e.y});
      if (crossing && !s.clash) s.clash = { timer:0, pPulled:false, ePulled:false };
      if (s.clash) {
        s.clash.timer++;
        if (keys.pull) s.clash.pPulled = true;
        e.reactCtr++;
        if (!s.clash.ePulled && e.reactCtr >= W.reactF && Math.random() < 0.10+W.aggr*0.08) {
          s.clash.ePulled = true; e.pulling = true;
        }
        if (!crossing) { s.clash=null; e.reactCtr=0; e.pulling=false; }
        else if (s.clash.pPulled || s.clash.ePulled || s.clash.timer > 90) {
          const pp=s.clash.pPulled, ep=s.clash.ePulled;
          if (pp && !ep) {
            s.streak++;
            s.score += 150 + (s.streak-1)*30;
            s.eKilled = { x:e.x, y:e.y, vx:(Math.random()-0.4)*5-1, vy:-4-Math.random()*2 };
          } else if (ep && !pp) {
            s.lives--;
            s.streak = 0;
            s.pDip = 80;
            p.vy = 4;
            if (s.lives <= 0) {
              cancelAnimationFrame(rafRef.current);
              setPhase("over");
              setUi({ lives:0, wi:s.wi, score:s.score, clashing:false });
              return;
            }
            p.x=PA.x-25; p.y=CH*0.25; p.vx=0; p.vy=0;
            e.x=EA.x+25; e.y=CH*0.25; e.vx=0; e.vy=0;
          } else {
            p.vy -= 2; e.vy -= 2;
          }
          s.clash=null; e.reactCtr=0; e.pulling=false;
        }
      }
    }

    setUi({ lives:s.lives, wi:s.wi, score:s.score, clashing:!!s.clash });

    /* ─────────── DRAW ─────────── */
    const sky = ctx.createLinearGradient(0,0,0,CH);
    sky.addColorStop(0,"#0f2744"); sky.addColorStop(0.6,"#1e5a8f"); sky.addColorStop(1,"#7e4a1a");
    ctx.fillStyle=sky; ctx.fillRect(0,0,CW,CH);
    const hg = ctx.createLinearGradient(0,CH-90,0,CH);
    hg.addColorStop(0,"rgba(251,146,60,0)"); hg.addColorStop(1,"rgba(251,146,60,0.32)");
    ctx.fillStyle=hg; ctx.fillRect(0,CH-90,CW,90);
    s.clouds.forEach(c => {
      c.x += c.spd*(s.wind.dx*0.3+0.2);
      if(c.x>CW+c.w) c.x=-c.w; if(c.x<-c.w) c.x=CW+c.w;
      ctx.beginPath(); ctx.ellipse(c.x,c.y,c.w,c.w*0.32,0,0,Math.PI*2);
      ctx.fillStyle="rgba(255,255,255,0.10)"; ctx.fill();
    });
    ctx.fillStyle="#1a0a00"; ctx.fillRect(0,CH-6,CW,6);
    [PA,EA].forEach(a=>{ ctx.beginPath(); ctx.arc(a.x,a.y-3,4,0,Math.PI*2); ctx.fillStyle="rgba(255,255,255,0.25)"; ctx.fill(); });

    /* wind arrow */
    ctx.save(); ctx.translate(16,16);
    const wLen=clamp(Math.abs(s.wind.dx)*s.wind.str*8,4,28), wd=s.wind.dx>=0?1:-1;
    ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(wLen*wd,0);
    ctx.strokeStyle="rgba(255,255,255,0.35)"; ctx.lineWidth=2; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(wLen*wd,0); ctx.lineTo((wLen-5)*wd,-3); ctx.lineTo((wLen-5)*wd,3); ctx.closePath();
    ctx.fillStyle="rgba(255,255,255,0.35)"; ctx.fill();
    ctx.font="9px sans-serif"; ctx.fillStyle="rgba(255,255,255,0.3)"; ctx.textAlign="left"; ctx.fillText("angin",0,16);
    ctx.restore();

    /* clash flash */
    if (s.clash) { const a=Math.abs(Math.sin(s.tick*0.35))*0.16; ctx.fillStyle=`rgba(255,200,50,${a})`; ctx.fillRect(0,0,CW,CH); }

    /* helpers */
    const drawStr = (ax,ay,kx,ky,taut,col) => {
      ctx.beginPath();
      if(taut){ ctx.moveTo(ax,ay); ctx.lineTo(kx,ky); }
      else { ctx.moveTo(ax,ay); ctx.quadraticCurveTo((ax+kx)/2,(ay+ky)/2+18,kx,ky); }
      ctx.strokeStyle=col; ctx.lineWidth=taut?1.8:1.2; ctx.stroke();
    };
    const drawKit = (x,y,col,dk,pull) => {
      ctx.save(); ctx.translate(x,y);
      const w=18,h=25;
      ctx.beginPath(); ctx.moveTo(0,-h); ctx.lineTo(w,0); ctx.lineTo(0,h*0.55); ctx.lineTo(-w,0); ctx.closePath();
      ctx.fillStyle=col; ctx.fill();
      ctx.strokeStyle="rgba(255,255,255,0.28)"; ctx.lineWidth=1; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0,-h); ctx.lineTo(w*0.5,-h*0.15); ctx.lineTo(0,0); ctx.lineTo(-w*0.5,-h*0.15); ctx.closePath();
      ctx.fillStyle=dk; ctx.fill();
      ctx.beginPath(); ctx.moveTo(-w,0); ctx.lineTo(w,0); ctx.strokeStyle="rgba(255,255,255,0.18)"; ctx.lineWidth=1.5; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0,h*0.55);
      for(let i=1;i<=4;i++){ const ty=h*0.55+i*(pull?11:17),tx=Math.sin(s.tick*0.06+i*1.4)*(pull?2:5); ctx.lineTo(tx,ty); }
      ctx.strokeStyle=col+"99"; ctx.lineWidth=2; ctx.stroke();
      if(pull){ const g=ctx.createRadialGradient(0,0,5,0,0,26); g.addColorStop(0,"rgba(255,255,255,0.18)"); g.addColorStop(1,"rgba(255,255,255,0)"); ctx.beginPath(); ctx.arc(0,0,26,0,Math.PI*2); ctx.fillStyle=g; ctx.fill(); }
      ctx.restore();
    };

    /* draw strings + kites */
    if (!s.eKilled) {
      if (s.clash) {
        ctx.save(); ctx.shadowColor="#ffcb05"; ctx.shadowBlur=10;
        drawStr(EA.x,EA.y-3,s.e.x,s.e.y,s.e.pulling,W.color+"cc");
        drawStr(PA.x,PA.y-3,p.x,p.y+s.pDip*0.25,p.pulling,"rgba(255,255,255,0.85)");
        ctx.restore();
      } else {
        drawStr(EA.x,EA.y-3,s.e.x,s.e.y,false,W.color+"80");
        drawStr(PA.x,PA.y-3,p.x,p.y+s.pDip*0.25,p.pulling,"rgba(255,255,255,0.62)");
      }
      drawKit(s.e.x,s.e.y,W.color,W.dark,s.e.pulling);
    } else {
      drawStr(PA.x,PA.y-3,p.x,p.y+s.pDip*0.25,p.pulling,"rgba(255,255,255,0.62)");
      drawKit(s.eKilled.x,s.eKilled.y,W.color,W.dark,false);
    }
    drawKit(p.x,p.y+s.pDip*0.25,"#741ce8","#3b0764",p.pulling);

    /* "TARIK!" prompt */
    if (s.clash && !s.clash.pPulled) {
      ctx.save();
      ctx.font="bold 14px sans-serif"; ctx.textAlign="center"; ctx.fillStyle="#ffcb05";
      ctx.fillText("TARIK !", CW/2, 30);
      ctx.restore();
    }

    rafRef.current = requestAnimationFrame(loop);
  }, []);

  const startGame = () => {
    cancelAnimationFrame(rafRef.current);
    sRef.current = makeState(0);
    setPhase("playing");
    setUi({ lives:3, wi:0, score:0, clashing:false });
    rafRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  useEffect(() => {
    const onKey = e => {
      const dn = e.type === "keydown";
      if (e.key==="ArrowLeft"  || e.key==="a") { keysRef.current.left  = dn; e.preventDefault(); }
      if (e.key==="ArrowRight" || e.key==="d") { keysRef.current.right = dn; e.preventDefault(); }
      if (e.key===" " || e.key==="ArrowUp" || e.key==="w") { keysRef.current.pull = dn; e.preventDefault(); }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup",   onKey);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("keyup", onKey); };
  }, []);

  return (
    <div>
      <button onClick={onBack} className="mb-4 flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-white">
        ← Back to Games
      </button>

      <div className="mx-auto mb-3 flex max-w-2xl items-center justify-between px-2">
        <div className="flex gap-1">
          {[...Array(3)].map((_,i) => <span key={i} style={{opacity:i<ui.lives?1:0.2}} className="text-base">❤️</span>)}
        </div>
        <div className="flex gap-4">
          {WAVES.map((w,i) => (
            <span key={i} className="font-futura text-xs uppercase" style={{color:i<ui.wi?"#22c55e":i===ui.wi?w.color:"rgba(255,255,255,0.2)"}}>
              {i<ui.wi?"✓ ":""}{w.name}
            </span>
          ))}
        </div>
        <span className="font-futura text-lg font-bold text-[#ffcb05]">{ui.score}</span>
      </div>

      <div className="mx-auto overflow-hidden rounded-2xl" style={{maxWidth:CW,border:"2px solid rgba(255,255,255,0.08)",boxShadow:"0 0 40px rgba(116,28,232,0.3)"}}>
        <canvas ref={canvasRef} width={CW} height={CH} style={{display:"block",width:"100%",touchAction:"none"}} />
      </div>

      {phase==="idle" && (
        <div className="mt-6 flex flex-col items-center gap-4">
          <p className="text-5xl">🪁</p>
          <p className="font-futura text-lg uppercase text-white/60">Adu Layangan</p>
          <p className="text-xs text-white/35">A/D gerak, W / Space tarik tali saat benang silang</p>
          <button onClick={startGame} className="rounded-full bg-primary px-10 py-3 font-futura font-bold uppercase text-white hover:opacity-80">Main</button>
        </div>
      )}

      {phase==="playing" && (
        <div className="mx-auto mt-4 grid max-w-[200px] grid-cols-3 gap-1.5">
          <div />
          <button onPointerDown={()=>{keysRef.current.pull=true}} onPointerUp={()=>{keysRef.current.pull=false}} onPointerLeave={()=>{keysRef.current.pull=false}} className="flex h-11 items-center justify-center rounded-xl bg-white/10 text-xs text-white active:bg-white/25" style={{touchAction:"none"}}>↑ Tarik</button>
          <div />
          <button onPointerDown={()=>{keysRef.current.left=true}} onPointerUp={()=>{keysRef.current.left=false}} onPointerLeave={()=>{keysRef.current.left=false}} className="flex h-11 items-center justify-center rounded-xl bg-white/10 text-white active:bg-white/25" style={{touchAction:"none"}}>◀</button>
          <div />
          <button onPointerDown={()=>{keysRef.current.right=true}} onPointerUp={()=>{keysRef.current.right=false}} onPointerLeave={()=>{keysRef.current.right=false}} className="flex h-11 items-center justify-center rounded-xl bg-white/10 text-white active:bg-white/25" style={{touchAction:"none"}}>▶</button>
        </div>
      )}

      {(phase==="won"||phase==="over") && (
        <div className="mt-6 flex flex-col items-center gap-3">
          <p className="text-5xl">{phase==="won"?"🏆":"💀"}</p>
          <p className="font-futura text-3xl font-extrabold text-white">{phase==="won"?"Juara!":"Kalah!"}</p>
          <p className="font-futura text-lg text-[#ffcb05]">{ui.score} pts</p>
          <button onClick={startGame} className="mt-2 rounded-full bg-primary px-10 py-3 font-futura font-bold uppercase text-white hover:opacity-80">Main Lagi</button>
        </div>
      )}
    </div>
  );
};

export default KiteBattleGame;
