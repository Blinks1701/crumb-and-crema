import { useEffect, useState, type AnchorHTMLAttributes } from 'react';

// Tiny hash router for the preview: #menu, #checkout, #order, and #day / #cities / #rewards
// for sections of the home page. In the Next.js project each route is app/<route>/page.tsx
// and Link comes from next/link.
const ROUTES = ['menu', 'checkout', 'order', 'admin', 'admin-orders', 'admin-menu', 'admin-cafes', 'admin-club'];
export const SECTIONS = ['best', 'day', 'cities', 'rewards'];

function current(): string {
  const name = window.location.hash.replace(/^#/, '');
  return ROUTES.includes(name) ? `/${name}` : '/';
}

export function toHash(path: string): string {
  if (path.startsWith('/?s=')) return `#${path.slice(4)}`;
  if (path === '/') return '#home';
  return `#${path.replace(/^\//, '')}`;
}

export function useRoute(): string {
  const [route, setRoute] = useState('/');
  useEffect(() => {
    const read = () => setRoute(current());
    read();
    window.addEventListener('hashchange', read);
    return () => window.removeEventListener('hashchange', read);
  }, []);
  return route;
}

export function go(path: string) { window.location.hash = toHash(path); }

export function Link({ to, ...rest }: { to: string } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a href={toHash(to)} {...rest} />;
}
