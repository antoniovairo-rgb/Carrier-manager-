#!/usr/bin/env node
/* [7.999.162 guardiano — PO-232 «gli highlights devono partire sempre con i GLB on di CGTrader caricati totalmente (mai in T-Pose
   o senza testa)»]
   Partite vere col GLB ACCESO (qui NON si mette __CPM_GLB=false) e rete RALLENTATA come su un telefono: ogni .glb e ogni texture
   arriva con un ritardo fisso per file fra 2 e 6 s (CPM_RIT_MIN/CPM_RIT_MAX), le texture della testa (HEAD_hair_*.png, 2,5 MB) 20 s
   (CPM_RIT_TESTA), contesto nuovo a ogni partita (cache fredda) e service worker bloccato (altrimenti serve lui i file e il ritardo
   non si applica: misurato 0 file ritardati). Al PRIMO FOTOGRAMMA DISEGNATO di ogni scena dell'eroe il testimone __CPM_GLB232W (src/12) registra, per
   ogni corpo visibile e inquadrato: CGTrader si/no, peso delle clip attive (T-pose = 0), teste con texture caricata, e quanti
   modelli procedurali sono visibili. Una scena e' NON PRONTA se anche un solo corpo non e' CGTrader, ha le clip a peso <= 0,05,
   ha una testa senza texture, se in campo c'e' un procedurale, o se nessun corpo e' inquadrato (campo vuoto: CH38 non ancora
   agganciato). ⚠️ Sotto ?cpmtest=1 la trattenuta del fischio (CH38) e' spenta: la classe «campo vuoto» del rosso e' propria del banco;
   le classi del telefono sono «CH38 al posto di CGTrader», «T-pose» e «senza testa».
   VERDE: 0 scene non pronte su almeno 3 misurate. ROSSO (__CPM_NO_GLB232): le scene non pronte ricompaiono (>= 1).
   Uso: CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node glb-pronti-232.mjs
        CPM_SCENE232 (scene per partita, 2) · CPM_PARTITE232 (partite per braccio, 2) · CPM_BRACCI=verde|rosso (solo uno) */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const SCENE = +(process.env.CPM_SCENE232 || 2);
const PARTITE = +(process.env.CPM_PARTITE232 || 2);
const RMIN = +(process.env.CPM_RIT_MIN || 2000), RMAX = +(process.env.CPM_RIT_MAX || 6000);
const hash = s => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const ritardo = url => RMIN + (hash(url.split('?')[0].split('/').pop()) % (RMAX - RMIN + 1));
/* CPM_RIT_TESTA: ritardo delle texture della testa, 20 s di default (2,5 MB l'una a ~1 Mbit/s di rete mobile): e' la finestra in cui, senza la correzione, i corpi CGTrader sono gia' in campo e la testa no. CPM_RIT_TESTA=0 = stesso ritardo 2-6 s degli altri file */
const RTESTA = process.env.CPM_RIT_TESTA != null ? +process.env.CPM_RIT_TESTA : 20000;
const ritardoDi = url => (RTESTA && /HEAD_hair_/.test(url)) ? RTESTA : ritardo(url);

const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();

async function partita(rosso, n) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, serviceWorkers: 'block' }); const page = await ctx.newPage();/* il service worker del gioco servirebbe i .glb fuori dalla rotta: si blocca, o il ritardo non si applica (misurato: 0 file ritardati) */
  await installCdnRoutes(page);
  const ritardati = [];
  await ctx.route(/\.glb(\?|$)|HEAD_hair_[a-z]+\.png/, async route => { const u = route.request().url(); const ms = ritardoDi(u); ritardati.push([u.split('/').pop(), ms]); await sleep(ms); try { await route.continue(); } catch (e) {} });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.addInitScript(() => { setInterval(() => { try { if (window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_move') { document.dispatchEvent(new KeyboardEvent('keydown', { key: '0', bubbles: true })); window.dispatchEvent(new KeyboardEvent('keydown', { key: '0' })); } } catch (e) {} }, 700); });
  await page.addInitScript(r => { window.__CPM_GLB = true; window.__CPM_GLB232W = []; window.__CPM_CINE = 1; window.__CPM_PRESENT = 1; if (r) window.__CPM_NO_GLB232 = 1; }, rosso);
  await openMatch(page, port, { skipLoadAll: true, name: 'Pronti ' + n });
  const t0 = Date.now(); let scene = 0, giri = 0, prontiA = null;
  const pollPronti = setInterval(async () => { try { if (prontiA == null) { const p = await page.evaluate(() => window.__CPM_CORPI232 && window.__CPM_CORPI232().pronti); if (p) prontiA = Date.now() - t0; } } catch (e) {} }, 500);
  /* il giro e' guidato dal testimone: una scena conta quando il suo primo fotogramma e' stato registrato. In `playing` si chiede una
     scena (coda reattiva) — la prima solo quando il cronometro arriva all'8', il minuto del primo highlight del calendario (8+step·i),
     cioe' la stessa finestra che ha il telefono: chiederla al fischio misurerebbe una gara che il gioco non corre. In scelta si
     risolve l'azione 0. */
  let ultimaRich = -1;
  while (Date.now() - t0 < 300000) {
    const s = await page.evaluate(() => ({ ph: window.__CPM_PHASE && window.__CPM_PHASE(), c: window.__CPM_CLOCK ? window.__CPM_CLOCK() : 0, n: (window.__CPM_GLB232W || []).length })).catch(() => null);
    if (!s) break; scene = s.n; if (scene >= SCENE || s.ph === 'ended') break;
    if (s.ph === 'playing' && s.c >= 8 && s.c !== ultimaRich) { ultimaRich = s.c; await page.evaluate(() => { window.__CPM_QUEUE_REACTIVE && window.__CPM_QUEUE_REACTIVE(); }).catch(() => {}); }
    if (s.ph === 'hl_choose') { await sleep(500); await page.evaluate(() => window.__CPM_RESOLVE && window.__CPM_RESOLVE(0)).catch(() => {}); }
    if (process.env.CPM_DBG232) console.log('   dbg', ((Date.now() - t0) / 1000).toFixed(0), 's', JSON.stringify(s));
    await sleep(1000);
  }
  clearInterval(pollPronti);
  const d = await page.evaluate(() => ({ w: (window.__CPM_GLB232W || []).slice(), ev: ((typeof window.__CPM_EV === 'function' && window.__CPM_EV()) || []).filter(e => e && e.ev === 'corpi232').map(e => { const o = { ...e }; delete o.ts; return o; }).slice(0, 10) })).catch(() => ({ w: [], ev: [] }));
  await ctx.close();
  return { n, durS: +((Date.now() - t0) / 1000).toFixed(1), prontiS: prontiA == null ? null : +(prontiA / 1000).toFixed(1), errs: errs.slice(0, 3), ritardati: ritardati.length, w: d.w, ev: d.ev };
}
const giudica = s => {
  const c = s.corpi || [];
  const noCg = c.filter(x => !x.cg).length, tpose = c.filter(x => x.w <= 0.05).length, testa = c.filter(x => x.teste > x.testeOk).length, proc = s.proc > 0 ? s.proc : 0;
  const vuota = c.length === 0; /* nessun corpo inquadrato: CH38 non ancora agganciato e procedurali nascosti = campo vuoto */
  return { ph: s.ph, st: s.st, motivo: s.pronti && s.pronti.motivo, corpi: c.length, noCg, tpose, testa, proc, vuota, nonPronta: !!(vuota || noCg || tpose || testa || proc) };
};
const esito = {};
for (const rosso of (process.env.CPM_BRACCI === 'verde' ? [false] : process.env.CPM_BRACCI === 'rosso' ? [true] : [false, true])) {
  const nome = rosso ? 'rosso' : 'verde'; const tutte = [];
  for (let i = 0; i < PARTITE; i++) {
    const r = await partita(rosso, i + 1);
    const g = r.w.map(giudica); tutte.push(...g);
    console.log(`${nome} partita ${r.n}: ${r.durS}s, corpi pronti a ${r.prontiS}s, file ritardati ${r.ritardati}, scene ${g.length}${r.errs.length ? ' · pageerror ' + JSON.stringify(r.errs) : ''}`);
    g.forEach((x, k) => console.log(`   scena ${k + 1} [${x.ph}] st=${x.st} motivo=${x.motivo} corpi=${x.corpi} noCGTrader=${x.noCg} tpose=${x.tpose} senzaTesta=${x.testa} procedurali=${x.proc} vuota=${x.vuota} → ${x.nonPronta ? 'NON PRONTA' : 'pronta'}`));
    if (r.ev.length) console.log('   eventi corpi232: ' + JSON.stringify(r.ev));
  }
  esito[nome] = { scene: tutte.length, nonPronte: tutte.filter(x => x.nonPronta).length, conCorpi: tutte.filter(x => x.corpi > 0).length, vuote: tutte.filter(x => x.vuota).length, noCg: tutte.filter(x => x.noCg).length, tpose: tutte.filter(x => x.tpose).length, senzaTesta: tutte.filter(x => x.testa).length };
  console.log(`${nome.toUpperCase()}: ${JSON.stringify(esito[nome])}`);
}
await b.close(); srv.close();
const g = [];
if (esito.verde) { if (esito.verde.scene < 3 || esito.verde.conCorpi < 3) g.push('verde: troppe poche scene misurate ' + JSON.stringify(esito.verde)); if (esito.verde.nonPronte > 0) g.push('verde: scene partite coi corpi non pronti ' + JSON.stringify(esito.verde)); }
if (esito.rosso && esito.rosso.nonPronte < 1) g.push('rosso: le scene non pronte non ricompaiono ' + JSON.stringify(esito.rosso));
if (g.length) { console.log('❌ glb-pronti-232'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ glb-pronti-232 verde (e il rosso si vede)');
