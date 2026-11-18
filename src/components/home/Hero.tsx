import { useEffect, useRef, type CSSProperties, type MouseEvent as RMouseEvent } from 'react';
import type { ArtKey } from '../../lib/data';
import { Link } from '../../lib/router';
import { useReducedMotion } from '../../lib/hooks';
import { Art, C } from '../Art';
import { Mark } from '../Logo';

const orbit: ArtKey[] = ['croissant', 'donut', 'cupcake', 'beans', 'pistachio', 'cookie'];

/** Bouncy per-letter headline. */
function Bouncy({ text, className, start = 0 }: { text: string; className?: string; start?: number }) {
  return (
    <span className={`bouncy ${className ?? ''}`} aria-label={text}>
      {[...text].map((ch, i) => (
        <span key={i} aria-hidden="true" className="bouncy__ch" style={{ '--i': start + i } as CSSProperties}>{ch === ' ' ? ' ' : ch}</span>
      ))}
    </span>
  );
}

/** The layered glass latte that pours itself on load. */
function GlassLatte() {
  const wave = 'M-300 20 Q -250 0 -200 20 T -100 20 T 0 20 T 100 20 T 200 20 T 300 20 T 400 20 T 500 20 T 600 20 V 400 H -300 Z';
  return (
    <svg className="glass" viewBox="0 0 400 420" role="img" aria-label="A layered latte pouring itself into a glass">
      <defs>
        <clipPath id="glass-clip"><path d="M112 112 H288 L274 330 Q272 350 252 350 H148 Q128 350 126 330 Z" /></clipPath>
      </defs>
      <ellipse cx="200" cy="372" rx="150" ry="26" fill={C.cream} stroke={C.aub} strokeWidth="5" />
      <ellipse cx="200" cy="366" rx="96" ry="12" fill={C.sky2} opacity="0.5" />
      <path d="M284 160 Q340 158 338 214 Q336 270 278 268" fill="none" stroke={C.aub} strokeWidth="26" strokeLinecap="round" />
      <path d="M284 160 Q340 158 338 214 Q336 270 278 268" fill="none" stroke="#FFFFFF" strokeWidth="13" strokeLinecap="round" />
      <path d="M112 112 H288 L274 330 Q272 350 252 350 H148 Q128 350 126 330 Z" fill="#FFFFFF" />
      <g clipPath="url(#glass-clip)">
        <g transform="translate(0 100)"><g className="pour pour--foam"><path className="slosh" d={wave} fill="#FFF3E2" /></g></g>
        <g transform="translate(0 150)"><g className="pour pour--coffee"><path className="slosh slosh--rev" d={wave} fill="#8A4B2A" /></g></g>
        <g transform="translate(0 200)"><g className="pour pour--milk"><path className="slosh" d={wave} fill="#E8C49B" /></g></g>
        <g className="pour pour--drizzle"><path d="M150 140 Q 170 200 150 260 M 250 150 Q 236 210 252 290" fill="none" stroke="#6B341A" strokeWidth="6" strokeLinecap="round" opacity="0.55" /></g>
      </g>
      <path d="M112 112 H288 L274 330 Q272 350 252 350 H148 Q128 350 126 330 Z" fill="none" stroke={C.aub} strokeWidth="6" strokeLinejoin="round" />
      <path d="M136 130 L146 320" stroke="#FFFFFF" strokeWidth="10" strokeLinecap="round" opacity="0.7" />
      <path d="M262 130 L258 170" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" opacity="0.6" />
      <g className="heart-pop"><path d="M200 132 C 178 120, 176 104, 190 101 C 196 100, 200 105, 200 108 C 200 105, 204 100, 210 101 C 224 104, 222 120, 200 132 Z" fill={C.aub} /></g>
      <g className="steam" fill="none" strokeLinecap="round">
        <path d="M168 96 C 150 76, 186 62, 168 36 C 156 20, 172 8, 176 2" stroke={C.aub} strokeWidth="9" />
        <path d="M204 96 C 192 80, 218 66, 208 46" stroke={C.sky2} strokeWidth="8" />
        <path d="M236 96 C 224 78, 252 66, 240 40 C 234 28, 248 20, 254 24" stroke={C.aub} strokeWidth="7" />
      </g>
    </svg>
  );
}

export function Hero() {
  const stageRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const heroRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const mouse = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  // 3D orbit: items circle the glass on an ellipse, passing behind and in front of it.
  useEffect(() => {
    let raf = 0; const t0 = performance.now();
    const loop = (now: number) => {
      const stage = stageRef.current; if (!stage) { raf = requestAnimationFrame(loop); return; }
      const w = stage.clientWidth; const rx = w * 0.46; const ry = w * 0.13;
      const t = reduced ? 0 : (now - t0) / 1000;
      const m = mouse.current; m.x += (m.tx - m.x) * 0.08; m.y += (m.ty - m.y) * 0.08;
      if (tiltRef.current) tiltRef.current.style.transform = `rotateY(${m.x * 12}deg) rotateX(${-m.y * 10}deg)`;
      itemRefs.current.forEach((el, i) => {
        if (!el) return;
        const a = t * 0.45 + (i / orbit.length) * Math.PI * 2;
        const s = Math.sin(a);
        const x = Math.cos(a) * rx; const y = s * ry - w * 0.02;
        const depth = (s + 1) / 2;
        el.style.transform = `translate(-50%, -50%) translate(${x + m.x * 30 * depth}px, ${y + m.y * 20 * depth}px) scale(${0.62 + depth * 0.5}) rotate(${Math.sin(t * 1.3 + i) * 18}deg)`;
        el.style.zIndex = s > 0 ? '4' : '1';
        el.style.filter = s > 0 ? 'none' : `blur(${(1 - depth) * 2.2}px)`;
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  const onMove = (e: RMouseEvent) => {
    const r = heroRef.current?.getBoundingClientRect(); if (!r) return;
    mouse.current.tx = (e.clientX - r.left) / r.width - 0.5; mouse.current.ty = (e.clientY - r.top) / r.height - 0.5;
  };

  // Tap anywhere: a burst of beans, hearts and sprinkles.
  const burst = (e: RMouseEvent) => {
    if (reduced) return;
    if ((e.target as HTMLElement).closest('a, button')) return;
    const host = heroRef.current; if (!host) return;
    const r = host.getBoundingClientRect();
    const x = e.clientX - r.left; const y = e.clientY - r.top;
    const shapes = ['bean', 'heart', 'sprinkle', 'heart', 'bean', 'sprinkle', 'dot'];
    for (let i = 0; i < 16; i++) {
      const p = document.createElement('span');
      p.className = `particle particle--${shapes[i % shapes.length]}`;
      p.style.left = `${x}px`; p.style.top = `${y}px`;
      host.appendChild(p);
      const ang = Math.random() * Math.PI * 2; const v = 90 + Math.random() * 160;
      const dx = Math.cos(ang) * v; const dy = Math.sin(ang) * v - 120;
      const rot = (Math.random() - 0.5) * 720;
      p.animate([
        { transform: 'translate(-50%,-50%) scale(0) rotate(0deg)', opacity: 1 },
        { transform: `translate(calc(-50% + ${dx * 0.6}px), calc(-50% + ${dy * 0.6}px)) scale(1.1) rotate(${rot * 0.5}deg)`, opacity: 1, offset: 0.4 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy + 260}px)) scale(0.6) rotate(${rot}deg)`, opacity: 0 },
      ], { duration: 1100 + Math.random() * 500, easing: 'cubic-bezier(.2,.7,.4,1)' }).onfinish = () => p.remove();
    }
  };

  return (
    <section ref={heroRef} className="hero" onMouseMove={onMove} onClick={burst}>
      <div className="hero__blobs" aria-hidden="true"><span /><span /><span /></div>
      <div className="hero__inner">
        <div className="hero__copy">
          <p className="hero__eyebrow"><span className="dot-live" /> Now pouring in Dubai Marina &amp; Brooklyn</p>
          <h1 className="hero__title">
            <Bouncy text="Good food." />
            <span className="hero__line2"><Bouncy text="Great" start={10} /> <span className="hero__script"><Bouncy text="mood" start={16} className="bouncy--script" />
              <svg className="scribble" viewBox="0 0 220 30" aria-hidden="true"><path d="M4 20 C 50 6, 110 4, 216 14 M 30 26 C 90 18, 150 18, 200 24" fill="none" stroke={C.sky2} strokeWidth="7" strokeLinecap="round" /></svg>
            </span></span>
          </h1>
          <p className="hero__sub">Specialty coffee, croissants laminated over three days and brunch that runs all day. Order ahead in three taps and skip the queue.</p>
          <div className="hero__ctas">
            <Link to="/menu" className="btn btn--primary btn--big magnetic">Order ahead <span className="btn__arrow" aria-hidden="true">→</span></Link>
            <Link to="/menu" className="btn btn--ghost btn--big">See the menu</Link>
          </div>
          <p className="hero__hint" aria-hidden="true">psst… tap anywhere <span>✦</span></p>
        </div>
        <div className="hero__stage" ref={stageRef}>
          <div className="hero__tilt" ref={tiltRef}>
            <svg className="hero__ring" viewBox="0 0 100 28" preserveAspectRatio="none" aria-hidden="true"><ellipse cx="50" cy="14" rx="49" ry="13" vectorEffect="non-scaling-stroke" /></svg>
            <div className="hero__glass"><GlassLatte /></div>
            {orbit.map((k, i) => (
              <div key={k} className="orbit" ref={(el) => { itemRefs.current[i] = el; }} aria-hidden="true">
                <div className="orbit__bob" style={{ animationDelay: `${i * -0.7}s` }}><Art k={k} size={110} /></div>
              </div>
            ))}
          </div>
          <div className="badge" aria-hidden="true">
            <svg viewBox="0 0 200 200" className="badge__ring">
              <defs><path id="badge-path" d="M100 100 m -74 0 a 74 74 0 1 1 148 0 a 74 74 0 1 1 -148 0" /></defs>
              <text><textPath href="#badge-path">fresh every morning ✦ baked at 5am ✦ made with love ✦ </textPath></text>
            </svg>
            <Mark size={64} color={C.cream} accent={C.sky} animated className="badge__mark" />
          </div>
        </div>
      </div>
      <svg className="hero__wave" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true">
        <path className="wave1" d="M0 60 Q 180 10 360 60 T 720 60 T 1080 60 T 1440 60 T 1800 60 T 2160 60 T 2520 60 T 2880 60 V 120 H 0 Z" fill={C.cream} opacity="0.6" />
        <path className="wave2" d="M0 70 Q 180 120 360 70 T 720 70 T 1080 70 T 1440 70 T 1800 70 T 2160 70 T 2520 70 T 2880 70 V 120 H 0 Z" fill={C.cream} />
      </svg>
    </section>
  );
}
