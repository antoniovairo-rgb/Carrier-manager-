#!/usr/bin/env node
/* [giro 168 · PO-363] GUARDIANO DELLA RIGA TUA IN CLASSIFICA: «la riga tua e' nel colore del club».
   grafica-v2 giudicava per esclusione («il fondo non e' uno dei due neutri del tema»): il velo scuro rgba(15,23,42,.28) passava
   senza essere il club, e dal giro 110 (velo = rgba(13,15,20), il fondo pagina) e' diventato rosso. Qui il criterio e' POSITIVO:
   CLR  il fondo calcolato di [data-cpm="riga-mia-v2"] ha ESATTAMENTE i canali del colore del club smorzato verso la notte
        (fondoClub106(club.c), la stessa regola della fascia della prossima partita) e alfa 0,28 (+-0,01), e NON e' uno dei neutri
        del tema (13,15,20 · 26,30,39 · 15,23,42) quando il colore del club non lo e'. Provato su cinque colori di club: quello del banco (#6c1f2e) e quattro scelti per i casi difficili
        (bianco #f5f5f5, giallo #f59e0b, rosso vivo #dc2626, blu #1d4ed8);
   CON  ogni testo della riga ha contrasto WCAG >= 4,5:1 sul fondo composto (>= 3:1 da 24 px o 18,66 px grassetto);
   VIS  la riga esiste, e' visibile e larga quanto la tabella.
   Formati: telefono 375x812, tablet 820x1180, PC 1440x900. Foto della scheda Stagione in docs/sviluppo/giro168/
   (CPM_FOTO=prima con il rosso, CPM_FOTO=dopo col verde; senza CPM_FOTO nessuna foto).
   ROSSO: CPM_PROVA_ROSSO=1 arma window.__CPM_NO_G168 (la chiamata di prima, inkVelo945) e pretende che CLR cada in OGNI formato
   e per OGNI colore. «Non giudicato» (riga mancante, pagina non raggiunta) = rosso. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import { SAVE, INIT } from './lib/banco-g0.mjs';
import { mkdirSync } from 'node:fs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const ROSSO = !!process.env.CPM_PROVA_ROSSO, FOTO = process.env.CPM_FOTO || '';
const FORMATI = [{ k: 'tel375', w: 375, h: 812, touch: true }, { k: 'tab820', w: 820, h: 1180, touch: true }, { k: 'pc1440', w: 1440, h: 900, touch: false }];
const COLORI = (process.env.CPM_COLORI || '#6c1f2e,#f5f5f5,#f59e0b,#dc2626,#1d4ed8').split(',');
const DIR = new URL('../../docs/sviluppo/giro168/', import.meta.url).pathname; if (FOTO) mkdirSync(DIR, { recursive: true });

function RIGA() {
  const P = s => { const m = String(s).match(/rgba?\(([^)]+)\)/); if (!m) return null; const v = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return [v[0], v[1], v[2], v.length > 3 ? v[3] : 1]; };
  const lum = c => { const f = x => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
  const sopra = (a, b) => [0, 1, 2].map(i => a[i] * a[3] + b[i] * (1 - a[3]));
  const fondo = e => { const st = []; for (let x = e; x; x = x.parentElement) { const c = P(getComputedStyle(x).backgroundColor); if (c && c[3] > 0) { st.push(c); if (c[3] >= 1) break; } }
    let b = [13, 15, 20]; for (let i = st.length - 1; i >= 0; i--) b = st[i][3] >= 1 ? st[i].slice(0, 3) : sopra(st[i], b); return b; };
  const r = document.querySelector('[data-cpm="riga-mia-v2"]'); if (!r) return null;
  r.scrollIntoView({ block: 'center' });
  const rc = r.getBoundingClientRect(), tb = r.closest('table').getBoundingClientRect();
  const testi = []; const w = document.createTreeWalker(r, NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) { const t = n.textContent.trim(); if (!t) continue; const e = n.parentElement, cs = getComputedStyle(e);
    const fg = P(cs.color), bg = fondo(e), col = fg[3] < 1 ? sopra(fg, bg) : fg.slice(0, 3); const a = lum(col), b = lum(bg);
    const fs = parseFloat(cs.fontSize), gr = +cs.fontWeight >= 700, soglia = (fs >= 24 || (gr && fs >= 18.66)) ? 3 : 4.5;
    testi.push({ t, rap: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05), soglia }); }
  return { bg: P(getComputedStyle(r).backgroundColor), w: rc.width, h: rc.height, tw: tb.width, testi };
}
const hex = h => { h = h.slice(1); return [0, 2, 4].map(i => parseInt(h.substr(i, 2), 16)); };

const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const errs = [], fail = { CLR: [], CON: [], VIS: [] }, visti = { CLR: 0, CON: 0, VIS: 0 }; let conMin = 99;
const KO = (k, m) => fail[k].push(m);
for (const f of FORMATI) for (const colore of COLORI) {
  const opt = { viewport: { width: f.w, height: f.h }, deviceScaleFactor: FOTO ? 2 : 1 }; if (f.touch) { opt.isMobile = true; opt.hasTouch = true; }
  const ctx = await b.newContext(opt); const page = await ctx.newPage(); await installCdnRoutes(page);
  page.on('pageerror', e => errs.push(`${f.k} · ${String(e.message).slice(0, 120)}`));
  const save = JSON.parse(JSON.stringify(SAVE)); save.player.club.c = colore;
  await page.addInitScript(INIT, { seme: 4242, tema: 'chiaro', rossi: ROSSO ? ['__CPM_NO_G168'] : [], save });
  await page.addInitScript(() => { const s = document.createElement('style'); s.textContent = '*,*::before,*::after{transition:none!important;animation:none!important}'; document.addEventListener('DOMContentLoaded', () => document.head.appendChild(s)); });
  const id = `${f.k} ${colore}`;
  try {
    await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
    await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 }); await sleep(800);
    /* il gioco ripara player.club dal database CLUBS al caricamento (src/17, migrazione 7.0.2): il colore si cambia LI', prima di Continua */
    await page.evaluate(c => { CLUBS.filter(x => x.id === 'sal').forEach(x => { x.c = c; }); }, colore);
    try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 40000 });
    await sleep(900); try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {} await sleep(300);
    await page.evaluate(() => window.__CPM_CAREER.goTab('standings')); await sleep(1000);
    const m = await page.evaluate(RIGA); visti.VIS++;
    if (!m) { KO('VIS', id + ': manca la riga tua (non giudicato)'); await ctx.close(); continue; }
    if (m.h < 20 || m.w < 0.95 * m.tw) KO('VIS', `${id}: riga ${Math.round(m.w)}x${Math.round(m.h)} su tabella larga ${Math.round(m.tw)}`);
    visti.CLR++; const atteso = hex(await page.evaluate(c => fondoClub106(c), colore)), neutro = m.bg && ['13,15,20', '26,30,39', '15,23,42'].includes(m.bg.slice(0, 3).join(','));
    const ok = m.bg && !neutro && atteso.every((v, i) => v === m.bg[i]) && Math.abs(m.bg[3] - 0.28) <= 0.01;
    if (!ok) KO('CLR', `${id}: fondo rgba(${m.bg && m.bg.join(',')}) atteso rgba(${atteso.join(',')},0.28)`);
    if (m.testi.length) { visti.CON++; for (const t of m.testi) { conMin = Math.min(conMin, t.rap); if (t.rap < t.soglia) KO('CON', `${id}: «${t.t.slice(0, 20)}» ${t.rap.toFixed(2)}:1 < ${t.soglia}`); } }
    console.log(`  ${id.padEnd(16)} fondo rgba(${m.bg.join(',')}) · ${m.testi.length} testi, contrasto min ${Math.min(...m.testi.map(t => t.rap)).toFixed(2)}`);
    if (FOTO && colore === COLORI[0]) await page.screenshot({ path: `${DIR}${FOTO}-${f.k}.png` });
  } catch (e) { KO('VIS', `${id}: non raggiunta (${String(e.message).slice(0, 80)})`); }
  await ctx.close();
}
for (const [k, v] of Object.entries(fail)) v.forEach(x => console.log(`  ✗ ${k} ${x}`));
if (errs.length) console.log('errori di pagina: ' + errs.slice(0, 4).join(' | '));
const casi = FORMATI.length * COLORI.length; let esito;
if (ROSSO) { esito = fail.CLR.length === casi && !fail.VIS.length && !errs.length;
  console.log(esito ? `ROSSO ATTESO OK: con __CPM_NO_G168 la riga tua perde il colore del club in ${casi}/${casi} casi` : `ROSSO NON RIUSCITO: CLR cade in ${fail.CLR.length}/${casi}, VIS ${fail.VIS.length}`); }
else { const ciechi = Object.entries(visti).filter(([, n]) => n === 0).map(([k]) => k);
  esito = Object.values(fail).every(v => !v.length) && !ciechi.length && !errs.length && visti.CLR === casi;
  console.log(esito ? `grafica-168 VERDE: ${casi} casi (3 formati x ${COLORI.length} colori) · contrasto minimo nella riga ${conMin.toFixed(2)}:1` : `grafica-168 ROSSO${ciechi.length ? ' (ciechi: ' + ciechi.join(', ') + ')' : ''}`); }
await b.close(); srv.close(); process.exit(esito ? 0 : 1);
