#!/usr/bin/env node
/* [giro 107 · collaudo 180, richiesta PO 06/11: «durante la partita 2D rivedere il posizionamento e la logica della freccetta sulle
   statistiche / pagelle»] GUARDIANO della freccetta del pannello Statistiche/Pagelle (PannelloLive2D, src/15).
   Dal salvataggio fixtures/save-194-primavera-w38.json fino alla partita di carriera in 2D (ingresso saltato, gioco fluido, poi pausa),
   in trasferta su 360x800 · 412x915 · 820x1180 (tocco) · 1440x900 (mouse) e IN CASA su 412x915 (si scambia la sede della gara di
   campionato rimasta con quella gia' giocata contro lo stesso avversario, calendario e storico insieme: le guardie anti-loop lo pretendono).
   A) SIMBOLO: il verso promesso dal simbolo e' quello in cui compare il contenuto. Da aperto il contenuto sta SOTTO la barra, quindi il
      simbolo punta in giu' (chevron ruotato o «▾»); da chiuso NON deve puntare in su («▴»), perche' il pannello si apre sotto.
      `aria-expanded` uguale allo stato; contenuto presente se e solo se aperto.
   B) TOCCO: freccia e linguette almeno 44x44 px (linguette: altezza) in ogni formato.
   C) LOGICA: a pannello chiuso, toccare «Statistiche» apre il pannello su Statistiche; la freccia apre e richiude; al 46' (secondo
      tempo, __CPM_SALTA297) lo stato aperto/chiuso e la vista restano quelli scelti.
   D) POSIZIONE: barra/pannello non si sovrappongono alla striscia alta, al tabellone e alla cronaca; la freccia sta dentro lo schermo con
      almeno 4 px dai bordi; in casa e in trasferta la freccia sta nello stesso posto (412x915).
   ROSSO: CPM_PROVA_ROSSO=1 accende __CPM_NO_G107A/B/C e pretende che A, B e C cadano (su 412x915 e 1440x900).
   CPM_FOTO_107=<cartella> salva le foto (chiuso/aperto per formato). Non prova dispositivi veri. */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-194-primavera-w38.json', import.meta.url)));
const FORMATI = { s360: [360, 800, 1], s412: [412, 915, 1], t820: [820, 1180, 1], pc: [1440, 900, 0] };
const ROSSO_ON = !!process.env.CPM_PROVA_ROSSO, FOTO = process.env.CPM_FOTO_107 || '';
const GIRI = [['s360', 0], ['s412', 0], ['s412', 1], ['t820', 0], ['pc', 0]];
const GIRI_ROSSO = [['s412', 0], ['pc', 0]];
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const MIS = () => {
  const R = e => { if (!e) return null; const r = e.getBoundingClientRect(); return r.width ? [r.left, r.top, r.width, r.height].map(v => Math.round(v)) : null; };
  const li = document.querySelector('[data-cpm="linguette918"]'); if (!li) return null; const bs = [...li.querySelectorAll('button')]; const bt = bs[bs.length - 1];
  const ch = bt.querySelector('[data-verso]');
  let simbolo = (bt.textContent || '').trim(); let verso = simbolo === '▴' ? 'su' : simbolo === '▾' ? 'giu' : '?';
  /* la rotazione si legge dallo stile dichiarato (stato d'arrivo): quella calcolata, a meta' della transizione, e' un angolo intermedio */
  if (ch) { const m = /rotate\((-?\d+)deg\)/.exec(ch.style.transform || ''); const ang = m ? +m[1] : 0; verso = ang === 90 ? 'giu' : ang === 0 ? 'destra' : ang === -90 ? 'su' : 'ang' + ang; }
  const cont = li.children.length > 1 ? R(li.children[1]) : null;
  return { aperto: !!cont, vista: (bs.find(x => x.getAttribute('aria-pressed') === 'true' || /0\.2/.test(x.style.background)) || {}).textContent || null,
    simbolo, verso, ariaExp: bt.getAttribute('aria-expanded'), freccia: R(bt), linguette: bs.slice(0, -1).map(R), barra: R(li.firstElementChild), pannello: R(li), contenuto: cont,
    striscia: R(document.querySelector('[data-cpm="striscia918"]')), tabellone: R([...document.querySelectorAll('[data-cpm="barra"]')].find(e => e.getBoundingClientRect().width)),
    /* la cronaca si misura sul TESTO: il riquadro com661 ha un'imbottitura trasparente sopra la riga (t820: riquadro da 963, testo da 990) */
    cronaca: (() => { const c = document.querySelector('[data-cpm="com661"]'); if (!c) return null; let u = null; const tw = document.createTreeWalker(c, NodeFilter.SHOW_TEXT); let n;
      while ((n = tw.nextNode())) { if (!(n.nodeValue || '').trim()) continue; const rg = document.createRange(); rg.selectNodeContents(n); for (const r of rg.getClientRects()) { if (r.width < 1) continue; u = u ? [Math.min(u[0], r.left), Math.min(u[1], r.top), Math.max(u[2], r.right), Math.max(u[3], r.bottom)] : [r.left, r.top, r.right, r.bottom]; } }
      return u ? [u[0], u[1], u[2] - u[0], u[3] - u[1]].map(v => Math.round(v)) : null; })(), W: innerWidth, H: innerHeight, clock: window.__CPM_CLOCK && window.__CPM_CLOCK() };
};
const freccia = page => page.evaluate(() => { const li = document.querySelector('[data-cpm="linguette918"]'); [...li.querySelectorAll('button')].pop().click(); });
const linguetta = (page, t) => page.evaluate(t => { const li = document.querySelector('[data-cpm="linguette918"]'); [...li.querySelectorAll('button')].find(x => (x.textContent || '').trim() === t).click(); }, t);
async function giro(k, casa, rosso) {
  const [w, h, touch] = FORMATI[k]; const opt = { viewport: { width: w, height: h }, serviceWorkers: 'block' }; if (touch) { opt.hasTouch = true; opt.isMobile = true; }
  const ctx = await b.newContext(opt); const page = await ctx.newPage(); await installCdnRoutes(page); const errs = [], ko = [], M = {};
  page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  if (rosso) await page.addInitScript(() => { window.__CPM_NO_G107A = true; window.__CPM_NO_G107B = true; window.__CPM_NO_G107C = true; });
  const S = JSON.parse(JSON.stringify(SAVE));
  if (casa) { const c = S.player.calendar; const u = c.find(m => !m.played); const g = c.find(m => m.played && m.opponentId === u.opponentId && m.isHome); if (g) g.isHome = false; u.isHome = true;
    for (const x of (S.player.matchHistory || [])) if (x.opponent === u.opponentName && x.isHome) x.isHome = false; }
  await page.addInitScript(s => { try { if (!localStorage.getItem('cpm-v3')) localStorage.setItem('cpm-v3', JSON.stringify(s)); } catch (e) {} window.__CPM_W297 = {}; }, S);
  const foto = async n => { if (FOTO && !rosso) { fs.mkdirSync(FOTO, { recursive: true }); await page.screenshot({ path: `${FOTO}/freccia-${k}-${casa ? 'casa' : 'trasf'}-${n}.png` }).catch(() => {}); } };
  try {
    await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => [...document.querySelectorAll('button')].some(x => /Continua/.test(x.textContent || '')), null, { timeout: 90000 }); await sleep(800);
    await page.evaluate(() => [...document.querySelectorAll('button')].find(x => /Continua/.test(x.textContent || '')).click());
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 40000 }); await sleep(2000);
    await page.evaluate(() => window.__CPM_CAREER.dismiss()); await sleep(500);
    M.pm = await page.evaluate(() => window.__CPM_CAREER.playMatch());
    await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE(), null, { timeout: 30000 }); await sleep(1500);
    await page.keyboard.press('Enter'); await sleep(1500); await page.keyboard.press('Enter');
    for (let i = 0; i < 40; i++) { await sleep(500); const ok = await page.evaluate(() => { const x = [...document.querySelectorAll('button')].find(q => /Salta ingresso/.test(q.textContent || '')); if (x) { x.click(); return true; } return false; }); if (ok) break; }
    await page.waitForFunction(() => window.__CPM_PHASE() === 'playing' && document.querySelector('[data-cpm="linguette918"]'), null, { timeout: 60000 });
    await sleep(500); M.sede = await page.evaluate(() => { const t = document.body.innerText || ''; return /FC LAGUNA/i.test(t.split('\n').slice(0, 6).join(' ').split(/\d+\s*-\s*\d+/)[0] || '') ? 'casa-a-sinistra' : 'ospite-a-sinistra'; });
    /* foto dal vivo (niente pausa: la pausa vela lo schermo) */
    const s0 = await page.evaluate(MIS); if (s0 && s0.aperto) await freccia(page); await sleep(500); await foto('1-chiuso');
    await freccia(page); await sleep(500); await foto('2-aperto'); await freccia(page); await sleep(400);
    /* da qui in pausa: il cronometro si ferma e gli highlight non spengono il 2D */
    await page.evaluate(() => { const x = [...document.querySelectorAll('button')].find(q => (q.textContent || '').trim() === '⏸'); if (x) x.click(); }); await sleep(500);
    M.chiuso = await page.evaluate(MIS);
    await freccia(page); await sleep(500); M.aperto = await page.evaluate(MIS);
    await freccia(page); await sleep(500); M.richiuso = await page.evaluate(MIS);
    await linguetta(page, 'Statistiche'); await sleep(500); M.daLinguetta = await page.evaluate(MIS);
    await page.evaluate(() => window.__CPM_SALTA297(46, 1, 0)); await sleep(1200); M.al46 = await page.evaluate(MIS);
  } catch (e) { ko.push('eccezione: ' + String(e && e.message || e).slice(0, 160)); }
  if (errs.length) ko.push('pageerror: ' + errs.slice(0, 2).join(' | '));
  await ctx.close(); return { k, casa, M, ko };
}
const sov = (a, c) => a && c && Math.min(a[0] + a[2], c[0] + c[2]) - Math.max(a[0], c[0]) > 1 && Math.min(a[1] + a[3], c[1] + c[3]) - Math.max(a[1], c[1]) > 1;
function giudica(r) {
  const { M } = r, A = [], B = [], C = [], D = [];
  if (!M.chiuso || !M.aperto) return { A: ['A: pannello non misurato'], B: ['B: non misurato'], C: ['C: non misurato'], D: [], altro: r.ko };
  for (const [n, s] of [['chiuso', M.chiuso], ['aperto', M.aperto], ['richiuso', M.richiuso]]) {
    if (s.ariaExp !== String(s.aperto)) A.push(`A: ${n}: aria-expanded=${s.ariaExp} ma il pannello e' ${s.aperto ? 'aperto' : 'chiuso'}`);
    if (s.aperto && s.verso !== 'giu') A.push(`A: ${n}: contenuto sotto la barra ma il simbolo «${s.simbolo}» punta ${s.verso}`);
    if (!s.aperto && s.verso === 'su') A.push(`A: ${n}: il pannello si apre sotto ma il simbolo «${s.simbolo}» punta in su`);
    if (s.aperto && s.contenuto && s.contenuto[1] < s.barra[1] + s.barra[3] - 1) A.push(`A: ${n}: il contenuto non sta sotto la barra`);
  }
  for (const [n, s] of [['chiuso', M.chiuso], ['aperto', M.aperto]]) {
    const f = s.freccia; if (!f || f[2] < 44 || f[3] < 44) B.push(`B: ${n}: freccia ${f ? f[2] + 'x' + f[3] : '-'} px (minimo 44x44)`);
    s.linguette.forEach((l, i) => { if (!l || l[3] < 44) B.push(`B: ${n}: linguetta ${i + 1} alta ${l ? l[3] : '-'} px (minimo 44)`); });
  }
  if (M.chiuso.aperto) C.push('C: dopo la freccia il pannello non si chiude');
  if (!M.aperto.aperto) C.push('C: la freccia non apre il pannello');
  if (M.richiuso.aperto) C.push('C: la freccia non richiude');
  if (!M.daLinguetta || !M.daLinguetta.aperto || !/Statistiche/.test(M.daLinguetta.vista || '')) C.push(`C: «Statistiche» a pannello chiuso non apre le statistiche (aperto=${M.daLinguetta && M.daLinguetta.aperto}, vista=${M.daLinguetta && M.daLinguetta.vista})`);
  if (!M.al46 || M.al46.clock !== 46) C.push('C: 46\' non raggiunto'); else if (M.al46.aperto !== M.daLinguetta.aperto || M.al46.vista !== M.daLinguetta.vista) C.push(`C: al 46' lo stato cambia (${M.daLinguetta.aperto}/${M.daLinguetta.vista} → ${M.al46.aperto}/${M.al46.vista})`);
  for (const [n, s] of [['chiuso', M.chiuso], ['aperto', M.aperto]]) {
    for (const [nn, x] of [['striscia alta', s.striscia], ['tabellone', s.tabellone], ['cronaca', s.cronaca]]) if (sov(s.pannello, x)) D.push(`D: ${n}: pannello ${JSON.stringify(s.pannello)} sopra ${nn} ${JSON.stringify(x)}`);
    const f = s.freccia; if (f && (f[0] < 4 || f[1] < 4 || f[0] + f[2] > s.W - 4 || f[1] + f[3] > s.H - 4)) D.push(`D: ${n}: freccia a meno di 4 px dal bordo ${JSON.stringify(f)}`);
  }
  return { A, B, C, D, altro: r.ko };
}
let fallito = false; const esiti = [];
const bracci = ROSSO_ON ? [false, true] : [false];
for (const rosso of bracci) for (const [k, casa] of (rosso ? GIRI_ROSSO : GIRI)) {
  const r = await giro(k, casa, rosso); const g = giudica(r); esiti.push({ k, casa, rosso, r, g }); const M = r.M;
  console.log(`\n[${k} ${casa ? 'CASA' : 'TRASFERTA'}${rosso ? ' — ROSSO' : ''}] pm=${M.pm} sede=${M.sede}`);
  for (const n of ['chiuso', 'aperto', 'daLinguetta', 'al46']) { const s = M[n]; if (s) console.log(`  ${n.padEnd(11)} aperto=${s.aperto} vista=${s.vista} simbolo «${s.simbolo}» verso ${s.verso} aria-expanded=${s.ariaExp} freccia ${JSON.stringify(s.freccia)} linguette ${JSON.stringify(s.linguette)} pannello ${JSON.stringify(s.pannello)}`); }
  for (const kk of ['A', 'B', 'C', 'D', 'altro']) for (const x of g[kk]) console.log('   ' + (rosso ? '·' : '✗') + ' ' + x);
  if (!rosso && (g.A.length || g.B.length || g.C.length || g.D.length || g.altro.length)) fallito = true;
}
/* stessa posizione in casa e in trasferta */
const t = esiti.find(e => !e.rosso && e.k === 's412' && !e.casa), c = esiti.find(e => !e.rosso && e.k === 's412' && e.casa);
if (t && c && t.r.M.chiuso && c.r.M.chiuso) { const d = Math.max(...t.r.M.chiuso.freccia.map((v, i) => Math.abs(v - c.r.M.chiuso.freccia[i])), ...t.r.M.aperto.freccia.map((v, i) => Math.abs(v - c.r.M.aperto.freccia[i])));
  console.log(`\nD: freccia casa vs trasferta (412x915): scarto massimo ${d} px`); if (d > 2) { console.log('   ✗ D: la freccia cambia posto fra casa e trasferta'); fallito = true; } }
else { console.log('\n✗ D: confronto casa/trasferta non disponibile'); fallito = true; }
if (ROSSO_ON) { const R = esiti.filter(e => e.rosso).map(e => e.g); const cade = x => R.every(g => g[x].length);
  console.log(`\nROSSO: A ${cade('A') ? 'cade' : 'NON cade'} · B ${cade('B') ? 'cade' : 'NON cade'} · C ${cade('C') ? 'cade' : 'NON cade'}`);
  if (!cade('A') || !cade('B') || !cade('C')) fallito = true; }
await b.close(); srv.close();
console.log(fallito ? '\n❌ freccia-107 ROSSO' : '\n✅ freccia-107 VERDE');
process.exit(fallito ? 1 : 0);
