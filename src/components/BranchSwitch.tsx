import { useStore } from '../lib/store';

/** Dubai / New York switch. Changes prices, currency and pickup branch everywhere. */
export function BranchSwitch({ big = false }: { big?: boolean }) {
  const { branch, setBranch } = useStore();
  return (
    <div className={`bswitch ${big ? 'bswitch--big' : ''}`} role="radiogroup" aria-label="Choose your café">
      <span className="bswitch__thumb" style={{ transform: branch === 'nyc' ? 'translateX(100%)' : 'translateX(0)' }} />
      <button type="button" role="radio" aria-checked={branch === 'dxb'} onClick={() => setBranch('dxb')}>Dubai</button>
      <button type="button" role="radio" aria-checked={branch === 'nyc'} onClick={() => setBranch('nyc')}>New York</button>
    </div>
  );
}
