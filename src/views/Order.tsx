import { useEffect, useRef } from 'react';
import { branches, money } from '../lib/data';
import { useStore } from '../lib/store';
import { Link } from '../lib/router';
import { useReducedMotion } from '../lib/hooks';
import { Art, C } from '../components/Art';
import { photoOf } from '../lib/photos';

const stages = ['Order received', 'Brewing & baking', 'Ready to pick up!'];

export default function Order() {
  const { orders, myOrderId, setStatus, itemById } = useStore();
  const order = orders.find((o) => o.id === myOrderId) ?? null;
  const reduced = useReducedMotion();
  const confettiRef = useRef<HTMLDivElement>(null);
  const status = order?.status ?? 'new';
  const stage = status === 'new' ? 0 : status === 'brewing' ? 1 : 2;

  // Demo barista: moves the order along by itself. The same order shows on the admin
  // panel's live board, where staff can move it sooner.
  useEffect(() => {
    if (!order) return;
    if (status === 'new') { const t = setTimeout(() => setStatus(order.id, 'brewing'), 2500); return () => clearTimeout(t); }
    if (status === 'brewing') { const t = setTimeout(() => setStatus(order.id, 'ready'), 5000); return () => clearTimeout(t); }
    return undefined;
  }, [order, status, setStatus]);

  useEffect(() => {
    if (status !== 'ready' || reduced || !confettiRef.current) return;
    const host = confettiRef.current;
    const colors = [C.aub, C.sky2, C.pink, C.gold];
    for (let i = 0; i < 60; i++) {
      const p = document.createElement('span');
      p.className = 'confetti';
      p.style.background = colors[i % colors.length];
      p.style.left = `${Math.random() * 100}%`;
      host.appendChild(p);
      p.animate([
        { transform: 'translateY(-20px) rotate(0deg)', opacity: 1 },
        { transform: `translate(${(Math.random() - 0.5) * 200}px, ${500 + Math.random() * 300}px) rotate(${Math.random() * 900}deg)`, opacity: 0 },
      ], { duration: 1800 + Math.random() * 1400, delay: Math.random() * 400, easing: 'cubic-bezier(.2,.6,.4,1)' }).onfinish = () => p.remove();
    }
  }, [status, reduced]);

  if (!order) {
    return (
      <div className="wrap checkout checkout--empty">
        <Art k="latte" size={140} />
        <h1 className="h2">No order yet</h1>
        <Link to="/menu" className="btn btn--primary">Start an order</Link>
      </div>
    );
  }
  const b = branches[order.branch];
  const level = [0.25, 0.65, 1][stage];
  const done = status === 'collected';

  return (
    <div className="wrap orderdone">
      <div className="orderdone__confetti" ref={confettiRef} aria-hidden="true" />
      <div className="orderdone__cup" aria-hidden="true">
        <svg viewBox="0 0 200 220">
          <defs><clipPath id="od-clip"><path d="M40 60 H160 L148 196 Q146 206 136 206 H64 Q54 206 52 196 Z" /></clipPath></defs>
          <g clipPath="url(#od-clip)">
            <rect x="0" y="0" width="200" height="220" fill="#FFFFFF" />
            <g style={{ transform: `translateY(${(1 - level) * 150}px)`, transition: 'transform 1.4s cubic-bezier(.5,0,.2,1)' }}>
              <path className="slosh" d="M-200 64 Q -175 52 -150 64 T -100 64 T -50 64 T 0 64 T 50 64 T 100 64 T 150 64 T 200 64 T 250 64 T 300 64 V 260 H -200 Z" fill={C.coffee} />
              <path className="slosh slosh--rev" d="M-200 64 Q -175 56 -150 64 T -100 64 T -50 64 T 0 64 T 50 64 T 100 64 T 150 64 T 200 64 T 250 64 T 300 64 V 76 H -200 Z" fill={C.crema} />
            </g>
          </g>
          <path d="M40 60 H160 L148 196 Q146 206 136 206 H64 Q54 206 52 196 Z" fill="none" stroke={C.aub} strokeWidth="6" strokeLinejoin="round" />
          <path d="M158 86 Q186 86 184 112 Q182 140 150 138" fill="none" stroke={C.aub} strokeWidth="8" strokeLinecap="round" />
          {stage === 2 && <g className="steam" fill="none" strokeLinecap="round"><path d="M86 48 C 74 34, 98 24, 86 6" stroke={C.aub} strokeWidth="7" /><path d="M114 48 C 104 36, 126 28, 116 12" stroke={C.sky2} strokeWidth="6" /></g>}
        </svg>
      </div>
      <p className="eyebrow">Order #{order.number} · {b.area}, {b.city}</p>
      <h1 className="h1" aria-live="polite">
        {status === 'cancelled' ? <>Sorry, <span className="script">{order.name}</span></> : done ? <>Enjoy, <span className="script">{order.name}</span>!</> : stage === 2 ? <>Ready, <span className="script">{order.name}</span>!</> : <>Thanks, <span className="script">{order.name}</span></>}
      </h1>
      <p className="lede">{status === 'cancelled' ? 'The café had to cancel this order. Nothing was charged.' : done ? 'Picked up. See you again soon.' : `Pickup ${order.pickup} at ${b.address}. We’ll call your name at the counter.`}</p>
      <ol className="tracker">
        {stages.map((s, i) => <li key={s} className={i <= stage ? 'is-done' : ''}><span className="tracker__dot">{i < stage || stage === 2 ? '✓' : i + 1}</span>{s}</li>)}
      </ol>
      <div className="card orderdone__sum">
        {order.lines.map((l) => { const it = itemById(l.itemId); return it ? <div key={l.key} className="orderdone__line">{photoOf(it) ? <img className="thumb" src={photoOf(it)} alt="" width={40} height={40} /> : <Art k={it.art} size={40} />}<span>{l.qty} × {it.name}</span></div> : null; })}
        <div className="drawer__total"><span>Pay at the counter</span><b>{money(order.total, order.branch)}</b></div>
      </div>
      <p className="fine">This order now shows on the café’s live board. <Link to="/admin-orders">See it in the admin panel →</Link></p>
      <Link to="/" className="btn btn--ghost">Back to home</Link>
    </div>
  );
}
