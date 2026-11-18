import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { BranchId } from '../lib/data';
import type { OrderStatus } from '../lib/store';

export const SERIES: Record<BranchId, { color: string; label: string }> = {
  dxb: { color: '#5E0B1F', label: 'Dubai Marina' },
  nyc: { color: '#2A8AA0', label: 'Williamsburg' },
};

export const statusLabel: Record<OrderStatus, string> = { new: 'New', brewing: 'Brewing', ready: 'Ready', collected: 'Collected', cancelled: 'Cancelled' };

export function Pill({ status }: { status: OrderStatus }) {
  return <span className={`apill apill--${status}`}><span aria-hidden="true" />{statusLabel[status]}</span>;
}

export function CafeTag({ b }: { b: BranchId }) {
  return <span className={`cafetag cafetag--${b}`}>{b === 'dxb' ? 'Dubai' : 'NYC'}</span>;
}

export function Panel({ title, action, children, className }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`apanel ${className ?? ''}`}>
      <header className="apanel__head"><h2>{title}</h2>{action}</header>
      {children}
    </section>
  );
}

export function Kpi({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: 'warn' | 'good' }) {
  return (
    <div className="kpi">
      <span className="kpi__label">{label}</span>
      <b className="kpi__value">{value}</b>
      {sub && <span className={`kpi__sub ${tone ? `kpi__sub--${tone}` : ''}`}>{sub}</span>}
    </div>
  );
}

export function Switch({ checked, onChange, label, id }: { checked: boolean; onChange: (v: boolean) => void; label: string; id: string }) {
  return (
    <label className="aswitch" htmlFor={id}>
      <input id={id} type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="aswitch__track" aria-hidden="true"><span /></span>
      <span className="aswitch__label">{label}</span>
    </label>
  );
}

export function Legend({ keys }: { keys: BranchId[] }) {
  if (keys.length < 2) return null;
  return <div className="legend">{keys.map((k) => <span key={k}><i style={{ background: SERIES[k].color }} />{SERIES[k].label}</span>)}</div>;
}

/** Live "x min ago" that re-renders every 20 seconds. */
export function useNow(ms = 20000) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), ms); return () => clearInterval(id); }, [ms]);
  return now;
}
export function ago(t: number, now: number) {
  const m = Math.max(0, Math.round((now - t) / 60000));
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60); return `${h} h ${m % 60} min ago`;
}

/* ---------- Grouped bar chart: orders by hour ---------- */
export function HourBars({ hours, data, keys }: { hours: number[]; data: Record<BranchId, number[]>; keys: BranchId[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 640; const H = 220; const padL = 32; const padB = 26; const padT = 12;
  const max = Math.max(4, ...keys.flatMap((k) => data[k]));
  const step = Math.ceil(max / 4 / 2) * 2 || 2; const top = step * 4;
  const bw = (W - padL) / hours.length;
  const barW = Math.min(14, (bw - 6) / keys.length);
  const y = (v: number) => padT + (H - padT - padB) * (1 - v / top);
  return (
    <div className="chart" onMouseLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Orders by hour today">
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <line x1={padL} x2={W} y1={y(step * i)} y2={y(step * i)} className="chart__grid" />
            <text x={padL - 6} y={y(step * i) + 4} className="chart__tick" textAnchor="end">{step * i}</text>
          </g>
        ))}
        {hours.map((h, i) => {
          const x0 = padL + i * bw + (bw - barW * keys.length - 2 * (keys.length - 1)) / 2;
          return (
            <g key={h} onMouseEnter={() => setHover(i)}>
              <rect x={padL + i * bw} y={padT} width={bw} height={H - padT - padB} fill="transparent" />
              {hover === i && <rect x={padL + i * bw + 2} y={padT} width={bw - 4} height={H - padT - padB} className="chart__hover" />}
              {keys.map((k, j) => {
                const v = data[k][i] ?? 0; const yy = y(v);
                return v > 0 ? <path key={k} d={`M${x0 + j * (barW + 2)} ${H - padB} V ${yy + 4} q 0 -4 4 -4 h ${barW - 8} q 4 0 4 4 V ${H - padB} Z`} fill={SERIES[k].color} opacity={hover === null || hover === i ? 1 : 0.55} style={{ transition: 'opacity .2s' }} aria-hidden="true" /> : null;
              })}
              {(i % 2 === 0 || hours.length < 10) && <text x={padL + i * bw + bw / 2} y={H - 8} className="chart__tick" textAnchor="middle">{h > 12 ? `${h - 12}p` : h === 12 ? '12p' : `${h}a`}</text>}
            </g>
          );
        })}
      </svg>
      {hover !== null && (
        <div className="tip" style={{ left: `${((padL + hover * bw + bw / 2) / W) * 100}%` }}>
          <b>{hours[hover] > 12 ? `${hours[hover] - 12}pm` : hours[hover] === 12 ? '12pm' : `${hours[hover]}am`} local</b>
          {keys.map((k) => <span key={k}><i style={{ background: SERIES[k].color }} />{SERIES[k].label}: {data[k][hover] ?? 0} orders</span>)}
        </div>
      )}
    </div>
  );
}

/* ---------- Line chart: revenue last 7 days (USD) ---------- */
export function WeekLines({ days, keys }: { days: { label: string; dxb: number; nyc: number }[]; keys: BranchId[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const ref = useRef<SVGSVGElement>(null);
  const W = 640; const H = 220; const padL = 46; const padR = 16; const padB = 26; const padT = 14;
  const max = Math.max(...days.flatMap((d) => keys.map((k) => d[k])));
  const step = Math.ceil(max / 4 / 500) * 500; const top = step * 4;
  const x = (i: number) => padL + (i / (days.length - 1)) * (W - padL - padR);
  const y = (v: number) => padT + (H - padT - padB) * (1 - v / top);
  const onMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect(); if (!r) return;
    const px = ((e.clientX - r.left) / r.width) * W;
    setHover(Math.max(0, Math.min(days.length - 1, Math.round(((px - padL) / (W - padL - padR)) * (days.length - 1)))));
  };
  return (
    <div className="chart" onMouseLeave={() => setHover(null)}>
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Revenue over the last 7 days in US dollars" onMouseMove={onMove}>
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <line x1={padL} x2={W - padR} y1={y(step * i)} y2={y(step * i)} className="chart__grid" />
            <text x={padL - 8} y={y(step * i) + 4} className="chart__tick" textAnchor="end">{i === 0 ? '0' : `${(step * i / 1000).toFixed(step * i % 1000 ? 1 : 0)}k`}</text>
          </g>
        ))}
        {days.map((d, i) => <text key={i} x={x(i)} y={H - 8} className="chart__tick" textAnchor="middle">{d.label}</text>)}
        {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={padT} y2={H - padB} className="chart__cross" />}
        {keys.map((k) => {
          const full = days.map((d, i) => `${i ? 'L' : 'M'}${x(i)} ${y(d[k])}`).join(' ');
          const last = days.length - 1;
          return (
            <g key={k}>
              <path d={full} fill="none" stroke={SERIES[k].color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
              {days.map((d, i) => <circle key={i} cx={x(i)} cy={y(d[k])} r={hover === i || i === last ? 5 : 3.5} fill={SERIES[k].color} stroke={SERIES[k].color} strokeWidth="2.5" />)}
              {keys.length > 1 && <text x={x(last) - 8} y={y(days[last][k]) - 10} className="chart__label" textAnchor="end">{k === 'dxb' ? 'Dubai' : 'NYC'}</text>}
            </g>
          );
        })}
      </svg>
      {hover !== null && (
        <div className="tip" style={{ left: `${(x(hover) / W) * 100}%` }}>
          <b>{days[hover].label}</b>
          {keys.map((k) => <span key={k}><i style={{ background: SERIES[k].color }} />{SERIES[k].label}: ${days[hover][k].toLocaleString('en-US')}</span>)}
        </div>
      )}
    </div>
  );
}

/* ---------- Horizontal bar list ---------- */
export function BarList({ rows, unit }: { rows: { label: string; value: number; thumb?: string }[]; unit: string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ol className="barlist">
      {rows.map((r) => (
        <li key={r.label} title={`${r.label}: ${r.value} ${unit}`}>
          {r.thumb && <img src={r.thumb} alt="" width={34} height={34} />}
          <span className="barlist__label">{r.label}</span>
          <span className="barlist__track"><span style={{ width: `${(r.value / max) * 100}%` }} /></span>
          <b>{r.value}</b>
        </li>
      ))}
    </ol>
  );
}

/* ---------- Toasts ---------- */
export interface ToastMsg { id: number; text: string }
export function Toasts({ items }: { items: ToastMsg[] }) {
  return <div className="toasts" role="status" aria-live="polite">{items.map((t) => <div key={t.id} className="toast">{t.text}</div>)}</div>;
}
