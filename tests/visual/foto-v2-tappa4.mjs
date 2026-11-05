#!/usr/bin/env node
/* [PO-302 · grafica V2, tappa 4 — UNIFICAZIONE] MISURA + FOTO (strumento, non guardiano).
   Sei schermate (Home, Carriera, Ufficio dal banco V2; Partita 2D, Highlight in scelta, Post partita dal banco della partita)
   in tre formati: 360x780 e 820x1180 (tocco), 1440x900 (mouse). Per ogni schermata misura su TUTTO #root:
   - contrasto WCAG minimo dei testi (lib/misura-v2.mjs: fondi composti, soglia 4,5:1 e 3:1 sui testi grandi) e quanti sotto soglia;
   - scorrimento orizzontale (documento e contenitore .cpm-scroll).
   Foto PNG ridotte (scala 0,5) a 360 e 1440 in docs/sviluppo/foto-v2-tappa4/<PREF>-<schermata>-<formato>.png.
   CPM_FOTO_PREF=prima|dopo · CPM_FORMATI=f360,f820,f1440 · CPM_SCHERMI=home,carriera,ufficio,partita2d,highlight,post
   CPM_TEMA_ROSSO=1: applica il tema di prova a basso contrasto (lib/tema-prova.mjs) per vedere che la misura lo coglie.
   Scrive anche out/foto-v2-tappa4-<PREF>.json. Chromium headless, GLB spento. */
import fs from 'node:fs';
import { startServer, launchBrowser, sleep } from './lib/harness.mjs';
import { apriBancoV2 } from './lib/banco-v2.mjs';
import { apriPartitaV2, forzaHL, finePartita } from './lib/partita-v2.mjs';
import { MISURA } from './lib/misura-v2.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const PREF = process.env.CPM_FOTO_PREF || 'dopo', ROSSO = !!process.env.CPM_TEMA_ROSSO;
const FORMATI = { f360: { k: 'f360', w: 360, h: 780, touch: true, foto: true }, f820: { k: 'f820', w: 820, h: 1180, touch: true }, f1440: { k: 'f1440', w: 1440, h: 900, touch: false, foto: true } };
const SCELTI = (process.env.CPM_FORMATI || 'f360,f820,f1440').split(',').map(k => FORMATI[k]).filter(Boolean);
const SCHERMI = (process.env.CPM_SCHERMI || 'home,carriera,ufficio,partita2d,highlight,post').split(',');
const OUT = new URL('../../docs/sviluppo/foto-v2-tappa4/', import.meta.url).pathname; fs.mkdirSync(OUT, { recursive: true });
const PATR = 'p.patrimonio303=[{s:11,w:28,v:1200000},{s:11,w:32,v:1350000},{s:11,w:36,v:1300000},{s:12,w:4,v:1500000},{s:12,w:8,v:1620000},{s:12,w:12,v:1800000}];p.bankBalance=1800000;';
const srv = await startServer(); const b = await launchBrowser(); const port = srv.address().port;
const R = {}, errs = [], mancanti = [];
async function misura(page, f, sc) {
  const m = await page.evaluate(MISURA, '#root');
  const ox = await page.evaluate(() => { const s = document.querySelector('.cpm-scroll'); return Math.max(s ? s.scrollWidth - s.clientWidth : 0, document.documentElement.scrollWidth - innerWidth); });
  R[sc] = R[sc] || {}; R[sc][f.k] = { testi: m.n, min: m.min, sotto: m.peggiori.length, peggiori: m.peggiori.slice(0, 4), ox };
  console.log(`  ${f.k.padEnd(5)} ${sc.padEnd(9)} testi ${String(m.n).padStart(4)} · contrasto min ${m.min} · sotto soglia ${m.peggiori.length}${m.peggiori.length ? ' (' + m.peggiori.slice(0, 2).join(' | ') + ')' : ''} · scorrimento ${ox}px`);
  if (f.foto) { const p = `${OUT}${PREF}-${sc}-${f.k}.png`; await page.screenshot({ path: p, scale: 'css' }); }
}
const giro = async (fn, f, nome) => { try { await fn(); } catch (e) { mancanti.push(`${f.k} ${nome}: ${String(e.message).slice(0, 90)}`); } };
for (const f of SCELTI) {
  if (SCHERMI.some(s => ['home', 'carriera', 'ufficio'].includes(s))) await giro(async () => {
    const { ctx, page } = await apriBancoV2(b, port, f, { errs, mancanti, prep: PATR, temaRosso: ROSSO }); if (!page) return;
    if (SCHERMI.includes('home')) { await page.evaluate(() => window.__CPM_CAREER.goTab('dashboard')); await sleep(900); await misura(page, f, 'home'); }
    if (SCHERMI.includes('carriera')) { await page.evaluate(() => window.__CPM_CAREER.goTab('profile')); await sleep(1100); await misura(page, f, 'carriera'); }
    if (SCHERMI.includes('ufficio')) { await page.evaluate(() => window.__CPM_CAREER.goTab('ufficio')); await sleep(1100); await misura(page, f, 'ufficio'); }
    await ctx.close(); }, f, 'banco');
  if (SCHERMI.includes('partita2d') || SCHERMI.includes('highlight')) await giro(async () => {
    const { ctx, page } = await apriPartitaV2(b, port, f, { errs, temaRosso: ROSSO });
    if (SCHERMI.includes('partita2d')) { await sleep(1500); await misura(page, f, 'partita2d'); }
    if (SCHERMI.includes('highlight')) { await forzaHL(page, 4); if (await page.evaluate(() => window.__CPM_PHASE()) === 'hl_choose') await misura(page, f, 'highlight'); else mancanti.push(f.k + ' highlight'); }
    await ctx.close(); }, f, 'partita');
  if (SCHERMI.includes('post')) await giro(async () => {
    const { ctx, page } = await apriPartitaV2(b, port, f, { errs, temaRosso: ROSSO });
    if (await finePartita(page)) { await sleep(1800); await misura(page, f, 'post'); } else mancanti.push(f.k + ' post'); await ctx.close(); }, f, 'post');
}
await b.close(); srv.close();
/* PNG piccoli: scala 0,5 (Pillow, se c'e') */
try { const { execFileSync } = await import('node:child_process');
  execFileSync('python3', ['-c', `import sys,glob\nfrom PIL import Image\nfor p in glob.glob(sys.argv[1]+sys.argv[2]+'-*.png'):\n  im=Image.open(p)\n  if im.size[0]>700:\n    im=im.convert('RGB').resize((im.size[0]//2,im.size[1]//2),Image.LANCZOS)\n  im=im.convert('RGB').quantize(colors=128)\n  im.save(p,optimize=True)`, OUT, PREF]);
} catch (e) { console.log('  (riduzione PNG non riuscita: ' + String(e.message).slice(0, 60) + ')'); }
fs.mkdirSync(new URL('./out/', import.meta.url).pathname, { recursive: true });
fs.writeFileSync(new URL(`./out/foto-v2-tappa4-${PREF}.json`, import.meta.url).pathname, JSON.stringify({ pref: PREF, rosso: ROSSO, R, errs, mancanti }, null, 1));
if (errs.length) console.log('errori di pagina: ' + errs.slice(0, 4).join(' | '));
if (mancanti.length) console.log('non raggiunte: ' + mancanti.join(', '));
console.log(`foto-v2-tappa4 ${PREF}: ${Object.keys(R).length} schermate misurate`);
