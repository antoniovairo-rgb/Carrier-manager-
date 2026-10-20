#!/usr/bin/env node
/* [PO-286, giro 81] GUARDIANO «I COLORI DEL POST-PARTITA SONO QUELLI DELLE DUE SQUADRE». Rosso __CPM_NO_COL286 (= comportamento 7.999.176).
   Collaudo PO (foto po286-postpartita-colori.png): il «Tabellino della gara» aveva barre bordeaux/arancio fisse (TH.primary/TH.warning)
   mentre l'intestazione del risultato portava le maglie vere (verde e quasi nero, quest'ultima invisibile sul fondo scuro).
   (A) pura, in pagina: la regola colori286(k,bg) su coppie sintetiche (due scure, quasi nere, bianche, identiche, accenti uguali) su TRE fondi
       (card chiara #ffffff, card scura #172033, testata #101a33): le due barre distano >= DIST (redmean) e ognuna ha contrasto >= 3:1 col fondo.
   (B) partita vera in autoplay (salvataggio S12): si leggono i colori calcolati delle barre del tabellino (barra286-a/-b), dei nomi colonna e
       delle due barre dell'intestazione; si confrontano con le maglie delle due squadre (shirt e accento di casa/ospite, dall'hook __CPM_COL286):
       ogni barra e' la maglia, il suo accento oppure una VARIANTE della stessa tonalita' (schiarita/scurita); distanza minima fra le due barre e
       contrasto minimo con lo sfondo della card (e della testata); testata e tabellino della stessa squadra = stessa famiglia di colore.
   VERDE: tutto sopra. ROSSO (__CPM_NO_COL286, CPM_SOLO_ROSSO=1): il guardiano deve fallire (barre del tabellino non delle squadre).
   Soglie fisse (mai abbassate): DIST 120 · contrasto 3 · tonalita' entro 28 gradi.
   Uso: node colori-286.mjs · CPM_SOLO_A=1 · CPM_SAVE=save-xxx.json · CPM_BRACCI=verde,rosso · CPM_FOTO=<percorso.png> (screenshot del tabellino) */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const DIST = 120, VIS = 3, TON = 28;
const lum = (h) => { const v = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
const rap = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const rgb = (h) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const dist = (a, b) => { const x = rgb(a), y = rgb(b), rm = (x[0] + y[0]) / 2, dr = x[0] - y[0], dg = x[1] - y[1], db = x[2] - y[2]; return Math.sqrt((2 + rm / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rm) / 256) * db * db); };
const hue = (h) => { const [r, g, b] = rgb(h).map(v => v / 255); const M = Math.max(r, g, b), m = Math.min(r, g, b), d = M - m; if (d < 0.08) return null; let H = M === r ? ((g - b) / d) % 6 : M === g ? (b - r) / d + 2 : (r - g) / d + 4; return ((H * 60) + 360) % 360; };
const hex = (c) => { if (!c) return null; if (c[0] === '#') return c.length === 4 ? '#' + [1, 2, 3].map(i => c[i] + c[i]).join('') : c.toLowerCase(); const m = c.match(/(\d+(?:\.\d+)?)/g); if (!m || m.length < 3) return null; return '#' + m.slice(0, 3).map(v => Math.round(+v).toString(16).padStart(2, '0')).join(''); };
/* variante = stessa tonalita' (o entrambi neutri) della maglia o dell'accento */
const famiglia = (c, k) => [k.sx, k.sx2, k.dx, k.dx2].filter(Boolean).map(hex).some(r => { if (c === r) return true; const a = hue(c), b = hue(r); if (a === null || b === null) return a === b; const d = Math.abs(a - b); return Math.min(d, 360 - d) <= TON; });
const fail = [];
const SOLO_ROSSO = process.env.CPM_SOLO_ROSSO === '1';
const BRACCI = SOLO_ROSSO ? ['rosso'] : (process.env.CPM_BRACCI || 'verde,rosso').split(',');
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/' + (process.env.CPM_SAVE || 'save-190-s12-ovr93.json'), import.meta.url)));
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const R = {};
for (const braccio of BRACCI) {
  const rosso = braccio === 'rosso';
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140))); page.on('console', m => { if (m.type() === 'error' && !/BABEL/.test(m.text())) errs.push('console: ' + String(m.text()).slice(0, 200)); });
  await page.addInitScript(o => { window.__CPM_GLB = false; window.__CPM_REC = true; if (o.r) window.__CPM_NO_COL286 = 1; localStorage.setItem('cpm-match-speed', '4'); localStorage.setItem('cpm-v3', JSON.stringify(o.s)); }, { r: rosso, s: SAVE });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
  /* (A) regola pura — solo nel braccio verde */
  if (!rosso) {
    const A = await page.evaluate(() => { const f = window.__CPM_FN286; if (!f) return null;
      const coppie = [['#15151c', '#15151c', '#0f172a', '#0f172a'], ['#1a1a1a', null, '#111827', null], ['#ffffff', '#f2f1ec', '#f5f5f5', null], ['#8e1f33', '#d4922a', '#8e1f33', '#d4922a'], ['#16a34a', '#fff', '#15151c', '#fff'], ['#003399', null, '#0b2a6b', '#ffffff'], ['#101a33', '#101a33', '#172033', '#172033'], ['#e2e8f0', null, '#f1f5f9', null]];
      const fondi = { chiaro: '#ffffff', scuro: '#172033', testata: '#101a33' };
      const out = []; for (const [nome, bg] of Object.entries(fondi)) for (const c of coppie) { const r = f({ sx: c[0], sx2: c[1], dx: c[2], dx2: c[3] }, bg); out.push({ nome, k: c, r }); } return out; });
    if (!A) fail.push('A: hook __CPM_FN286 assente');
    else { let n = 0, minD = 1e9, minC = 1e9;
      for (const o of A) { const bg = { chiaro: '#ffffff', scuro: '#172033', testata: '#101a33' }[o.nome]; const sx = hex(o.r.sx), dx = hex(o.r.dx); const d = dist(sx, dx), c1 = rap(sx, bg), c2 = rap(dx, bg); n++; minD = Math.min(minD, d); minC = Math.min(minC, c1, c2);
        if (d < DIST) fail.push(`A: ${o.nome} ${JSON.stringify(o.k)} → barre troppo simili (${d.toFixed(0)} < ${DIST}): ${sx} ${dx}`);
        if (c1 < VIS - 0.05 || c2 < VIS - 0.05) fail.push(`A: ${o.nome} ${JSON.stringify(o.k)} → barra invisibile sul fondo (${c1.toFixed(2)}/${c2.toFixed(2)} < ${VIS}): ${sx} ${dx}`); }
      console.log(`(A) regola pura: ${n} casi (8 coppie x 3 fondi) · distanza minima ${minD.toFixed(0)} (soglia ${DIST}) · contrasto minimo ${minC.toFixed(2)} (soglia ${VIS})`); }
    if (process.env.CPM_SOLO_A) { await ctx.close(); break; }
  }
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(1500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => window.__CPM_CAREER.playMatch());
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
  await page.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: 2021, policy: 'seeded', tickMs: 150 }));
  const t0 = Date.now(); let ph = '';
  while (Date.now() - t0 < 420000) { ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()); if (ph === 'ended' || ph === 'ceremony') break; await sleep(1000); }
  for (let k = 0; k < 20 && !(await page.evaluate(() => !!document.querySelector('[data-cpm="tab280"]'))); k++) { /* premiazione: si salta finche' non compare il tabellino */
    try { await page.getByText('Salta premiazione', { exact: false }).first().click({ timeout: 2500 }); } catch (e) {} await sleep(1500); }
  await sleep(2500);
  const L = await page.evaluate(() => { const bg = (el) => el ? getComputedStyle(el).backgroundColor : null, col = (el) => el ? getComputedStyle(el).color : null;
    const q = (s) => document.querySelector(s); const K = window.__CPM_COL286 || null;
    return { K, tabA: bg(q('[data-cpm="barra286-a"]')), tabB: bg(q('[data-cpm="barra286-b"]')), testSx: bg(q('[data-cpm="barra286-sx"]')), testDx: bg(q('[data-cpm="barra286-dx"]')),
      nomeSx: col(q('[data-cpm="tab280-sx"]')), nomeDx: col(q('[data-cpm="tab280-dx"]')), nomeSxT: (q('[data-cpm="tab280-sx"]') || {}).innerText, nomeDxT: (q('[data-cpm="tab280-dx"]') || {}).innerText,
      sfondo: (() => { const c = q('[data-cpm="sez210"]'); let e = c; while (e) { const x = getComputedStyle(e).backgroundColor; if (x && !/rgba\(0, 0, 0, 0\)|transparent/.test(x)) return x; e = e.parentElement; } return null; })(),
      tab: !!q('[data-cpm="tab280"]'), clubs: [...document.querySelectorAll('[data-cpm="barra286-sx"],[data-cpm="barra286-dx"]')].length }; });
  if (process.env.CPM_FOTO && (process.env['CPM_FOTO_' + braccio.toUpperCase()] || braccio === (process.env.CPM_FOTO_BRACCIO || 'verde'))) {
    const dst = process.env['CPM_FOTO_' + braccio.toUpperCase()] || process.env.CPM_FOTO;
    try { const sez = await page.evaluateHandle(() => { const t = document.querySelector('[data-cpm="tab280"]'); return t ? t.closest('[data-cpm="sez210"]') : null; });
      const el = sez.asElement(); if (el) { await el.scrollIntoViewIfNeeded(); await sleep(300); await el.screenshot({ path: dst }); } else console.log('foto: sezione non trovata'); } catch (e) { console.log('foto: ' + String(e.message).slice(0, 100)); }
    try { const hh = await page.evaluateHandle(() => { const t = document.querySelector('[data-cpm="barra286-sx"]'); let e = t; for (let i = 0; i < 6 && e; i++) { if (e.style && /gradient/.test(e.style.background || '')) return e; e = e.parentElement; } return null; });
      const el2 = hh.asElement(); if (el2) { await el2.scrollIntoViewIfNeeded(); await sleep(300); await el2.screenshot({ path: dst.replace('.png', '-testata.png') }); } } catch (e) { console.log('foto testata: ' + String(e.message).slice(0, 100)); } }
  if (!L.K) { console.log('DEBUG ' + braccio + ' ' + JSON.stringify(await page.evaluate(() => ({ t: document.body.innerText.replace(/\s+/g, ' ').slice(0, 400), ph: window.__CPM_PHASE && window.__CPM_PHASE(), sez: document.querySelectorAll('[data-cpm="sez210"]').length })))); try { await page.screenshot({ path: process.env.CPM_DBG || '/tmp/c286dbg.png' }); } catch (e) {} }
  R[braccio] = { fase: ph, ...L, errs };
  if (errs.length) console.log(braccio + ' errori di pagina: ' + errs.join(' | '));
  console.log(`${braccio} ${JSON.stringify({ fase: ph, kit: L.K && L.K.kit, tabellino: [hex(L.tabA), hex(L.tabB)], testata: [hex(L.testSx), hex(L.testDx)], nomi: [hex(L.nomeSx), hex(L.nomeDx)], sfondoCard: hex(L.sfondo), nomiTesto: [L.nomeSxT, L.nomeDxT] })}`);
  await ctx.close();
}
await b.close(); srv.close();
const giudica = (x, etic) => { const g = [];
  if (!x || !x.K || !x.K.kit) return [etic + ': nessun hook colori (post-partita non raggiunto?)'];
  const k = x.K.kit; const tab = [hex(x.tabA), hex(x.tabB)], te = [hex(x.testSx), hex(x.testDx)], bgc = hex(x.sfondo) || '#ffffff', bgt = '#101a33';
  if (!tab[0] || !tab[1]) return [etic + ': barre del tabellino non lette'];
  const kit = { sx: k.sx, sx2: k.sx2, dx: k.dx, dx2: k.dx2 };
  const kS = { sx: hex(k.sx), sx2: k.sx2 && hex(k.sx2), dx: hex(k.dx), dx2: k.dx2 && hex(k.dx2) };
  tab.forEach((c, i) => { if (!famiglia(c, kS)) g.push(`${etic}: barra del tabellino ${i ? 'destra' : 'sinistra'} ${c} non e' del colore delle squadre (${[kS.sx, kS.sx2, kS.dx, kS.dx2].join(' ')})`); });
  /* ogni squadra la sua tonalita': la barra di sinistra dalla famiglia di casa, quella di destra dall'ospite (a meno di ripiego sul secondo colore) */
  if (!(famiglia(tab[0], { sx: kS.sx, sx2: kS.sx2 }) )) g.push(`${etic}: la barra sinistra ${tab[0]} non porta i colori della squadra di casa (${kS.sx} ${kS.sx2})`);
  if (!(famiglia(tab[1], { sx: kS.dx, sx2: kS.dx2 }))) g.push(`${etic}: la barra destra ${tab[1]} non porta i colori dell'ospite (${kS.dx} ${kS.dx2})`);
  const d = dist(tab[0], tab[1]); if (d < DIST) g.push(`${etic}: barre del tabellino troppo simili (${d.toFixed(0)} < ${DIST})`);
  tab.forEach((c, i) => { const r = rap(c, bgc); if (r < VIS - 0.05) g.push(`${etic}: barra del tabellino ${i ? 'destra' : 'sinistra'} ${c} poco visibile sulla card ${bgc} (${r.toFixed(2)} < ${VIS})`); });
  if (te[0] && te[1]) { te.forEach((c, i) => { const r = rap(c, bgt); if (r < VIS - 0.05) g.push(`${etic}: barra dell'intestazione ${i ? 'ospite' : 'casa'} ${c} invisibile sulla testata (${r.toFixed(2)} < ${VIS})`); if (!famiglia(c, kS)) g.push(`${etic}: barra dell'intestazione ${c} non e' del colore delle squadre`); });
    const dh = dist(te[0], te[1]); if (dh < DIST) g.push(`${etic}: barre dell'intestazione troppo simili (${dh.toFixed(0)} < ${DIST})`);
    te.forEach((c, i) => { if (dist(c, tab[i]) > 150 && Math.abs((hue(c) ?? 0) - (hue(tab[i]) ?? 0)) > TON) g.push(`${etic}: intestazione ${c} e tabellino ${tab[i]} non sono la stessa famiglia`); }); }
  else g.push(etic + ': barre dell\'intestazione non lette');
  /* i nomi colonna portano la tonalita' della barra e si leggono sulla card */
  [[hex(x.nomeSx), tab[0]], [hex(x.nomeDx), tab[1]]].forEach(([n, bar], i) => { if (!n) { g.push(etic + ': nome colonna non letto'); return; } const r = rap(n, bgc); if (r < 4.5 - 0.05) g.push(`${etic}: nome colonna ${i ? 'destra' : 'sinistra'} ${n} illeggibile sulla card (${r.toFixed(2)} < 4.5)`);
    const a = hue(n), c = hue(bar); if (a !== null && c !== null) { const dd = Math.abs(a - c); if (Math.min(dd, 360 - dd) > TON) g.push(`${etic}: nome colonna ${n} non ha la tonalita' della sua barra ${bar}`); } });
  return g; };
if (!process.env.CPM_SOLO_A) {
  if (R.verde) { const g = giudica(R.verde, 'verde'); if (R.verde.errs && R.verde.errs.length) g.push('verde: errori di pagina ' + R.verde.errs.join(' | ')); fail.push(...g); }
  if (R.rosso) { const g = giudica(R.rosso, 'rosso'); console.log(`rosso: ${g.length} difetti rilevati (atteso > 0): ` + g.slice(0, 4).join(' · '));
    if (SOLO_ROSSO) { console.log(g.length ? '✅ ROSSO come atteso: con __CPM_NO_COL286 le barre non sono dei colori delle squadre / invisibili' : '❌ il rosso non riproduce il difetto'); process.exit(g.length ? 0 : 1); }
    if (!g.length) fail.push('rosso cieco: con __CPM_NO_COL286 il guardiano non vede difetti'); } }
console.log(fail.length ? '❌ FAIL colori-286\n  ' + fail.join('\n  ') : '✅ PASS colori-286 (verde, e il rosso si vede)'); process.exit(fail.length ? 1 : 0);
