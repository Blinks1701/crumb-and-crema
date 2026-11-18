import { useMemo, useState } from 'react';
import { branches, money } from '../lib/data';
import { describe, unitPrice, useStore } from '../lib/store';
import { go, Link } from '../lib/router';
import { useClock } from '../lib/hooks';
import { Art } from '../components/Art';
import { photoOf } from '../lib/photos';
import { Mark } from '../components/Logo';

export default function Checkout() {
  const { lines, branch, subtotal, placeOrder, itemById, cafes } = useStore();
  const cafe = cafes[branch];
  const b = branches[branch];
  const { hour, minute } = useClock(b.timeZone);
  const [slot, setSlot] = useState('asap');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const slots = useMemo(() => {
    const base = hour * 60 + minute + cafe.prep;
    const list = [{ id: 'asap', label: 'As soon as possible', sub: `About ${cafe.prep} minutes` }];
    let t = Math.ceil((base + 10) / 15) * 15;
    for (let i = 0; i < 5; i++, t += 15) {
      const h = Math.floor(t / 60) % 24; const m = t % 60;
      if (h >= b.closes || h < b.opens) break;
      const label = `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`;
      list.push({ id: label, label, sub: 'Pickup' });
    }
    return list;
  }, [hour, minute, b.closes, b.opens, cafe.prep]);

  if (!lines.length) {
    return (
      <div className="wrap checkout checkout--empty">
        <Mark size={120} animated />
        <h1 className="h2">Your cup is empty</h1>
        <p className="lede">Add something tasty and come back here to choose a pickup time.</p>
        <Link to="/menu" className="btn btn--primary">Browse the menu</Link>
      </div>
    );
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Please add your name so we can call it out.'); return; }
    const chosen = slots.find((s) => s.id === slot);
    if (cafe.paused) return;
    placeOrder(name.trim(), chosen?.id === 'asap' ? `in about ${cafe.prep} minutes` : `at ${chosen?.label}`);
    go('/order');
    window.scrollTo(0, 0);
  };

  return (
    <div className="wrap checkout">
      <Link to="/menu" className="back">← Back to the menu</Link>
      <h1 className="h1">Almost <span className="script">there</span></h1>
      <form className="checkout__grid" onSubmit={submit} noValidate>
        <div className="checkout__main">
          <fieldset className="card">
            <legend className="card__title">1 · Pickup time at {b.area}</legend>
            <div className="slots">
              {slots.map((s) => (
                <label key={s.id} className={`slot ${slot === s.id ? 'is-on' : ''}`}>
                  <input type="radio" name="slot" checked={slot === s.id} onChange={() => setSlot(s.id)} />
                  <b>{s.label}</b><small>{s.sub}</small>
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset className="card">
            <legend className="card__title">2 · Who’s it for?</legend>
            <div className="fields">
              <label className="field"><span>Name (we’ll call it out)</span><input value={name} onChange={(e) => { setName(e.target.value); setError(''); }} autoComplete="given-name" aria-invalid={!!error} aria-describedby={error ? 'name-err' : undefined} /></label>
              <label className="field"><span>Mobile (optional, for a “ready” text)</span><input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" /></label>
            </div>
            {error && <p className="field__err" id="name-err" role="alert">{error}</p>}
          </fieldset>
          <div className="card card--note">
            <b>3 · Pay at the counter</b>
            <span>Card, Apple Pay or cash when you pick up. Nothing is charged online in this concept.</span>
          </div>
        </div>
        <aside className="card checkout__sum">
          <h2 className="card__title">Your order</h2>
          <ul className="sumlist">
            {lines.map((l) => {
              const it = itemById(l.itemId); if (!it) return null;
              return (
                <li key={l.key}>{photoOf(it) ? <img className="thumb" src={photoOf(it)} alt="" width={44} height={44} /> : <Art k={it.art} size={44} />}<span><b>{l.qty} × {it.name}</b><small>{describe(l.options)}</small></span><span>{money(Math.round(unitPrice(it, l.options, branch) * l.qty * 100) / 100, branch)}</span></li>
              );
            })}
          </ul>
          <div className="drawer__total"><span>Total</span><b>{money(Math.round(subtotal * 100) / 100, branch)}</b></div>
          {cafe.paused && <p className="paused" role="status">Online orders at {b.area} are paused for a few minutes. Please try again shortly or switch café.</p>}
          <button type="submit" className="btn btn--primary btn--block btn--big" disabled={cafe.paused}>Place order</button>
          <p className="fine">Prices include VAT/tax. Sample prices for this concept.</p>
        </aside>
      </form>
    </div>
  );
}
