import { useState } from 'react';
import { money } from '../lib/data';
import { describe, useStore, type AdminOrder, type OrderStatus } from '../lib/store';
import { PageHead, useAdmin } from './AdminApp';
import { ago, CafeTag, useNow } from './ui';

const cols: { id: OrderStatus; title: string; next?: OrderStatus; action?: string }[] = [
  { id: 'new', title: 'New', next: 'brewing', action: 'Start' },
  { id: 'brewing', title: 'Brewing', next: 'ready', action: 'Mark ready' },
  { id: 'ready', title: 'Ready for pickup', next: 'collected', action: 'Collected' },
  { id: 'collected', title: 'Collected' },
];

function OrderCard({ o, now, showCafe }: { o: AdminOrder; now: number; showCafe: boolean }) {
  const { setStatus, itemById } = useStore();
  const { toast } = useAdmin();
  const [confirm, setConfirm] = useState(false);
  const col = cols.find((c) => c.id === o.status)!;
  const mins = (now - o.placedAt) / 60000;
  const late = (o.status === 'new' && mins > 4) || (o.status === 'brewing' && mins > 10);
  return (
    <article className={`ocard ${late ? 'ocard--late' : ''} ${o.mine ? 'ocard--mine' : ''}`} draggable onDragStart={(e) => { e.dataTransfer.setData('text/plain', o.id); e.dataTransfer.effectAllowed = 'move'; }}>
      <header>
        <b>#{o.number} · {o.name}</b>
        {showCafe && <CafeTag b={o.branch} />}
      </header>
      <p className="ocard__meta">
        <span className={`chan chan--${o.channel}`}>{o.channel === 'web' ? 'Online' : 'Counter'}</span>
        <span className={late ? 'ocard__late' : ''}>{ago(o.placedAt, now)}{late ? ' · running late' : ''}</span>
      </p>
      {o.mine && <p className="ocard__you">Your order from the website</p>}
      <ul className="ocard__lines">
        {o.lines.map((l) => { const it = itemById(l.itemId); const d = describe(l.options); return <li key={l.key}><b>{l.qty}×</b> {it?.name}{d && <small>{d}</small>}</li>; })}
      </ul>
      <footer>
        <span className="ocard__total">{money(o.total, o.branch)}</span>
        {col.next && <button type="button" className="abtn abtn--primary abtn--sm" onClick={() => { setStatus(o.id, col.next!); toast(`#${o.number} moved to ${cols.find((c) => c.id === col.next)!.title.toLowerCase()}`); }}>{col.action}</button>}
      </footer>
      {(o.status === 'new' || o.status === 'brewing') && (
        confirm ? (
          <div className="ocard__confirm" role="group" aria-label="Confirm cancel">
            <span>Cancel #{o.number}?</span>
            <button type="button" onClick={() => { setStatus(o.id, 'cancelled'); toast(`#${o.number} cancelled`); }}>Yes, cancel</button>
            <button type="button" onClick={() => setConfirm(false)}>No</button>
          </div>
        ) : <button type="button" className="ocard__cancel" onClick={() => setConfirm(true)}>Cancel order</button>
      )}
    </article>
  );
}

export default function Orders() {
  const { orders, setStatus } = useStore();
  const { scope, toast } = useAdmin();
  const now = useNow(15000);
  const [over, setOver] = useState<OrderStatus | null>(null);
  const [filter, setFilter] = useState<'all' | 'dxb' | 'nyc'>('all');
  const inScope = orders.filter((o) => scope.includes(o.branch) && (filter === 'all' || o.branch === filter));

  return (
    <>
      <PageHead title="Live orders" sub="Drag a card or tap its button to move it along. The customer’s tracker on the website updates straight away.">
        {scope.length > 1 && (
          <div className="seg" role="radiogroup" aria-label="Café">
            {(['all', 'dxb', 'nyc'] as const).map((f) => <button key={f} type="button" role="radio" aria-checked={filter === f} onClick={() => setFilter(f)}>{f === 'all' ? 'Both' : f === 'dxb' ? 'Dubai' : 'NYC'}</button>)}
          </div>
        )}
      </PageHead>
      <div className="board">
        {cols.map((c) => {
          const list = inScope.filter((o) => o.status === c.id).sort((a, b) => (c.id === 'collected' ? b.placedAt - a.placedAt : a.placedAt - b.placedAt));
          const shown = c.id === 'collected' ? list.slice(0, 8) : list;
          return (
            <section key={c.id} className={`bcol bcol--${c.id} ${over === c.id ? 'is-over' : ''}`} aria-label={c.title}
              onDragOver={(e) => { e.preventDefault(); setOver(c.id); }} onDragLeave={() => setOver(null)}
              onDrop={(e) => { e.preventDefault(); setOver(null); const id = e.dataTransfer.getData('text/plain'); const o = orders.find((x) => x.id === id); if (o && o.status !== c.id) { setStatus(id, c.id); toast(`#${o.number} moved to ${c.title.toLowerCase()}`); } }}>
              <header className="bcol__head"><h2>{c.title}</h2><span>{list.length}</span></header>
              <div className="bcol__list">
                {shown.length === 0 && <p className="bcol__empty">{c.id === 'new' ? 'No new orders. New ones pop in here.' : 'Nothing here yet.'}</p>}
                {shown.map((o) => <OrderCard key={o.id} o={o} now={now} showCafe={scope.length > 1 && filter === 'all'} />)}
                {c.id === 'collected' && list.length > shown.length && <p className="bcol__more">+ {list.length - shown.length} earlier today</p>}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
