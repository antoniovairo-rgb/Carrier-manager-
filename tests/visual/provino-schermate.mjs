#!/usr/bin/env node
/* [G1 — IL METRO SUL PROVINO] Misura le pagine statiche di docs/collaudo-grafico/proposta-schermate/
   con LO STESSO codice di misura della griglia mobile: la funzione MISURA non e' riscritta qui,
   e' LETTA da tests/visual/griglia-mobile.mjs e iniettata nella pagina. Due metri diversi darebbero
   due verita' diverse, e la seconda sarebbe comoda.
   NON MODIFICA IL GIOCO e non apre il gioco: giudica solo il provino, prima di scrivere una riga in src/.
   Uso: node tests/visual/provino-schermate.mjs   [CPM_FOTO=0]
   DICHIARATO: Chromium headless a 412x915, NON l'Android del PO. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
if (!process.env.CPM_CHROME) {
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH;
  try {
    const d = fs.readdirSync(base).filter(x => /^chromium-\d+$/.test(x)).sort().reverse();
    for (const x of d) { const p = path.join(base, x, 'chrome-linux', 'chrome'); if (fs.existsSync(p)) { process.env.CPM_CHROME = p; break; } }
  } catch (_e) {}
}
const { chromium } = await import('playwright');

const QUI = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(QUI, '..', '..');
const CART = path.join(ROOT, 'docs', 'collaudo-grafico', 'proposta-schermate');
const FOTO = process.env.CPM_FOTO !== '0';

/* la misura, presa alla lettera dalla griglia mobile */
const sorgente = fs.readFileSync(path.join(QUI, 'griglia-mobile.mjs'), 'utf8');
const i0 = sorgente.indexOf('function MISURA(W) {');
const i1 = sorgente.indexOf('/* ── attese deterministiche');
if (i0 < 0 || i1 < 0 || i1 < i0) { console.error('MISURA non trovata in griglia-mobile.mjs: il metro non e\' quello dichiarato. Fermo.'); process.exit(2); }
const MISURA_SRC = sorgente.slice(i0, i1);

const PAGINE = [
  { f: 'home.html',      nome: 'Home' },
  { f: 'stagione.html',  nome: 'Stagione · Classifica' },
  { f: 'club.html',      nome: 'Club' },
];

const browser = await chromium.launch({ executablePath: process.env.CPM_CHROME, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const righe = [];
for (const p of PAGINE) {
  await page.goto('file://' + path.join(CART, p.f), { waitUntil: 'load' });
  await page.evaluate(() => document.fonts && document.fonts.ready);
  const m = await page.evaluate(new Function('W', MISURA_SRC + '; return MISURA(W);'), 412);
  if (FOTO) await page.screenshot({ path: path.join(CART, p.f.replace(/\.html$/, '.png')), fullPage: true });
  righe.push({ nome: p.nome, m });
}
await browser.close();

const col = (s, n) => String(s).padEnd(n);
const num = (s, n) => String(s).padStart(n);
console.log('\nPROVINO — 412x915, Chromium headless (NON l\'Android del PO)\n');
console.log(col('SCHERMATA', 24) + num('overflow', 9) + num('fuori', 7) + num('<10px', 7) + num('<11px', 7) + num('minFs', 7) + num('testi', 7) + num('contr<s', 9) + num('grad', 6));
console.log('-'.repeat(83));
let tot = { of: 0, fu: 0, p10: 0, p11: 0, te: 0, co: 0, gr: 0 };
for (const r of righe) {
  const m = r.m;
  tot.of += m.overflowPx; tot.fu += m.nFuori; tot.p10 += m.nPiccoli; tot.p11 += m.nSottoPav;
  tot.te += m.nTesto; tot.co += m.nSotto; tot.gr += m.nGradiente;
  console.log(col(r.nome, 24) + num(m.overflowPx + ' px', 9) + num(m.nFuori, 7) + num(m.nPiccoli, 7) + num(m.nSottoPav, 7) + num(m.minFs, 7) + num(m.nTesto, 7) + num(m.nSotto + '/' + m.nMisurati, 9) + num(m.nGradiente, 6));
}
console.log('-'.repeat(83));
console.log(col('TOTALE', 24) + num(tot.of + ' px', 9) + num(tot.fu, 7) + num(tot.p10, 7) + num(tot.p11, 7) + num('', 7) + num(tot.te, 7) + num(tot.co, 9) + num(tot.gr, 6));

for (const r of righe) {
  if (!r.m.peggiori.length) continue;
  const so = r.m.peggiori.filter(x => x.rap < x.soglia);
  if (!so.length) continue;
  console.log('\n' + r.nome + ' — coppie sotto soglia:');
  so.forEach(x => console.log('  ' + x.rap + ':1 (soglia ' + x.soglia + ') ' + x.testo + ' su ' + x.fondo + '  ' + x.fs + 'px/' + x.fw + '  x' + x.n + '  «' + x.esempio + '»  ' + x.sel));
}
for (const r of righe) {
  if (r.m.nFuori) { console.log('\n' + r.nome + ' — sporgono a destra:'); r.m.fuori.forEach(x => console.log('  +' + x.px + 'px  ' + x.sel + '  «' + x.txt + '»')); }
}
const ok = tot.of === 0 && tot.fu === 0 && tot.p11 === 0 && tot.co === 0;
console.log('\n' + (ok ? 'VERDE' : 'ROSSO') + ' — overflow ' + tot.of + 'px, fuori ' + tot.fu + ', sotto il pavimento 11px ' + tot.p11 + ', contrasto sotto soglia ' + tot.co);
process.exit(ok ? 0 : 1);
