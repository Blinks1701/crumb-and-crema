import { useEffect, useState } from 'react';
import { useStore } from '../lib/store';
import { Link } from '../lib/router';
import { Logo } from './Logo';
import { BranchSwitch } from './BranchSwitch';

const nav = [
  { to: '/menu', label: 'Menu' },
  { to: '/?s=day', label: 'Our day' },
  { to: '/?s=cities', label: 'Dubai & NYC' },
  { to: '/?s=rewards', label: 'Rewards' },
];

export function Header({ route }: { route: string }) {
  const { count, bump, cartRef, setCartOpen } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pop, setPop] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on(); window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useEffect(() => { if (!bump) return; setPop(true); const t = setTimeout(() => setPop(false), 500); return () => clearTimeout(t); }, [bump]);
  useEffect(() => { setMenuOpen(false); }, [route]);

  return (
    <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
      <div className="header__inner">
        <Link to="/" className="header__logo" aria-label="Crumb & Crema home"><Logo compact={scrolled} /></Link>
        <nav className="header__nav" aria-label="Main">
          {nav.map((n) => <Link key={n.to} to={n.to} className={`header__link ${route === n.to ? 'is-active' : ''}`} aria-current={route === n.to ? 'page' : undefined}>{n.label}</Link>)}
        </nav>
        <div className="header__actions">
          <BranchSwitch />
          <button ref={cartRef} type="button" className={`cartbtn ${pop ? 'cartbtn--pop' : ''}`} onClick={() => setCartOpen(true)} aria-label={`Open your order, ${count} item${count === 1 ? '' : 's'}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg>
            <span className="cartbtn__label">Your order</span>
            {count > 0 && <span className="cartbtn__count" key={count}>{count}</span>}
          </button>
          <button type="button" className="header__menu" onClick={() => setMenuOpen((v) => !v)} aria-expanded={menuOpen} aria-label="Menu">
            <span /><span /><span />
          </button>
        </div>
      </div>
      <div className={`mobilenav ${menuOpen ? 'is-open' : ''}`}>
        {nav.map((n, i) => <Link key={n.to} to={n.to} style={{ transitionDelay: `${menuOpen ? i * 60 : 0}ms` }}>{n.label}</Link>)}
        <Link to="/menu" className="btn btn--primary">Order ahead</Link>
      </div>
    </header>
  );
}
