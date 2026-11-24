/* [giro 339 · PO-614 + PO-595] GUARDIANO «FORMAZIONI: L'EROE VESTE LA DIVISA DEI COMPAGNI, NIENTE RIQUADRO, TITOLO AL CENTRO».
   Rosso del giro: window.__CPM_NO_G339 (= la schermata del 22/11: maglia dell'eroe senza disegno/secondo colore, riquadro bianco,
   «FORMAZIONI · LEGA» a sinistra dopo «← Indietro»).
   PO 22/11 08:35 «l'eroe non deve avere una maglia diversa» · 08:40 «il quadrato intorno è brutto, lo toglierei» ·
   PO 21/11 08:45 «la scritta formazioni + lega deve essere centrale».
   Per ogni misura (telefono 412×915 e PC 1280×800, partita vera dal salvataggio S12, schermata `formations`):
   M1 · maglia: l'insieme dei colori pieni disegnati nella maglia dell'eroe (riempimenti e tratti «#…» dello SVG) e' identico a
        quello dei compagni della sua squadra (tutti i compagni hanno lo stesso insieme: si controlla anche questo).
   M2 · riquadro: l'eroe e i suoi contenitori fino alla riga non hanno bordo, ombra-contorno ne' outline.
   M3 · titolo: il centro del testo «Formazioni · …» sta entro 4 px dal centro della testata, e non tocca il tasto Indietro.
   M4 · l'eroe resta riconoscibile: il suo cognome e' giallo (diverso dai compagni).
   M5 · (solo verde, telefono 360×740) etichetta lunga di coppa («Formazioni · ⭐ Korward Champions Cup», turno lungo): il titolo
        resta centrato entro 4 px, va a capo e non passa sotto «Indietro»; nessuno scorrimento orizzontale.
   Verde: M1-M4 tutte vere a 412 e al PC. Rosso (__CPM_NO_G339): M1, M2 e M3 devono essere FALSE (il difetto si vede).
   «Non giudicato» (schermata non raggiunta, eroe o compagni non trovati) = rosso. Esiti stampati per ultimi.
   Foto in tests/visual/out/formazioni-339/ (verde = dopo, rosso = prima).
   Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node formazioni-339.mjs   (~2 minuti) */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const OUTD = new URL('./out/formazioni-339/', import.meta.url).pathname; fs.mkdirSync(OUTD, { recursive: true });
const save190 = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const esiti = []; let tutto = true; const giudica = (c, m) => { esiti.push(`${c ? '✅' : '❌'} ${m}`); tutto = tutto && !!c; };
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const TOLL = 4;

const misura = (page) => page.evaluate(() => {
  const colori = (el) => { const svg = el.querySelector('svg'); if (!svg) return null; const S = new Set();
    svg.querySelectorAll('path,rect,polygon,circle').forEach(n => { if (n.closest('defs')) return; for (const a of ['fill', 'stroke']) { const v = (n.getAttribute(a) || '').toLowerCase(); if (v.startsWith('#')) S.add(a + ':' + v); } });
    return [...S].sort().join(' '); };
  const eroe = document.querySelector('[data-maglia339="eroe"]');
  if (!eroe) return { trovato: false };
  const riga = eroe.closest('[data-cpm="eroe339"]') ? eroe.closest('[data-cpm="eroe339"]').parentElement : eroe.parentElement;
  const card = riga.parentElement; // campetto della squadra dell'eroe
  const compagni = [...card.querySelectorAll('[data-maglia339="altro"]')];
  const cComp = [...new Set(compagni.map(colori))];
  // riquadro: dall'eroe fino alla riga (esclusa)
  const bordi = []; let n = eroe;
  while (n && n !== riga) { const cs = getComputedStyle(n);
    const bw = ['Top', 'Right', 'Bottom', 'Left'].map(k => parseFloat(cs['border' + k + 'Width']) || 0).reduce((a, x) => a + x, 0);
    if (cs.boxShadow && cs.boxShadow !== 'none') bordi.push('ombra ' + cs.boxShadow.slice(0, 40));
    if (bw > 0 && cs.borderStyle !== 'none') bordi.push('bordo ' + bw);
    if (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) bordi.push('outline');
    n = n.parentElement; }
  const lab = (el) => { const d = el.querySelector('div'); return d ? getComputedStyle(d).color : null; };
  // titolo
  const tit = [...document.querySelectorAll('span')].find(s => /^Formazioni ·/i.test((s.textContent || '').trim()));
  let tt = null;
  if (tit) { const r = document.createRange(); r.selectNodeContents(tit); const tr = r.getBoundingClientRect();
    const cont = tit.closest('[data-cpm="testata339"]') || tit.parentElement; const cr = cont.getBoundingClientRect();
    const ind = document.querySelector('[data-cpm="indietro294"]'); const ir = ind ? ind.getBoundingClientRect() : null;
    const tocca = ir ? !(tr.right <= ir.left || tr.left >= ir.right || tr.bottom <= ir.top || tr.top >= ir.bottom) : false;
    tt = { testo: tit.textContent.trim(), scarto: Math.round(((tr.left + tr.right) / 2 - (cr.left + cr.right) / 2) * 10) / 10, tocca, indietro: !!ind, righe: Math.round(tr.height) }; }
  return { trovato: true, cEroe: colori(eroe), cComp, nComp: compagni.length, bordi, colEroe: lab(eroe), colComp: compagni[0] ? lab(compagni[0]) : null, tt,
    sfora: document.documentElement.scrollWidth > window.innerWidth + 1 };
});

async function giro(rosso, w, h) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
  await page.addInitScript(([s, r]) => { window.__CPM_GLB = false; if (r) window.__CPM_NO_G339 = 1; localStorage.setItem('cpm-v3', JSON.stringify(s)); }, [save190, rosso]);
  try {
    await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
    try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(1500);
    try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
    await page.evaluate(() => window.__CPM_CAREER.playMatch());
    const t0 = Date.now(); let m = null;
    while (Date.now() - t0 < 90000) {
      const ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE());
      if (ph === 'matchday') { try { await page.getByText('Vedi le formazioni', { exact: false }).first().click({ timeout: 2000 }); } catch (e) {} }
      if (ph === 'formations') { await sleep(900); m = await misura(page);
        await page.screenshot({ path: `${OUTD}${rosso ? 'rosso' : 'verde'}-${w}.png`, fullPage: true }); break; }
      await sleep(400);
    }
    return { m, errs };
  } finally { await ctx.close(); }
}

const lungo = (page) => page.evaluate(() => { const t = document.querySelector('[data-cpm="titolo339"]'); if (!t) return null;
  t.textContent = 'Formazioni · ⭐ Korward Champions Cup'; const g = document.querySelector('[data-cpm="giornata339"]'); if (g) g.textContent = 'Ottavi di finale · andata';
  const r = document.createRange(); r.selectNodeContents(t); const tr = r.getBoundingClientRect(); const cr = t.closest('[data-cpm="testata339"]').getBoundingClientRect();
  const ind = document.querySelector('[data-cpm="indietro294"]'); const ir = ind ? ind.getBoundingClientRect() : null;
  return { indietro: !!ir, tocca: ir ? !(tr.right <= ir.left || tr.left >= ir.right || tr.bottom <= ir.top || tr.top >= ir.bottom) : null,
    scarto: Math.round(((tr.left + tr.right) / 2 - (cr.left + cr.right) / 2) * 10) / 10, sfora: document.documentElement.scrollWidth > window.innerWidth + 1 }; });
async function giroLungo() {
  const ctx = await b.newContext({ viewport: { width: 360, height: 740 }, deviceScaleFactor: 1 }); const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript((s) => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(s)); }, save190);
  try {
    await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
    try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(1500);
    try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
    await page.evaluate(() => window.__CPM_CAREER.playMatch());
    const t0 = Date.now();
    while (Date.now() - t0 < 90000) { const ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE());
      if (ph === 'matchday') { try { await page.getByText('Vedi le formazioni', { exact: false }).first().click({ timeout: 2000 }); } catch (e) {} }
      if (ph === 'formations') { await sleep(900); const m = await lungo(page); await sleep(200);
        await page.screenshot({ path: `${OUTD}verde-360-etichetta-lunga.png`, clip: { x: 0, y: 0, width: 360, height: 220 } }); return m; }
      await sleep(400); }
    return null;
  } finally { await ctx.close(); }
}

const R = {};
for (const [w, h] of [[412, 915], [1280, 800]]) for (const rosso of [false, true]) {
  const k = (rosso ? 'rosso' : 'verde') + w;
  try { R[k] = await giro(rosso, w, h); } catch (e) { R[k] = { m: null, errs: ['errore: ' + e.message] }; }
  console.log(k + ' ' + JSON.stringify(R[k]));
}
let L = null; try { L = await giroLungo(); } catch (e) { console.log('M5 errore: ' + e.message); }
console.log('lungo360 ' + JSON.stringify(L));
await b.close(); srv.close();
giudica(!!L && L.indietro && L.tocca === false && Math.abs(L.scarto) <= TOLL && !L.sfora, `360 verde M5 etichetta lunga: ${L ? `tocca Indietro ${L.tocca} · scarto ${L.scarto} px · sfora ${L.sfora}` : 'NON GIUDICATO'}`);
for (const w of [412, 1280]) {
  const V = R['verde' + w], X = R['rosso' + w];
  const v = V && V.m, x = X && X.m;
  const ok = (q) => !!q && q.trovato && q.nComp >= 9 && q.tt && q.tt.indietro;
  if (!ok(v)) giudica(false, `${w} verde NON GIUDICATO (schermata/eroe/compagni/titolo non trovati)`);
  else {
    giudica(v.cComp.length === 1 && v.cEroe === v.cComp[0], `${w} verde M1 maglia eroe = compagni: eroe «${v.cEroe}» · compagni ${JSON.stringify(v.cComp)}`);
    giudica(v.bordi.length === 0, `${w} verde M2 nessun riquadro attorno all'eroe: ${v.bordi.join(', ') || 'nessuno'}`);
    giudica(Math.abs(v.tt.scarto) <= TOLL && !v.tt.tocca, `${w} verde M3 titolo «${v.tt.testo}» centrato: scarto ${v.tt.scarto} px (tetto ${TOLL}) · tocca Indietro ${v.tt.tocca}`);
    giudica(v.colEroe && v.colEroe !== v.colComp, `${w} verde M4 nome dell'eroe in evidenza: ${v.colEroe} contro ${v.colComp}`);
    giudica(!v.sfora, `${w} verde nessuno scorrimento orizzontale`);
  }
  if (!ok(x)) giudica(false, `${w} rosso NON GIUDICATO (schermata/eroe/compagni/titolo non trovati)`);
  else {
    giudica(x.cEroe !== x.cComp[0], `${w} rosso __CPM_NO_G339 M1 maglia diversa (il difetto si vede): eroe «${x.cEroe}» · compagni «${x.cComp[0]}»`);
    giudica(x.bordi.length > 0, `${w} rosso M2 riquadro presente: ${x.bordi.join(', ') || 'nessuno'}`);
    giudica(Math.abs(x.tt.scarto) > TOLL, `${w} rosso M3 titolo fuori centro: scarto ${x.tt.scarto} px`);
  }
  giudica(!!V && !!X && V.errs.length === 0 && X.errs.length === 0, `${w} errori di pagina: verde ${V ? V.errs.length : '—'} · rosso ${X ? X.errs.length : '—'} ${[...(V ? V.errs : []), ...(X ? X.errs : [])].slice(0, 2).join(' | ')}`);
}
for (const e of esiti) console.log(e);
console.log(tutto ? '✅ formazioni-339 verde (e il rosso si vede)' : '❌ formazioni-339 rosso');
process.exit(tutto ? 0 : 1);
