import { useState } from 'react';
import { branches } from '../lib/data';
import { Link } from '../lib/router';
import { Logo } from './Logo';

export function Footer() {
  const [sent, setSent] = useState(false);
  return (
    <footer className="footer">
      <svg className="footer__wave" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true"><path d="M0 40 Q 180 0 360 40 T 720 40 T 1080 40 T 1440 40 V 80 H 0 Z" fill="#5E0B1F" /></svg>
      <div className="footer__body">
        <div className="wrap footer__grid">
          <div className="footer__brand">
            <Logo light />
            <p className="footer__script">Good Food, Great Mood</p>
          </div>
          {(['dxb', 'nyc'] as const).map((id) => (
            <div key={id} className="footer__col">
              <h3>{branches[id].city}</h3>
              <p>{branches[id].address}<br />{branches[id].hoursLabel}<br />{branches[id].phone}</p>
            </div>
          ))}
          <div className="footer__col">
            <h3>Fresh drops, once a month</h3>
            {sent ? <p className="footer__thanks">You’re in! Check your inbox ✦</p> : (
              <form className="footer__form" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
                <label htmlFor="nl" className="sr-only">Email address</label>
                <input id="nl" type="email" required placeholder="you@email.com" />
                <button type="submit" className="btn btn--sky">Sign up</button>
              </form>
            )}
            <nav className="footer__links" aria-label="Footer"><Link to="/menu">Menu</Link><Link to="/?s=rewards">Rewards</Link><Link to="/?s=cities">Locations</Link><Link to="/checkout">Order ahead</Link><Link to="/admin">Admin panel demo</Link></nav>
          </div>
        </div>
        <div className="wrap footer__base">
          <span>© 2026 Crumb &amp; Crema</span>
          <span>Concept project by Arooj Fatima · sample menu, prices and addresses</span>
        </div>
      </div>
    </footer>
  );
}
