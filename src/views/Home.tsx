import { useEffect, useState } from 'react';
import type { MenuItem } from '../lib/data';
import { SECTIONS } from '../lib/router';
import { Hero } from '../components/home/Hero';
import { AppDemo, Bestsellers, Cities, OurDay, Outro, Rewards, Ribbons } from '../components/home/Sections';
import { ProductSheet } from '../components/ProductSheet';

export default function Home() {
  const [open, setOpen] = useState<MenuItem | null>(null);
  useEffect(() => {
    const jump = () => {
      const s = window.location.hash.replace(/^#/, '');
      if (SECTIONS.includes(s)) setTimeout(() => document.getElementById(s)?.scrollIntoView({ behavior: 'smooth' }), 60);
    };
    jump();
    window.addEventListener('hashchange', jump);
    return () => window.removeEventListener('hashchange', jump);
  }, []);
  return (
    <>
      <Hero />
      <Ribbons />
      <Bestsellers onOpen={setOpen} />
      <AppDemo />
      <OurDay />
      <Cities />
      <Rewards />
      <Outro />
      <ProductSheet item={open} onClose={() => setOpen(null)} />
    </>
  );
}
