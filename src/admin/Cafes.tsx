import { branches, money, type BranchId } from '../lib/data';
import { useStore } from '../lib/store';
import { useClock } from '../lib/hooks';
import { Link } from '../lib/router';
import { PageHead, useAdmin } from './AdminApp';
import { Switch } from './ui';

function CafeCard({ b }: { b: BranchId }) {
  const { cafes, setCafe, orders } = useStore();
  const { toast } = useAdmin();
  const br = branches[b]; const c = cafes[b];
  const { label, hour } = useClock(br.timeZone);
  const open = hour >= br.opens && hour < br.closes;
  const today = orders.filter((o) => o.branch === b && o.status !== 'cancelled');
  const queue = today.filter((o) => o.status === 'new' || o.status === 'brewing').length;
  const status = !open ? 'Closed now' : c.paused ? 'Open · online orders paused' : 'Open · taking orders';
  return (
    <section className="apanel cafe">
      <header className="cafe__head">
        <div><h2>{br.area}</h2><p>{br.city} · {label} local time</p></div>
        <span className={`cafe__status ${!open ? 'is-closed' : c.paused ? 'is-paused' : 'is-open'}`}>{status}</span>
      </header>
      <dl className="cafe__stats">
        <div><dt>Orders today</dt><dd>{today.length}</dd></div>
        <div><dt>Sales today</dt><dd>{money(Math.round(today.reduce((s, o) => s + o.total, 0)), b)}</dd></div>
        <div><dt>In the queue</dt><dd>{queue}</dd></div>
      </dl>
      <div className="cafe__row">
        <div><b>Online orders</b><span>Pause when the queue gets too long. Customers see a short message at checkout.</span></div>
        <Switch id={`pause-${b}`} checked={!c.paused} onChange={(v) => { setCafe(b, { paused: !v }); toast(v ? `${br.area} is taking online orders again` : `Online orders paused at ${br.area}`); }} label={c.paused ? 'Paused' : 'On'} />
      </div>
      <div className="cafe__row">
        <div><b>Pickup time</b><span>Shown on the menu and used for the pickup slots at checkout.</span></div>
        <div className="astepper" aria-label="Pickup time in minutes">
          <button type="button" onClick={() => setCafe(b, { prep: Math.max(5, c.prep - 1) })} aria-label="One minute less">−</button>
          <output aria-live="polite">{c.prep} min</output>
          <button type="button" onClick={() => setCafe(b, { prep: Math.min(30, c.prep + 1) })} aria-label="One minute more">+</button>
        </div>
      </div>
      <div className="cafe__row">
        <div><b>Opening hours</b><span>{br.hoursLabel}</span></div>
        <span className="anote">{br.address}</span>
      </div>
    </section>
  );
}

export default function Cafes() {
  const { scope } = useAdmin();
  return (
    <>
      <PageHead title="Cafés" sub="Settings here change the website instantly. Try pausing orders, then open the checkout.">
        <Link to="/checkout" className="abtn abtn--ghost">Open the checkout</Link>
      </PageHead>
      <div className="cafes">{scope.map((b) => <CafeCard key={b} b={b} />)}</div>
    </>
  );
}
