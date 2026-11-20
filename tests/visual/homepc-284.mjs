#!/usr/bin/env node
/* [giro 284 · PO-542 + PO-543] GUARDIANO «HOME DA PC» E «TENDINE LEGGIBILI» — non-gate, solo grafica.
 * PO-542 (foto PO 1883x971, «da PC si vede male»; scelta PO «Logo compatto, azioni in vista»). A 1366x768 e 1920x1080:
 *   H1 riquadro del logo alto <= 40% della finestra
 *   H2 «Nuova carriera» largo >= 90% della colonna della Home
 *   H3 colonna centrata nello spazio a destra del menu laterale (|sinistra - destra| <= 8 px)
 *   H4 «Crediti» visibile senza scorrere a 1366x768 (dentro la finestra e non coperto)
 *   H5 [giro 302, PO-552 cambiata dal PO il 20/11 «Toglierli»] la riga dei tasti «1 2 3 salvataggi» NON c'e' piu' (prima: tasti alti
 *      >= 44 px con testo >= 14 px). Si giudica solo nel verde: col rosso __CPM_NO_G284 la riga non torna (la toglie il giro 302).
 * PO-543 («non si legge bene l'elenco»): per ogni <select> raggiungibile (tendina della nazione nella creazione) e per
 *   una tendina di prova con <optgroup> (le regole sono globali: valgono per le tendine di classifica e del taccuino)
 *   T1 contrasto fra color e background-color delle <option>/<optgroup> (getComputedStyle) >= 4,5; un fondo trasparente
 *      non e' giudicabile = rosso.
 * TELEFONO (360, 375, 412): la Home NON cambia — foto col verde e col rosso (__CPM_NO_G284 = la 7.999.197) confrontate
 *   pixel per pixel; devono essere identiche. Foto in docs/sviluppo/giro284/.
 * Uso: node homepc-284.mjs                       → verde (esce 0 solo se tutto passa)
 *      CPM_PROVA_ROSSO=1 node homepc-284.mjs      → in piu' accende __CPM_NO_G284 e pretende che H1 H2 H3 T1 cadano
 *        (H4 era gia' vero sulla 7.999.197, misurato: Crediti 701-746 px su 768 — si giudica solo nel verde).
 *      CPM_FOTO=prima node homepc-284.mjs         → solo foto (nome file con prefisso), nessun giudizio. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOC = path.join(__dirname, '..', '..', 'docs', 'sviluppo', 'giro284');
fs.mkdirSync(DOC, { recursive: true });
fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true });
const FOTO = process.env.CPM_FOTO || '';
const PC = [[1366, 768], [1920, 1080], [1883, 971]];
const TEL = [[360, 800], [375, 812], [412, 915]];
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();

async function apri(w, h, rosso) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const page = await ctx.newPage(); await installCdnRoutes(page);
  const err = []; page.on('pageerror', e => err.push(String(e.message).slice(0, 140)));
  await page.addInitScript(({ rosso }) => { window.__CPM_GLB = false; if (rosso) window.__CPM_NO_G284 = true;
    try { localStorage.clear(); localStorage.setItem('cpm-intro-seen', '1'); } catch (e) {} }, { rosso });
  for (let t = 0; t < 3; t++) { try { await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
    await page.waitForFunction(() => { const r = document.querySelector('.cpm-slots'); return !!r; }, null, { timeout: 90000 }); break; } catch (e) { if (t === 2) throw e; } }
  await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important;}' });
  await sleep(900);
  return { ctx, page, err };
}

async function misuraHome(page) {
  return page.evaluate(() => {
    const R = el => { const r = el.getBoundingClientRect(); return { l: r.left, r: r.right, t: r.top, b: r.bottom, w: r.width, h: r.height }; };
    const col = document.querySelector('.cpm-scroll > div'); const sc = document.querySelector('.cpm-scroll');
    const hero = col && col.firstElementChild && col.firstElementChild.getBoundingClientRect().height > 60 ? col.firstElementChild : (col && [...col.children].find(c => c.querySelector('svg')));
    const nuova = [...document.querySelectorAll('.cpm-slots button')].find(b => /Nuova carriera/i.test(b.textContent || ''));
    const cred = [...document.querySelectorAll('button')].find(b => (b.textContent || '').trim().replace(/\s+/g, ' ').endsWith('Crediti'));
    const nav = [...document.querySelectorAll('.cpm-nav-bar,.cpm-v2nav')].map(R).filter(r => r.w > 0 && r.w < innerWidth * 0.5 && r.h > innerHeight * 0.6);
    const navR = nav.length ? Math.max(...nav.map(r => r.r)) : 0;
    const scR = R(sc); const scrollRight = scR.l + sc.clientWidth * (scR.w / sc.offsetWidth || 1);
    const zoom = parseFloat(sc.style.zoom || getComputedStyle(sc).zoom || '1') || 1;
    const tasti = [...document.querySelectorAll('.kbd')].map(k => ({ h: R(k).h, w: R(k).w, fs: parseFloat(getComputedStyle(k).fontSize) * zoom, tag: k.tagName }));
    let credVis = false, credInfo = null;
    if (cred) { const r = R(cred); credInfo = r; if (r.b <= innerHeight && r.t >= 0 && r.h > 0) { const e = document.elementFromPoint((r.l + r.r) / 2, (r.t + r.b) / 2); credVis = !!e && (e === cred || cred.contains(e)); } }
    const c = col ? R(col) : null;
    return { vw: innerWidth, vh: innerHeight, col: c, hero: hero ? R(hero) : null, nuova: nuova ? R(nuova) : null, navR, scrollRight,
      sx: c ? c.l - navR : null, dx: c ? scrollRight - c.r : null, cred: credInfo, credVis, tasti, scrollH: sc.scrollHeight, clientH: sc.clientHeight };
  });
}

function giudicaPC(m, w, h) {
  const out = [];
  const ok = (id, pass, msg) => out.push({ id, pass: !!pass, msg: `${w}x${h} ${id}: ${msg}` });
  ok('H1', m.hero && m.hero.h <= 0.40 * m.vh, m.hero ? `logo ${m.hero.h.toFixed(0)} px = ${(100 * m.hero.h / m.vh).toFixed(1)}% della finestra (<= 40%)` : 'riquadro del logo non trovato (non giudicato)');
  ok('H2', m.nuova && m.col && m.nuova.w >= 0.90 * m.col.w, m.nuova ? `Nuova carriera ${m.nuova.w.toFixed(0)} px su colonna ${m.col.w.toFixed(0)} = ${(100 * m.nuova.w / m.col.w).toFixed(1)}% (>= 90%)` : 'Nuova carriera non trovato (non giudicato)');
  ok('H3', m.col && Math.abs(m.sx - m.dx) <= 8, m.col ? `colonna: ${m.sx.toFixed(0)} px a sinistra (dal menu a ${m.navR.toFixed(0)}), ${m.dx.toFixed(0)} a destra, scarto ${Math.abs(m.sx - m.dx).toFixed(0)} (<= 8)` : 'colonna non trovata');
  if (w === 1366) ok('H4', m.credVis, m.cred ? `Crediti ${m.cred.t.toFixed(0)}-${m.cred.b.toFixed(0)} px su finestra ${m.vh}: ${m.credVis ? 'visibile' : 'NON visibile senza scorrere'}` : 'Crediti non trovato (non giudicato)');
  const t = m.tasti; ok('H5', m.col && t.length === 0, m.col ? `riga «1 2 3 salvataggi»: ${t.length} tasti a schermo (devono essere 0, PO-552 cambiata)` : 'Home non trovata (non giudicato)');
  return out;
}

const LUM = c => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); if (p.length > 3 && p[3] < 1) return { a: p[3] };
  const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return { L: 0.2126 * f(p[0]) + 0.7152 * f(p[1]) + 0.0722 * f(p[2]) }; };
const CR = (a, b) => { const x = LUM(a), y = LUM(b); if (!x || !y || x.a !== undefined || y.a !== undefined) return null; const [h, l] = x.L > y.L ? [x.L, y.L] : [y.L, x.L]; return (h + 0.05) / (l + 0.05); };

async function misuraTendine(page) {
  const btn = page.locator('.cpm-slots button', { hasText: 'Nuova carriera' }).first();
  await btn.click({ timeout: 10000 });
  await page.waitForSelector('select', { timeout: 30000 });
  await sleep(500);
  return page.evaluate(() => {
    const prova = document.createElement('select'); prova.setAttribute('data-prova284', '1');
    prova.innerHTML = '<optgroup label="La tua lega"><option>Lega A</option></optgroup><optgroup label="Altre leghe"><option>Lega B</option></optgroup>';
    (document.querySelector('.cpm-scroll') || document.body).appendChild(prova);
    const righe = [];
    document.querySelectorAll('select').forEach((s, si) => {
      const nome = s.getAttribute('data-cpm') || (s.hasAttribute('data-prova284') ? 'prova-optgroup' : 'select#' + si);
      const vis = [...s.querySelectorAll('option,optgroup')].slice(0, 6);
      vis.forEach(o => { const cs = getComputedStyle(o); righe.push({ nome, tag: o.tagName.toLowerCase(), testo: (o.label || o.textContent || '').slice(0, 18), color: cs.color, bg: cs.backgroundColor, scheme: getComputedStyle(s).colorScheme }); });
    });
    prova.remove();
    return righe;
  });
}

function pngDiff(a, b) { const A = PNG.sync.read(a), B = PNG.sync.read(b); if (A.width !== B.width || A.height !== B.height) return { diversi: -1, tot: 0 };
  let d = 0; for (let i = 0; i < A.data.length; i += 4) if (A.data[i] !== B.data[i] || A.data[i + 1] !== B.data[i + 1] || A.data[i + 2] !== B.data[i + 2]) d++; return { diversi: d, tot: A.width * A.height }; }

async function braccio(rosso) {
  const tag = rosso ? 'rosso' : (FOTO || 'dopo');
  const esiti = []; const righeT = [];
  for (const [w, h] of PC) {
    const { ctx, page, err } = await apri(w, h, rosso);
    const m = await misuraHome(page);
    await page.screenshot({ path: path.join(DOC, `${tag}-home-${w}x${h}.png`) });
    if (w !== 1883) esiti.push(...giudicaPC(m, w, h)); else console.log(`  (informativa 1883x971: logo ${(100 * m.hero.h / m.vh).toFixed(1)}% · Nuova ${(100 * m.nuova.w / m.col.w).toFixed(1)}% · sx ${m.sx.toFixed(0)} dx ${m.dx.toFixed(0)})`);
    if (w === 1366) {
      const t = await misuraTendine(page);
      await page.screenshot({ path: path.join(DOC, `${tag}-creazione-${w}x${h}.png`) });
      for (const r of t) { const c = CR(r.color, r.bg); righeT.push({ ...r, c }); }
      const brutte = righeT.filter(r => r.c === null || r.c < 4.5);
      const min = Math.min(...righeT.map(r => r.c === null ? 0 : r.c));
      esiti.push({ id: 'T1', pass: righeT.length > 0 && brutte.length === 0, msg: `T1: ${righeT.length} voci in ${new Set(righeT.map(r => r.nome)).size} tendine, contrasto minimo ${min.toFixed(2)} (>= 4,5)` + (brutte.length ? ` — sotto soglia: ${brutte.slice(0, 3).map(r => `${r.nome}/${r.tag} «${r.testo}» ${r.color} su ${r.bg} (${r.c === null ? 'non giudicabile' : r.c.toFixed(2)})`).join(' · ')}` : '') });
    }
    if (err.length) esiti.push({ id: 'ERR', pass: false, msg: `${w}x${h} errori di pagina: ${err.slice(0, 2).join(' | ')}` });
    await ctx.close();
  }
  return esiti;
}

async function fotoTelefono(rosso) {
  const o = {};
  for (const [w, h] of TEL) { const { ctx, page } = await apri(w, h, rosso); const b = await page.screenshot({ fullPage: false });
    fs.writeFileSync(path.join(DOC, `${rosso ? 'rosso' : (FOTO || 'dopo')}-telefono-${w}.png`), b); o[w] = b; await ctx.close(); }
  return o;
}

let fallito = false;
const stampa = (titolo, es) => { console.log(`\n== ${titolo} ==`); for (const e of es) console.log(`  ${e.pass ? 'OK ' : 'NO '} ${e.msg}`); };

if (FOTO) {
  const es = await braccio(false); stampa(`FOTO «${FOTO}» (solo misura)`, es); await fotoTelefono(false);
} else {
  const verde = await braccio(false); stampa('BRACCIO VERDE', verde);
  if (verde.some(e => !e.pass)) fallito = true;
  const telV = await fotoTelefono(false), telR = await fotoTelefono(true);
  console.log('\n== TELEFONO: verde contro rosso (la 7.999.197) ==');
  for (const [w] of TEL) { const d = pngDiff(telV[w], telR[w]); const pass = d.diversi === 0; if (!pass) fallito = true;
    console.log(`  ${pass ? 'OK ' : 'NO '} ${w} px: ${d.diversi < 0 ? 'misure diverse' : d.diversi + ' pixel diversi su ' + d.tot} (deve essere 0)`); }
  if (process.env.CPM_PROVA_ROSSO) {
    const rosso = await braccio(true); stampa('BRACCIO ROSSO (__CPM_NO_G284)', rosso);
    for (const id of ['H1', 'H2', 'H3', 'T1']) /* H4 (Crediti in vista a 1366x768) era gia' vero sulla 7.999.197: si giudica solo nel verde; H5 dal giro 302 e' l'assenza della riga e col rosso del 284 non cambia */ { const cade = rosso.some(e => e.id === id && !e.pass);
      console.log(`  ${cade ? 'OK ' : 'NO '} il rosso fa cadere ${id}`); if (!cade) fallito = true; }
  }
}
await browser.close(); srv.close();
console.log(FOTO ? '\nFOTO FATTE' : (fallito ? '\n❌ homepc-284 ROSSO' : '\n✅ homepc-284 VERDE'));
process.exit(FOTO ? 0 : (fallito ? 1 : 0));
