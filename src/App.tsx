import { useEffect, type ComponentType } from 'react';
import { StoreProvider } from './lib/store';
import { SECTIONS, useRoute } from './lib/router';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import Home from './views/Home';
import Menu from './views/Menu';
import Checkout from './views/Checkout';
import Order from './views/Order';
import AdminApp from './admin/AdminApp';

const views: Record<string, ComponentType> = { '/': Home, '/menu': Menu, '/checkout': Checkout, '/order': Order };
const titles: Record<string, string> = {
  '/': 'Crumb & Crema · Good Food, Great Mood', '/menu': 'Menu · Crumb & Crema', '/checkout': 'Checkout · Crumb & Crema', '/order': 'Your order · Crumb & Crema',
};

function Shell() {
  const route = useRoute();
  const View = views[route] ?? Home;
  useEffect(() => {
    document.title = route.startsWith('/admin') ? 'Admin · Crumb & Crema' : titles[route] ?? titles['/'];
    if (!SECTIONS.includes(window.location.hash.slice(1))) window.scrollTo(0, 0);
  }, [route]);
  if (route.startsWith('/admin')) return <AdminApp route={route} />;
  return (
    <>
      <a href="#main" className="skip" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus(); }}>Skip to content</a>
      <div className="ribbon-top">Concept project · sample menu and prices</div>
      <Header route={route} />
      <main id="main" tabIndex={-1} key={route} className="page-enter"><View /></main>
      <Footer />
      <CartDrawer />
    </>
  );
}

export default function App() {
  return <StoreProvider><Shell /></StoreProvider>;
}
