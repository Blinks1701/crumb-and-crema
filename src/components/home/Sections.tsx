import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { branches, categories, day, money, type BranchId, type CategoryId, type MenuItem } from '../../lib/data';
import { useStore, type Item } from '../../lib/store';
import { useClock, useInView, useReducedMotion, useScrollProgress } from '../../lib/hooks';
import { Link } from '../../lib/router';
import { Art, C } from '../Art';
import { photoOf } from '../../lib/photos';
import { Mark } from '../Logo';

/* ---------- Crossing ribbons ---------- */
export function Ribbons() {
  const words = ['Velvet latte', 'Pistachio croissant', 'Cloud pancakes', 'Karak chai', 'Basque cheesecake', 'Sesame simit', 'Strawberry matcha', 'Stuffed cookies'];
  const row = (rev: boolean) => (
    <div className={`ribbon__track ${rev ? 'ribbon__track--rev' : ''}`}>
      {[0, 1].map((n) => (
        <span key={n} className="ribbon__set" aria-hidden={n === 1}>
          {words.map((w) => <span key={w} className="ribbon__item">{w}<svg viewBox="0 0 20 20" width="22" height="22" aria-hidden="true"><path d="M10 0 L12.5 7.5 L20 10 L12.5 12.5 L10 20 L7.5 12.5 L0 10 L7.5 7.5 Z" fill="currentColor" /></svg></span>)}
        </span>
      ))}
    </div>
  );
  return (
    <section className="ribbons" aria-label="Menu favourites">
      <div className="ribbon ribbon--sky">{row(true)}</div>
      <div className="ribbon ribbon--aub">{row(false)}</div>
    </section>
  );
}

/* ---------- Product card with 3D tilt ---------- */
export function ProductCard({ item, index, onOpen }: { item: Item; index: number; onOpen: (m: MenuItem) => void }) {
  const { branch, add } = useStore();
  const ref = useRef<HTMLElement>(null);
  const artRef = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--rx', `${((e.clientY - r.top) / r.height - 0.5) * -14}deg`);
    el.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - 0.5) * 16}deg`);
  };
  const reset = () => { ref.current?.style.setProperty('--rx', '0deg'); ref.current?.style.setProperty('--ry', '0deg'); };
  const quickAdd = () => { if (item.soldOut) return; if (item.customisable) onOpen(item); else add(item, {}, 1, artRef.current?.querySelector('img, svg')); };
  return (
    <article ref={ref} className={`pcard ${item.soldOut ? 'pcard--out' : ''}`} style={{ '--i': index } as CSSProperties} onMouseMove={onMove} onMouseLeave={reset}>
      <button type="button" className="pcard__open" onClick={() => onOpen(item)} aria-label={`${item.name}, ${money(item.price[branch], branch)}. See details`} />
      <div className="pcard__art" ref={artRef}>{photoOf(item) ? <img className="pcard__photo" src={photoOf(item)} alt="" loading="lazy" width={300} height={300} /> : <><span className="pcard__halo" /><Art k={item.art} size={150} /></>}</div>
      {item.soldOut ? <span className="tag tag--out pcard__tag">Sold out today</span> : item.tags?.[0] && <span className="tag pcard__tag">{item.tags[0]}</span>}
      <h3 className="pcard__name">{item.name}</h3>
      <p className="pcard__desc">{item.description}</p>
      <div className="pcard__foot">
        <span className="pcard__price">{money(item.price[branch], branch)}</span>
        <button type="button" className="addbtn" onClick={quickAdd} disabled={item.soldOut} aria-label={item.soldOut ? `${item.name} is sold out` : item.customisable ? `Customise ${item.name}` : `Add ${item.name} to your order`}>
          <span aria-hidden="true">+</span>
        </button>
      </div>
    </article>
  );
}

/* ---------- Bestsellers with sliding tabs ---------- */
export function Bestsellers({ onOpen }: { onOpen: (m: MenuItem) => void }) {
  const { items: all } = useStore();
  const [cat, setCat] = useState<CategoryId | 'best'>('best');
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, 0.15);
  const tabs: { id: CategoryId | 'best'; label: string }[] = [{ id: 'best', label: 'Bestsellers' }, ...categories.map((c) => ({ id: c.id, label: c.label }))];
  const items = (cat === 'best' ? all.filter((m) => m.tags?.includes('Bestseller')) : all.filter((m) => m.category === cat)).slice(0, 4);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [ind, setInd] = useState({ left: 0, width: 0 });
  useEffect(() => {
    const update = () => { const el = tabRefs.current[cat]; if (el) setInd({ left: el.offsetLeft, width: el.offsetWidth }); };
    update(); window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [cat]);

  return (
    <section className="section best" id="best">
      <div className="wrap">
        <div className="section__head">
          <p className="eyebrow">Pick your mood</p>
          <h2 className="h2">What are you <span className="script">craving</span> today?</h2>
        </div>
        <div className="tabs" role="tablist" aria-label="Menu categories">
          <span className="tabs__ind" style={{ transform: `translateX(${ind.left}px)`, width: ind.width }} />
          {tabs.map((t) => (
            <button key={t.id} ref={(el) => { tabRefs.current[t.id] = el; }} type="button" role="tab" aria-selected={cat === t.id} className="tabs__tab" onClick={() => setCat(t.id)}>{t.label}</button>
          ))}
        </div>
        <div ref={ref} className={`pgrid ${seen ? 'is-in' : ''}`} key={cat}>
          {items.map((m, i) => <ProductCard key={m.id} item={m} index={i} onOpen={onOpen} />)}
        </div>
        <div className="center"><Link to="/menu" className="btn btn--ghost">See the full menu →</Link></div>
      </div>
    </section>
  );
}

/* ---------- Order in three taps: phone demo ---------- */
const steps = [
  { title: 'Pick your café', text: 'Dubai Marina or Williamsburg. Prices switch between AED and USD for you.' },
  { title: 'Make it yours', text: 'Size, milk, an extra shot. Your favourites are saved for next time.' },
  { title: 'Grab and go', text: 'We tell you the minute it’s ready. Walk in, pick up, skip the queue.' },
];
export function AppDemo() {
  const [step, setStep] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, 0.3);
  const reduced = useReducedMotion();
  useEffect(() => { if (!seen || reduced) return; const id = setInterval(() => setStep((s) => (s + 1) % 3), 3200); return () => clearInterval(id); }, [seen, reduced]);
  return (
    <section className="section appdemo" ref={ref}>
      <div className="wrap appdemo__grid">
        <div>
          <p className="eyebrow eyebrow--light">Order ahead</p>
          <h2 className="h2 h2--light">Three taps.<br />Zero <span className="script script--sky">queue</span>.</h2>
          <ol className="steps">
            {steps.map((s, i) => (
              <li key={s.title}>
                <button type="button" className={`step ${step === i ? 'is-on' : ''}`} onClick={() => setStep(i)} aria-pressed={step === i}>
                  <span className="step__num">{i + 1}</span>
                  <span><b>{s.title}</b><span>{s.text}</span></span>
                  <span className="step__bar" key={`${step}-${i}`} />
                </button>
              </li>
            ))}
          </ol>
          <Link to="/menu" className="btn btn--sky">Start an order</Link>
        </div>
        <div className="phone" aria-hidden="true">
          <div className="phone__notch" />
          <div className="phone__screens" style={{ transform: `translateX(${step * -100}%)` }}>
            <div className="screen">
              <p className="screen__hi">Good morning ☀️</p>
              <b className="screen__h">Where are you today?</b>
              {(['dxb', 'nyc'] as BranchId[]).map((b, i) => (
                <div key={b} className={`screen__branch ${i === 0 ? 'is-on' : ''}`}><Mark size={34} color={i === 0 ? C.cream : C.aub} accent={C.sky} /><span><b>{branches[b].area}</b><small>{branches[b].city} · {branches[b].currency}</small></span></div>
              ))}
              <div className="screen__chips">{categories.slice(0, 3).map((c) => <span key={c.id}>{c.label}</span>)}</div>
            </div>
            <div className="screen">
              <div className="screen__prod"><Art k="iced" size={120} /></div>
              <b className="screen__h">Iced Spanish latte</b>
              <div className="screen__opts"><span>S</span><span className="is-on">M</span><span>L</span></div>
              <div className="screen__opts"><span className="is-on">Oat</span><span>Almond</span><span>Whole</span></div>
              <div className="screen__cta">Add · AED 29</div>
            </div>
            <div className="screen screen--ready">
              <div className="ready">
                <svg viewBox="0 0 120 120" className="ready__ring"><circle cx="60" cy="60" r="52" /><circle cx="60" cy="60" r="52" className="ready__prog" key={step} /></svg>
                <Mark size={70} animated />
              </div>
              <b className="screen__h">Order #214 is ready!</b>
              <p className="screen__hi">Pick it up at the counter, Sara.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- A day at Crumb & Crema: scroll-driven sky ---------- */
const skies = [['#FBD3C7', '#FFF0D9'], ['#C7F3F7', '#EFFCFD'], ['#9FE3EC', '#DDF7FA'], ['#F7C68B', '#FCE6C4']];
function mix(a: string, b: string, t: number) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16)); const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * t)).join(',')})`;
}
export function OurDay() {
  const ref = useRef<HTMLElement>(null);
  const p = useScrollProgress(ref);
  const seg = Math.min(day.length - 1, p * day.length);
  const idx = Math.floor(Math.min(day.length - 0.001, seg));
  const f = Math.min(1, seg - Math.floor(seg));
  const next = Math.min(day.length - 1, idx + 1);
  const top = mix(skies[idx][0], skies[next][0], f); const bottom = mix(skies[idx][1], skies[next][1], f);
  const angle = Math.PI * (0.95 - p * 0.9);
  const sx = 50 + Math.cos(angle) * 40; const sy = 78 - Math.sin(angle) * 58;
  return (
    <section ref={ref} className="day" id="day" aria-label="A day at Crumb and Crema">
      <div className="day__sticky" style={{ background: `linear-gradient(180deg, ${top}, ${bottom})` }}>
        <div className="day__sun" style={{ left: `${sx}%`, top: `${sy}%` }} aria-hidden="true"><span /></div>
        <div className="day__clouds" aria-hidden="true" style={{ transform: `translateX(${-p * 30}%)` }}><span /><span /><span /></div>
        <div className="wrap day__grid">
          <div className="day__clock">
            <p className="eyebrow">A day at Crumb &amp; Crema</p>
            <div className="day__time" key={idx}>{day[idx].time}</div>
            <h2 className="h2">{day[idx].title}</h2>
            <p className="day__text">{day[idx].text}</p>
            <div className="day__dots">{day.map((d, i) => <span key={d.time} className={i === idx ? 'is-on' : ''} />)}</div>
          </div>
          <div className="day__art" aria-hidden="true">
            {(['croissant', 'latte', 'pancakes', 'iced'] as const).map((k, i) => (
              <div key={k} className={`day__piece ${i === idx ? 'is-on' : ''} ${i < idx ? 'is-past' : ''}`}><Art k={k} size={300} /></div>
            ))}
          </div>
        </div>
        <svg className="day__hills" viewBox="0 0 1440 160" preserveAspectRatio="none" aria-hidden="true"><path d="M0 100 Q 240 30 480 90 T 960 80 T 1440 70 V 160 H 0 Z" fill={C.aub} opacity="0.12" /><path d="M0 130 Q 300 80 640 120 T 1440 110 V 160 H 0 Z" fill={C.cream} /></svg>
      </div>
    </section>
  );
}

/* ---------- Two cities with live clocks ---------- */
function AnalogClock({ tz }: { tz: string }) {
  const { hour, minute, second } = useClock(tz);
  const h = ((hour % 12) + minute / 60) * 30; const m = (minute + second / 60) * 6; const s = second * 6;
  return (
    <svg className="clock" viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="46" fill={C.cream} stroke={C.aub} strokeWidth="4" />
      {Array.from({ length: 12 }).map((_, i) => <line key={i} x1="50" y1="9" x2="50" y2={i % 3 === 0 ? 17 : 13} stroke={C.aub} strokeWidth={i % 3 === 0 ? 3.5 : 2} strokeLinecap="round" transform={`rotate(${i * 30} 50 50)`} />)}
      <line x1="50" y1="50" x2="50" y2="28" stroke={C.aub} strokeWidth="5" strokeLinecap="round" transform={`rotate(${h} 50 50)`} />
      <line x1="50" y1="50" x2="50" y2="18" stroke={C.aub} strokeWidth="3.5" strokeLinecap="round" transform={`rotate(${m} 50 50)`} />
      <line x1="50" y1="56" x2="50" y2="14" stroke={C.sky2} strokeWidth="2" strokeLinecap="round" transform={`rotate(${s} 50 50)`} className="clock__sec" />
      <circle cx="50" cy="50" r="4" fill={C.aub} />
    </svg>
  );
}
function Skyline({ city }: { city: BranchId }) {
  if (city === 'dxb') return (
    <svg viewBox="0 0 400 140" className="skyline" aria-hidden="true" preserveAspectRatio="xMidYMax meet">
      <g fill="currentColor"><rect x="20" y="80" width="34" height="60" rx="3" /><rect x="60" y="56" width="26" height="84" rx="3" /><path d="M150 140 V 74 L 156 70 V 40 L 160 36 V 10 L 162 0 L 164 10 V 36 L 168 40 V 70 L 174 74 V 140 Z" /><rect x="96" y="70" width="40" height="70" rx="3" /><path d="M186 140 V 60 Q 206 34 226 60 V 140 Z" /><rect x="236" y="90" width="30" height="50" rx="3" /><path d="M276 140 V 64 L 296 50 L 316 64 V 140 Z" /><rect x="326" y="84" width="40" height="56" rx="3" /><rect x="370" y="100" width="24" height="40" rx="3" /></g>
      <path d="M0 132 Q 50 124 100 132 T 200 132 T 300 132 T 400 132 V 140 H 0 Z" fill={C.sky2} className="skyline__water" />
    </svg>
  );
  return (
    <svg viewBox="0 0 400 140" className="skyline" aria-hidden="true" preserveAspectRatio="xMidYMax meet">
      <g fill="currentColor"><rect x="14" y="76" width="44" height="64" rx="2" /><path d="M66 140 V 60 H 80 V 46 H 96 V 60 H 110 V 140 Z" /><path d="M126 52 h 26 l -4 -16 h -18 Z" /><rect x="132" y="52" width="14" height="20" /><rect x="118" y="72" width="42" height="68" rx="2" /><path d="M176 140 V 30 L 190 14 L 204 30 V 140 Z" /><rect x="214" y="64" width="36" height="76" rx="2" /><path d="M262 140 V 86 L 284 72 L 306 86 V 140 Z" /><path d="M312 34 h 24 l -4 -14 h -16 Z" /><rect x="318" y="34" width="12" height="18" /><rect x="306" y="52" width="40" height="88" rx="2" /><rect x="354" y="92" width="36" height="48" rx="2" /></g>
      <path d="M0 132 Q 50 124 100 132 T 200 132 T 300 132 T 400 132 V 140 H 0 Z" fill={C.sky2} className="skyline__water" />
    </svg>
  );
}
function CityCard({ id }: { id: BranchId }) {
  const b = branches[id];
  const { branch, setBranch } = useStore();
  const { label, hour } = useClock(b.timeZone);
  const open = hour >= b.opens && hour < b.closes;
  const active = branch === id;
  return (
    <article className={`city city--${id} ${active ? 'is-active' : ''}`}>
      <div className="city__top">
        <AnalogClock tz={b.timeZone} />
        <div>
          <p className="city__name">{b.city}</p>
          <p className="city__time">{label} <span className={`openpill ${open ? 'is-open' : ''}`}>{open ? 'Open now' : 'Closed now'}</span></p>
        </div>
      </div>
      <h3 className="city__area">{b.area}</h3>
      <p className="city__addr">{b.address}<br />{b.hoursLabel}</p>
      <Skyline city={id} />
      <button type="button" className={`btn ${active ? 'btn--sky' : 'btn--primary'}`} onClick={() => setBranch(id)} aria-pressed={active}>
        {active ? '✓ Your café' : `Order from ${b.city}`}
      </button>
    </article>
  );
}
export function Cities() {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, 0.2);
  return (
    <section className="section cities" id="cities">
      <div className="wrap">
        <div className="section__head">
          <p className="eyebrow">Two cities, one mood</p>
          <h2 className="h2">From the Marina <span className="script">to</span> Brooklyn</h2>
          <p className="lede">Same recipes, same 5am bake, different time zones. Pick your café and the menu, prices and pickup switch with you.</p>
        </div>
        <div ref={ref} className={`cities__grid ${seen ? 'is-in' : ''}`}>
          <CityCard id="dxb" />
          <div className="cities__plane" aria-hidden="true">
            <svg viewBox="0 0 200 80"><path d="M10 60 Q 100 -10 190 60" fill="none" stroke={C.aub} strokeWidth="3" strokeDasharray="2 10" strokeLinecap="round" /></svg>
            <span className="plane">✈</span>
            <small>11,000 km of good mood</small>
          </div>
          <CityCard id="nyc" />
        </div>
      </div>
    </section>
  );
}

/* ---------- Rewards stamp card ---------- */
export function Rewards() {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, 0.4);
  const stamped = 7;
  return (
    <section className="section rewards" id="rewards">
      <div className="wrap rewards__grid">
        <div>
          <p className="eyebrow">Crumb Club</p>
          <h2 className="h2">Every 10th cup is <span className="script">on us</span></h2>
          <p className="lede">Collect a stamp with every drink, in Dubai or New York. Your card works in both cities, plus a free pastry on your birthday.</p>
          <ul className="perks">
            <li><span><Art k="latte" size={40} /></span> 1 stamp for every drink</li>
            <li><span><Art k="cupcake" size={40} /></span> Birthday pastry, on the house</li>
            <li><span><Art k="donut" size={40} /></span> Early access to new menu drops</li>
          </ul>
          <Link to="/menu" className="btn btn--primary">Join free when you order</Link>
        </div>
        <div ref={ref} className={`stampcard ${seen ? 'is-in' : ''}`} aria-label={`Sample stamp card: ${stamped} of 10 stamps`} role="img">
          <div className="stampcard__head"><Mark size={46} color={C.cream} accent={C.sky} /><span><b>Crumb Club</b><small>Sample card · Sara K.</small></span></div>
          <div className="stampcard__grid">
            {Array.from({ length: 10 }).map((_, i) => (
              <span key={i} className={`stamp ${i < stamped ? 'is-on' : ''} ${i === 9 ? 'stamp--free' : ''}`} style={{ '--i': i } as CSSProperties}>
                {i < stamped ? <Mark size={40} color={C.aub} accent={C.sky2} /> : i === 9 ? 'FREE' : i + 1}
              </span>
            ))}
          </div>
          <p className="stampcard__foot"><b>3 more cups</b> to your free one</p>
        </div>
      </div>
    </section>
  );
}

/* ---------- Outro ---------- */
export function Outro() {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, 0.4);
  return (
    <section className="outro">
      <div ref={ref} className={`wrap outro__inner ${seen ? 'is-in' : ''}`}>
        <svg className="outro__script" viewBox="0 0 1000 200" role="img" aria-label="Good Food, Great Mood">
          <text x="50%" y="120" textAnchor="middle">Good Food, Great Mood</text>
          <path d="M310 160 Q 500 190 690 160" fill="none" stroke={C.sky2} strokeWidth="6" strokeLinecap="round" className="outro__line" />
          <path d="M500 186 c -8 -6 -12 -10 -12 -15 c 0 -4 3 -6 6 -6 c 3 0 5 2 6 4 c 1 -2 3 -4 6 -4 c 3 0 6 2 6 6 c 0 5 -4 9 -12 15 z" fill={C.aub} className="outro__heart" />
        </svg>
        <div className="outro__ctas">
          <Link to="/menu" className="btn btn--primary btn--big magnetic">Order ahead →</Link>
        </div>
      </div>
    </section>
  );
}
