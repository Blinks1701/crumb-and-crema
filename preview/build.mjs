// Builds the static preview: one bundle with hash routes (/#/menu, /#/checkout, /#/order).
// In the Next.js project each view becomes app/<route>/page.tsx. Run: node preview/build.mjs
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const out = path.join(root, 'dist');
const globalModules = execSync('npm root -g').toString().trim();
let build;
try { ({ build } = await import('esbuild')); } catch { ({ build } = await import('/opt/npm-tools/node_modules/esbuild/lib/main.js')); }

fs.mkdirSync(out, { recursive: true });
await build({
  entryPoints: [path.join(root, 'src/main.tsx')], outdir: out, entryNames: 'app', bundle: true, minify: true,
  jsx: 'automatic', format: 'iife', target: 'es2020', nodePaths: [path.join(root, 'node_modules'), globalModules],
  define: { 'process.env.NODE_ENV': '"production"' }, logLevel: 'warning', loader: { '.png': 'dataurl', '.jpg': 'dataurl' },
});
fs.writeFileSync(path.join(out, 'index.html'), `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Crumb & Crema · Good Food, Great Mood</title>
<meta name="description" content="Specialty coffee, fresh bakes and all-day brunch in Dubai Marina and Williamsburg, Brooklyn. Order ahead and skip the queue.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT,WONK@9..144,500..700,0..100,0..1&family=Dancing+Script:wght@600;700&family=DM+Sans:wght@400;500;700;800&display=swap">
<link rel="stylesheet" href="app.css">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Ccircle cx='100' cy='100' r='100' fill='%23C7F3F7'/%3E%3Cpath d='M70 120a40 40 0 1 0 50-38' fill='none' stroke='%235E0B1F' stroke-width='22' stroke-linecap='round'/%3E%3C/svg%3E">
</head>
<body>
<div id="root"></div>
<script src="app.js"></script>
</body>
</html>
`);
console.log('built', fs.readdirSync(out));

// Single-file page for the hosted preview: styles and script inlined.
const css = fs.readFileSync(path.join(out, 'app.css'), 'utf8');
const js = fs.readFileSync(path.join(out, 'app.js'), 'utf8').replace(/<\/script/gi, '<\\/script');
fs.writeFileSync(path.join(out, 'crumb-and-crema.html'), `<title>Crumb & Crema</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="description" content="Specialty coffee, fresh bakes and all-day brunch in Dubai Marina and Williamsburg, Brooklyn.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT,WONK@9..144,500..700,0..100,0..1&family=Dancing+Script:wght@600;700&family=DM+Sans:wght@400;500;700;800&display=swap">
<style>${css}</style>
<div id="root"></div>
<script>${js}</script>
`);
console.log('artifact page', Math.round(fs.statSync(path.join(out, 'crumb-and-crema.html')).size / 1024), 'KB');
