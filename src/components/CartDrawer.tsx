import { useEffect, useRef } from 'react';
import { branches, money } from '../lib/data';
import { describe, unitPrice, useStore } from '../lib/store';
import { go } from '../lib/router';
import { Art } from './Art';
import { photoOf } from '../lib/photos';
import { Mark } from './Logo';

export function CartDrawer() {
  const { cartOpen, setCartOpen, lines, setQty, subtotal, branch, itemById } = useStore();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!cartOpen) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setCartOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cartOpen, setCartOpen]);

  return (
    <div className={`drawer ${cartOpen ? 'is-open' : ''}`} aria-hidden={!cartOpen}>
      <button type="button" className="drawer__scrim" aria-label="Close your order" tabIndex={-1} onClick={() => setCartOpen(false)} />
      <aside className="drawer__panel" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
        <div className="drawer__head">
          <h2 id="drawer-title">Your order</h2>
          <button ref={closeRef} type="button" className="sheet__close" onClick={() => setCartOpen(false)} aria-label="Close" tabIndex={cartOpen ? 0 : -1}>×</button>
        </div>
        <p className="drawer__branch">Pickup at <b>{branches[branch].area}, {branches[branch].city}</b></p>
        {lines.length === 0 ? (
          <div className="drawer__empty">
            <Mark size={110} animated />
            <p>Your cup is empty.<br />Let’s fix that.</p>
            <button type="button" className="btn btn--primary" tabIndex={cartOpen ? 0 : -1} onClick={() => { setCartOpen(false); go('/menu'); }}>Browse the menu</button>
          </div>
        ) : (
          <>
            <ul className="drawer__list">
              {lines.map((l) => {
                const it = itemById(l.itemId); if (!it) return null;
                return (
                  <li key={l.key} className="line">
                    <span className="line__art">{photoOf(it) ? <img src={photoOf(it)} alt="" width={56} height={56} /> : <Art k={it.art} size={56} />}</span>
                    <span className="line__info"><b>{it.name}</b><small>{describe(l.options) || ' '}</small><span>{money(Math.round(unitPrice(it, l.options, branch) * l.qty * 100) / 100, branch)}</span></span>
                    <span className="stepper stepper--sm">
                      <button type="button" tabIndex={cartOpen ? 0 : -1} onClick={() => setQty(l.key, l.qty - 1)} aria-label={`One less ${it.name}`}>−</button>
                      <span>{l.qty}</span>
                      <button type="button" tabIndex={cartOpen ? 0 : -1} onClick={() => setQty(l.key, l.qty + 1)} aria-label={`One more ${it.name}`}>+</button>
                    </span>
                  </li>
                );
              })}
            </ul>
            <div className="drawer__foot">
              <div className="drawer__total"><span>Subtotal</span><b>{money(Math.round(subtotal * 100) / 100, branch)}</b></div>
              <button type="button" className="btn btn--primary btn--block" tabIndex={cartOpen ? 0 : -1} onClick={() => { setCartOpen(false); go('/checkout'); }}>Choose pickup time</button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
