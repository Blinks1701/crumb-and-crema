import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { branches, type BranchId } from '../lib/data';
import { useStore, type AdminOrder } from '../lib/store';
import { Link } from '../lib/router';
import { Mark } from '../components/Logo';
import { Switch, Toasts, type ToastMsg } from './ui';
import { makeLines, randomName, rng } from './seed';
import Dashboard from './Dashboard';
import Orders from './Orders';
import MenuAdmin from './MenuAdmin';
import Cafes from './Cafes';
import Club from './Club';

export type Role = 'owner' | BranchId;
interface AdminCtx { role: Role; scope: BranchId[]; toast: (t: string) => void }
const Ctx = createContext<AdminCtx>({ role: 'owner', scope: ['dxb', 'nyc'], toast: () => {} });
export const useAdmin = () => useContext(Ctx);

const nav = [
  { to: '/admin', label: 'Dashboard', icon: 'M4 13h6V4H4zm10 7h6v-9h-6zM4 20h6v-5H4zm10-11h6V4h-6z' },
  { to: '/admin-orders', label: 'Live orders', icon: 'M6 3h12l-1 4H7zM5 7h14l-1.5 13a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1zM9 11h6' },
  { to: '/admin-menu', label: 'Menu', icon: 'M4 5h16M4 12h16M4 19h10' },
  { to: '/admin-cafes', label: 'Cafés', icon: 'M3 10l9-6 9 6v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z' },
  { to: '/admin-club', label: 'Crumb Club', icon: 'M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.6-7 10-7 10z' },
];

function read<T>(k: string, f: T): T { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) as T : f; } catch { return f; } }
function write(k: string, v: unknown) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } }

export default function AdminApp({ route }: { route: string }) {
  const { orders, addOrder, cafes, resetDemo, items } = useStore();
  const [role, setRoleState] = useState<Role>('owner');
  const [sim, setSimState] = useState(true);
  const [navOpen, setNavOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const [confirmReset, setConfirmReset] = useState(false);
  const r = useRef(rng(Date.now() % 100000));

  useEffect(() => { setRoleState(read<Role>('cc-role', 'owner')); setSimState(read('cc-sim', true)); }, []);
  useEffect(() => { setNavOpen(false); window.scrollTo(0, 0); }, [route]);
  const setRole = (v: Role) => { setRoleState(v); write('cc-role', v); };
  const setSim = (v: boolean) => { setSimState(v); write('cc-sim', v); };
  const scope: BranchId[] = role === 'owner' ? ['dxb', 'nyc'] : [role];

  const toast = useCallback((text: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-2), { id, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }, []);

  // Demo: a new order arrives every ~25 seconds at an open café in scope.
  const scopeKey = scope.join(',');
  useEffect(() => {
    if (!sim) return;
    const id = setInterval(() => {
      const open = scope.filter((b) => {
        const h = Number(new Intl.DateTimeFormat('en-GB', { timeZone: branches[b].timeZone, hour: '2-digit', hour12: false }).format(new Date())) % 24;
        return !cafes[b].paused && h >= branches[b].opens && h < branches[b].closes;
      });
      if (!open.length) return;
      const b = open[Math.floor(r.current() * open.length)];
      const lines = makeLines(r.current).filter((l) => items.some((i) => i.id === l.itemId && !i.soldOut));
      if (!lines.length) return;
      const o: AdminOrder = { id: `${b}-${Date.now()}`, number: '', branch: b, name: randomName(r.current), lines, total: 0, status: 'new', placedAt: Date.now(), pickup: `in about ${cafes[b].prep} minutes`, channel: r.current() < 0.65 ? 'web' : 'counter' };
      addOrder(o);
      toast(`New ${o.channel === 'web' ? 'online' : 'counter'} order for ${o.name} · ${branches[b].area}`);
    }, 25000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sim, scopeKey, cafes, addOrder, toast, items]);

  const waiting = orders.filter((o) => scope.includes(o.branch) && o.status === 'new').length;
  let view: ReactNode;
  switch (route) {
    case '/admin-orders': view = <Orders />; break;
    case '/admin-menu': view = <MenuAdmin />; break;
    case '/admin-cafes': view = <Cafes />; break;
    case '/admin-club': view = <Club />; break;
    default: view = <Dashboard />;
  }

  return (
    <Ctx.Provider value={{ role, scope, toast }}>
      <div className="admin">
        <aside className={`aside ${navOpen ? 'is-open' : ''}`}>
          <Link to="/admin" className="aside__brand"><Mark size={40} color="#FFF8F0" /><span><b>Crumb &amp; Crema</b><small>Café admin</small></span></Link>
          <nav aria-label="Admin">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} className={`aside__link ${route === n.to ? 'is-active' : ''}`} aria-current={route === n.to ? 'page' : undefined}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={n.icon} /></svg>
                {n.label}
                {n.to === '/admin-orders' && waiting > 0 && <span className="aside__badge" key={waiting}>{waiting}</span>}
              </Link>
            ))}
          </nav>
          <div className="aside__foot">
            <Switch id="sim" checked={sim} onChange={setSim} label="Simulate new orders" />
            {confirmReset ? (
              <div className="aside__confirm">
                <span>Reset all demo changes?</span>
                <button type="button" onClick={() => { resetDemo(); setConfirmReset(false); toast('Demo data reset'); }}>Reset</button>
                <button type="button" onClick={() => setConfirmReset(false)}>Keep</button>
              </div>
            ) : <button type="button" className="aside__reset" onClick={() => setConfirmReset(true)}>Reset demo data</button>}
            <Link to="/" className="aside__site">← Back to the website</Link>
          </div>
        </aside>
        {navOpen && <button type="button" className="aside__scrim" aria-label="Close menu" onClick={() => setNavOpen(false)} />}
        <div className="amain">
          <div className="atop">
            <button type="button" className="atop__menu" onClick={() => setNavOpen(true)} aria-label="Open admin menu">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
            </button>
            <p className="atop__ribbon">Concept admin panel · sample data, changes stay in this browser</p>
            <label className="atop__role">
              <span>Signed in as</span>
              <select value={role} onChange={(e) => setRole(e.target.value as Role)}>
                <option value="owner">Owner · both cafés</option>
                <option value="dxb">Barista · Dubai Marina</option>
                <option value="nyc">Barista · Williamsburg</option>
              </select>
            </label>
          </div>
          <div className="acontent" key={route}>{view}</div>
        </div>
        <Toasts items={toasts} />
      </div>
    </Ctx.Provider>
  );
}

export function PageHead({ title, sub, children }: { title: string; sub?: string; children?: ReactNode }) {
  return (
    <div className="ahead">
      <div><h1>{title}</h1>{sub && <p>{sub}</p>}</div>
      {children && <div className="ahead__actions">{children}</div>}
    </div>
  );
}
