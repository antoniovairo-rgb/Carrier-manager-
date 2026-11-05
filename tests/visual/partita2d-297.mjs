#!/usr/bin/env node
/* [giro 92 PO-297 guardiano — «Migliora la grafica della partita 2D, c'e' troppo nero attorno al campo», foto PO docs/governo/foto/
   po297-partita2d-bordo.jpg sulla 7.999.178]. Su telefono 412x915 (tocco) e PC 1366x768 (mouse), dal salvataggio
   fixtures/save-194-primavera-w38.json fino alla partita di carriera in 2D (pre-partita → ingresso saltato → gioco fluido):
   A) SPALTI: sulla tela del campo 2D, fra i pixel FUORI dal campo (rettangolo delle linee allargato di 3 px), la quota di pixel «neri»
      (canale piu' alto < 40, cioe' il fondo #0a1220→#050a14 di prima e piu' scuro) resta sotto SOGLIA_NERO (25%). La soglia: il fondo dei
      gradoni (#26324a) e' sopra 40 per costruzione, quindi il nero che resta e' solo ombra degli angoli e divisori; la 178 misura ~100%.
      E i colori: fra i pixel della tribuna (fuori dall'erba esterna) almeno il 4% ha la tinta della squadra di casa dello stadio e, dentro lo
      spicchio ospiti, almeno il 4% quella degli ospiti; le due tinte sono quelle dichiarate dal testimone __CPM_W297 (maglie
      _mkits.homeShirt/awayShirt passate per colori286) e distano fra loro.
      Il lampo del gol: col punteggio che cambia (__CPM_SALTA297) la tribuna si accende (__CPM_LAMPO297) e torna normale entro 2 s.
   B) BARRA: a pannello CHIUSO la barra «Statistiche / Pagelle» non copre nessuno dei ventidue (centro del pallino entro il rettangolo della
      barra allargato del raggio), su 10 campioni in 3 s (subito dopo l'ingresso: gli highlight in calendario spengono il 2D dall'8').
   C) SQUADRE FISSE: portati minuto e punteggio nel primo tempo (30', 2-1) e poi nel secondo (60', 2-1), l'intestazione ha a sinistra la
      STESSA squadra e lo STESSO numero in entrambi i tempi (e data-specchio=0); lo scudo di casa sta a sinistra di quello ospite.
   + fps: media dei fotogrammi (rAF) in 4 s di gioco 2D e costo dello sfondo (una volta) e del tratto per-fotogramma toccato — solo
     dichiarati (headless senza GPU), si confrontano i due bracci.
   ROSSO: CPM_PROVA_ROSSO=1 accende __CPM_NO_SPALTI297, __CPM_NO_BARRA297, __CPM_NO_FISSE297 e pretende che A, B e C cadano (B: su almeno un
   formato; il pallino coperto dipende da dove sono i giocatori, quindi nel rosso si contano i campioni coperti su tutti i formati).
   CPM_FOTO_297=<cartella> salva le foto (partita, gol) per formato; CPM_SOLO_ROSSO=1 gira solo il braccio rosso senza giudicare (foto «prima»).
   Non prova dispositivi veri. */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-194-primavera-w38.json', import.meta.url)));
const FORMATI = {
  tel: { nome: 'Telefono 412x915', w: 412, h: 915, touch: true },
  pc: { nome: 'PC 1366x768', w: 1366, h: 768, touch: false },
};
const SCELTI = (process.env.CPM_FORMATI || 'tel,pc').split(',').filter(k => FORMATI[k]);
const ROSSO_ON = !!process.env.CPM_PROVA_ROSSO, SOLO_ROSSO = !!process.env.CPM_SOLO_ROSSO, FOTO = process.env.CPM_FOTO_297 || '';
const SOGLIA_NERO = 0.25, SOGLIA_TINTA = 0.04;
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();

const PIXEL = () => { /* gira nella pagina: quota di nero fuori dal campo, quote di tinta casa/ospiti negli spalti */
  const W = window.__CPM_W297, cv = window.__CPM_CAMPO2D_CV && window.__CPM_CAMPO2D_CV(); if (!W || !cv) return null;
  const c = document.createElement('canvas'); c.width = cv.width; c.height = cv.height; const x = c.getContext('2d'); x.drawImage(cv, 0, 0);
  const d = x.getImageData(0, 0, c.width, c.height).data, k = cv.width / W.cv[2];
  const loc = r => [(r[0] - W.cv[0]) * k, (r[1] - W.cv[1]) * k, r[2] * k, r[3] * k];
  const campo = loc(W.campo), erba = loc(W.erba), osp = loc(W.osp), m = 3 * k;
  const den = (r, px, py, mm = 0) => px >= r[0] - mm && px <= r[0] + r[2] + mm && py >= r[1] - mm && py <= r[1] + r[3] + mm;
  const hex = h => { const n = parseInt(String(h || '').replace('#', ''), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const P = W.spalti, tc = P ? hex(P.casa[0]) : null, to = P ? hex(P.osp[0]) : null, vic = (a, r, g, bb) => Math.abs(a[0] - r) + Math.abs(a[1] - g) + Math.abs(a[2] - bb) < 60;
  let fuori = 0, neri = 0, trib = 0, casa = 0, tribO = 0, ospN = 0;
  for (let py = 0; py < c.height; py += 2) for (let px = 0; px < c.width; px += 2) {
    if (den(campo, px, py, m)) continue; const i = (py * c.width + px) * 4, r = d[i], g = d[i + 1], bb = d[i + 2];
    fuori++; if (Math.max(r, g, bb) < 40) neri++;
    if (den(erba, px, py, 6 * k)) continue;
    if (den(osp, px, py)) { tribO++; if (to && vic(to, r, g, bb)) ospN++; } else { trib++; if (tc && vic(tc, r, g, bb)) casa++; }
  }
  return { fuori, nero: +(neri / Math.max(1, fuori)).toFixed(3), trib, casa: +(casa / Math.max(1, trib)).toFixed(3), tribO, osp: +(ospN / Math.max(1, tribO)).toFixed(3), spalti: P };
};
const BARRA = () => { /* rettangolo della barra Statistiche/Pagelle e pallini sotto */
  const W = window.__CPM_W297, li = document.querySelector('[data-cpm="linguette918"]'); if (!W || !li) return null;
  const r = li.getBoundingClientRect(), R = W.r || 7, sotto = W.gioc.filter(p => p[0] >= r.left - R && p[0] <= r.right + R && p[1] >= r.top - R && p[1] <= r.bottom + R).length;
  const c = W.campo, inter = (r.left >= c[0] + c[2] || r.right <= c[0]) ? 0 : Math.max(0, Math.min(r.bottom, c[1] + c[3]) - Math.max(r.top, c[1]));
  if (W.vert === undefined) return null;
  return { fuoriCampo: r.left >= W.campo[0] + W.campo[2] || r.right <= W.campo[0] || r.top >= W.campo[1] + W.campo[3] || r.bottom <= W.campo[1], barra: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], campo: c, sotto, campoCoperto: Math.round(inter), aperto: !!document.querySelector('[data-cpm="linguette918"] button[aria-label="Nascondi"]') };
};
const TESTATA = () => { /* l'intestazione: squadra e numero a sinistra */
  const vis = e => { if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const barre = [...document.querySelectorAll('[data-cpm="barra"]')].filter(vis); const ba = barre[0]; if (!ba) return null;
  const sc = ba.querySelector('[data-cpm="scudo-casa"]'), so = ba.querySelector('[data-cpm="scudo-ospiti"]'); if (!sc || !so) return null;
  const rc = sc.getBoundingClientRect(), ro = so.getBoundingClientRect(); const sx = rc.left < ro.left ? sc : so;
  const nome = (sx.innerText || '').split('\n').map(q => q.trim()).filter(q => q && !/^\d+$/.test(q))[0] || '';
  const nums = []; const walk = n => { for (const ch of n.children) { const t = (ch.innerText || '').trim(); if (/^\d+$/.test(t) && ch.children.length === 0 && vis(ch)) nums.push({ v: +t, x: ch.getBoundingClientRect().left }); else walk(ch); } };
  walk(ba); nums.sort((p, q) => p.x - q.x);
  return { specchio: ba.getAttribute('data-specchio'), nomeSx: nome, casaSx: rc.left < ro.left, numSx: nums.length ? nums[0].v : null, numDx: nums.length ? nums[nums.length - 1].v : null, clock: window.__CPM_CLOCK && window.__CPM_CLOCK() };
};
const FPS = async page => page.evaluate(() => new Promise(res => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 4000) requestAnimationFrame(f); else res(+(n / ((performance.now() - t0) / 1000)).toFixed(1)); }; requestAnimationFrame(f); }));

async function giro(sigla, rosso) {
  const f = FORMATI[sigla], mis = {}, ko = []; const opt = { viewport: { width: f.w, height: f.h }, serviceWorkers: 'block' }; if (f.touch) { opt.hasTouch = true; opt.isMobile = true; }
  const ctx = await b.newContext(opt); const page = await ctx.newPage(); await installCdnRoutes(page); const errs = [];
  page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  if (rosso) await page.addInitScript(() => { window.__CPM_NO_SPALTI297 = true; window.__CPM_NO_BARRA297 = true; window.__CPM_NO_FISSE297 = true; });
  await page.addInitScript(s => { try { if (!localStorage.getItem('cpm-v3')) localStorage.setItem('cpm-v3', JSON.stringify(s)); } catch (e) {} window.__CPM_W297 = {}; }, SAVE);
  const foto = async nome => { if (FOTO && (!rosso || SOLO_ROSSO)) { fs.mkdirSync(FOTO, { recursive: true }); await page.screenshot({ path: `${FOTO}/${rosso ? 'prima' : 'dopo'}-${sigla}-${nome}.png` }).catch(() => {}); } };
  try {
    await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => [...document.querySelectorAll('button')].some(x => /Continua/.test(x.textContent || '')), null, { timeout: 90000 }); await sleep(800);
    await page.evaluate(() => [...document.querySelectorAll('button')].find(x => /Continua/.test(x.textContent || '')).click());
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 40000 }); await sleep(2000);
    await page.evaluate(() => window.__CPM_CAREER.dismiss()); await sleep(500);
    await page.evaluate(() => window.__CPM_CAREER.playMatch());
    await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE(), null, { timeout: 30000 }); await sleep(1500);
    await page.keyboard.press('Enter'); await sleep(1500); await page.keyboard.press('Enter');
    for (let i = 0; i < 40; i++) { await sleep(500); const ok = await page.evaluate(() => { const x = [...document.querySelectorAll('button')].find(q => /Salta ingresso/.test(q.textContent || '')); if (x) { x.click(); return true; } return false; }); if (ok) break; }
    await page.waitForFunction(() => window.__CPM_PHASE() === 'playing' && window.__CPM_W297 && window.__CPM_W297.campo, null, { timeout: 60000 });
    /* il pannello chiuso: e' lo stato della foto del PO */
    await page.evaluate(() => { const x = document.querySelector('[data-cpm="linguette918"] button[aria-label="Nascondi"]'); if (x) x.click(); }); await sleep(1200);
    const sotto = [], fasi = []; let barra = null; for (let i = 0; i < 10; i++) { const fa = await page.evaluate(() => window.__CPM_PHASE()); fasi.push(fa); if (fa === 'playing') { const q = await page.evaluate(BARRA); if (q) { sotto.push(q.fuoriCampo ? 0 : q.sotto); barra = q; } } await sleep(300); }
    mis.barra = { ...barra, fasi: [...new Set(fasi)].join(','), linguette: await page.evaluate(() => !!document.querySelector('[data-cpm="linguette918"]')), campioni: sotto.length, coperti: sotto.filter(v => v > 0).length, max: Math.max(0, ...sotto) };
    mis.pixel = await page.evaluate(PIXEL); await foto('partita');
    mis.costo = await page.evaluate(() => ({ sfondo: window.__CPM_W297.msSfondo, fotogramma: window.__CPM_W297.ms }));
    /* il gol, nei primi minuti (prima degli highlight in calendario, che spengono il 2D): un gol in piu' alla squadra dell'eroe */
    await page.evaluate(() => { window.__CPM_LAMPO297 = null; const s = window.__CPM_SCORE(); window.__CPM_SALTA297(window.__CPM_CLOCK(), s.home + 1, s.away); });
    await page.waitForFunction(() => window.__CPM_LAMPO297 && window.__CPM_LAMPO297.ms < 900, null, { timeout: 4000, polling: 50 }).catch(() => {}); await foto('gol');
    mis.lampo = await page.evaluate(() => window.__CPM_LAMPO297); await sleep(2200);
    mis.lampoSpento = await page.evaluate(() => !!(window.__CPM_LAMPO297 && window.__CPM_LAMPO297.spento));
    mis.pixelDopo = await page.evaluate(PIXEL);
    mis.fps = await FPS(page);
    /* pausa: il cronometro si ferma (niente highlight in calendario che spengono il 2D), il campo 2D continua a disegnarsi */
    mis.pausa = await page.evaluate(() => { const x = [...document.querySelectorAll('button')].find(q => (q.textContent || '').trim() === '⏸'); if (x) { x.click(); return true; } return false; }); await sleep(800);
    await page.evaluate(() => window.__CPM_SALTA297(30, 2, 1)); await sleep(1500); mis.t1 = await page.evaluate(TESTATA);
    await page.evaluate(() => window.__CPM_SALTA297(60, 3, 1)); await sleep(1500);
    mis.t2 = await page.evaluate(TESTATA); await foto('ripresa');
  } catch (e) { ko.push('eccezione: ' + String(e && e.message || e).slice(0, 160)); }
  if (errs.length) ko.push('pageerror: ' + errs.slice(0, 2).join(' | '));
  await ctx.close(); return { mis, ko };
}
function giudica(r) {
  const m = r.mis, A = [], B = [], C = [];
  const p = m.pixel; if (!p) A.push('A: tela del campo 2D non misurabile'); else {
    if (p.nero > SOGLIA_NERO) A.push(`A: nero fuori dal campo ${(p.nero * 100).toFixed(1)}% (massimo ${SOGLIA_NERO * 100}%)`);
    if (!p.spalti) A.push('A: spalti non dichiarati dal testimone');
    else { if (p.casa < SOGLIA_TINTA) A.push(`A: tinta di casa negli spalti ${(p.casa * 100).toFixed(1)}% (minimo ${SOGLIA_TINTA * 100}%)`);
      if (p.tribO > 2000 && p.osp < SOGLIA_TINTA) A.push(`A: tinta ospite nello spicchio ${(p.osp * 100).toFixed(1)}% (minimo ${SOGLIA_TINTA * 100}%)`);
      if (p.spalti.casa[0] === p.spalti.osp[0]) A.push('A: casa e ospiti con la stessa tinta'); }
  }
  if (!m.lampo || !m.lampo.n) A.push('A: al gol la tribuna non si accende'); else if (!m.lampoSpento) A.push(`A: lampo non spento dopo 2,2 s`);
  const q = m.barra; if (!q || q.campioni < 4) B.push(`B: barra non misurabile (${q ? q.campioni : 0} campioni in gioco fluido, minimo 4)`); else if (q.coperti) B.push(`B: barra Statistiche/Pagelle sopra ${q.max} pallini (${q.coperti}/${q.campioni} campioni), barra ${JSON.stringify(q.barra)}`);
  const t1 = m.t1, t2 = m.t2; if (!t1 || !t2) C.push('C: intestazione non misurabile'); else {
    if (t2.specchio !== '0') C.push(`C: nel 2° tempo l'intestazione si specchia (data-specchio=${t2.specchio})`);
    if (t1.nomeSx !== t2.nomeSx) C.push(`C: a sinistra ${t1.nomeSx} nel 1° tempo e ${t2.nomeSx} nel 2°`);
    if (t1.numSx !== 2 && t1.numSx !== 1) C.push(`C: numero a sinistra non letto (${t1.numSx})`);
    if (t2.numSx == null || (t1.numSx === 2 ? t2.numSx !== 3 : t2.numSx !== 1)) C.push(`C: il numero a sinistra cambia squadra (1° tempo ${t1.numSx}, 2° tempo ${t2.numSx})`);
    if (!t2.casaSx) C.push('C: nel 2° tempo lo scudo di casa non e\' a sinistra');
  }
  return { A, B, C, altro: r.ko };
}
let fallito = false; const tutti = {};
for (const sg of SCELTI) {
  const bracci = SOLO_ROSSO ? [true] : ROSSO_ON ? [false, true] : [false];
  for (const rosso of bracci) {
    const r = await giro(sg, rosso); const g = giudica(r); tutti[sg + (rosso ? '-rosso' : '')] = { r, g };
    const m = r.mis;
    console.log(`\n[${FORMATI[sg].nome}${rosso ? ' — ROSSO' : ''}] nero ${m.pixel ? (m.pixel.nero * 100).toFixed(1) + '%' : '-'} su ${m.pixel ? m.pixel.fuori : 0} px fuori campo · tinta casa ${m.pixel ? (m.pixel.casa * 100).toFixed(1) : '-'}% · ospiti ${m.pixel ? (m.pixel.osp * 100).toFixed(1) : '-'}% (spicchio ${m.pixel ? m.pixel.tribO : 0} px)`);
    console.log(`  barra ${m.barra ? JSON.stringify(m.barra.barra) : '-'} campo ${m.barra ? JSON.stringify(m.barra.campo) : '-'} campo coperto ${m.barra ? m.barra.campoCoperto : "-"} px fasi ${m.barra && m.barra.fasi} ling ${m.barra && m.barra.linguette} · pallini sotto: ${m.barra ? m.barra.coperti + '/' + m.barra.campioni + ' campioni, max ' + m.barra.max : '-'}`);
    console.log(`  testata 1° ${JSON.stringify(m.t1)} · 2° ${JSON.stringify(m.t2)}`);
    console.log(`  spalti ${m.pixel && JSON.stringify(m.pixel.spalti)}`);
    console.log(`  lampo ${JSON.stringify(m.lampo)} · fps ${m.fps} · costo sfondo ${m.costo && m.costo.sfondo} ms, tratto per-fotogramma ${m.costo && m.costo.fotogramma} ms`);
    for (const k of ['A', 'B', 'C', 'altro']) for (const x of g[k]) console.log('   ' + (rosso ? '·' : '✗') + ' ' + x);
    if (!rosso && !SOLO_ROSSO && (g.A.length || g.B.length || g.C.length || g.altro.length)) fallito = true;
  }
}
if (ROSSO_ON && !SOLO_ROSSO) {
  const R = Object.entries(tutti).filter(([k]) => k.endsWith('-rosso')).map(([, v]) => v.g);
  const cadeA = R.every(g => g.A.length), cadeC = R.every(g => g.C.length), cadeB = R.some(g => g.B.length);
  console.log(`\nROSSO: A ${cadeA ? 'cade' : 'NON cade'} · B ${cadeB ? 'cade' : 'NON cade'} · C ${cadeC ? 'cade' : 'NON cade'}`);
  if (!cadeA || !cadeB || !cadeC) fallito = true;
}
await b.close(); srv.close();
console.log(SOLO_ROSSO ? '\n(solo rosso: nessun giudizio)' : fallito ? '\n❌ partita2d-297 ROSSO' : '\n✅ partita2d-297 VERDE');
process.exit(SOLO_ROSSO ? 0 : fallito ? 1 : 0);
