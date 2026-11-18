import { useEffect, useMemo, useRef, useState } from 'react';
import { categories, menu as defaults, money, type CategoryId } from '../lib/data';
import { useStore, type Item } from '../lib/store';
import { photoOf } from '../lib/photos';
import { Art } from '../components/Art';
import { PageHead, useAdmin } from './AdminApp';
import { Switch } from './ui';

/** Shrink an uploaded photo to a 600px square JPEG so it fits in browser storage. */
function toSquareJpeg(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const s = Math.min(img.width, img.height);
      const c = document.createElement('canvas'); c.width = 600; c.height = 600;
      c.getContext('2d')!.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, 600, 600);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('That file isn’t an image we can read. Try a JPG or PNG.')); };
    img.src = url;
  });
}

function Editor({ item, onClose }: { item: Item | null; onClose: () => void }) {
  const { updateItem, resetItem, addItem, removeItem } = useStore();
  const { toast } = useAdmin();
  const isNew = !item;
  const isDefault = !!item && defaults.some((d) => d.id === item.id);
  const [name, setName] = useState(item?.name ?? '');
  const [category, setCategory] = useState<CategoryId>(item?.category ?? 'hot');
  const [desc, setDesc] = useState(item?.description ?? '');
  const [aed, setAed] = useState(item ? String(item.price.dxb) : '');
  const [usd, setUsd] = useState(item ? String(item.price.nyc) : '');
  const [drinkOptions, setDrinkOptions] = useState(item?.customisable ?? true);
  const [tags, setTags] = useState<string[]>(item?.tags ?? (isNew ? ['New'] : []));
  const [photo, setPhoto] = useState<string | undefined>(item?.photo);
  const [err, setErr] = useState('');
  const [confirmDel, setConfirmDel] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { closeRef.current?.focus(); const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, [onClose]);
  const isDrink = category === 'hot' || category === 'iced';

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const a = Number(aed); const u = Number(usd);
    if (!name.trim()) { setErr('Add a name for this item.'); return; }
    if (!(a > 0) || !(u > 0)) { setErr('Prices must be numbers above zero, for example 24 or 5.75.'); return; }
    const art = categories.find((c) => c.id === category)!.art;
    if (isNew) {
      addItem({ id: `item-${Date.now()}`, name: name.trim(), category, description: desc.trim() || 'Freshly made at Crumb & Crema.', art, price: { dxb: a, nyc: u }, tags, customisable: isDrink && drinkOptions, kcal: 0, photo });
      toast(`${name.trim()} added. It’s on the website menu now.`);
    } else {
      updateItem(item.id, { name: name.trim(), category, description: desc.trim(), price: { dxb: a, nyc: u }, tags, photo, customisable: isDrink && drinkOptions });
      toast(`${name.trim()} saved. The website menu is updated.`);
    }
    onClose();
  };
  const toggleTag = (t: string) => setTags((ts) => (ts.includes(t) ? ts.filter((x) => x !== t) : [...ts, t]));
  const shown = photo ?? (item ? photoOf({ id: item.id }) : undefined);
  const art = categories.find((c) => c.id === category)!.art;

  return (
    <div className="adrawer" role="dialog" aria-modal="true" aria-labelledby="ed-title">
      <button type="button" className="adrawer__scrim" aria-label="Close" tabIndex={-1} onClick={onClose} />
      <form className="adrawer__panel" onSubmit={save} noValidate>
        <header className="adrawer__head"><h2 id="ed-title">{isNew ? 'Add a new item' : 'Edit item'}</h2><button ref={closeRef} type="button" className="aicon" onClick={onClose} aria-label="Close">×</button></header>
        <div className="adrawer__body">
          <div className="photoedit">
            {shown ? <img src={shown} alt="" width={120} height={120} /> : <span className="photoedit__art"><Art k={art} size={100} /></span>}
            <div>
              <label className="abtn abtn--ghost abtn--sm" htmlFor="ph">{shown ? 'Upload new photo' : 'Upload a photo'}</label>
              <input id="ph" className="sr-only" type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; try { setPhoto(await toSquareJpeg(f)); setErr(''); } catch (x) { setErr((x as Error).message); } }} />
              {photo && !isNew && <button type="button" className="alink" onClick={() => setPhoto(undefined)}>Use the original photo</button>}
              <p className="anote">{isNew && !shown ? 'Optional. Without a photo the menu shows the category illustration.' : 'Square photos look best. We crop to the centre.'}</p>
            </div>
          </div>
          <label className="afield"><span>Name</span><input id="ed-name" value={name} onChange={(e) => { setName(e.target.value); setErr(''); }} placeholder="e.g. Rose pistachio latte" /></label>
          <label className="afield"><span>Category</span>
            <select id="ed-cat" value={category} onChange={(e) => setCategory(e.target.value as CategoryId)}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </label>
          <label className="afield"><span>Description</span><textarea id="ed-desc" rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="What’s in it, in one or two sentences" /></label>
          <div className="afield-row">
            <label className="afield"><span>Price in Dubai (AED)</span><input id="ed-aed" inputMode="decimal" value={aed} onChange={(e) => { setAed(e.target.value); setErr(''); }} placeholder="24" /></label>
            <label className="afield"><span>Price in New York (USD)</span><input id="ed-usd" inputMode="decimal" value={usd} onChange={(e) => { setUsd(e.target.value); setErr(''); }} placeholder="5.75" /></label>
          </div>
          {isDrink && <Switch id="ed-opts" checked={drinkOptions} onChange={setDrinkOptions} label="Customers can choose size, milk and extras" />}
          <fieldset className="afield"><legend>Badges on the menu</legend>
            <div className="chips">{['Bestseller', 'New', 'Dubai favourite', 'Fresh daily'].map((t) => <label key={t} className={`chip ${tags.includes(t) ? 'is-on' : ''}`}><input type="checkbox" checked={tags.includes(t)} onChange={() => toggleTag(t)} />{t}</label>)}</div>
          </fieldset>
          {err && <p className="aerr" role="alert">{err}</p>}
          {!isNew && (confirmDel ? (
            <div className="adanger" role="group" aria-label="Confirm remove">
              <b>Remove {item.name} from the menu?</b>
              <span>It disappears from the website and from customers’ carts. Past orders keep it.{isDefault ? ' You can bring it back with “Reset demo data”.' : ''}</span>
              <div><button type="button" className="abtn abtn--danger abtn--sm" onClick={() => { removeItem(item.id); toast(`${item.name} removed from the menu`); onClose(); }}>Remove item</button><button type="button" className="abtn abtn--ghost abtn--sm" onClick={() => setConfirmDel(false)}>Keep it</button></div>
            </div>
          ) : <button type="button" className="adel" onClick={() => setConfirmDel(true)}>Remove from menu</button>)}
        </div>
        <footer className="adrawer__foot">
          {isDefault && <button type="button" className="alink" onClick={() => { resetItem(item.id); toast(`${item.name} reset to the original`); onClose(); }}>Reset to original</button>}
          <button type="button" className="abtn abtn--ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="abtn abtn--primary">{isNew ? 'Add to menu' : 'Save changes'}</button>
        </footer>
      </form>
    </div>
  );
}

export default function MenuAdmin() {
  const { items, updateItem, orders } = useStore();
  const { toast } = useAdmin();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<CategoryId | 'all'>('all');
  const [editing, setEditing] = useState<Item | 'new' | null>(null);
  const sold = useMemo(() => { const m = new Map<string, number>(); orders.forEach((o) => o.status !== 'cancelled' && o.lines.forEach((l) => m.set(l.itemId, (m.get(l.itemId) ?? 0) + l.qty))); return m; }, [orders]);
  const list = items.filter((m) => (cat === 'all' || m.category === cat) && `${m.name} ${m.description}`.toLowerCase().includes(q.trim().toLowerCase()));
  const outCount = items.filter((m) => m.soldOut).length;

  return (
    <>
      <PageHead title="Menu" sub={`${items.length} items · ${outCount ? `${outCount} sold out today` : 'everything available'} · changes show on the website straight away`}>
        <button type="button" className="abtn abtn--primary" onClick={() => setEditing('new')}>+ Add new item</button>
      </PageHead>
      <div className="atools">
        <label className="asearch"><span className="sr-only">Search items</span><input id="menu-q" type="search" placeholder="Search items" value={q} onChange={(e) => setQ(e.target.value)} /></label>
        <div className="seg seg--wrap" role="radiogroup" aria-label="Category">
          <button type="button" role="radio" aria-checked={cat === 'all'} onClick={() => setCat('all')}>All</button>
          {categories.map((c) => <button key={c.id} type="button" role="radio" aria-checked={cat === c.id} onClick={() => setCat(c.id)}>{c.label}</button>)}
        </div>
      </div>
      <div className="atable-wrap">
        <table className="atable">
          <thead><tr><th>Item</th><th>Category</th><th className="num">Dubai</th><th className="num">New York</th><th className="num">Sold today</th><th>Available</th><th><span className="sr-only">Edit</span></th></tr></thead>
          <tbody>
            {list.map((m) => {
              const orig = defaults.find((d) => d.id === m.id);
              const changed = !!orig && JSON.stringify({ n: m.name, p: m.price }) !== JSON.stringify({ n: orig.name, p: orig.price });
              return (
                <tr key={m.id} className={m.soldOut ? 'is-out' : ''}>
                  <td><span className="aitem">{photoOf(m) ? <img src={photoOf(m)} alt="" width={44} height={44} /> : <Art k={m.art} size={44} />}<span><b>{m.name}</b>{m.tags?.length ? <small>{m.tags.join(' · ')}</small> : null}{changed && <small className="edited">Edited</small>}{!orig && <small className="edited">Added by you</small>}</span></span></td>
                  <td>{categories.find((c) => c.id === m.category)?.label}</td>
                  <td className="num">{money(m.price.dxb, 'dxb')}</td>
                  <td className="num">{money(m.price.nyc, 'nyc')}</td>
                  <td className="num">{sold.get(m.id) ?? 0}</td>
                  <td><Switch id={`av-${m.id}`} checked={!m.soldOut} onChange={(v) => { updateItem(m.id, { soldOut: !v }); toast(v ? `${m.name} is back on the menu` : `${m.name} marked sold out on the website`); }} label={m.soldOut ? 'Sold out' : 'On sale'} /></td>
                  <td><button type="button" className="abtn abtn--ghost abtn--sm" onClick={() => setEditing(m)}>Edit</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {list.length === 0 && <p className="aempty">No items match “{q}”.</p>}
      </div>
      {editing && <Editor item={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
    </>
  );
}
