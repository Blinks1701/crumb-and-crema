import { useMemo } from 'react';
import { branches, money, type BranchId } from '../lib/data';
import { AED_PER_USD, useStore } from '../lib/store';
import { Link } from '../lib/router';
import { photoOf } from '../lib/photos';
import { PageHead, useAdmin } from './AdminApp';
import { ago, BarList, CafeTag, HourBars, Kpi, Legend, Panel, Pill, useNow, WeekLines } from './ui';
import { seedWeek } from './seed';

const usd = (v: number, b: BranchId) => (b === 'dxb' ? v / AED_PER_USD : v);
const fmtUsd = (v: number) => `$${Math.round(v).toLocaleString('en-US')}`;

function localHour(tz: string, t: number) {
  return Number(new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', hour12: false }).format(new Date(t))) % 24;
}

export default function Dashboard() {
  const { orders, itemById } = useStore();
  const { scope, role } = useAdmin();
  const now = useNow();
  const mine = useMemo(() => orders.filter((o) => scope.includes(o.branch) && o.status !== 'cancelled'), [orders, scope]);
  const single = scope.length === 1 ? scope[0] : null;

  const revenue = single ? mine.reduce((s, o) => s + o.total, 0) : mine.reduce((s, o) => s + usd(o.total, o.branch), 0);
  const fmt = (v: number) => (single ? money(Math.round(v), single) : fmtUsd(v));
  const active = mine.filter((o) => o.status === 'new' || o.status === 'brewing');
  const oldestWait = active.length ? Math.round((now - Math.min(...active.map((o) => o.placedAt))) / 60000) : 0;
  const web = mine.filter((o) => o.channel === 'web').length;

  const hours = Array.from({ length: 16 }, (_, i) => 7 + i);
  const byHour = useMemo(() => {
    const d: Record<BranchId, number[]> = { dxb: hours.map(() => 0), nyc: hours.map(() => 0) };
    mine.forEach((o) => { const h = localHour(branches[o.branch].timeZone, o.placedAt); const i = h - 7; if (i >= 0 && i < hours.length) d[o.branch][i] += 1; });
    return d;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mine]);

  const week = useMemo(() => seedWeek(), []);

  const best = useMemo(() => {
    const m = new Map<string, number>();
    mine.forEach((o) => o.lines.forEach((l) => m.set(l.itemId, (m.get(l.itemId) ?? 0) + l.qty)));
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([id, v]) => { const it = itemById(id); return { label: it?.name ?? id, value: v, thumb: it ? photoOf(it) : undefined }; });
  }, [mine, itemById]);

  const greeting = role === 'owner' ? 'Both cafés' : `${branches[role].area}, ${branches[role].city}`;

  return (
    <>
      <PageHead title="Today" sub={`${greeting} · live from the counter and the website`}>
        <Link to="/admin-orders" className="abtn abtn--primary">Open live orders{active.length ? ` (${active.length})` : ''}</Link>
      </PageHead>

      <div className="kpis">
        <Kpi label="Orders today" value={String(mine.length)} sub={`${Math.round((web / Math.max(1, mine.length)) * 100)}% ordered online`} />
        <Kpi label={single ? 'Sales today' : 'Sales today (USD)'} value={fmt(revenue)} sub={single ? 'incl. VAT/tax' : 'AED converted at 3.6725'} />
        <Kpi label="Average order" value={fmt(revenue / Math.max(1, mine.length))} />
        <Kpi label="In the queue" value={String(active.length)} sub={active.length ? `Oldest waiting ${oldestWait} min` : 'All caught up'} tone={oldestWait > 10 ? 'warn' : active.length ? undefined : 'good'} />
      </div>

      <div className="agrid">
        <Panel title="Orders by hour" action={<Legend keys={scope} />} className="agrid__wide">
          <HourBars hours={hours} data={byHour} keys={scope} />
          <p className="anote">Each café in its own local time.</p>
        </Panel>
        <Panel title="Bestsellers today">
          <BarList rows={best} unit="sold" />
        </Panel>
        <Panel title="Sales, last 7 days (USD)" action={<Legend keys={scope} />} className="agrid__wide">
          <WeekLines days={week} keys={scope} />
          <p className="anote">Full days only. Today is in the numbers above.</p>
        </Panel>
        <Panel title="Waiting now" action={<Link to="/admin-orders" className="alink">See all →</Link>}>
          {active.length === 0 ? <p className="aempty">No one waiting. Nice work.</p> : (
            <ul className="queue">
              {active.slice(0, 6).map((o) => (
                <li key={o.id}>
                  <span><b>#{o.number} {o.name}</b><small>{ago(o.placedAt, now)} · {(() => { const n = o.lines.reduce((t, l) => t + l.qty, 0); return `${n} item${n === 1 ? '' : 's'}`; })()}</small></span>
                  {scope.length > 1 && <CafeTag b={o.branch} />}
                  <Pill status={o.status} />
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
