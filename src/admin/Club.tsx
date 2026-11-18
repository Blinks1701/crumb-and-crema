import { useState } from 'react';
import { branches } from '../lib/data';
import { PageHead, useAdmin } from './AdminApp';
import { CafeTag, Kpi } from './ui';
import { members as seed, type Member } from './seed';

export default function Club() {
  const { scope, toast } = useAdmin();
  const [list, setList] = useState<Member[]>(seed);
  const [q, setQ] = useState('');
  const shown = list.filter((m) => scope.includes(m.home) && `${m.name} ${m.email}`.toLowerCase().includes(q.trim().toLowerCase()));
  const nearReward = shown.filter((m) => m.stamps >= 8).length;

  const stamp = (id: string) => setList((ls) => ls.map((m) => {
    if (m.id !== id) return m;
    const s = m.stamps + 1;
    if (s >= 10) { toast(`${m.name} earned a free drink! Card reset to 0.`); return { ...m, stamps: 0, visits: m.visits + 1, lastVisit: 'Today' }; }
    toast(`Stamp added for ${m.name} (${s}/10)`);
    return { ...m, stamps: s, visits: m.visits + 1, lastVisit: 'Today' };
  }));

  return (
    <>
      <PageHead title="Crumb Club" sub="Loyalty members. One stamp per drink, the 10th drink is free, and cards work in both cities." />
      <div className="kpis kpis--3">
        <Kpi label="Members shown" value={String(shown.length)} sub="sample members" />
        <Kpi label="One or two stamps from a free drink" value={String(nearReward)} sub="good people to send a nudge" />
        <Kpi label="Average visits" value={String(Math.round(shown.reduce((s, m) => s + m.visits, 0) / Math.max(1, shown.length)))} />
      </div>
      <div className="atools">
        <label className="asearch"><span className="sr-only">Search members</span><input id="club-q" type="search" placeholder="Search by name or email" value={q} onChange={(e) => setQ(e.target.value)} /></label>
      </div>
      <div className="atable-wrap">
        <table className="atable">
          <thead><tr><th>Member</th><th>Home café</th><th>Stamp card</th><th className="num">Visits</th><th>Last visit</th><th><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>
            {shown.map((m) => (
              <tr key={m.id}>
                <td><span className="aitem"><span className="avatar" aria-hidden="true">{m.name.split(' ').map((p) => p[0]).join('').slice(0, 2)}</span><span><b>{m.name}</b><small>{m.email} · since {m.since}</small></span></span></td>
                <td><CafeTag b={m.home} /> <span className="sr-only">{branches[m.home].area}</span></td>
                <td><span className="stamps" role="img" aria-label={`${m.stamps} of 10 stamps`}>{Array.from({ length: 10 }).map((_, i) => <i key={i} className={i < m.stamps ? 'on' : i === 9 ? 'free' : ''} />)}</span> <small className="stamps__n">{m.stamps}/10</small></td>
                <td className="num">{m.visits}</td>
                <td>{m.lastVisit}</td>
                <td><button type="button" className="abtn abtn--ghost abtn--sm" onClick={() => stamp(m.id)}>Add stamp</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
