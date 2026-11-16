#!/usr/bin/env node
/* [giro 219 · PO-484 «a volte l'evento post tocco e' un po' ritardato e sembra che non ho premuto»] GUARDIANO del tocco nelle scene 3D.
   Percorso vero: carriera → «Gioca la partita» → ingresso in campo → partita → cerimonia (provocata dalla sonda con
   __CPM_FORCE_CEREMONY, come festa-3d e cerimonie-192). Corpi 3D ACCESI, notte, attesa dei corpi come in produzione (__CPM_T196ON).
   Banco: telefono emulato 375x667 (isMobile + hasTouch, dpr 2, tocco vero via CDP, CPU rallentata x4 messa a scena aperta) e
   PC 1366x768 (mouse, nessun freno). Prima della misura si raccolgono gli scarti di Babel (la pagina di prova traduce il JSX nel
   browser: ~1,1 GB che il gioco pubblicato non ha, e la cui raccolta cadrebbe dentro una scena a caso).
   Per ogni scena (ingresso · premiazione · festa) un tocco su «Salta» con lib/tocco-213, e in piu':
     effetto        = la scena e' chiusa (fase diversa), letto A OGNI MUTAZIONE del documento e a ogni fotogramma;
     compiti lunghi = PerformanceObserver 'longtask' fra il tocco e l'effetto (+0,6 s).
   VERDE, per ogni scena e ogni ripetizione (telefono: RIP corse, PC: 1; verde = TUTTE):
     G1 riscontro del giro 213 (tasto illuminato/schiacciato) nel PRIMO fotogramma dopo l'elaborazione del tocco, e rotellina;
     G2 dal tocco alla scena chiusa <= MAX (ms, dichiarati sotto per scena e banco);
     G3 nessun compito del filo principale piu' lungo di LUNGO ms fra il tocco e la scena chiusa;
     G4 dall'ELABORAZIONE del clic alla scena chiusa <= DOPO ms (la parte che dipende dal gioco, senza l'attesa della scheda grafica
        software del banco prima che il tocco arrivi alla pagina);
     G5 nessun errore di pagina, la scena si chiude davvero, lo smontaggio rimandato arriva in fondo (cerimonie);
     G6 «i tasti passano prima del disegno»: fra il clic elaborato e la scena chiusa NESSUN disegno 3D (chiamate drawElements/drawArrays
        contate sui prototipi WebGL: 0), e il ciclo 3D ha ceduto almeno un fotogramma al tasto (testimone __CPM_SALTI219 / __CPM_IP219).
   ROSSO (__CPM_NO_G219, gioco com'era): il guardiano deve bocciare OGNI scena su almeno un criterio.
   ⚠️ Cosa separa davvero i bracci sul banco (misurato, rapporto §5): nelle cerimonie G3 e G4 (lo smontaggio dentro il clic: un compito
   da 0,7-2,9 s contro <0,35 s) piu' G6; nell'ingresso, dove il clic non smonta nulla, SOLO G6 — li' il tempo e' quello dei fotogrammi
   gia' in volo sulla scheda grafica software: sul telefono dal clic 812-1484 ms nel verde (8 misure) contro 1513-1591 nel rosso (4),
   troppo vicini per una soglia (una soglia a 1250 ha dato un falso rosso alla 7ª misura: tolta come separatore e DICHIARATA, il tetto
   dell'ingresso e' quello largo). G2 e G4-ingresso sono tetti dichiarati, non separatori.
   Uso: CPM_CHROME=/opt/pw-browsers/chromium node tocco3d-219.mjs      (CPM_BRACCI=verde,rosso · CPM_DOVE=tel,pc · CPM_RIP=2 · CPM_OUT=<json>)
   Soglie: non si abbassano. Una scena non misurata («tasto non trovato», scena gia' finita) e' ROSSO. */
import fs from 'node:fs';
import { sleep } from './lib/harness.mjs';
import { apriCarriera166, apriPrompt166 } from './lib/partita-166.mjs';
import { misura } from './lib/tocco-213.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const BRACCI = (process.env.CPM_BRACCI || 'verde,rosso').split(',');
const DOVE = (process.env.CPM_DOVE || 'tel,pc').split(',');
const RIP = +(process.env.CPM_RIP || 2), OUT = process.env.CPM_OUT || '';
/* soglie dichiarate (ms) — misurate sul banco, vedi docs/sviluppo/RAPPORTO-giro219.md §5 */
const MAX = { tel: { ingresso: 6000, premiazione: 5000, festa: 5000 }, pc: { ingresso: 4000, premiazione: 3000, festa: 3000 } };
const DOPO = { tel: { ingresso: 3000, premiazione: 900, festa: 900 }, pc: { ingresso: 4000, premiazione: 1800, festa: 1800 } };
const LUNGO = { tel: 600, pc: 250 };
const RIGHE = [];
const fase = (p) => p.evaluate(() => { try { return window.__CPM_PHASE ? window.__CPM_PHASE() : null; } catch (e) { return null; } }).catch(() => null);
const perSel = (s) => `const L=[...document.querySelectorAll(${JSON.stringify(s)})].filter(b=>b.offsetParent!==null||getComputedStyle(b).position==='fixed');return L[0]||null;`;
const FESTA = { name: 'Doppietta', kind: 'bigwin', light: true, festa: { titolo: 'Doppietta', punteggio: '2 – 1', avversario: 'FC Prova', casa: true, facce: [{ eroe: true, id: 0 }], voci: [{ n: 2, et: 'gol', oro: true }, { n: '7,8', et: 'voto', oro: true }] } };
const PREMIO = { name: 'CAMPIONI!', kind: 'league' };

/* testimone nella pagina: istante (performance.now, lo stesso orologio di event.timeStamp) in cui la fase smette di essere `f`,
   letto a ogni mutazione del documento e a ogni fotogramma; compiti lunghi */
const ARMA = (f) => { const W = window.__G219 = { f, tFine: null, lt: [], t0: performance.now(), fot: [], tClic: null, salti0: (window.__CPM_SALTI219 | 0) + (window.__CPM_IP219 | 0) };
  if (!window.__G219L) { window.__G219L = 1; window.__G219D = 0; for (const P of [window.WebGLRenderingContext, window.WebGL2RenderingContext]) { if (!P) continue; for (const n of ['drawElements', 'drawArrays']) { const f = P.prototype[n]; if (!f) continue; P.prototype[n] = function () { window.__G219D++; return f.apply(this, arguments); }; } } /* in cattura sulla FINESTRA: prima dello strato del tocco, che sui tasti pesanti ferma la propagazione del clic vero */ window.addEventListener('click', e => { const X = window.__G219; if (X && e.isTrusted && X.tClic == null && e.target && e.target.closest && e.target.closest('[data-cpm^="salta"]')) { X.tClic = performance.now(); X.dClic = window.__G219D; } }, true); } const guarda = () => { if (W.tFine != null) return; let x = null; try { x = window.__CPM_PHASE(); } catch (e) {} if (x !== f) { W.tFine = performance.now(); W.dFine = window.__G219D; } };
  W.mo = new MutationObserver(guarda); W.mo.observe(document.documentElement, { subtree: true, childList: true, attributes: true });
  let u = 0; const g = (t) => { guarda(); if (u) W.fot.push(Math.round(t - u)); u = t; if (performance.now() - W.t0 < 20000) requestAnimationFrame(g); }; requestAnimationFrame(g);
  try { W.po = new PerformanceObserver(l => { for (const e of l.getEntries()) W.lt.push([e.startTime, e.duration]); }); W.po.observe({ type: 'longtask' }); } catch (e) {} };
const LEGGI = () => { const W = window.__G219; return { tFine: W.tFine, tClic: W.tClic, disegni: (W.dClic == null || W.dFine == null) ? null : W.dFine - W.dClic, ceduti219: (window.__CPM_SALTI219 | 0) + (window.__CPM_IP219 | 0) - W.salti0, lt: W.lt, fot: W.fot.slice(-30), smontato: window.__CPM_SMONTATO219 | 0, salti: window.__CPM_SALTI219 | 0, ceduti: window.__CPM_IP219 | 0, caldo: window.__CPM_CALDO219 | 0,
  prog: (() => { try { return (window.__CPM_PROGS16() || []).length; } catch (e) { return null; } })() }; };

async function tocca(riga, p, cdp, mobile, sel, f) {
  await p.evaluate(ARMA, f);
  const r = await misura(p, mobile ? cdp : null, mobile, { trova: perSel(sel), effetto: `try{return window.__CPM_PHASE()!==${JSON.stringify(f)};}catch(e){return false;}`, finestra: 12000, dopo: 900 }).catch(e => ({ err: e.message }));
  await sleep(700); const w = await p.evaluate(LEGGI).catch(() => null);
  if (!r || r.err || r.t0 == null || !w) { Object.assign(riga, { assente: true, err: !r ? 'tasto «Salta» non trovato' : r.err ? r.err : r.t0 == null ? 'il tocco non e\' arrivato al tasto' : 'testimone non letto' }); return; }
  const fine = w.tFine == null ? null : w.tFine - r.t0; const m = /pointerdown\+0:attesa(\d+)/.exec(r.eventi || ''); const mc = /click\+(\d+):attesa(\d+)/.exec(r.eventi || '');
  const clicElab = w.tClic != null ? Math.round(w.tClic - r.t0) : (mc ? (+mc[1] + +mc[2]) : null);/* ms dal tocco all'elaborazione del clic (orologio della pagina) */
  const lt = (w.lt || []).filter(([s, d]) => s + d > r.t0 && (fine == null || s < r.t0 + fine + 600)).map(([s, d]) => Math.round(d));
  Object.assign(riga, { attesaTocco: m ? +m[1] : null, riscontro: r.riscontro == null ? null : Math.round(r.riscontro), fotRisc: r.fotRisc, dopoGestore: r.dopoGestore, durFot: r.durFot, rotella: r.rotella == null ? null : Math.round(r.rotella),
    effetto: fine == null ? null : Math.round(fine), effettoAFotogramma: r.effetto == null ? null : Math.round(r.effetto), clicElab, dopoClic: (fine == null || clicElab == null) ? null : Math.round(fine - clicElab),
    lungoMax: lt.length ? Math.max(...lt) : 0, lunghi: lt, cedutiAlTasto: w.ceduti219, disegniDopoClic: w.disegni, traccia: (r.traccia || []).slice(0, 6), premuto: r.premuto, smontato: w.smontato, salti: w.salti, ceduti: w.ceduti, caldo: w.caldo, prog: w.prog, fotMed: (() => { const a = (w.fot || []).slice().sort((x, y) => x - y); return a.length ? a[a.length >> 1] : null; })() });
}
function giudica(r, dove) {
  const ko = []; if (!r || r.assente) return ['non misurato (tasto non trovato o scena gia\' finita): ' + ((r && r.err) || '')];
  const fotLungo = r.durFot != null && r.durFot > 50;
  const risc = r.riscontro != null && r.fotRisc != null && r.fotRisc <= 1 && r.dopoGestore != null && (r.dopoGestore <= 50 || (fotLungo && r.dopoGestore <= r.durFot + 1));
  if (!risc) ko.push(`G1 nessun riscontro nel primo fotogramma (riscontro ${r.riscontro} · fotogrammi ${r.fotRisc} · dopo il gestore ${r.dopoGestore})`);
  else if (!/brightness/.test(String(r.premuto || ''))) ko.push('G1 riscontro senza luce');
  if (r.rotella == null) ko.push('G1 nessuna rotellina');
  if (r.effetto == null) ko.push('G5 la scena non si chiude'); else {
    if (r.effetto > MAX[dove][r.scena]) ko.push(`G2 tocco→scena chiusa ${r.effetto} ms > ${MAX[dove][r.scena]}`);
    if (r.dopoClic != null && r.dopoClic > DOPO[dove][r.scena]) ko.push(`G4 clic elaborato→scena chiusa ${r.dopoClic} ms > ${DOPO[dove][r.scena]}`); }
  if (r.lungoMax > LUNGO[dove]) ko.push(`G3 compito lungo ${r.lungoMax} ms > ${LUNGO[dove]} fra tocco e scena chiusa`);
  if (r.dopoClic == null) ko.push('G4 non misurato (clic non visto)');
  if (!(r.cedutiAlTasto >= 1)) ko.push('G6 il ciclo 3D non ha ceduto nessun fotogramma al tasto');
  if (r.disegniDopoClic == null) ko.push('G6 disegni non contati'); else if (r.disegniDopoClic > 0) ko.push(`G6 ${r.disegniDopoClic} chiamate di disegno 3D fra il clic e la scena chiusa`);
  if (r.errori) ko.push('G5 errori di pagina: ' + r.errori);
  return ko;
}
async function finoA(p, voluta, salta) {
  const t0 = Date.now();
  while (Date.now() - t0 < 300000) { const f = await fase(p); if (f === voluta) return true; if (voluta === 'walkout' && f === 'playing') return false;
    if (f === 'walkout' && voluta === 'playing') { if (salta) await p.evaluate(() => { const b = document.querySelector('[data-cpm="salta-ingresso-v2"]'); if (b && !window.__s219) { window.__s219 = 1; b.click(); } }); await sleep(500); continue; }
    await p.evaluate(() => { try { const C = window.__CPM_CAREER; if (C && C.dismiss) C.dismiss(); } catch (e) {} const B = [...document.querySelectorAll('button')].filter(x => x.offsetParent && /^(Vedi le formazioni|Ingresso in campo|Continua|Avanti|Vai in campo|In campo|Entra in campo|Chiudi|OK|Ok|Siamo pronti)/i.test((x.textContent || '').trim()) && !/Salta/i.test(x.textContent || '')); if (B.length) B[B.length - 1].click(); }).catch(() => {});
    await sleep(600); }
  return false;
}
const aRegime = async (p) => { for (let i = 0; i < 720; i++) { if (await p.evaluate(() => { try { return !!window.__CPM_PRONTI196().pronti && !window.__CPM_ATT196; } catch (e) { return false; } }).catch(() => false)) return true; await sleep(250); } return false; };

/* la cerimonia si provoca da `playing` e si ATTENDE (evento, non tempo): se un highlight della partita arriva prima o la scalza
   (misurato: «fase hl_move» al momento del tocco in 2 corse su 12), il pilota lo gioca e si riprova; tetto 120 s */
async function cerimonia(p, o) {
  const t0 = Date.now(); let pil = false; const pilota = async (on) => { if (pil === on) return; pil = on; await p.evaluate((on) => { try { window.__CPM_AUTOPLAY(on, { seed: 219, policy: 'seeded', tickMs: 300 }); } catch (e) {} }, on).catch(() => {}); };
  while (Date.now() - t0 < 120000) { const f = await fase(p);
    if (f === 'ended' || f == null) return 'partita finita';
    if (f !== 'playing') { await pilota(true); await sleep(300); continue; }
    await pilota(false); await p.evaluate((o) => window.__CPM_FORCE_CEREMONY(o), o);
    let ok = false; for (let i = 0; i < 16; i++) { await sleep(250); if ((await fase(p)) === 'ceremony') { ok = true; break; } }
    if (!ok) continue; await sleep(2500);
    if ((await fase(p)) === 'ceremony' && await p.evaluate(() => !!document.querySelector('[data-cpm="salta"]')).catch(() => false)) return null; }
  return 'cerimonia non raggiunta in 120 s (fase ' + (await fase(p)) + ')';
}
/* una pagina: 'A' = ingresso + premiazione (una partita vera li ha entrambi) · 'B' = festa */
async function pagina(braccio, dove, quale, rip) {
  const mobile = dove === 'tel'; const vp = mobile ? { width: 375, height: 667 } : { width: 1366, height: 768 }; const rosso = braccio === 'rosso';
  const init = { __CPM_PRESENT: 1, __CPM_WALKTEST74: 1, __CPM_T196ON: 1, __CPM_TOD: 'night', ...(rosso ? { __CPM_NO_G219: 1 } : {}) };
  const A = await apriCarriera166({ vp, mobile, init, glb: true, nome: 'Tocco Tre D' }); const p = A.page; const cdp = await A.ctx.newCDPSession(p);
  const freno = async (on) => { if (mobile) await cdp.send('Emulation.setCPUThrottlingRate', { rate: on ? 4 : 1 }); };
  const riga = (scena) => { const r = { braccio, dove, scena, rip }; RIGHE.push(r); return r; };
  try {
    try { await cdp.send('HeapProfiler.enable'); await cdp.send('HeapProfiler.collectGarbage'); } catch (e) {}
    await apriPrompt166(p);
    await p.evaluate(() => { const b = [...document.querySelectorAll('[data-cpm="partita23"] button')].find(x => /^Gioca la partita/.test((x.textContent || '').trim())); if (b) b.click(); });
    if (quale === 'A') { const r = riga('ingresso');
      if (await finoA(p, 'walkout', false)) {
        for (let i = 0; i < 720; i++) { if (await p.evaluate(() => { try { return window.__CPM_PHASE() !== 'walkout' || (!!window.__CPM_PRONTI196().pronti && !window.__CPM_ATT196 && window.__CPM_WALKHOLD74 === false); } catch (e) { return false; } }).catch(() => false)) break; await sleep(250); }
        await freno(true); await sleep(1500);
        { const f0 = await fase(p); if (f0 === 'walkout') await tocca(r, p, cdp, mobile, '[data-cpm="salta-ingresso-v2"]', 'walkout'); else { r.assente = true; r.err = 'ingresso gia\' finito (fase ' + f0 + ')'; } }
        await freno(false);
      } else { r.assente = true; r.err = 'ingresso non raggiunto'; }
    }
    const ok = await finoA(p, 'playing', true) && await aRegime(p); await sleep(5000);
    const r = riga(quale === 'A' ? 'premiazione' : 'festa');
    if (ok) { await freno(true); await sleep(400); const guasto = await cerimonia(p, quale === 'A' ? PREMIO : FESTA);
      if (!guasto) { await tocca(r, p, cdp, mobile, '[data-cpm="salta"]', 'ceremony');
        if (!rosso && !r.assente) { for (let i = 0; i < 40 && !(await p.evaluate(() => window.__CPM_SMONTATO219 | 0)); i++) await sleep(250); r.smontato = await p.evaluate(() => window.__CPM_SMONTATO219 | 0); if (!r.smontato) r.errori = (r.errori ? r.errori + ' · ' : '') + 'lo smontaggio rimandato non e\' arrivato in fondo entro 10 s'; } }
      else { r.assente = true; r.err = guasto; } await freno(false); } else { r.assente = true; r.err = 'partita a regime non raggiunta (fase ' + (await fase(p)) + ')'; }
  } catch (e) { RIGHE.push({ braccio, dove, scena: 'pagina ' + quale, rip, assente: true, err: e.message }); }
  if (A.errs.length) for (const r of RIGHE) if (r.braccio === braccio && r.dove === dove && r.rip === rip && !r.assente && (quale === 'A' ? r.scena !== 'festa' : r.scena === 'festa')) r.errori = (r.errori ? r.errori + ' · ' : '') + A.errs.slice(0, 2).join(' | ');
  await A.b.close(); A.srv.close();
}

for (const braccio of BRACCI) for (const dove of DOVE) { const n = (braccio === 'verde' && dove === 'tel') ? RIP : 1;
  for (let rip = 1; rip <= n; rip++) for (const q of ['A', 'B']) { console.log(`▶ ${braccio} · ${dove} · pagina ${q} · corsa ${rip}/${n}`); await pagina(braccio, dove, q, rip);
    for (const r of RIGHE.filter(x => !x.stampata)) { r.stampata = 1; r.ko = giudica(r, r.dove); console.log('  ' + JSON.stringify({ ...r, premuto: undefined, stampata: undefined })); } } }
if (OUT) fs.writeFileSync(OUT, JSON.stringify(RIGHE.map(r => ({ ...r, stampata: undefined, premuto: undefined })), null, 1));

console.log('\nRIEPILOGO (ms dal tocco) — soglie: MAX ' + JSON.stringify(MAX) + ' · DOPO ' + JSON.stringify(DOPO) + ' · LUNGO ' + JSON.stringify(LUNGO));
for (const r of RIGHE) console.log(`  ${r.braccio.padEnd(5)} ${r.dove.padEnd(3)} ${String(r.scena).padEnd(11)} #${r.rip}  attesa ${String(r.attesaTocco).padStart(5)} · riscontro ${String(r.riscontro).padStart(5)} (fot ${r.fotRisc}) · rotellina ${String(r.rotella).padStart(5)} · scena chiusa ${String(r.effetto).padStart(5)} · dal clic ${String(r.dopoClic).padStart(5)} · disegni ${String(r.disegniDopoClic).padStart(4)} · lungo max ${String(r.lungoMax).padStart(5)}  ${r.ko.length ? '✗ ' + r.ko.join(' · ') : '✓'}`);
const SCENE = ['ingresso', 'premiazione', 'festa']; const guai = [];
if (BRACCI.includes('verde')) for (const dove of DOVE) for (const s of SCENE) { const L = RIGHE.filter(r => r.braccio === 'verde' && r.dove === dove && r.scena === s); const att = dove === 'tel' ? RIP : 1;
  if (L.length < att) guai.push(`verde ${dove} ${s}: ${L.length} misure su ${att} (non giudicato = rosso)`); for (const r of L) if (r.ko.length) guai.push(`verde ${dove} ${s} #${r.rip}: ${r.ko.join(' · ')}`); }
for (const r of RIGHE.filter(x => /^pagina/.test(String(x.scena)))) guai.push(`${r.braccio} ${r.dove} ${r.scena}: ${r.err}`);
if (BRACCI.includes('rosso')) for (const dove of DOVE) for (const s of SCENE) { const L = RIGHE.filter(r => r.braccio === 'rosso' && r.dove === dove && r.scena === s);
  if (!L.length) guai.push(`rosso ${dove} ${s}: nessuna misura`); else if (L.some(r => r.assente)) guai.push(`rosso ${dove} ${s}: non misurato (${L[0].err || 'scena non raggiunta'}) — il rosso si deve VEDERE, non mancare`); else if (!L.every(r => r.ko.length)) guai.push(`rosso ${dove} ${s}: il guardiano NON boccia il gioco com'era (${JSON.stringify({ effetto: L[0].effetto, dopoClic: L[0].dopoClic, lungoMax: L[0].lungoMax })})`); }
const nv = RIGHE.filter(r => r.braccio === 'verde' && !r.ko.length).length, tv = RIGHE.filter(r => r.braccio === 'verde').length, nr = RIGHE.filter(r => r.braccio === 'rosso' && r.ko.length && !r.assente).length, tr = RIGHE.filter(r => r.braccio === 'rosso').length;
if (guai.length) { console.log('\n❌ tocco3d-219'); guai.forEach(x => console.log('  · ' + x)); console.log(`ultimo: verde ${nv}/${tv} · rosso bocciato ${nr}/${tr}`); process.exit(1); }
console.log(`\n✅ tocco3d-219 — verde ${nv}/${tv}${BRACCI.includes('rosso') ? ` · rosso bocciato ${nr}/${tr}` : ''}`); process.exit(0);
