// Menu photos. In the Next.js build these live in public/menu/ and come from the admin panel's image upload.
import flatwhite from '../assets/menu/flatwhite.jpg';
import latte from '../assets/menu/latte.jpg';
import mocha from '../assets/menu/mocha.jpg';
import karak from '../assets/menu/karak.jpg';
import spanish from '../assets/menu/spanish.jpg';
import matcha from '../assets/menu/matcha.jpg';
import coldbrew from '../assets/menu/coldbrew.jpg';
import croissant from '../assets/menu/croissant.jpg';
import pistachio from '../assets/menu/pistachio.jpg';
import bagel from '../assets/menu/bagel.jpg';
import toast from '../assets/menu/toast.jpg';
import pancakes from '../assets/menu/pancakes.jpg';
import cupcake from '../assets/menu/cupcake.jpg';
import cake from '../assets/menu/cake.jpg';
import cookie from '../assets/menu/cookie.jpg';
import donut from '../assets/menu/donut.jpg';

export const photos: Record<string, string> = { flatwhite, latte, mocha, karak, spanish, matcha, coldbrew, croissant, pistachio, bagel, toast, pancakes, cupcake, cake, cookie, donut };

/** Admin-uploaded photo first, then the default menu photo. */
export function photoOf(item: { id: string; photo?: string }): string | undefined { return item.photo || photos[item.id]; }
