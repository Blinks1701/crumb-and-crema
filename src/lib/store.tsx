import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { extras, menu, milks, sizes, type BranchId, type MenuItem } from './data';
import { seedOrders } from '../admin/seed';

export interface LineOptions { size?: string; milk?: string; extras?: string[] }
export interface CartLine { key: string; itemId: string; qty: number; options: LineOptions }
export type OrderStatus = 'new' | 'brewing' | 'ready' | 'collected' | 'cancelled';
export interface AdminOrder {
  id: string; number: string; branch: BranchId; name: string; lines: CartLine[]; total: number;
  status: OrderStatus; placedAt: number; pickup: string; channel: 'web' | 'counter'; mine?: boolean;
}
/** What the admin can change on a menu item. Website and admin both read the merged result. */
export interface ItemPatch { name?: string; description?: string; category?: MenuItem['category']; customisable?: boolean; price?: { dxb: number; nyc: number }; soldOut?: boolean; photo?: string; tags?: string[]; hidden?: boolean }
export type Item = MenuItem & { soldOut?: boolean; photo?: string };
export interface CafeSettings { paused: boolean; prep: number }

export function unitPrice(item: MenuItem, opt: LineOptions, branch: BranchId): number {
  let p = item.price[branch];
  const s = sizes.find((x) => x.id === opt.size); if (s) p += s.add[branch];
  const m = milks.find((x) => x.id === opt.milk); if (m) p += m.add[branch];
  for (const e of opt.extras ?? []) { const x = extras.find((y) => y.id === e); if (x) p += x.add[branch]; }
  return Math.round(p * 100) / 100;
}

export function describe(opt: LineOptions): string {
  const parts: string[] = [];
  const s = sizes.find((x) => x.id === opt.size); if (s) parts.push(s.label);
  const m = milks.find((x) => x.id === opt.milk); if (m && m.id !== 'whole') parts.push(m.label);
  for (const e of opt.extras ?? []) { const x = extras.find((y) => y.id === e); if (x) parts.push(x.label); }
  return parts.join(' · ');
}

export const AED_PER_USD = 3.6725;

interface Store {
  branch: BranchId; setBranch: (b: BranchId) => void;
  items: Item[]; itemById: (id: string) => Item | undefined; updateItem: (id: string, patch: ItemPatch) => void; resetItem: (id: string) => void;
  addItem: (item: Item) => void; removeItem: (id: string) => void;
  lines: CartLine[]; count: number; subtotal: number;
  add: (item: MenuItem, options: LineOptions, qty: number, from?: Element | null) => void;
  setQty: (key: string, qty: number) => void; clear: () => void;
  cartOpen: boolean; setCartOpen: (v: boolean) => void;
  bump: number; cartRef: React.MutableRefObject<HTMLButtonElement | null>;
  orders: AdminOrder[]; myOrderId: string | null; placeOrder: (name: string, pickup: string) => AdminOrder;
  setStatus: (id: string, status: OrderStatus) => void; addOrder: (o: AdminOrder) => void;
  cafes: Record<BranchId, CafeSettings>; setCafe: (b: BranchId, patch: Partial<CafeSettings>) => void;
  resetDemo: () => void;
}

const Ctx = createContext<Store | null>(null);

function read<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v ? (JSON.parse(v) as T) : fallback; } catch { return fallback; }
}
function write(key: string, v: unknown) { try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* storage full or unavailable */ } }

const defaultCafes: Record<BranchId, CafeSettings> = { dxb: { paused: false, prep: 10 }, nyc: { paused: false, prep: 8 } };

export function StoreProvider({ children }: { children: ReactNode }) {
  const [branch, setBranchState] = useState<BranchId>('dxb');
  const [lines, setLines] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [bump, setBump] = useState(0);
  const [patches, setPatches] = useState<Record<string, ItemPatch>>({});
  const [custom, setCustom] = useState<Item[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [myOrderId, setMyOrderId] = useState<string | null>(null);
  const [cafes, setCafes] = useState(defaultCafes);
  const [ready, setReady] = useState(false);
  const cartRef = useRef<HTMLButtonElement | null>(null);

  const all = useMemo<(Item & { hidden?: boolean })[]>(() => [...menu, ...custom].map((m) => ({ ...m, ...(patches[m.id] ?? {}) })), [patches, custom]);
  const items = useMemo<Item[]>(() => all.filter((m) => !m.hidden), [all]);
  // Orders keep showing removed items by name, so look them up in the full list.
  const itemById = useCallback((id: string) => all.find((m) => m.id === id), [all]);
  const priceOf = useCallback((o: AdminOrder) => Math.round(o.lines.reduce((s, l) => { const it = menu.find((m) => m.id === l.itemId); return it ? s + unitPrice(it, l.options, o.branch) * l.qty : s; }, 0) * 100) / 100, []);

  // Load saved state. Orders are re-seeded each day so the dashboard always shows "today".
  useEffect(() => {
    setBranchState(read<BranchId>('cc-branch', 'dxb'));
    setLines(read<CartLine[]>('cc-cart', []));
    setPatches(read('cc-patches', {}));
    setCustom(read<Item[]>('cc-custom', []));
    setCafes(read('cc-cafes', defaultCafes));
    setMyOrderId(read<string | null>('cc-my-order', null));
    const day = new Date().toDateString();
    const saved = read<{ day: string; orders: AdminOrder[] } | null>('cc-orders', null);
    setOrders(saved && saved.day === day ? saved.orders : seedOrders(new Date(), priceOf));
    setReady(true);
  }, [priceOf]);

  useEffect(() => { if (ready) write('cc-cart', lines); }, [lines, ready]);
  useEffect(() => { if (ready) write('cc-patches', patches); }, [patches, ready]);
  useEffect(() => { if (ready) write('cc-custom', custom); }, [custom, ready]);
  useEffect(() => { if (ready) write('cc-cafes', cafes); }, [cafes, ready]);
  useEffect(() => { if (ready) write('cc-orders', { day: new Date().toDateString(), orders: orders.slice(0, 400) }); }, [orders, ready]);
  useEffect(() => { if (ready) write('cc-my-order', myOrderId); }, [myOrderId, ready]);

  // Keep two open tabs (website and admin) in sync.
  useEffect(() => {
    const on = (e: StorageEvent) => {
      if (e.key === 'cc-orders') { const v = read<{ orders: AdminOrder[] } | null>('cc-orders', null); if (v) setOrders(v.orders); }
      if (e.key === 'cc-patches') setPatches(read('cc-patches', {}));
      if (e.key === 'cc-custom') setCustom(read('cc-custom', []));
      if (e.key === 'cc-cafes') setCafes(read('cc-cafes', defaultCafes));
    };
    window.addEventListener('storage', on);
    return () => window.removeEventListener('storage', on);
  }, []);

  const setBranch = useCallback((b: BranchId) => { setBranchState(b); write('cc-branch', b); }, []);

  const fly = useCallback((from: Element) => {
    const target = cartRef.current;
    if (!target || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const a = from.getBoundingClientRect(); const b = target.getBoundingClientRect();
    const ghost = from.cloneNode(true) as HTMLElement;
    Object.assign(ghost.style, { position: 'fixed', left: `${a.left}px`, top: `${a.top}px`, width: `${a.width}px`, height: `${a.height}px`, zIndex: '200', pointerEvents: 'none', margin: '0', borderRadius: '50%', objectFit: 'cover' });
    document.body.appendChild(ghost);
    const dx = b.left + b.width / 2 - (a.left + a.width / 2); const dy = b.top + b.height / 2 - (a.top + a.height / 2);
    const anim = ghost.animate([
      { transform: 'translate(0,0) scale(1) rotate(0deg)', opacity: 1 },
      { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - 160}px) scale(0.6) rotate(-200deg)`, opacity: 1, offset: 0.5 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.1) rotate(-360deg)`, opacity: 0.6 },
    ], { duration: 820, easing: 'cubic-bezier(.45,.05,.4,1)' });
    anim.onfinish = () => { ghost.remove(); setBump((n) => n + 1); };
  }, []);

  const add = useCallback((item: MenuItem, options: LineOptions, qty: number, from?: Element | null) => {
    const key = `${item.id}|${options.size ?? ''}|${options.milk ?? ''}|${(options.extras ?? []).slice().sort().join(',')}`;
    setLines((ls) => {
      const found = ls.find((l) => l.key === key);
      if (found) return ls.map((l) => (l.key === key ? { ...l, qty: l.qty + qty } : l));
      return [...ls, { key, itemId: item.id, qty, options }];
    });
    if (from) fly(from); else setBump((n) => n + 1);
  }, [fly]);

  const setQty = useCallback((key: string, qty: number) => setLines((ls) => (qty <= 0 ? ls.filter((l) => l.key !== key) : ls.map((l) => (l.key === key ? { ...l, qty } : l)))), []);
  const clear = useCallback(() => setLines([]), []);

  const subtotal = useMemo(() => lines.reduce((sum, l) => { const it = items.find((m) => m.id === l.itemId); return it ? sum + unitPrice(it, l.options, branch) * l.qty : sum; }, 0), [lines, branch, items]);
  const count = useMemo(() => lines.reduce((n, l) => n + l.qty, 0), [lines]);

  const nextNumber = useCallback((list: AdminOrder[]) => String(Math.max(100, ...list.map((o) => Number(o.number) || 0)) + 1), []);

  const placeOrder = useCallback((name: string, pickup: string) => {
    const o: AdminOrder = { id: `${branch}-${Date.now()}`, number: nextNumber(orders), branch, name, lines, total: Math.round(subtotal * 100) / 100, status: 'new', placedAt: Date.now(), pickup, channel: 'web', mine: true };
    setOrders((os) => [o, ...os]); setMyOrderId(o.id); setLines([]);
    return o;
  }, [lines, subtotal, branch, orders, nextNumber]);

  const addOrder = useCallback((o: AdminOrder) => setOrders((os) => [{ ...o, number: nextNumber(os), total: o.total || priceOf(o) }, ...os]), [nextNumber, priceOf]);
  const setStatus = useCallback((id: string, status: OrderStatus) => setOrders((os) => os.map((o) => (o.id === id ? { ...o, status } : o))), []);
  const updateItem = useCallback((id: string, patch: ItemPatch) => setPatches((p) => ({ ...p, [id]: { ...(p[id] ?? {}), ...patch } })), []);
  const addItem = useCallback((item: Item) => setCustom((c) => [...c, item]), []);
  const removeItem = useCallback((id: string) => {
    if (custom.some((c) => c.id === id)) setCustom((c) => c.filter((x) => x.id !== id));
    else setPatches((p) => ({ ...p, [id]: { ...(p[id] ?? {}), hidden: true } }));
    setLines((ls) => ls.filter((l) => l.itemId !== id));
  }, [custom]);
  const resetItem = useCallback((id: string) => setPatches((p) => { const n = { ...p }; delete n[id]; return n; }), []);
  const setCafe = useCallback((b: BranchId, patch: Partial<CafeSettings>) => setCafes((c) => ({ ...c, [b]: { ...c[b], ...patch } })), []);
  const resetDemo = useCallback(() => { setPatches({}); setCustom([]); setCafes(defaultCafes); setOrders(seedOrders(new Date(), priceOf)); setMyOrderId(null); }, [priceOf]);

  const value: Store = {
    branch, setBranch, items, itemById, updateItem, resetItem, addItem, removeItem, lines, count, subtotal, add, setQty, clear, cartOpen, setCartOpen, bump, cartRef,
    orders, myOrderId, placeOrder, setStatus, addOrder, cafes, setCafe, resetDemo,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore must be used inside StoreProvider');
  return v;
}
