import { useEffect, useMemo, useRef, useState } from 'react';
import { branches, categories, money, type CategoryId, type MenuItem } from '../lib/data';
import { useStore } from '../lib/store';
import { Art } from '../components/Art';
import { BranchSwitch } from '../components/BranchSwitch';
import { ProductCard } from '../components/home/Sections';
import { ProductSheet } from '../components/ProductSheet';

export default function Menu() {
  const { branch, count, subtotal, setCartOpen, items: menu, cafes } = useStore();
  const [open, setOpen] = useState<MenuItem | null>(null);
  const [q, setQ] = useState('');
  const [active, setActive] = useState<CategoryId>('hot');
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? menu.filter((m) => `${m.name} ${m.description}`.toLowerCase().includes(s)) : menu;
  }, [q, menu]);

  // Scrollspy for the category bar.
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.getAttribute('data-cat') as CategoryId); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.values(sectionRefs.current).forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [filtered]);

  const jump = (id: CategoryId) => {
    const el = sectionRefs.current[id]; if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 150, behavior: 'smooth' });
  };

  return (
    <div className="menupage">
      <section className="menuhero">
        <div className="wrap menuhero__inner">
          <div>
            <p className="eyebrow">Order ahead · pickup in about {cafes[branch].prep} minutes</p>
            <h1 className="h1">The <span className="script">menu</span></h1>
            <p className="lede">Ordering from <b>{branches[branch].area}, {branches[branch].city}</b>. Prices in {branches[branch].currency}.</p>
          </div>
          <div className="menuhero__tools">
            <BranchSwitch big />
            <label className="search">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
              <span className="sr-only">Search the menu</span>
              <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Latte, croissant, matcha…" />
            </label>
          </div>
        </div>
        <div className="menuhero__floaters" aria-hidden="true">
          {(['beans', 'croissant', 'donut', 'latte'] as const).map((k, i) => <span key={k} className={`floater floater--${i}`}><Art k={k} size={90} /></span>)}
        </div>
      </section>

      <nav className="catbar" aria-label="Menu sections">
        <div className="wrap catbar__inner">
          {categories.map((c) => (
            <button key={c.id} type="button" className={`catchip ${active === c.id ? 'is-on' : ''}`} onClick={() => jump(c.id)} aria-current={active === c.id}>
              <Art k={c.art} size={34} /> {c.label}
            </button>
          ))}
        </div>
      </nav>

      <div className="wrap menupage__body">
        {filtered.length === 0 && (
          <div className="nores"><Art k="cookie" size={120} /><p>Nothing matches “{q}”. Try “latte” or “croissant”.</p></div>
        )}
        {categories.map((c) => {
          const items = filtered.filter((m) => m.category === c.id);
          if (!items.length) return null;
          return (
            <section key={c.id} className="menusec" data-cat={c.id} ref={(el) => { sectionRefs.current[c.id] = el; }} aria-labelledby={`sec-${c.id}`}>
              <h2 id={`sec-${c.id}`} className="menusec__title"><Art k={c.art} size={54} /> {c.label}</h2>
              <div className="pgrid is-in">
                {items.map((m, i) => <ProductCard key={m.id} item={m} index={i} onOpen={setOpen} />)}
              </div>
            </section>
          );
        })}
      </div>

      {count > 0 && (
        <button type="button" className="floatbar" onClick={() => setCartOpen(true)}>
          <span className="floatbar__count">{count}</span> View your order <b>{money(Math.round(subtotal * 100) / 100, branch)}</b>
        </button>
      )}
      <ProductSheet item={open} onClose={() => setOpen(null)} />
    </div>
  );
}
