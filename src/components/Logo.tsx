import markDark from '../assets/mark-dark.png';
import markLight from '../assets/mark-light.png';

/** The cup-C mark (the brand icon). Light version for dark backgrounds. `animated` makes it sway gently. */
export function Mark({ size = 48, color = '#5E0B1F', animated = false, className }: { size?: number; color?: string; accent?: string; animated?: boolean; className?: string }) {
  const light = /^#(FFF8F0|FBF3EA|FFFFFF|C7F3F7)$/i.test(color);
  return (
    <img className={`mark ${animated ? 'mark--live' : ''} ${className ?? ''}`} src={light ? markLight : markDark} width={size} height={size} alt="" aria-hidden="true" draggable={false} />
  );
}

export function Logo({ light = false, compact = false }: { light?: boolean; compact?: boolean }) {
  const color = light ? '#FFF8F0' : '#5E0B1F';
  return (
    <span className={`logo ${light ? 'logo--light' : ''}`}>
      <Mark size={compact ? 38 : 46} color={color} accent={light ? '#C7F3F7' : '#8FDDE5'} />
      <span className="logo__text">
        <span className="logo__name">Crumb &amp; Crema</span>
        {!compact && <span className="logo__tag">Café · Brunch</span>}
      </span>
    </span>
  );
}
