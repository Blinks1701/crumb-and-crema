import type { ReactElement } from 'react';
import type { ArtKey } from '../lib/data';

// Flat, sticker-style food and drink illustrations in the brand palette.
// Each one sits in a 200 x 200 box with a 4px aubergine outline.
export const C = {
  aub: '#5E0B1F', sky: '#C7F3F7', sky2: '#8FDDE5', cream: '#FFF8F0', coffee: '#8A4B2A', crema: '#D9A066',
  gold: '#E9A944', gold2: '#F6C76B', pink: '#F4A6B8', green: '#8DB36A', choc: '#4A2416', berry: '#C2304A',
};
const o = { stroke: C.aub, strokeWidth: 4, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };

function Cup({ body, top, art }: { body: string; top: string; art: 'heart' | 'leaf' | 'cocoa' }) {
  return (
    <g>
      <ellipse cx="100" cy="158" rx="80" ry="17" fill={C.sky} {...o} />
      <path d="M156 92 Q188 90 186 114 Q184 138 150 134" fill="none" stroke={C.aub} strokeWidth="18" strokeLinecap="round" />
      <path d="M156 92 Q188 90 186 114 Q184 138 150 134" fill="none" stroke={body} strokeWidth="9" strokeLinecap="round" />
      <path d="M38 80 H162 L152 136 Q146 156 120 156 H80 Q54 156 48 136 Z" fill={body} {...o} />
      <path d="M52 96 Q56 128 70 140" fill="none" stroke="#FFFFFF" strokeOpacity="0.6" strokeWidth="6" strokeLinecap="round" />
      <ellipse cx="100" cy="80" rx="62" ry="15" fill={top} {...o} />
      {art === 'heart' && <path d="M100 90 C 84 82, 82 72, 92 70 C 97 69, 100 73, 100 75 C 100 73, 103 69, 108 70 C 118 72, 116 82, 100 90 Z" fill={C.cream} />}
      {art === 'leaf' && <g fill="none" stroke={C.cream} strokeWidth="3.5" strokeLinecap="round"><path d="M76 81 Q100 66 124 81" /><path d="M82 84 Q100 74 118 84" /><path d="M100 70 V 92" /></g>}
      {art === 'cocoa' && <g fill={C.choc}>{[[84, 78], [96, 74], [110, 79], [120, 75], [92, 85], [106, 86], [76, 82], [126, 82]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.6" />)}</g>}
    </g>
  );
}

function IcedCup({ low, high }: { low: string; high: string }) {
  return (
    <g>
      <path d="M118 18 L104 70" stroke={C.aub} strokeWidth="9" strokeLinecap="round" />
      <path d="M50 64 Q100 34 150 64 Z" fill="#FFFFFF" fillOpacity="0.85" {...o} />
      <rect x="44" y="62" width="112" height="12" rx="6" fill={C.sky} {...o} />
      <path d="M52 74 H148 L136 186 Q135 192 128 192 H72 Q65 192 64 186 Z" fill="#FFFFFF" {...o} />
      <path d="M58 120 Q80 110 100 120 T 143 118 L 136 186 Q135 190 128 190 H72 Q65 190 64 186 Z" fill={low} />
      <path d="M55 92 H145 L143 118 Q120 110 100 120 T 58 120 Z" fill={high} />
      <g fill="#FFFFFF" fillOpacity="0.75" stroke={C.aub} strokeWidth="3"><rect x="70" y="88" width="22" height="22" rx="5" transform="rotate(-12 81 99)" /><rect x="104" y="96" width="22" height="22" rx="5" transform="rotate(14 115 107)" /></g>
      <path d="M58 76 L72 184 H64 Q65 190 72 190" fill="none" stroke={C.aub} strokeWidth="4" strokeLinejoin="round" />
      <path d="M128 82 L122 170" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" strokeOpacity="0.8" />
    </g>
  );
}

function Croissant({ cream }: { cream?: boolean }) {
  const lobes = [
    { a: 162, rx: 15, ry: 21, f: C.gold }, { a: 18, rx: 15, ry: 21, f: C.gold },
    { a: 128, rx: 21, ry: 29, f: C.gold2 }, { a: 52, rx: 21, ry: 29, f: C.gold2 },
    { a: 90, rx: 26, ry: 36, f: C.gold },
  ];
  return (
    <g>
      {lobes.map(({ a, rx, ry, f }) => {
        const x = 100 + Math.cos((a * Math.PI) / 180) * 62; const y = 146 - Math.sin((a * Math.PI) / 180) * 62;
        return (
          <g key={a} transform={`rotate(${90 - a} ${x} ${y})`}>
            <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={f} {...o} />
            <path d={`M${x - rx * 0.6} ${y - ry * 0.2} Q${x} ${y + ry * 0.15} ${x + rx * 0.6} ${y - ry * 0.2}`} fill="none" stroke="#C47A22" strokeWidth="3.5" strokeLinecap="round" />
          </g>
        );
      })}
      <path d="M88 62 Q96 56 106 58" fill="none" stroke="#FFFFFF" strokeOpacity="0.75" strokeWidth="5" strokeLinecap="round" />
      {cream && (
        <g>
          <path d="M52 108 Q66 76 100 70 Q134 76 148 108 Q140 114 134 106 Q124 118 114 104 Q100 116 88 104 Q76 118 66 106 Q58 114 52 108 Z" fill={C.green} {...o} />
          <g fill="#5C8A3E">{[[74, 92], [92, 82], [110, 84], [126, 92], [100, 96], [84, 98], [118, 100]].map(([x, y], i) => <rect key={i} x={x} y={y} width="6" height="5" rx="1.5" transform={`rotate(${i * 25} ${x} ${y})`} />)}</g>
        </g>
      )}
    </g>
  );
}

const arts: Record<ArtKey, () => ReactElement> = {
  latte: () => <Cup body={C.sky} top={C.crema} art="heart" />,
  flatwhite: () => <Cup body={C.cream} top={C.crema} art="leaf" />,
  mocha: () => <Cup body={C.pink} top="#A9663E" art="cocoa" />,
  karak: () => (
    <g>
      <ellipse cx="100" cy="164" rx="66" ry="14" fill={C.sky} {...o} />
      <path d="M62 60 H138 L128 152 Q127 160 118 160 H82 Q73 160 72 152 Z" fill="#FFFFFF" fillOpacity="0.9" {...o} />
      <path d="M66 84 H134 L127 150 Q126 156 118 156 H82 Q74 156 73 150 Z" fill="#C9813F" />
      <path d="M66 84 Q100 92 134 84" fill="none" stroke="#E7B079" strokeWidth="5" />
      <path d="M62 60 H138 L128 152 Q127 160 118 160 H82 Q73 160 72 152 Z" fill="none" {...o} />
      <path d="M76 70 L84 146" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" strokeOpacity="0.8" />
      <g fill={C.gold}><circle cx="150" cy="70" r="5" /><circle cx="160" cy="84" r="4" /></g>
    </g>
  ),
  iced: () => <IcedCup low={C.cream} high={C.coffee} />,
  matcha: () => <IcedCup low={C.pink} high={C.green} />,
  croissant: () => <Croissant />,
  pistachio: () => <Croissant cream />,
  cupcake: () => (
    <g>
      <path d="M56 112 H144 L132 180 Q131 186 124 186 H76 Q69 186 68 180 Z" fill={C.pink} {...o} />
      <g stroke={C.aub} strokeWidth="3.5"><path d="M78 114 L84 184" /><path d="M100 114 V 184" /><path d="M122 114 L116 184" /></g>
      <path d="M50 116 Q48 92 70 88 Q72 66 100 66 Q128 66 130 88 Q152 92 150 116 Z" fill={C.berry} {...o} />
      <path d="M60 96 Q56 76 80 76 Q82 50 100 50 Q120 50 122 76 Q146 76 140 96 Q122 108 100 102 Q78 108 60 96 Z" fill={C.cream} {...o} />
      <path d="M82 68 Q100 56 118 68" fill="none" stroke={C.aub} strokeWidth="3" strokeLinecap="round" opacity="0.4" />
      <circle cx="100" cy="40" r="11" fill={C.berry} {...o} />
      <g fill={C.sky2}><rect x="76" y="84" width="8" height="3.5" rx="1.7" transform="rotate(30 80 86)" /><rect x="112" y="80" width="8" height="3.5" rx="1.7" transform="rotate(-25 116 82)" /></g>
      <g fill={C.gold}><rect x="96" y="90" width="8" height="3.5" rx="1.7" transform="rotate(-10 100 92)" /><rect x="124" y="92" width="8" height="3.5" rx="1.7" transform="rotate(40 128 94)" /></g>
    </g>
  ),
  cake: () => (
    <g>
      <path d="M28 120 L150 66 L172 112 L172 154 L28 166 Z" fill="#F3D9A4" {...o} />
      <path d="M28 120 L150 66 L172 112 Z" fill="#7A3E1C" {...o} />
      <path d="M28 120 L172 112" stroke={C.aub} strokeWidth="4" />
      <path d="M150 66 Q166 60 172 112" fill="#5A2A12" {...o} />
      <path d="M40 132 L160 124" stroke="#FFFFFF" strokeOpacity="0.6" strokeWidth="5" strokeLinecap="round" />
      <g fill={C.berry} {...o}><circle cx="96" cy="92" r="9" /><circle cx="114" cy="84" r="8" /></g>
    </g>
  ),
  cookie: () => (
    <g>
      <path d="M100 30 Q130 28 150 48 Q172 70 168 100 Q166 132 142 152 Q116 172 86 166 Q54 160 38 132 Q24 104 36 76 Q50 40 100 30 Z" fill={C.gold} {...o} />
      <path d="M58 70 Q66 56 82 52" fill="none" stroke="#FFFFFF" strokeOpacity="0.6" strokeWidth="6" strokeLinecap="round" />
      <g fill={C.choc} stroke={C.aub} strokeWidth="2.5" strokeLinejoin="round">
        <path d="M70 84 l14 -4 l4 12 l-12 6 Z" /><path d="M112 70 l14 2 l-2 14 l-13 -2 Z" /><path d="M120 116 l14 4 l-4 14 l-14 -6 Z" /><path d="M76 124 l12 -2 l4 12 l-14 2 Z" /><path d="M100 98 l10 2 l-2 10 l-10 -2 Z" />
      </g>
    </g>
  ),
  bagel: () => (
    <g>
      <circle cx="100" cy="104" r="70" fill="#D18A3C" {...o} />
      <path d="M44 92 Q60 46 110 40" fill="none" stroke="#F0B56A" strokeWidth="10" strokeLinecap="round" />
      <circle cx="100" cy="104" r="20" fill="#FFFFFF" {...o} />
      <g fill={C.cream}>{Array.from({ length: 22 }).map((_, i) => { const a = (i / 22) * Math.PI * 2; const r = 42 + (i % 3) * 8; return <ellipse key={i} cx={100 + Math.cos(a) * r} cy={104 + Math.sin(a) * r} rx="3" ry="1.8" transform={`rotate(${i * 37} ${100 + Math.cos(a) * r} ${104 + Math.sin(a) * r})`} />; })}</g>
      <g fill={C.choc}>{Array.from({ length: 14 }).map((_, i) => { const a = (i / 14) * Math.PI * 2 + 0.2; const r = 48 + (i % 2) * 10; return <circle key={i} cx={100 + Math.cos(a) * r} cy={104 + Math.sin(a) * r} r="1.8" />; })}</g>
    </g>
  ),
  toast: () => (
    <g>
      <path d="M42 80 Q30 40 70 36 Q100 26 130 36 Q170 40 158 80 L156 166 Q156 174 148 174 H52 Q44 174 44 166 Z" fill="#D9963F" {...o} />
      <path d="M54 82 Q46 52 76 48 Q100 40 124 48 Q154 52 146 82 L144 160 H56 Z" fill="#F3D39A" />
      <path d="M58 96 Q74 76 100 84 Q126 74 142 96 Q148 120 136 138 Q118 152 100 144 Q80 152 64 138 Q52 120 58 96 Z" fill={C.green} {...o} />
      <g fill="#5C8A3E">{[[74, 104], [118, 100], [84, 130], [126, 126], [104, 96]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3" />)}</g>
      <ellipse cx="100" cy="116" rx="26" ry="20" fill="#FFFFFF" {...o} />
      <circle cx="104" cy="114" r="11" fill={C.gold} stroke={C.aub} strokeWidth="3" />
      <g fill={C.berry}><circle cx="70" cy="116" r="2.5" /><circle cx="132" cy="112" r="2.5" /><circle cx="90" cy="138" r="2.5" /></g>
    </g>
  ),
  pancakes: () => (
    <g>
      <ellipse cx="100" cy="172" rx="82" ry="14" fill={C.sky} {...o} />
      {[150, 124, 98].map((y, i) => (
        <g key={y}>
          <path d={`M30 ${y - 14} Q30 ${y + 14} 100 ${y + 14} Q170 ${y + 14} 170 ${y - 14} Z`} fill="#D38B3A" {...o} />
          <ellipse cx="100" cy={y - 14} rx="70" ry="14" fill={i === 2 ? C.gold2 : '#E7A955'} {...o} />
        </g>
      ))}
      <path d="M60 86 Q60 104 66 112 Q70 118 74 108 Q76 98 84 100 Q90 120 98 106 Q102 96 112 98 Q118 112 126 104 Q130 96 140 86 Z" fill="#B8641F" opacity="0.9" />
      <rect x="86" y="70" width="28" height="18" rx="4" fill="#FFF0B8" {...o} />
      <g {...o}><circle cx="58" cy="78" r="8" fill={C.berry} /><circle cx="142" cy="80" r="8" fill="#3F3A8C" /><circle cx="128" cy="70" r="7" fill={C.berry} /></g>
    </g>
  ),
  beans: () => (
    <g>
      {[[72, 96, -30], [130, 110, 25]].map(([x, y, r], i) => (
        <g key={i} transform={`rotate(${r} ${x} ${y})`}>
          <ellipse cx={x} cy={y} rx="34" ry="46" fill={C.coffee} {...o} />
          <path d={`M${x} ${y - 40} Q${x - 14} ${y} ${x} ${y + 40}`} fill="none" stroke={C.aub} strokeWidth="5" strokeLinecap="round" />
          <path d={`M${x - 18} ${y - 26} Q${x - 24} ${y - 10} ${x - 22} ${y + 6}`} fill="none" stroke="#FFFFFF" strokeOpacity="0.5" strokeWidth="5" strokeLinecap="round" />
        </g>
      ))}
    </g>
  ),
  donut: () => (
    <g>
      <circle cx="100" cy="104" r="70" fill="#E7A955" {...o} />
      <path d="M38 96 Q40 44 100 38 Q160 44 162 96 Q166 116 152 120 Q146 136 132 128 Q120 146 108 132 Q96 150 84 134 Q70 146 62 130 Q44 134 42 118 Q34 110 38 96 Z" fill={C.pink} {...o} />
      <circle cx="100" cy="96" r="20" fill="#FFFFFF" {...o} />
      <g>{[[66, 70, C.sky2], [134, 70, C.cream], [70, 112, C.gold], [130, 116, C.sky2], [100, 56, C.gold], [56, 92, C.cream], [146, 96, C.gold], [86, 126, C.cream], [118, 58, C.sky2]].map(([x, y, c], i) => <rect key={i} x={Number(x) - 5} y={Number(y) - 2} width="10" height="4" rx="2" fill={String(c)} transform={`rotate(${i * 41} ${x} ${y})`} />)}</g>
      <path d="M60 70 Q70 52 92 48" fill="none" stroke="#FFFFFF" strokeOpacity="0.6" strokeWidth="6" strokeLinecap="round" />
    </g>
  ),
};

export function Art({ k, size = 160, className, title }: { k: ArtKey; size?: number; className?: string; title?: string }) {
  const Comp = arts[k];
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 200 200" role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <Comp />
    </svg>
  );
}
