#!/usr/bin/env node
/* [giro 222 · PO-481] GUARDIANO dei GUARDALINEE, col GLB ACCESO. Testimone __CPM_G222W (src/12 _w222): a ogni fotogramma disegnato, per ognuno dei
   due guardalinee, la z del marker, se e' nell'inquadratura, se un cartellone sta fra la camera e il petto/la testa, e se copre l'eroe o il pallone.
   Scenari:
     festa-tel   · provino 375x812, festa del fischio finale forzata («Doppietta»): visibilita' dalla camera della festa + divisa (foto ravvicinata)
     festa-pc    · lo stesso a 1280x720
     partita-tel · provino 375x812 giocato in autoplay fino al fischio (2 gol forzati): highlight e festa VERA
   VERDE (soglie dichiarate prima di misurare il verde):
     · POSIZIONE: ogni fotogramma ha |z| in [33,4 · 34,6] — oltre la linea laterale (33,2) e davanti ai cartelloni (34,8);
     · VISIBILI DALLA FESTA: su tutti i fotogrammi della festa almeno il 90% delle linee di vista camera→guardalinee (petto o testa) senza
       cartellone davanti, e fra i fotogrammi in cui e. inquadrato almeno il 90% senza cartellone; servono 2·CPM_MINF misure, altrimenti «non giudicata» = rosso;
     · NON COPRONO IL GIOCO: 0 fotogrammi di highlight/gioco in cui un guardalinee e' davanti all'eroe o al pallone (servono CPM_MINF fotogrammi);
     · DIVISA (foto ravvicinata di lato a scena ferma e ora congelata, maschera = pixel del pezzo dipinto di magenta): maglia GIALLA (tinta 40°-62°,
       saturazione >= 0,40, valore >= 0,55 e distanza RGB dal dichiarato #f4d43c <= 75); pantaloncini e calzettoni SCURI (luminanza mediana <= 70
       su 255 e blu >= rosso). Soglie fissate DOPO la misura a copertura piena (regola 7.517), giorno/sera/notte, rosso e verde: maglia rosso
       saturazione 0,21-0,23 e distanza ~115, verde 0,49-0,53 e ~58; pantaloncini rosso luminanza 108-120, verde 25-32 (la prima stesura diceva
       saturazione >= 0,50, scritta prima di misurare: il verde notturno la mancava di un centesimo, vedi RAPPORTO-giro222).
   ROSSO (CPM_PROVA_ROSSO=1 → __CPM_NO_G222): almeno una delle quattro deve tornare rossa (attesi: posizione e pantaloncini).
   Uso: CPM_CHROME=/opt/pw-browsers/chromium node guardalinee-222.mjs   (CPM_MISURA=1 = esce 0) */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const ROSSO = !!process.env.CPM_PROVA_ROSSO, MISURA = !!process.env.CPM_MISURA;
const Z_MIN = 33.4, Z_MAX = 34.6, VIS_MIN = 0.90, MINF = +(process.env.CPM_MINF || 8);
const SCENARI = (process.env.CPM_SCENARI || 'festa-tel,festa-pc,partita-tel').split(',').filter(Boolean);
/* luce: la divisa si misura a ORA CONGELATA (invariante 7.539), di NOTTE (l'ora in cui gioca il PO) salvo CPM_TOD */
const TOD = process.env.CPM_TOD || 'night';
const TAG = ROSSO ? 'rosso' : (process.env.CPM_PRIMA ? 'prima' : 'dopo');
const FOTO = process.env.CPM_FOTO || path.join(ROOT, 'docs', 'sviluppo', 'giro222'); fs.mkdirSync(FOTO, { recursive: true });
const VP = { tel: { width: 375, height: 812, isMobile: true, hasTouch: true }, pc: { width: 1280, height: 720 } };
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const scene = {}; const guasti = []; const log = []; const divise = {};
const quando = (s) => `[${new Date().toISOString().slice(11, 19)}] ${s}`;
const FESTA = { name: 'Doppietta', kind: 'bigwin', light: true, festa: { titolo: 'Doppietta', punteggio: '2 – 0', avversario: 'FC Islington', casa: false, facce: [{ eroe: true, id: 0 }], voci: [{ n: 2, et: 'gol', oro: true }] } };

function raccogli(nome, frames) {
  const S = scene[nome] ||= { fotogrammi: 0, zFuori: 0, zMin: 99, zMax: 0, inQ: 0, dietro: 0, copre: 0, coppie: 0, coppieDietro: 0, esempi: [] };
  for (const f of frames) {
    if (!f.lin || !f.lin.length) continue; S.fotogrammi++;
    let inQ = false, dietro = false;
    for (const l of f.lin) { if (!l) continue; const az = Math.abs(l.z); S.zMin = Math.min(S.zMin, az); S.zMax = Math.max(S.zMax, az);
      if (az < Z_MIN || az > Z_MAX) { S.zFuori++; if (S.esempi.length < 4) S.esempi.push(`${f.sc} guardalinee ${l.i} a z ${l.z}`); }
      if (l.vis) { S.coppie++; if (l.cartPetto && l.cartTesta) S.coppieDietro++; }
      if (l.inQ) { inQ = true; if (l.cartPetto && l.cartTesta) dietro = true; }
      if (l.copre && l.copre.length) { S.copre++; if (S.esempi.length < 6) S.esempi.push(`${f.sc} guardalinee ${l.i} (x ${l.x}, z ${l.z}) copre ${l.copre.join('+')} · camera ${f.cam}`); } }
    if (inQ) { S.inQ++; if (dietro) S.dietro++; }
  }
}
async function svuota(page, nome) { const fr = await page.evaluate(() => (window.__CPM_G222W || []).splice(0)).catch(() => []); raccogli(nome, fr); }
async function guarda(page, nome, ms) { const t0 = Date.now(); while (Date.now() - t0 < ms) { await sleep(600); await svuota(page, nome); } }
async function nuovaPagina(v, ls) {
  const ctx = await b.newContext({ viewport: { width: VP[v].width, height: VP[v].height }, deviceScaleFactor: 1, isMobile: !!VP[v].isMobile, hasTouch: !!VP[v].hasTouch, serviceWorkers: 'block' });
  await installCdnRoutes(ctx); const page = await ctx.newPage(); if (+process.env.CPM_CPU_LENTO > 1) { /* [giro 353] solo misura: CPU rallentata come un runner conteso */ const cdp = await ctx.newCDPSession(page); await cdp.send('Emulation.setCPUThrottlingRate', { rate: +process.env.CPM_CPU_LENTO }); } const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  await page.addInitScript(o => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; window.__CPM_G222W = []; if (o.r) window.__CPM_NO_G222 = 1; if (o.tod) window.__CPM_TOD = o.tod;
    try { localStorage.setItem('cpm-intro-seen', '1'); if (o.ls) for (const k in o.ls) localStorage.setItem(k, o.ls[k]); } catch (e) {} }, { r: ROSSO, ls: ls || null, tod: TOD });
  return { ctx, page, errs };
}
/* colore a schermo di un pezzo della divisa: due fotografie a scena ferma, la seconda col pezzo dipinto di magenta SUL SUO materiale (colore nero +
   emissivo magenta: un materiale nuovo usciva in un'altra posa, misurato); la maschera sono i
   pixel magenta della seconda con i 4 vicini magenta (bordi esclusi); il colore e' la MEDIANA della prima su quella maschera */
const fotogrammi353 = (page) => page.evaluate(() => new Promise(r => { const t = setTimeout(r, 15000); requestAnimationFrame(() => requestAnimationFrame(() => { clearTimeout(t); r(); })); }));
async function coloreDi(page, i, chi) {
  const a = await page.screenshot({ type: 'png' });
  await page.evaluate(({ i, chi }) => { const m = window.__CPM_HYPER_ASSISTANT_LIST[i]; window.__g222rip = []; m.traverse(o => { if (!o.isMesh || !o.material) return; const n = o.material.name || '';
    if ((chi === 'maglia' && n === 'HyperShirt') || (chi === 'pantaloncini' && n === 'HyperShorts') || (chi === 'gambe' && /^HyperLeg/.test(n))) { const mt = o.material; window.__g222rip.push([mt, mt.color.getHex(), mt.emissive ? mt.emissive.getHex() : null, mt.emissiveIntensity, mt.toneMapped]); mt.color.setHex(0x000000); mt.toneMapped = false; mt.needsUpdate = true; if (mt.emissive) { mt.emissive.setHex(0xff00ff); mt.emissiveIntensity = 1; } } }); }, { i, chi });
  /* [giro 353] dopo la pittura si aspettano due fotogrammi VERI della pagina, non solo 120 ms: sul runner un fotogramma e' arrivato a 750 ms
     (render-3d-023, treno 45406157539) e la foto della maschera usciva senza magenta ("gambe 0 px") */
  await sleep(120); await fotogrammi353(page); const m = await page.screenshot({ type: 'png' }); if (process.env.CPM_DEBUG) { fs.writeFileSync(path.join(FOTO, `debug-${chi}-${i}.png`), m); fs.writeFileSync(path.join(FOTO, `debug-${chi}-${i}-a.png`), a); }
  await page.evaluate(() => { for (const [mt, c, e, ei, tm] of window.__g222rip || []) { mt.color.setHex(c); mt.toneMapped = tm; mt.needsUpdate = true; if (e != null) { mt.emissive.setHex(e); mt.emissiveIntensity = ei; } } });
  await fotogrammi353(page); /* [giro 353] il ripristino si vede prima della foto del pezzo dopo */
  return await page.evaluate(async ({ a, m, chi }) => {
    const img = async (b64) => { const im = new Image(); im.src = 'data:image/png;base64,' + b64; await im.decode(); const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const x = c.getContext('2d'); x.drawImage(im, 0, 0); return x.getImageData(0, 0, c.width, c.height); };
    const A = await img(a), M = await img(m), W = A.width, H = A.height; const mg = (k) => M.data[k] > 200 && M.data[k + 1] < 60 && M.data[k + 2] > 200;
    let pix = []; let y0 = H, y1 = 0;
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { const k = 4 * (y * W + x); if (mg(k) && mg(k - 4) && mg(k + 4) && mg(k - 4 * W) && mg(k + 4 * W)) { pix.push([y, A.data[k], A.data[k + 1], A.data[k + 2]]); y0 = Math.min(y0, y); y1 = Math.max(y1, y); } }
    /* gambe: i calzettoni sono la parte fra il 25% e il 65% dell'altezza visibile della gamba (sopra il ginocchio, sotto lo scarpino: misurato sulla foto della maschera) */
    const tot353 = pix.length;
    if (chi === 'gambe') { const h = y1 - y0; pix = pix.filter(p => p[0] > y0 + h * 0.25 && p[0] < y0 + h * 0.65); }
    /* [giro 353] sotto 30 px si dice anche quanta maschera c'era prima del filtro: 0 = magenta non disegnato, >0 = fascia dei calzettoni vuota */
    if (pix.length < 30) return { n: pix.length, maschera353: tot353, y0, y1 };
    const med = (j) => { const v = pix.map(p => p[j]).sort((p, q) => p - q); return v[v.length >> 1]; };
    const r = med(1), g = med(2), bb = med(3); const mx = Math.max(r, g, bb), mn = Math.min(r, g, bb); let h = 0;
    if (mx > mn) { if (mx === r) h = 60 * (((g - bb) / (mx - mn)) % 6); else if (mx === g) h = 60 * ((bb - r) / (mx - mn) + 2); else h = 60 * ((r - g) / (mx - mn) + 4); } if (h < 0) h += 360;
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * bb;
    return { n: pix.length, rgb: [r, g, bb], tinta: +h.toFixed(0), sat: +(mx ? (mx - mn) / mx : 0).toFixed(2), val: +(mx / 255).toFixed(2), lum: +lum.toFixed(0) };
  }, { a: a.toString('base64'), m: m.toString('base64'), chi });
}
function giudicaDivisa(d) {
  const m = [];
  if (!d.maglia || !d.maglia.rgb) m.push(`maglia non misurata (${d.maglia ? d.maglia.n : 0} px)`);
  else if (!(d.maglia.tinta >= 40 && d.maglia.tinta <= 62 && d.maglia.sat >= 0.40 && d.maglia.val >= 0.55 && Math.hypot(d.maglia.rgb[0] - 244, d.maglia.rgb[1] - 212, d.maglia.rgb[2] - 60) <= 75)) m.push(`maglia non gialla ${JSON.stringify(d.maglia)}`);
  for (const k of ['pantaloncini', 'gambe']) { const c = d[k]; if (!c || !c.rgb) m.push(`${k} non misurati (${c ? c.n : 0} px)`); else if (!(c.lum <= 70 && c.rgb[2] >= c.rgb[0])) m.push(`${k === 'gambe' ? 'calzettoni' : k} non scuri ${JSON.stringify(c)}`); }
  return m;
}
async function festa(v) {
  const nomeSc = 'festa-' + v; const { ctx, page, errs } = await nuovaPagina(v);
  try {
    await openMatch(page, port, { name: 'Lin222' });
    await page.waitForFunction(() => window.__CPM_GLB_READY && window.__CPM_HYPER_ASSISTANT_LIST && window.__CPM_HYPER_ASSISTANTS && window.__CPM_HYPER_ASSISTANTS.avatars === 2, null, { timeout: 90000 }).catch(() => guasti.push(`${nomeSc}: guardalinee CGTrader non pronti`));
    await sleep(2500);
    /* la divisa si misura su una scena 3D FERMA (situazione forzata, __CPM_FROZEN): fra le due fotografie della maschera non si muove niente */
    await page.evaluate(() => window.__CPM_FORCE_SIT(0, true)); await sleep(1500); await page.evaluate(() => { window.__CPM_FROZEN = true; }); await sleep(300);
    /* foto ravvicinata di lato (stessa z del guardalinee: nessun cartellone sulla linea di vista), poi i tre pezzi della divisa */
    const d = {};
    for (const i of [0, 1]) {
      await page.evaluate(i => { const m = window.__CPM_HYPER_ASSISTANT_LIST[i]; const p = new THREE.Vector3(); m.getWorldPosition(p); window.__CPM_CAM904 = { x: p.x + 5.2, y: 1.0, z: p.z + (p.z < 0 ? 0.3 : -0.3), lx: p.x, ly: 0.05, lz: p.z }; }, i);
      await sleep(900); await page.screenshot({ path: path.join(FOTO, `${TAG}-${nomeSc}-divisa${i}.jpg`), type: 'jpeg', quality: 80 }).catch(() => {});
      /* per la maschera si nascondono le altre mesh della scena (le luci restano): un compagno o un palo fra camera e guardalinee non entra nella misura */
      await page.evaluate(i => { const m = window.__CPM_HYPER_ASSISTANT_LIST[i]; let sc = m; while (sc.parent) sc = sc.parent; const mio = new Set(); m.traverse(o => mio.add(o));
        window.__g222nasc = []; sc.traverse(o => { if (o.isMesh && o.visible && !mio.has(o)) { o.visible = false; window.__g222nasc.push(o); } }); }, i);
      await sleep(300);
      d[i] = { maglia: await coloreDi(page, i, 'maglia'), pantaloncini: await coloreDi(page, i, 'pantaloncini'), gambe: await coloreDi(page, i, 'gambe') };
      await page.screenshot({ path: path.join(FOTO, `${TAG}-${nomeSc}-divisa${i}-sola.jpg`), type: 'jpeg', quality: 85 }).catch(() => {});
      await page.evaluate(() => { for (const o of window.__g222nasc || []) o.visible = true; });
    }
    await page.evaluate(() => { window.__CPM_CAM_RESET904 && window.__CPM_CAM_RESET904(); window.__CPM_FROZEN = false; });
    divise[nomeSc] = d;
    await page.evaluate(f => { window.__CPM_G222W = []; window.__CPM_FORCE_CEREMONY(f); }, FESTA);
    for (let i = 0; i < 5; i++) { await guarda(page, `${nomeSc}:festa`, 1000); if (i === 1) await page.screenshot({ path: path.join(FOTO, `${TAG}-${nomeSc}.jpg`), type: 'jpeg', quality: 70 }).catch(() => {}); }
  } catch (e) { guasti.push(`${nomeSc}: ${String(e.message).slice(0, 160)}`); }
  if (errs.length) log.push(`${nomeSc}: errori di pagina ${errs.length} → ${errs[0]}`);
  await ctx.close();
}
async function partita(v) {
  const nomeSc = 'partita-' + v; const { ctx, page, errs } = await nuovaPagina(v, { 'cpm-match-speed': '2' });
  try {
    await page.addInitScript(() => { window.__CPM_FESTA942_FORCE = { goals: 2, assists: 0, rb: 18 }; });
    await openMatch(page, port, { skipLoadAll: true, name: 'Festa3' });
    await page.waitForFunction(() => window.__CPM_GLB_READY, null, { timeout: 90000 }).catch(() => {});
    await page.evaluate(() => { window.__CPM_G222W = []; window.__CPM_AUTOPLAY(true, { seed: 4545, policy: 'seeded', tickMs: 300 }); });
    const t0 = Date.now(); let ph = null, foto = 0;
    while (Date.now() - t0 < 420000) { ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null);
      if (ph === 'ceremony' || ph === 'ended') break;
      if (/^hl_/.test(ph || '') || ph === 'playing') { await svuota(page, `${nomeSc}:${ph === 'playing' ? 'gioco' : 'highlight'}`); if (ph === 'hl_result' && foto++ < 2) await page.screenshot({ path: path.join(FOTO, `${TAG}-${nomeSc}-highlight${foto}.jpg`), type: 'jpeg', quality: 70 }).catch(() => {}); }
      else await page.evaluate(() => { window.__CPM_G222W = []; }).catch(() => {});
      await sleep(500); }
    log.push(quando(`${nomeSc}: fischio finale → ${ph} dopo ${((Date.now() - t0) / 1000).toFixed(0)} s`));
    if (ph === 'ceremony') { await page.evaluate(() => { window.__CPM_G222W = []; }); for (let i = 0; i < 6; i++) { await guarda(page, `${nomeSc}:festa`, 1000); if (i === 2) await page.screenshot({ path: path.join(FOTO, `${TAG}-${nomeSc}-festa.jpg`), type: 'jpeg', quality: 70 }).catch(() => {}); } }
  } catch (e) { guasti.push(`${nomeSc}: ${String(e.message).slice(0, 160)}`); }
  if (errs.length) log.push(`${nomeSc}: errori di pagina ${errs.length} → ${errs[0]}`);
  await ctx.close();
}

for (const sc of SCENARI) {
  log.push(quando('scenario ' + sc));
  if (sc === 'festa-tel') await festa('tel'); else if (sc === 'festa-pc') await festa('pc'); else if (sc === 'partita-tel') await partita('tel');
}
await b.close(); srv.close();

console.log(`\n=== GUARDALINEE-222 · linea laterale, festa, gioco, divisa === ${ROSSO ? '[ROSSO __CPM_NO_G222]' : '[VERDE]'}  |z| in [${Z_MIN}·${Z_MAX}] · visibili in festa >= ${VIS_MIN * 100}% · 0 coperture · divisa gialla/scura`);
log.forEach(x => console.log('  ' + x));
const esiti = { posizione: [], festa: [], gioco: [], divisa: [] }; const nonGiud = [];
for (const [k, S] of Object.entries(scene)) {
  console.log(`  · ${k.padEnd(26)} fotogrammi ${S.fotogrammi} · |z| ${S.zMin.toFixed(2)}–${S.zMax.toFixed(2)} (fuori ${S.zFuori}) · linea di vista coperta da un cartellone ${S.coppieDietro}/${S.coppie} · inquadrati ${S.inQ} (dietro i cartelloni ${S.dietro}) · coperture ${S.copre}`);
  S.esempi.forEach(e => console.log('      ' + e));
  if (S.fotogrammi >= MINF && S.zFuori) esiti.posizione.push(`${k}: ${S.zFuori} fotogrammi con |z| fuori`);
  /* VISIBILI DALLA FESTA = linea di vista libera dalla camera della festa (petto o testa senza cartellone davanti), su tutti i fotogrammi e i due
     guardalinee: la camera della festa li inquadra di rado (dichiarato a parte: «inquadrati»), quindi si giudica la linea di vista */
  if (/:festa$/.test(k)) { if (S.coppie < 2 * MINF) nonGiud.push(`${k} (${S.coppie} misure di linea di vista)`); else if (1 - S.coppieDietro / S.coppie < VIS_MIN) esiti.festa.push(`${k}: linea di vista libera ${((1 - S.coppieDietro / S.coppie) * 100).toFixed(0)}% < ${VIS_MIN * 100}%`); if (S.inQ && S.dietro / S.inQ > 1 - VIS_MIN) esiti.festa.push(`${k}: inquadrati ma dietro un cartellone ${S.dietro}/${S.inQ}`); }
  if (/:(highlight|gioco)$/.test(k) && S.copre) esiti.gioco.push(`${k}: ${S.copre} fotogrammi con un guardalinee davanti al gioco`);
}
for (const sc of SCENARI) {
  if (/^festa-/.test(sc)) { if (!scene[`${sc}:festa`] || scene[`${sc}:festa`].fotogrammi < MINF) nonGiud.push(`${sc}:festa (fotogrammi ${scene[`${sc}:festa`] ? scene[`${sc}:festa`].fotogrammi : 0})`);
    const d = divise[sc]; if (!d) nonGiud.push(`${sc}: divisa non misurata`); else for (const i of [0, 1]) { console.log(`  · ${sc} divisa guardalinee ${i}: ${JSON.stringify(d[i])}`); const m = giudicaDivisa(d[i]); m.forEach(x => esiti.divisa.push(`${sc} guardalinee ${i}: ${x}`)); } }
  if (sc === 'partita-tel') for (const k of ['highlight', 'festa']) { const h = scene['partita-tel:' + k]; if (!h || h.fotogrammi < MINF) nonGiud.push(`partita-tel:${k} (${h ? h.fotogrammi : 0} fotogrammi)`); }
}
for (const [k, v] of Object.entries(esiti)) console.log(`  ${v.length ? '✗' : '✓'} ${k}${v.length ? ': ' + v.join(' · ') : ''}`);
nonGiud.forEach(x => console.log('  ✗ NON GIUDICATA ' + x)); guasti.forEach(g => console.log('  ✗ ' + g));
fs.writeFileSync(path.join(FOTO, `misura-${TAG}.json`), JSON.stringify({ scene, divise, log, guasti }, null, 1));
const rossi = Object.values(esiti).reduce((s, v) => s + v.length, 0);
let ok;
if (ROSSO) { ok = rossi > 0 && !guasti.length; console.log(ok ? `\n✅ difetto riprodotto — col rosso __CPM_NO_G222 ${rossi} verdetti rossi (${Object.entries(esiti).filter(([k, v]) => v.length).map(([k]) => k).join(', ')})` : '\n❌ FAIL — col rosso il guardiano non vede il difetto (o la misura non e\' partita)'); }
else { ok = !rossi && !nonGiud.length && !guasti.length; console.log(ok ? `\n✅ PASS — guardalinee sulla linea laterale, visibili dalla festa, mai davanti al gioco, in divisa` : `\n❌ FAIL — ${rossi} verdetti rossi · non giudicate: ${nonGiud.length}`); }
process.exit(MISURA ? 0 : (ok ? 0 : 1));
