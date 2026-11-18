// Sample menu and branch data for the Crumb & Crema concept.
// In the full build these come from the Laravel API (GET /api/menu, GET /api/branches).

export type ArtKey =
  | 'latte' | 'iced' | 'flatwhite' | 'karak' | 'matcha' | 'mocha'
  | 'croissant' | 'pistachio' | 'cupcake' | 'cake' | 'cookie' | 'bagel'
  | 'toast' | 'pancakes' | 'beans' | 'donut';

export type CategoryId = 'hot' | 'iced' | 'bakery' | 'brunch' | 'sweet';

export interface Category { id: CategoryId; label: string; art: ArtKey }

export interface MenuItem {
  id: string;
  name: string;
  category: CategoryId;
  description: string;
  art: ArtKey;
  price: { dxb: number; nyc: number };
  tags?: string[];
  onlyAt?: BranchId;
  customisable?: boolean;
  kcal: number;
}

export type BranchId = 'dxb' | 'nyc';

export interface Branch {
  id: BranchId;
  city: string;
  area: string;
  address: string;
  timeZone: string;
  currency: 'AED' | 'USD';
  opens: number; // hour, 24h
  closes: number;
  hoursLabel: string;
  phone: string;
}

export const branches: Record<BranchId, Branch> = {
  dxb: {
    id: 'dxb', city: 'Dubai', area: 'Dubai Marina', address: 'Marina Walk, Dubai Marina, Dubai',
    timeZone: 'Asia/Dubai', currency: 'AED', opens: 7, closes: 23, hoursLabel: 'Daily 7am to 11pm', phone: '+971 4 000 0000',
  },
  nyc: {
    id: 'nyc', city: 'New York', area: 'Williamsburg', address: 'Wythe Ave, Williamsburg, Brooklyn, NY',
    timeZone: 'America/New_York', currency: 'USD', opens: 7, closes: 19, hoursLabel: 'Daily 7am to 7pm', phone: '+1 (718) 000-0000',
  },
};

export const categories: Category[] = [
  { id: 'hot', label: 'Hot coffee', art: 'latte' },
  { id: 'iced', label: 'Iced & cold', art: 'iced' },
  { id: 'bakery', label: 'Bakery', art: 'croissant' },
  { id: 'brunch', label: 'Brunch', art: 'pancakes' },
  { id: 'sweet', label: 'Sweet treats', art: 'cupcake' },
];

export const menu: MenuItem[] = [
  { id: 'latte', name: 'Velvet latte', category: 'hot', art: 'latte', price: { dxb: 24, nyc: 5.75 }, customisable: true, kcal: 190, tags: ['Bestseller'], description: 'Double ristretto and silky steamed milk with a heart on top. Our house blend has notes of cocoa and red berries.' },
  { id: 'flatwhite', name: 'Flat white', category: 'hot', art: 'flatwhite', price: { dxb: 22, nyc: 5.25 }, customisable: true, kcal: 120, description: 'Short, strong and smooth. Two shots with a thin layer of microfoam.' },
  { id: 'mocha', name: 'Crema mocha', category: 'hot', art: 'mocha', price: { dxb: 27, nyc: 6.5 }, customisable: true, kcal: 290, description: 'Espresso swirled with dark chocolate ganache and milk, topped with whipped cream and cocoa.' },
  { id: 'karak', name: 'Karak chai', category: 'hot', art: 'karak', price: { dxb: 12, nyc: 4.5 }, customisable: true, kcal: 160, tags: ['Dubai favourite'], description: 'Black tea slow-boiled with cardamom, saffron and evaporated milk.' },
  { id: 'spanish', name: 'Iced Spanish latte', category: 'iced', art: 'iced', price: { dxb: 26, nyc: 6.5 }, customisable: true, kcal: 230, tags: ['Bestseller'], description: 'Double espresso, condensed milk and cold milk over ice.' },
  { id: 'matcha', name: 'Iced strawberry matcha', category: 'iced', art: 'matcha', price: { dxb: 28, nyc: 7 }, customisable: true, kcal: 210, tags: ['New'], description: 'Ceremonial matcha over strawberry purée and oat milk.' },
  { id: 'coldbrew', name: '18-hour cold brew', category: 'iced', art: 'iced', price: { dxb: 23, nyc: 5.5 }, customisable: true, kcal: 10, description: 'Steeped overnight for 18 hours. Smooth, low acid, a little chocolatey.' },
  { id: 'croissant', name: 'Butter croissant', category: 'bakery', art: 'croissant', price: { dxb: 16, nyc: 4.5 }, kcal: 330, description: 'Laminated over three days with French butter. Baked every morning at 5am.' },
  { id: 'pistachio', name: 'Pistachio cream croissant', category: 'bakery', art: 'pistachio', price: { dxb: 24, nyc: 6.5 }, kcal: 460, tags: ['Bestseller'], description: 'Our butter croissant filled with pistachio cream and topped with crushed nuts.' },
  { id: 'bagel', name: 'Sesame simit', category: 'bakery', art: 'bagel', price: { dxb: 14, nyc: 3.75 }, kcal: 280, tags: ['Fresh daily'], description: 'A twisted bread ring dipped in grape molasses and rolled in toasted sesame. Great with a glass of tea.' },
  { id: 'toast', name: 'Smashed avo toast', category: 'brunch', art: 'toast', price: { dxb: 48, nyc: 15 }, kcal: 520, description: 'Sourdough, smashed avocado, feta, chilli flakes and a soft poached egg.' },
  { id: 'pancakes', name: 'Cloud pancakes', category: 'brunch', art: 'pancakes', price: { dxb: 52, nyc: 16 }, kcal: 640, tags: ['Bestseller'], description: 'Three fluffy soufflé pancakes with whipped butter, berries and maple.' },
  { id: 'cupcake', name: 'Red velvet cupcake', category: 'sweet', art: 'cupcake', price: { dxb: 18, nyc: 4.75 }, kcal: 380, description: 'Soft red velvet sponge with a swirl of cream cheese frosting.' },
  { id: 'cake', name: 'Basque cheesecake', category: 'sweet', art: 'cake', price: { dxb: 32, nyc: 8.5 }, kcal: 450, description: 'Burnt on top, creamy in the middle. One generous slice.' },
  { id: 'cookie', name: 'Stuffed cookie box', category: 'sweet', art: 'cookie', price: { dxb: 65, nyc: 18 }, kcal: 1900, description: 'Six thick, gooey cookies: raspberry white chocolate, hazelnut, pistachio, caramel popcorn and more.' },
  { id: 'donut', name: 'Glazed donut', category: 'sweet', art: 'donut', price: { dxb: 16, nyc: 4.25 }, kcal: 340, tags: ['New'], description: 'Baked donuts in four glazes: raspberry, matcha, pistachio and chocolate crunch. Ask which ones are out today.' },
];

export const sizes = [
  { id: 's', label: 'Small', oz: '8 oz', add: { dxb: 0, nyc: 0 } },
  { id: 'm', label: 'Regular', oz: '12 oz', add: { dxb: 3, nyc: 0.75 } },
  { id: 'l', label: 'Large', oz: '16 oz', add: { dxb: 5, nyc: 1.25 } },
] as const;

export const milks = [
  { id: 'whole', label: 'Whole milk', add: { dxb: 0, nyc: 0 } },
  { id: 'oat', label: 'Oat', add: { dxb: 3, nyc: 0.75 } },
  { id: 'almond', label: 'Almond', add: { dxb: 3, nyc: 0.75 } },
  { id: 'none', label: 'No milk', add: { dxb: 0, nyc: 0 } },
] as const;

export const extras = [
  { id: 'shot', label: 'Extra shot', add: { dxb: 4, nyc: 1 } },
  { id: 'vanilla', label: 'Vanilla syrup', add: { dxb: 3, nyc: 0.75 } },
  { id: 'caramel', label: 'Salted caramel', add: { dxb: 3, nyc: 0.75 } },
] as const;

export const day = [
  { time: '5:00', title: 'The ovens go on', text: 'Croissants and bagels are shaped by hand and baked before the city wakes up.' },
  { time: '7:00', title: 'Doors open', text: 'First espresso of the day. Order ahead and skip the queue on your way to work.' },
  { time: '11:00', title: 'Brunch o’clock', text: 'Cloud pancakes, avo toast and slow mornings. Brunch runs all day, every day.' },
  { time: '16:00', title: 'Golden hour', text: 'Iced coffees, a slice of Basque cheesecake and the best light in the house.' },
];

export function money(value: number, branch: BranchId): string {
  if (branch === 'dxb') return `AED ${Number.isInteger(value) ? value : value.toFixed(2)}`;
  return `$${value.toFixed(2)}`;
}
