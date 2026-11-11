#!/usr/bin/env node
/* [giro 156 · PO-361 «ultime notizie, graficamente tagliato...uniforma»] GUARDIANO: le card della Home a riga piena hanno
   tutte la stessa larghezza (±2 px). Causa misurata: «Ultime notizie» è l'unico figlio di .cpm-dash-grid (src/18 ~9127), che da
   900 px in su è una griglia a due colonne (src/19 ~1002) → la card prende mezza riga. Misura a 1428x867, 1920x1080, 1280x800 e
   390x844 (telefono) dal salvataggio del PO (fixtures/save-c177-s5w20), Home (tab dashboard): per ogni card di primo livello
   (Card con `momento`, cappello button[aria-expanded], non annidata) titolo, sinistra, larghezza; la «riga piena» è la larghezza più frequente.
   Giudica: «Ultime notizie» presente e larga come la riga piena (±2 px) e allineata a sinistra (±2 px) a ogni risoluzione;
   nessuna altra card di primo livello più stretta della riga piena di oltre 2 px. Rosso: __CPM_NO_G156 (deve tornare rosso).
   Uso: node home-larghezza-156.mjs  (CPM_ROSSO=1 braccio rosso · CPM_FOTO=<prefisso> salva gli screenshot in docs/collaudo) */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const ROSSO = process.env.CPM_ROSSO === '1';
const FOTO = process.env.CPM_FOTO || '';
const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'docs', 'collaudo');
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-c177-s5w20.json', import.meta.url)));
const RIS = [[1428, 867], [1920, 1080], [1280, 800], [390, 844]];
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const difetti = []; let errori = 0;
for (const [w, h] of RIS) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const page = await ctx.newPage(); await installCdnRoutes(page);
  page.on('pageerror', () => { errori++; });
  await page.addInitScript(([S, r]) => { window.__CPM_GLB = false; if (r) window.__CPM_NO_G156 = 1; for (const k of Object.keys(S)) { try { localStorage.setItem(k, S[k]); } catch (e) {} } try { localStorage.removeItem('cpm-match-resume'); } catch (e) {} }, [save, ROSSO]);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(900);
  await page.evaluate(() => { const C = window.__CPM_CAREER; C.dismiss(); C.goTab('dashboard'); });
  await sleep(1500);
  await page.evaluate(() => window.__CPM_CAREER.dismiss()); await sleep(400);
  const carte = await page.evaluate(() => {
    /* una card della Home = il riquadro (Card con `momento`, src/11 ~53) che contiene il suo cappello button[aria-expanded] come primo figlio */
    const cand = [...document.querySelectorAll('button[aria-expanded]')].map(b => b.parentElement).filter(el => el && el.firstElementChild && el.firstElementChild.matches('button[aria-expanded]'));
    const tutte = cand.filter(el => !cand.some(o => o !== el && o.contains(el)));
    return tutte.map(el => { const r = el.getBoundingClientRect(); const b = el.querySelector('button');
      const t = ((b && b.innerText) || el.innerText || '').split('\n').map(s => s.trim()).filter(Boolean)[0] || '?';
      return { t: t.slice(0, 40), x: Math.round(r.left), w: Math.round(r.width), vis: r.width > 0 && r.height > 0, griglia: !!el.closest('.cpm-dash-grid') }; }).filter(c => c.vis);
  });
  if (!carte.length) { difetti.push(`${w}x${h}: nessuna card trovata sulla Home (misura cieca)`); await ctx.close(); continue; }
  const freq = {}; carte.forEach(c => { freq[c.w] = (freq[c.w] || 0) + 1; });
  const piena = +Object.entries(freq).sort((a, b) => b[1] - a[1] || b[0] - a[0])[0][0];
  const xPiena = (carte.find(c => c.w === piena) || {}).x;
  const news = carte.find(c => /ultime notizie/i.test(c.t));
  console.log(`\n${w}x${h} · ${carte.length} card di primo livello · riga piena ${piena}px (x=${xPiena})`);
  carte.forEach(c => console.log(`   ${Math.abs(c.w - piena) <= 2 && Math.abs(c.x - xPiena) <= 2 ? '  ' : '≠ '}${c.t.padEnd(40)} x=${String(c.x).padStart(4)} larghezza=${String(c.w).padStart(4)}${c.griglia ? '  (dentro .cpm-dash-grid)' : ''}`));
  if (!news) difetti.push(`${w}x${h}: card «Ultime notizie» non trovata`);
  else {
    if (Math.abs(news.w - piena) > 2) difetti.push(`${w}x${h}: «Ultime notizie» larga ${news.w}px contro ${piena}px della riga piena`);
    if (Math.abs(news.x - xPiena) > 2) difetti.push(`${w}x${h}: «Ultime notizie» a x=${news.x} contro x=${xPiena}`);
  }
  carte.filter(c => c !== news && c.w < piena - 2).forEach(c => difetti.push(`${w}x${h}: «${c.t}» larga ${c.w}px contro ${piena}px`));
  if (FOTO) {
    fs.mkdirSync(DIR, { recursive: true });
    await page.evaluate(() => { const el = [...document.querySelectorAll('button[aria-expanded]')].find(e => /ultime notizie/i.test(e.innerText || '')); if (el) el.scrollIntoView({ block: 'center' }); });
    await sleep(600);
    const f = path.join(DIR, `${FOTO}-${w}x${h}.png`); await page.screenshot({ path: f }); console.log('   foto: ' + path.relative(process.cwd(), f));
  }
  await ctx.close();
}
await browser.close(); srv.close();
if (errori) difetti.push(`${errori} errori di pagina`);
const verde = difetti.length === 0;
console.log('');
difetti.forEach(d => console.log('  · ' + d));
if (ROSSO) {
  const ok = difetti.some(d => /Ultime notizie/.test(d));
  console.log(ok ? '✅ home-larghezza-156 ROSSO come atteso: con __CPM_NO_G156 «Ultime notizie» torna a mezza riga' : '❌ home-larghezza-156: il rosso non riproduce il difetto');
  process.exit(ok ? 0 : 1);
}
console.log(verde ? '✅ home-larghezza-156 verde: card a riga piena tutte larghe uguali (±2 px) alle 4 risoluzioni' : '❌ home-larghezza-156');
process.exit(verde ? 0 : 1);
