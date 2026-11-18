// Sample orders and Crumb Club members for the admin demo. Deterministic so the
// dashboard looks the same on every load. In the full build these come from Laravel.
import { branches, menu, type BranchId } from '../lib/data';
import type { AdminOrder, OrderStatus } from '../lib/store';

function rng(seed: number) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

const names = ['Sara', 'Omar', 'Aisha', 'Hamdan', 'Priya', 'Noah', 'Lina', 'Yusuf', 'Emma', 'Zayed', 'Maya', 'Ali', 'Chloe', 'Rashid', 'Fatima', 'Leo', 'Mariam', 'Ethan', 'Hessa', 'Jamal', 'Ava', 'Dev', 'Noor', 'Liam'];
// Relative popularity of each item, used to pick lines.
const weights: Record<string, number> = { latte: 9, spanish: 9, pistachio: 8, flatwhite: 6, karak: 7, matcha: 6, coldbrew: 5, croissant: 7, pancakes: 5, toast: 4, mocha: 4, cupcake: 3, cake: 4, cookie: 2, donut: 3, bagel: 3 };
// Orders per hour across opening hours (index 0 = opening hour).
const curve = [4, 9, 11, 8, 7, 9, 10, 7, 5, 6, 8, 7, 6, 5, 4, 3];

function localHour(tz: string, d: Date) {
  return Number(new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', hour12: false }).format(d)) % 24;
}

function pick(r: () => number) {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let x = r() * total;
  for (const [id, w] of Object.entries(weights)) { x -= w; if (x <= 0) return id; }
  return 'latte';
}

export function makeLines(r: () => number) {
  const n = 1 + Math.floor(r() * 2.4);
  const lines = [] as AdminOrder['lines'];
  for (let i = 0; i < n; i++) {
    const id = pick(r); const it = menu.find((m) => m.id === id)!;
    const options = it.customisable ? { size: ['s', 'm', 'm', 'l'][Math.floor(r() * 4)], milk: id === 'coldbrew' || id === 'karak' ? undefined : ['whole', 'oat', 'oat', 'almond', 'whole'][Math.floor(r() * 5)], extras: r() > 0.8 ? ['shot'] : [] } : {};
    const existing = lines.find((l) => l.itemId === id);
    if (existing) existing.qty += 1; else lines.push({ key: `${id}-${i}`, itemId: id, qty: 1, options });
  }
  return lines;
}

export function randomName(r: () => number) { return names[Math.floor(r() * names.length)]; }

/** Today's orders for both cafés, up to the current local time. */
export function seedOrders(now = new Date(), priceOf: (o: AdminOrder) => number): AdminOrder[] {
  const out: AdminOrder[] = [];
  let num = 101;
  (['dxb', 'nyc'] as BranchId[]).forEach((b, bi) => {
    const br = branches[b];
    const r = rng(42 + bi * 7 + now.getUTCDate());
    const hourNow = localHour(br.timeZone, now);
    const minutesNow = Number(new Intl.DateTimeFormat('en-GB', { timeZone: br.timeZone, minute: '2-digit' }).format(now));
    // Before opening, show yesterday's last hours are not needed: an empty-ish day reads as "not open yet".
    const lastHour = Math.min(hourNow, br.closes - 1);
    for (let h = br.opens; h <= lastHour; h++) {
      const count = Math.round(curve[h - br.opens] * (b === 'dxb' ? 1.15 : 0.9) * (0.75 + r() * 0.5));
      for (let k = 0; k < count; k++) {
        const minute = Math.floor(r() * 60);
        const minsAgo = (hourNow - h) * 60 + (minutesNow - minute);
        if (hourNow < br.closes && minsAgo < 0) continue;
        const placedAt = now.getTime() - Math.max(0, minsAgo) * 60000;
        const ageMin = (now.getTime() - placedAt) / 60000;
        let status: OrderStatus = 'collected';
        if (hourNow < br.closes) {
          if (ageMin < 3) status = 'new'; else if (ageMin < 7) status = 'brewing'; else if (ageMin < 11) status = 'ready';
        }
        if (status === 'collected' && r() < 0.02) status = 'cancelled';
        const o: AdminOrder = {
          id: `${b}-${num}`, number: String(num++), branch: b, name: randomName(r), lines: makeLines(r), total: 0,
          status, placedAt, pickup: 'in about 10 minutes', channel: r() < 0.62 ? 'web' : 'counter',
        };
        o.total = priceOf(o);
        out.push(o);
      }
    }
  });
  return out.sort((a, b) => b.placedAt - a.placedAt);
}

/** Sales for the last 7 full days, in USD equivalent, per café. */
export function seedWeek(): { label: string; dxb: number; nyc: number }[] {
  const r = rng(7);
  const days: { label: string; dxb: number; nyc: number }[] = [];
  const now = new Date();
  for (let i = 7; i >= 1; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const weekend = d.getDay() === 5 || d.getDay() === 6 || d.getDay() === 0;
    days.push({
      label: new Intl.DateTimeFormat('en-GB', { weekday: 'short' }).format(d),
      dxb: Math.round((1900 + r() * 500) * (weekend ? 1.25 : 1)),
      nyc: Math.round((1500 + r() * 400) * (weekend ? 1.2 : 1)),
    });
  }
  return days;
}

export interface Member { id: string; name: string; email: string; home: BranchId; stamps: number; visits: number; since: string; lastVisit: string }
export const members: Member[] = [
  { id: 'm1', name: 'Sara Khan', email: 'sara.k@example.com', home: 'dxb', stamps: 7, visits: 48, since: 'Mar 2025', lastVisit: 'Today' },
  { id: 'm2', name: 'Omar Haddad', email: 'omar.h@example.com', home: 'dxb', stamps: 9, visits: 61, since: 'Jan 2025', lastVisit: 'Today' },
  { id: 'm3', name: 'Emma Rossi', email: 'emma.r@example.com', home: 'nyc', stamps: 3, visits: 22, since: 'Jun 2025', lastVisit: 'Yesterday' },
  { id: 'm4', name: 'Hamdan Al Falasi', email: 'hamdan.f@example.com', home: 'dxb', stamps: 5, visits: 37, since: 'Apr 2025', lastVisit: '2 days ago' },
  { id: 'm5', name: 'Noah Kim', email: 'noah.k@example.com', home: 'nyc', stamps: 8, visits: 54, since: 'Feb 2025', lastVisit: 'Today' },
  { id: 'm6', name: 'Priya Nair', email: 'priya.n@example.com', home: 'dxb', stamps: 2, visits: 9, since: 'Sep 2026', lastVisit: '3 days ago' },
  { id: 'm7', name: 'Chloe Martin', email: 'chloe.m@example.com', home: 'nyc', stamps: 6, visits: 31, since: 'May 2025', lastVisit: 'Today' },
  { id: 'm8', name: 'Yusuf Rahman', email: 'yusuf.r@example.com', home: 'dxb', stamps: 0, visits: 70, since: 'Nov 2024', lastVisit: 'Yesterday' },
  { id: 'm9', name: 'Ava Thompson', email: 'ava.t@example.com', home: 'nyc', stamps: 4, visits: 15, since: 'Aug 2026', lastVisit: 'Last week' },
  { id: 'm10', name: 'Mariam Saeed', email: 'mariam.s@example.com', home: 'dxb', stamps: 9, visits: 44, since: 'Jul 2025', lastVisit: 'Today' },
];

export { rng };
