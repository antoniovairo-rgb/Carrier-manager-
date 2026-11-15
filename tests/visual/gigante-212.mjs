#!/usr/bin/env node
/* [giro 212 · PO-474 «Nelle scene 3d c'e' un gigante in campo!»] SONDA e GUARDIANO dei CORPI in tutte le scene 3D, col GLB ACCESO.
   Testimone __CPM_G212W (src/12 misuraCorpi212): a ogni fotogramma disegnato, per ogni corpo con scheletro visibile, statura in metri
   (dallo scheletro, indipendente dalla posa; in verticale 1 u = 1 m, la traversa del gioco sta a 2,44), distanza dalla camera, ossa dentro il piano near e quota
   dell'inquadratura occupata, con il ruolo del corpo e la catena dei genitori (con le scale) per risalire al codice che lo mette in scena.
   Scenari (CPM_SCENARI, separati da virgola):
     trasferta-tel  · salvataggio pro, partita di campionato in trasferta, 375x812: ingresso, highlight, festa del fischio finale «Doppietta» (forzata)
     casa-pc        · partita di coppa in casa, 1280x720, piu' la premiazione di coppa (anche trasferta-pc, casa-tel)
     festa-vera-tel · partita del provino giocata fino al fischio (autoplay, 2 gol forzati): la festa che nasce dal fischio finale vero
     cerimonie-tel  · presentazione (beat 3), gala, parata col pullman, intro della schermata d'avvio
   VERDE: ogni corpo misurato ha statura in [1,45 · 2,05] m (bambini dell'ingresso in [1,05 · 1,45] m; i corpi in campo sono disegnati a
   0,9 della statura dichiarata per scelta del giro 21, _scalaCorpo21: un calciatore da 1,80 misura 1,62), nessun corpo con ossa dentro
   il near della camera mentre e' inquadrato, nessun corpo che occupa piu' del 60% dell'inquadratura; e ogni scena e' GIUDICATA (almeno
   CPM_MINF fotogrammi con corpi). «Non giudicato» = rosso.
   ROSSO (CPM_PROVA_ROSSO=1 → __CPM_NO_G212): il gigante della foto deve ricomparire (almeno un corpo sopra 2,05 m).
   Foto in docs/sviluppo/giro212 (prima/dopo/rosso). Uso: CPM_CHROME=/opt/pw-browsers/chromium node gigante-212.mjs  (CPM_MISURA=1 = esce 0) */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const ROSSO = !!process.env.CPM_PROVA_ROSSO, MISURA = !!process.env.CPM_MISURA;
const H_MIN = 1.45, H_MAX = 2.05, B_MIN = 1.05, B_MAX = 1.45, Q_MAX = 0.60, MINF = +(process.env.CPM_MINF || 8);
const SCENARI = (process.env.CPM_SCENARI || 'trasferta-tel,casa-pc,festa-vera-tel,cerimonie-tel').split(',').filter(Boolean);
const TAG = ROSSO ? 'rosso' : (process.env.CPM_PRIMA ? 'prima' : 'dopo');
const FOTO = process.env.CPM_FOTO || path.join(ROOT, 'docs', 'sviluppo', 'giro212'); fs.mkdirSync(FOTO, { recursive: true });
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const VP = { tel: { width: 375, height: 812, isMobile: true, hasTouch: true }, pc: { width: 1280, height: 720 } };
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const scene = {}; const guasti = []; const log = [];
const quando = (s) => `[${new Date().toISOString().slice(11, 19)}] ${s}`;

function salvataggio(casa) {
  const sv = JSON.parse(JSON.stringify(SAVE)); const pl = sv.player || sv; const w = pl.week | 0;
  /* la prossima partita del salvataggio e' in trasferta (FC Tyneside). Per la partita in casa si inserisce in testa una gara di coppa
     in casa alla stessa settimana, come fa tpose-196: cambiare isHome a mano fa rispondere «nomatch» alla carriera (misurato). */
  if (casa) { pl.cup = Object.assign({}, pl.cup || {}, { active: true, eliminated: false, champion: false, results: [], round: 0 });
    const opp = (pl.calendar || []).find(m => m.opponentId);
    pl.calendar = [{ matchday: 1300 + w, week: w, opponentName: opp ? opp.opponentName : 'FC Albion', opponentId: opp ? opp.opponentId : undefined, isHome: true, played: false, type: 'cup', cupRound: 0, cupRoundName: 'Ottavi' }].concat(pl.calendar || []); }
  return sv;
}
function raccogli(nome, frames) {
  const S = scene[nome] ||= { fotogrammi: 0, corpi: 0, hMax: 0, hMin: 99, qMax: 0, near: 0, per: {}, cattivi: [] };
  for (const f of frames) {
    if (!f.corpi.length) continue; S.fotogrammi++;
    for (const c of f.corpi) {
      S.corpi++; const bimbo = c.ruolo === 'bambino'; const lo = bimbo ? B_MIN : H_MIN, hi = bimbo ? B_MAX : H_MAX;
      const k = c.ruolo + (c.ix >= 0 ? '#' + c.ix : '') + (c.ruolo === 'sconosciuto' ? '@' + c.cat : '');
      const e = S.per[k] ||= { n: 0, hM: c.hM, scala: c.scala, dmin: 99, qMax: 0, near: 0, yMin: c.yMin };
      e.n++; e.hM = Math.max(e.hM, c.hM); e.dmin = Math.min(e.dmin, c.dmin); e.qMax = Math.max(e.qMax, c.quota); e.yMin = Math.min(e.yMin, c.yMin);
      S.hMax = Math.max(S.hMax, c.hM); S.hMin = Math.min(S.hMin, c.hM); S.qMax = Math.max(S.qMax, c.quota);
      const inQ = c.quota > 0;
      if (inQ && c.dentroNear) { S.near++; e.near++; }
      const m = [];
      if (c.hM < lo || c.hM > hi) m.push(`statura ${c.hM} m fuori da [${lo}·${hi}]`);
      if (inQ && c.dentroNear) m.push(`${c.dentroNear} ossa dentro il near ${f.near}`);
      if (c.quota > Q_MAX) m.push(`occupa ${(c.quota * 100).toFixed(0)}% dell'inquadratura (d ${c.dmin} u)`);
      if (m.length && S.cattivi.length < 6) S.cattivi.push(`${f.scena} ${f.w} ${k} scala ${c.scala} pos ${c.pos} → ${m.join(', ')}`);
      if (m.length) S.male = (S.male || 0) + 1;
    }
  }
}
async function svuota(page, nome) { const fr = await page.evaluate(() => (window.__CPM_G212W || []).splice(0)).catch(() => []); raccogli(nome, fr); return fr; }
async function foto(page, nome) { await page.screenshot({ path: path.join(FOTO, `${TAG}-${nome}.jpg`), type: 'jpeg', quality: 70 }).catch(() => {}); }
async function nuovaPagina(v, init) {
  const ctx = await b.newContext({ viewport: { width: VP[v].width, height: VP[v].height }, deviceScaleFactor: 1, isMobile: !!VP[v].isMobile, hasTouch: !!VP[v].hasTouch, serviceWorkers: 'block' });
  await installCdnRoutes(ctx); const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  await page.addInitScript(o => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; window.__CPM_G212W = []; window.__CPM_G212MAX = 3000; if (o.r) window.__CPM_NO_G212 = 1;
    try { localStorage.setItem('cpm-intro-seen', '1'); if (o.ls) for (const k in o.ls) localStorage.setItem(k, o.ls[k]); } catch (e) {} }, { r: ROSSO, ls: init || null });
  return { ctx, page, errs };
}
async function carriera(page, sv) {
  await page.addInitScript(s => { localStorage.setItem('cpm-v3', JSON.stringify(s)); }, sv);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 40000 }); await sleep(1200);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
}
async function guarda(page, nome, ms) { const t0 = Date.now(); while (Date.now() - t0 < ms) { await sleep(700); await svuota(page, nome); } }

async function partita(nomeSc, casa, v) {
  const { ctx, page, errs } = await nuovaPagina(v);
  try {
    await carriera(page, salvataggio(casa));
    const pm = await page.evaluate(() => window.__CPM_CAREER.playMatch()).catch(e => 'errore ' + e.message); log.push(quando(`${nomeSc}: playMatch → ${JSON.stringify(pm)}`));
    const t0 = Date.now(); let fase = null, hl = 0, fotoW = 0, fotoH = 0, ultimaRich = -1;
    while (Date.now() - t0 < 240000 && hl < 2) {
      const s = await page.evaluate(() => ({ ph: window.__CPM_PHASE && window.__CPM_PHASE(), c: window.__CPM_CLOCK ? window.__CPM_CLOCK() : 0 })).catch(() => null); if (!s) break; fase = s.ph;
      const k = s.ph === 'walkout' ? 'ingresso' : /^hl_/.test(s.ph || '') ? 'highlight' : s.ph === 'playing' ? 'gioco' : null;
      if (k) await svuota(page, `${nomeSc}:${k}`); else await page.evaluate(() => { window.__CPM_G212W = []; }).catch(() => {});
      if (k === 'ingresso' && !fotoW++) { await sleep(2500); await foto(page, `${nomeSc}-ingresso`); }
      if (s.ph === 'matchday' || s.ph === 'formations') await page.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null); const x = bs.find(b => /Vedi le formazioni|Ingresso in campo|Diplomatico|Siamo pronti|Continua/i.test(b.textContent || '') && !/Salta/i.test(b.textContent || '')); if (x) x.click(); }).catch(() => {});
      if (s.ph === 'playing' && s.c >= 8 && s.c !== ultimaRich) { ultimaRich = s.c; await page.evaluate(() => { window.__CPM_QUEUE_REACTIVE && window.__CPM_QUEUE_REACTIVE(); }).catch(() => {}); }
      if (s.ph === 'hl_choose') { await sleep(900); if (!fotoH++) await foto(page, `${nomeSc}-highlight`); await page.evaluate(() => window.__CPM_RESOLVE && window.__CPM_RESOLVE(0)).catch(() => {}); hl++; await guarda(page, `${nomeSc}:highlight`, 3500); }
      if (s.ph === 'hl_move') await page.evaluate(() => { document.dispatchEvent(new KeyboardEvent('keydown', { key: '0', bubbles: true })); }).catch(() => {});
      await sleep(350);
    }
    log.push(quando(`${nomeSc}: ingresso/highlight finiti (fase ${fase}, highlight ${hl})`));
    await page.evaluate(c => { window.__CPM_G212W = []; window.__CPM_FORCE_CEREMONY({ name: 'Doppietta', kind: 'bigwin', light: true, festa: { titolo: 'Doppietta', punteggio: c ? '2 – 0' : '2 – 0', avversario: 'FC Islington', casa: c, facce: [{ eroe: true, id: 0 }], voci: [{ n: 2, et: 'gol', oro: true }, { n: '7,8', et: 'voto', oro: true }] } }); }, casa);
    for (let i = 0; i < 16 && (i < 6 || ((scene[`${nomeSc}:festa`] || {}).fotogrammi | 0) < 2 * MINF); i++) { await guarda(page, `${nomeSc}:festa`, 1500); if (i === 2) await foto(page, `${nomeSc}-festa`); }
    /* la premiazione si misura su una pagina sua (premiazione()): forzata dopo la festa, il timer della festa la chiudeva dopo ~5 s (misurato) */
  } catch (e) { guasti.push(`${nomeSc}: ${String(e.message).slice(0, 160)}`); }
  if (errs.length) log.push(`${nomeSc}: errori di pagina ${errs.length} → ${errs[0]}`);
  await ctx.close();
}
async function premiazione(nomeSc, v) {
  const { ctx, page, errs } = await nuovaPagina(v);
  try {
    await openMatch(page, port, { skipLoadAll: true, name: 'Prem212' });
    await page.waitForFunction(() => window.__CPM_GLB_READY, null, { timeout: 90000 }).catch(() => {}); await sleep(2500);
    await page.evaluate(() => { window.__CPM_G212W = []; window.__CPM_FORCE_CEREMONY({ name: 'COPPA NAZIONALE', kind: 'cup' }); });
    for (let i = 0; i < 16 && (i < 6 || ((scene[`${nomeSc}:premiazione`] || {}).fotogrammi | 0) < 2 * MINF); i++) { await guarda(page, `${nomeSc}:premiazione`, 1500); if (i === 4) await foto(page, `${nomeSc}-premiazione`); }
  } catch (e) { guasti.push(`${nomeSc}:premiazione: ${String(e.message).slice(0, 160)}`); }
  if (errs.length) log.push(`${nomeSc}:premiazione: errori di pagina ${errs.length} → ${errs[0]}`);
  await ctx.close();
}
async function festaVera(v) {
  const nomeSc = 'festa-vera-' + v; const { ctx, page, errs } = await nuovaPagina(v, { 'cpm-match-speed': '2' });
  try {
    await page.addInitScript(() => { window.__CPM_FESTA942_FORCE = { goals: 2, assists: 0, rb: 18 }; });
    await openMatch(page, port, { skipLoadAll: true, name: 'Festa3' });
    await page.waitForFunction(() => window.__CPM_GLB_READY, null, { timeout: 90000 }).catch(() => {});
    await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 4545, policy: 'seeded', tickMs: 300 }));
    const t0 = Date.now(); let ph = null;
    while (Date.now() - t0 < 420000) { ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null);
      if (ph === 'ceremony' || ph === 'ended') break; await page.evaluate(() => { window.__CPM_G212W = []; }).catch(() => {}); await sleep(600); }
    log.push(quando(`${nomeSc}: fischio finale → ${ph} dopo ${((Date.now() - t0) / 1000).toFixed(0)} s`));
    if (ph === 'ceremony') for (let i = 0; i < 6; i++) { await guarda(page, `${nomeSc}:festa`, 1500); if (i === 2) await foto(page, `${nomeSc}`); }
  } catch (e) { guasti.push(`${nomeSc}: ${String(e.message).slice(0, 160)}`); }
  if (errs.length) log.push(`${nomeSc}: errori di pagina ${errs.length} → ${errs[0]}`);
  await ctx.close();
}
async function cerimonie(v) {
  const nomeSc = 'cerimonie-' + v;
  /* presentazione e gala: stesso salvataggio della sonda misura-pres-192 */
  const { apri } = await import('./misura-pres-192.mjs');
  for (const [k, fn] of [['presentazione', p => p.evaluate(() => window.__CPM_CAREER.apriPresentazione(3))], ['gala', p => p.evaluate(() => window.__CPM_CAREER.apriGala())]]) {
    let p = null; try {
      p = await apri(b, port, ROSSO ? ['__CPM_NO_G212'] : []); await p.evaluate(() => { window.__CPM_G212W = []; window.__CPM_G212MAX = 3000; });
      await fn(p); await sleep(3000); await p.evaluate(() => { window.__CPM_G212W = []; });
      for (let i = 0; i < 6; i++) { await guarda(p, `${nomeSc}:${k}`, 1500); if (i === 3) await foto(p, `${nomeSc}-${k}`); }
    } catch (e) { guasti.push(`${nomeSc}:${k}: ${String(e.message).slice(0, 160)}`); } if (p) await p.close().catch(() => {}); }
  { const { ctx, page } = await nuovaPagina(v); try {
    await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForFunction(() => typeof window.__CPM_PARATA198_C === 'function', null, { timeout: 60000 });
    await page.evaluate(() => { document.body.innerHTML = '<div id="parata" style="position:fixed;inset:0"></div>'; ReactDOM.createRoot(document.getElementById('parata')).render(React.createElement(window.__CPM_PARATA198_C, { club: { id: 'liv', n: 'FC Merseyside', a: 'MER', p: 96, c: '#dc2626', c2: '#f5f5f5', nat: '🏴', lg: 'Premier Division' }, euroWin: true, avatarId: 0, heroNum: 9 })); });
    await page.waitForFunction(() => window.__CPM_PARATA && (window.__CPM_PARATA.cg23 || 0) >= 8, null, { timeout: 60000 }).catch(() => {});
    await page.evaluate(() => { window.__CPM_G212W = []; });
    for (let i = 0; i < 6; i++) { await guarda(page, `${nomeSc}:parata`, 1500); if (i === 3) await foto(page, `${nomeSc}-parata`); }
  } catch (e) { guasti.push(`${nomeSc}:parata: ${String(e.message).slice(0, 160)}`); } await ctx.close(); }
  { const { ctx, page } = await nuovaPagina(v); try {
    await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1500);
    await page.evaluate(() => { window.__CPM_G212W = []; window.dispatchEvent(new CustomEvent('cpm-replay-intro')); });
    for (let i = 0; i < 10; i++) { await guarda(page, `${nomeSc}:avvio`, 1500); if (i === 5) await foto(page, `${nomeSc}-avvio`); }
  } catch (e) { guasti.push(`${nomeSc}:avvio: ${String(e.message).slice(0, 160)}`); } await ctx.close(); }
}

for (const sc of SCENARI) {
  log.push(quando('scenario ' + sc));
  if (sc === 'trasferta-tel') await partita(sc, false, 'tel', false);
  else if (sc === 'casa-pc') { await partita(sc, true, 'pc', true); await premiazione(sc, 'pc'); }
  else if (sc === 'trasferta-pc') await partita(sc, false, 'pc', false);
  else if (sc === 'casa-tel') { await partita(sc, true, 'tel', true); await premiazione(sc, 'tel'); }
  else if (sc === 'festa-vera-tel') await festaVera('tel');
  else if (sc === 'cerimonie-tel') await cerimonie('tel');
  else if (sc === 'cerimonie-pc') await cerimonie('pc');
}
await b.close(); srv.close();

console.log(`\n=== GIGANTE-212 · corpi nelle scene 3D === ${ROSSO ? '[ROSSO __CPM_NO_G212]' : '[VERDE]'}  statura [${H_MIN}·${H_MAX}] m (bambini [${B_MIN}·${B_MAX}]) · quota ≤ ${Q_MAX} · near vuoto`);
log.forEach(x => console.log('  ' + x));
let giganti = 0, nonGiudicate = [], male = 0;
const attese = [];
for (const sc of SCENARI) {
  if (/^(trasferta|casa)-/.test(sc)) attese.push(`${sc}:ingresso`, `${sc}:highlight`, `${sc}:festa`); if (/^casa-/.test(sc)) attese.push(`${sc}:premiazione`);
  if (/^festa-vera/.test(sc)) attese.push(`${sc}:festa`); if (/^cerimonie/.test(sc)) for (const k of ['presentazione', 'gala', 'parata', 'avvio']) attese.push(`${sc}:${k}`);
}
for (const k of attese) {
  const S = scene[k];
  if (!S || S.fotogrammi < MINF) { nonGiudicate.push(`${k} (${S ? S.fotogrammi : 0} fotogrammi)`); console.log(`  ✗ ${k.padEnd(34)} NON GIUDICATA (${S ? S.fotogrammi : 0} fotogrammi con corpi)`); continue; }
  male += S.male || 0;
  const g = Object.entries(S.per).filter(([n, e]) => e.hM > H_MAX); giganti += g.length;
  console.log(`  ${S.male ? '✗' : '✓'} ${k.padEnd(34)} fotogrammi ${S.fotogrammi} · corpi ${S.corpi} · statura ${S.hMin.toFixed(2)}–${S.hMax.toFixed(2)} m · quota max ${(S.qMax * 100).toFixed(0)}% · near ${S.near}`);
  for (const [n, e] of Object.entries(S.per)) if (e.hM > H_MAX || e.hM < (n.startsWith('bambino') ? B_MIN : H_MIN) || e.qMax > Q_MAX || e.near || process.env.CPM_TUTTI) console.log(`      ${n.slice(0, 70).padEnd(70)} ${JSON.stringify(e)}`);
  for (const c of S.cattivi) console.log('      · ' + c);
}
guasti.forEach(g => console.log('  ✗ ' + g));
fs.writeFileSync(path.join(FOTO, `misura-${TAG}.json`), JSON.stringify({ scene, log, guasti }, null, 1));
let ok;
if (ROSSO) { ok = giganti > 0; console.log(ok ? `\n✅ difetto riprodotto — col rosso __CPM_NO_G212 tornano ${giganti} corpi sopra ${H_MAX} m (il gigante della foto)` : '\n❌ FAIL — col rosso il gigante NON ricompare: il guardiano non vede il difetto'); }
else { ok = !nonGiudicate.length && !male && !guasti.length; console.log(ok ? `\n✅ PASS — ${attese.length} scene giudicate, nessun corpo fuori misura, nessuno dentro il near, nessuno oltre il ${Q_MAX * 100}% dell'inquadratura` : `\n❌ FAIL — ${male} corpi fuori misura · non giudicate: ${nonGiudicate.join(', ') || 'nessuna'}`); }
process.exit(MISURA ? 0 : (ok ? 0 : 1));
