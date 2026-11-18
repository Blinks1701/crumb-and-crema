import { useEffect, useRef, useState } from 'react';
import { extras, milks, money, sizes, type MenuItem } from '../lib/data';
import { unitPrice, useStore, type Item, type LineOptions } from '../lib/store';
import { Art } from './Art';
import { photoOf } from '../lib/photos';

export function ProductSheet({ item: picked, onClose }: { item: MenuItem | null; onClose: () => void }) {
  const { branch, add, itemById } = useStore();
  const item: Item | null = picked ? itemById(picked.id) ?? picked : null;
  const [opt, setOpt] = useState<LineOptions>({});
  const [qty, setQty] = useState(1);
  const artRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!item) return;
    setOpt(item.customisable ? { size: 'm', milk: item.category === 'hot' || item.category === 'iced' ? 'whole' : undefined, extras: [] } : {});
    setQty(1);
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [picked, onClose]);

  if (!item) return null;
  const price = unitPrice(item, opt, branch) * qty;
  const noMilk = item.id === 'coldbrew' || item.id === 'karak';

  const toggleExtra = (id: string) => setOpt((o) => ({ ...o, extras: o.extras?.includes(id) ? o.extras.filter((x) => x !== id) : [...(o.extras ?? []), id] }));

  return (
    <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
      <button type="button" className="sheet__scrim" aria-label="Close" onClick={onClose} tabIndex={-1} />
      <div className="sheet__panel">
        <button ref={closeRef} type="button" className="sheet__close" onClick={onClose} aria-label="Close">×</button>
        {photoOf(item) ? (
          <div className="sheet__hero sheet__hero--photo" ref={artRef}><img src={photoOf(item)} alt={item.name} /></div>
        ) : (
          <div className="sheet__hero">
            <div className="sheet__blob" />
            <div ref={artRef} className="sheet__art"><Art k={item.art} size={220} /></div>
          </div>
        )}
        <div className="sheet__body">
          {item.tags?.map((t) => <span key={t} className="tag">{t}</span>)}
          <h2 id="sheet-title" className="sheet__title">{item.name}</h2>
          <p className="sheet__desc">{item.description}</p>
          {item.kcal > 0 && <p className="sheet__meta">{item.kcal} kcal{item.customisable ? ' · regular size' : ''}</p>}

          {item.customisable && (
            <>
              <fieldset className="opts">
                <legend>Size</legend>
                <div className="opts__row">
                  {sizes.map((s) => (
                    <label key={s.id} className={`pill ${opt.size === s.id ? 'is-on' : ''}`}>
                      <input type="radio" name="size" checked={opt.size === s.id} onChange={() => setOpt((o) => ({ ...o, size: s.id }))} />
                      <span className={`pill__cup pill__cup--${s.id}`} aria-hidden="true" />
                      {s.label}<small>{s.add[branch] ? `+${money(s.add[branch], branch)}` : s.oz}</small>
                    </label>
                  ))}
                </div>
              </fieldset>
              {!noMilk && (
                <fieldset className="opts">
                  <legend>Milk</legend>
                  <div className="opts__row">
                    {milks.map((m) => (
                      <label key={m.id} className={`pill ${opt.milk === m.id ? 'is-on' : ''}`}>
                        <input type="radio" name="milk" checked={opt.milk === m.id} onChange={() => setOpt((o) => ({ ...o, milk: m.id }))} />
                        {m.label}{m.add[branch] ? <small>+{money(m.add[branch], branch)}</small> : null}
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}
              <fieldset className="opts">
                <legend>Extras</legend>
                <div className="opts__row">
                  {extras.map((x) => (
                    <label key={x.id} className={`pill ${opt.extras?.includes(x.id) ? 'is-on' : ''}`}>
                      <input type="checkbox" checked={!!opt.extras?.includes(x.id)} onChange={() => toggleExtra(x.id)} />
                      {x.label}<small>+{money(x.add[branch], branch)}</small>
                    </label>
                  ))}
                </div>
              </fieldset>
            </>
          )}
        </div>
        <div className="sheet__foot">
          <div className="stepper" aria-label="Quantity">
            <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="One less">−</button>
            <span aria-live="polite">{qty}</span>
            <button type="button" onClick={() => setQty((q) => Math.min(20, q + 1))} aria-label="One more">+</button>
          </div>
          <button type="button" className="btn btn--primary btn--grow" disabled={item.soldOut} onClick={() => { add(item, opt, qty, artRef.current?.querySelector('img, svg')); onClose(); }}>
            {item.soldOut ? 'Sold out today' : <>Add to order · {money(Math.round(price * 100) / 100, branch)}</>}
          </button>
        </div>
      </div>
    </div>
  );
}
