#!/usr/bin/env node
/* [giro 439 PO-638, decisione PO «Tutte le consigliate» dal giro 343, dubbio 4] SONDA DELLA BARRIERA NEL FLUSSO VERO (strumento).
   Come sonda-rigore-139: partite di carriera vere dal salvataggio fixtures/save-190-s12-ovr93.json, autoplay seedato, e il NOME del
   giocatore cambia a ogni partita (il seme di partita nasce da avversario+stagione+settimana+nome: ogni partita e' davvero diversa).
   Corpi accesi (__CPM_GLB), teatro acceso (__CPM_PRESENT + __CPM_CINE). Su OGNI scena di punizione dell'eroe (testimone __CPM_PUN343,
   src/12: pallone e corpi della barriera nel mondo, 1 u = 1 m) campiona, durante le fasi di lettura (hl_intro/hl_move/hl_choose),
   in UNA sola lettura della pagina (stessa sorgente: le mesh):
     - uomini in barriera (n) e bersagli __CPM_MUR72;
     - distanza del centro della barriera dal pallone (9,15 m) e del corpo piu' vicino;
     - scarto del centro dalla linea pallone -> centro porta (48,6 · 0);
     - distanza dal pallone dell'avversario di movimento piu' vicino FUORI dalla barriera (>= 10,15 m, giro 418).
   Uso: CPM_N=6 [CPM_PAR=2] [CPM_TAG=b439] [CPM_ROSSO=1] [CPM_CAP=420000] node sonda-barriera-439.mjs
     CPM_ROSSO=1 accende __CPM_NO_G375 + __CPM_NO_G418 (barriera di prima: il guardiano deve vederla storta). CPM_FERMA=1: la partita
     si chiude appena la prima punizione e' stata letta. Esporta partite439() per il guardiano barriera-vera-439. */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const LETTURA = ['hl_intro', 'hl_move', 'hl_choose'];

/* una lettura: tutto dalla pagina nello stesso istante */
const CAMPIONE = (L) => { try {
  const ph = window.__CPM_PHASE && window.__CPM_PHASE(); const W = window.__CPM_PUN343 || []; const M = window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ();
  const min = M && M._S ? M._S.min | 0 : null;
  let sit0 = null; if (L.includes(ph)) try { const X = window.__CPM_SITCTX && window.__CPM_SITCTX(); sit0 = X ? X.text : null; } catch (e) {}
  if (!L.includes(ph) || !W.length) return { ph, min, sit0 };
  const w = W[W.length - 1]; if (w.ph && !L.includes(w.ph)) return { ph, min };
  /* la voce si CONSUMA: il 3D la riscrive a ogni fotogramma solo finche' la scena di punizione e' in lettura; una voce non riscritta
     dall'ultima lettura e' di una scena finita (primo giro: 60 campioni di una scena successiva attribuiti alla punizione) */
  if (w.x == null) return { ph, min, sit0, vecchia: 1 }; const wx = w.x, wz = w.z, pm0 = (w.pm || []).slice(); w.x = null;
  const s = window.__CPM_STATE ? window.__CPM_STATE() : null; const pm = pm0; const W0 = { x: wx, z: wz };
  const gx = 48.6, dx = gx - W0.x, dz = -W0.z, dn = Math.hypot(dx, dz) || 1, ux = dx / dn, uz = dz / dn;
  let c = null, lato = null, mn = null;
  if (pm.length) { const cx = pm.reduce((a, q) => a + q[0], 0) / pm.length, cz = pm.reduce((a, q) => a + q[1], 0) / pm.length;
    c = Math.hypot(cx - W0.x, cz - W0.z); lato = Math.abs((cx - W0.x) * uz - (cz - W0.z) * ux); mn = Math.min(...pm.map(q => Math.hypot(q[0] - W0.x, q[1] - W0.z))); }
  /* barriera riconosciuta dai CORPI, senza il testimone: avversari di movimento fra 8,5 e 9,8 m dal pallone e entro 3 m dalla linea */
  let nG = 0, cG = 0, lG = 0; const geo = [];
  if (s && s.players) for (const q of s.players) { if (q.team !== 'away' || q.gk) continue; const qx = q.x - 50, qz = (q.y - 50) * 0.68, d = Math.hypot(qx - W0.x, qz - W0.z);
    const lt = Math.abs((qx - W0.x) * uz - (qz - W0.z) * ux); if (d >= 8.5 && d <= 9.8 && lt <= 3) { nG++; geo.push([qx, qz]); } }
  if (geo.length) { const gx2 = geo.reduce((a, q) => a + q[0], 0) / geo.length, gz2 = geo.reduce((a, q) => a + q[1], 0) / geo.length; cG = Math.hypot(gx2 - W0.x, gz2 - W0.z); lG = Math.abs((gx2 - W0.x) * uz - (gz2 - W0.z) * ux); }
  const minG = geo.length ? Math.min(...geo.map(q => Math.hypot(q[0] - W0.x, q[1] - W0.z))) : null;
  let fuoriG = null; if (s && s.players) for (const q of s.players) { if (q.team !== 'away' || q.gk) continue; const qx = q.x - 50, qz = (q.y - 50) * 0.68; if (geo.some(b => b[0] === qx && b[1] === qz)) continue; const d = Math.hypot(qx - W0.x, qz - W0.z); if (fuoriG == null || d < fuoriG) fuoriG = d; }
  let sit = null; try { const X = window.__CPM_SITCTX && window.__CPM_SITCTX(); sit = X ? X.text : null; } catch (e) {}
  let fuori = null, nf = 0;
  if (s && s.players) for (const q of s.players) { if (q.team !== 'away' || q.gk) continue; const qx = q.x - 50, qz = (q.y - 50) * 0.68;
    if (pm.some(b => Math.hypot(b[0] - qx, b[1] - qz) < 0.25)) continue; nf++; const d = Math.hypot(qx - W0.x, qz - W0.z); if (fuori == null || d < fuori) fuori = d; }
  return { ph, min, k: w.k, n: pm.length, mur: (window.__CPM_MUR72 || []).length, ball: [W0.x, W0.z], area: w.area, centro: c, lato, minB: mn, fuori, nf, nG, cG, lG, minG, fuoriG, sit };
} catch (e) { return { err: String(e.message).slice(0, 80) }; } };

async function partita(b, url, nome, idx, rosso, cap, ferma) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
  const sv = JSON.parse(JSON.stringify(save)); const pl = sv.player || sv; pl.name = pl.name + ' ' + nome;
  await page.addInitScript(([s, r]) => { window.__CPM_GLB = true; window.__CPM_REC = true; window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; window.__CPM_PUN343 = [];
    if (r) { window.__CPM_NO_G375 = 1; window.__CPM_NO_G418 = 1; } /* rosso: la barriera di prima del giro 375 (e del 418) */ localStorage.setItem('cpm-match-speed', '2'); localStorage.setItem('cpm-v3', JSON.stringify(s)); }, [sv, rosso]);
  const t0 = Date.now(); const scene = new Map(); const testi = []; let ph = '', impronta = null;
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
    try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(1500);
    try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
    await page.evaluate(() => window.__CPM_CAREER.playMatch());
    await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
    await page.evaluate((s) => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 150 }), idx + 1);
  } catch (e) { await ctx.close(); return { nome, err: 'apertura: ' + String(e.message).slice(0, 120), scene: [] }; }
  while (Date.now() - t0 < cap) {
    const c = await page.evaluate(CAMPIONE, LETTURA).catch(() => ({}));
    ph = c.ph || ph;
    /* censimento delle scene di punizione dal TESTO della scena corrente: una punizione dell'eroe che non arriva al testimone (tipo di
       scena diverso: niente barriera) resta scritta qui e il guardiano la dichiara */
    { const tx = c.sit0 || c.sit; if (tx && /punizion/i.test(tx) && !testi.some(t => t.sit === tx && Math.abs(t.min - c.min) <= 1)) testi.push({ sit: tx, min: c.min }); }
    if (c.k != null) { let e = scene.get(c.k); if (!e) { e = { k: c.k, min: c.min, campioni: [] }; scene.set(c.k, e); } if (e.campioni.length < 400) e.campioni.push(c); }
    if (ph === 'ended' || ph === 'ceremony') break;
    if (ferma && scene.size && !LETTURA.includes(ph)) break; /* il guardiano: la punizione e' stata letta tutta, la partita non serve piu' */
    await sleep(LETTURA.includes(ph) ? 120 : 300);
  }
  try { impronta = await page.evaluate(() => window.__CPM_SCORE ? JSON.stringify(window.__CPM_SCORE()) : null); } catch (e) {}
  /* ogni testo «punizione» visto in lettura deve avere la sua scena col testimone */
  const senza = testi.filter(t => ![...scene.values()].some(sc => sc.campioni.some(c => c.sit === t.sit)));
  await ctx.close();
  return { nome, fine: ph, s: Math.round((Date.now() - t0) / 1000), errs: errs.length, impronta, scene: [...scene.values()], testi, senza };
}

/* giudizio di UNA scena: barriera presente, a 9,15 m, sulla linea, nessun altro sotto 10,15 m, in OGNI campione dopo l'apertura */
export function giudica(sc) {
  /* un campione vale se e' della scena di punizione (testo della scena corrente uguale a quello della maggior parte dei campioni:
     al passaggio alla scena dopo il testimone porta ancora la chiave vecchia per un fotogramma, misurato: 1 campione su 15-19) */
  const conta = {}; for (const c of sc.campioni) conta[c.sit] = (conta[c.sit] | 0) + 1;
  const sit = Object.keys(conta).sort((a, z) => conta[z] - conta[a])[0];
  const C = sc.campioni.filter(c => String(c.sit) === sit); sc.altre = sc.campioni.length - C.length; if (!C.length) return { ng: 'nessun campione', motivi: ['non giudicata'] };
  /* il primo fotogramma della scena: il testimone gira PRIMA della passata che scrive la barriera della scena nuova (_w72, src/12),
     quindi non ha ancora i suoi uomini (misurato: n=0 con 4 corpi gia' a 9,15 m). Li' vale la barriera riconosciuta dai corpi,
     dichiarata nel conto (geo). */
  let geo = 0; const E = C.map(c => (c.n > 0 ? c : (geo++, { ...c, n: c.nG | 0, centro: c.nG ? c.cG : null, lato: c.nG ? c.lG : null, minB: c.minG, fuori: c.fuoriG })));
  const peg = { n: Math.min(...E.map(c => c.n)), centro: null, lato: 0, minB: 99, fuori: 99, campioni: C.length, geo };
  for (const c of E) { if (c.centro != null) { const dv = Math.abs(c.centro - 9.15); if (peg.centro == null || dv > Math.abs(peg.centro - 9.15)) peg.centro = c.centro; }
    if (c.lato != null) peg.lato = Math.max(peg.lato, c.lato); if (c.minB != null) peg.minB = Math.min(peg.minB, c.minB); if (c.fuori != null) peg.fuori = Math.min(peg.fuori, c.fuori); }
  const motivi = [];
  if (peg.n < 3) motivi.push(`${peg.n} in barriera`);
  if (peg.centro == null || Math.abs(peg.centro - 9.15) > 0.3) motivi.push(`centro a ${peg.centro == null ? '—' : peg.centro.toFixed(2)} m`);
  if (peg.lato > 0.5) motivi.push(`${peg.lato.toFixed(2)} m fuori linea`);
  if (peg.minB < 9) motivi.push(`un uomo di barriera a ${peg.minB.toFixed(2)} m`);
  if (peg.fuori < 10.15 - 0.05) motivi.push(`avversario fuori barriera a ${peg.fuori.toFixed(2)} m`);
  return { ...peg, motivi };
}

export async function partite439({ b, port, nomi, rosso = false, par = 2, cap = 420000, ferma = false, log = console.log }) {
  const url = `http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`; const res = []; let next = 0;
  async function lav() { while (next < nomi.length) { const i = next++; const r = await partita(b, url, nomi[i], i, rosso, cap, ferma); res.push(r);
    log(`[${res.length}/${nomi.length}] ${r.nome} fine=${r.fine} ${r.s}s errs=${r.errs} score=${r.impronta} punizioni=${r.scene.length} testi=${(r.testi || []).length} senzaTestimone=${(r.senza || []).map(t => t.min + "'" + t.sit).join('|') || 0}${r.err ? ' ERR ' + r.err : ''}`);
    for (const sc of r.scene) { const g = giudica(sc); const c0 = sc.campioni[0] || {};
      if (g.ng) { log(`   ${sc.min}' ${sc.k}: NON GIUDICATA (${g.ng})`); continue; }
      log(`   ${sc.min}' ${sc.k}: ${g.campioni} campioni (${g.geo} dai soli corpi, ${sc.altre | 0} di un'altra scena) · apertura n=${c0.n} centro=${c0.centro == null ? '—' : c0.centro.toFixed(2)} fuori=${c0.fuori == null ? '—' : c0.fuori.toFixed(2)} · peggiore n=${g.n} centro=${g.centro == null ? '—' : g.centro.toFixed(2)} lato=${g.lato.toFixed(2)} minB=${g.minB.toFixed(2)} fuori=${g.fuori.toFixed(2)} pallone=${(c0.ball || []).join(',')}${g.motivi.length ? ' ✗ ' + g.motivi.join(' · ') : ' ✓'}`); } } }
  await Promise.all(Array.from({ length: par }, lav)); return res;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const N = +(process.env.CPM_N || 4), TAG = process.env.CPM_TAG || 'b439'; const NOMI = process.env.CPM_NOMI ? process.env.CPM_NOMI.split(',') : Array.from({ length: N }, (_, i) => `${TAG}-${i}`);
  const srv = await startServer(); const b = await launchBrowser();
  const res = await partite439({ b, port: srv.address().port, nomi: NOMI, ferma: !!process.env.CPM_FERMA, rosso: !!process.env.CPM_ROSSO, par: +(process.env.CPM_PAR || 2), cap: +(process.env.CPM_CAP || 420000) });
  await b.close(); srv.close();
  if (process.env.CPM_OUT) fs.writeFileSync(process.env.CPM_OUT, JSON.stringify(res, null, 1));
  const tutte = res.flatMap(r => r.scene.map(giudica)); console.log(`RIASSUNTO partite=${res.length} punizioni=${tutte.length} storte=${tutte.filter(g => g.ng || g.motivi.length).length}`);
}
