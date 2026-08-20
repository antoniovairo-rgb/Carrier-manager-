#!/usr/bin/env node
/* GUARDIANO — IL VOCABOLARIO DEL GESTO (7.534.0, MP-1 prima ondata).
   Missione PO «macro-gestualità»: ogni famiglia di gesto ha varianti con FIRMA distinta (clip e/o
   profilo del volo), risolte dalla tabella unica GESTI invece che da una catena if.

   COME GIUDICA — PER ENUMERAZIONE (lezione trama-identita: le risoluzioni sono troppo rare per il
   campionamento). L'hook __CPM_GESTI espone la risoluzione VERA (gestoDi → tabella + rosso):
   · VERDE: (a) le risoluzioni storiche della catena restano identiche (shot_volley→volley,
     penalty→penalty, lunge→kick, press/call→locomozione, aerial→header, pass→kick, build→dribble);
     (b) la famiglia shot ha ≥3 firme distinte (clip,prof) e i profili dichiarati escono davvero
     (chip→campana, power→tesa, curled→null per la pancia a giro);
   · ROSSO (CPM_ROSSO=1 → __CPM_NO547): la tabella si appiattisce alla riga base — shot_volley
     risolve `kick`, la panenka perde la campana: le varianti PERDONO la firma e il guardiano lo vede.
   Niente partita: la pagina basta, l'hook legge la tabella e la funzione di risoluzione reali. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const ROSSO = !!process.env.CPM_ROSSO;
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(r => { window.__CPM_GLB = false; if (r) window.__CPM_NO547 = 1; }, ROSSO ? 1 : null);
await openMatch(page, port, { skipLoadAll: true, name: 'Voc' });
await sleep(400);

/* attesa dell'hook: vive nel renderer 3D, nasce col componente LiveMatch */
let ok = false;
for (let i = 0; i < 40 && !ok; i++) { ok = await page.evaluate(() => typeof window.__CPM_GESTI === 'function'); if (!ok) await sleep(250); }
if (!ok) { console.log('❌ hook __CPM_GESTI mai comparso (il renderer non è montato?)'); process.exit(1); }

const CASI = [
  ['shot', 'shot_volley', 'volley'], ['shot', 'shot_chip', 'kick'], ['shot', null, 'kick'],
  ['penalty', 'penalty_panenka', 'penalty'], ['penalty', null, 'penalty'],
  ['freekick', null, 'kick'], ['cross', null, 'kick'], ['header', null, 'header'],
  ['tackle', 'lunge', 'kick'], ['tackle', 'press', null], ['tackle', 'call', null],
  ['tackle', 'aerial', 'header'], ['tackle', 'slide', 'tackle'], ['tackle', null, 'tackle'],
  ['dribble', null, 'dribble'], ['pass', null, 'kick'], ['build', null, 'dribble'],
];
const res = await page.evaluate(cc => cc.map(([f, v]) => { const g = window.__CPM_GESTI(f, v); return { f, v, clip: g ? g.clip : '∅', prof: g ? (g.prof || null) : null }; }), CASI);
let bad = 0;
console.log(`${ROSSO ? 'ROSSO' : 'VERDE'} — risoluzioni della tabella GESTI:`);
for (let i = 0; i < CASI.length; i++) {
  const [f, v, attesa] = CASI[i]; const r = res[i];
  /* nel rosso l'attesa vale solo per le righe base (variante null): le varianti collassano sulla base */
  const attesaEff = ROSSO && v ? (res.find(q => q.f === f && q.v === null) || {}).clip : attesa;
  const okR = (r.clip || null) === (attesaEff === '∅' ? '∅' : attesaEff || null) || (r.clip === '∅' && attesaEff == null);
  const flat = (r.clip === '∅' ? null : r.clip);
  const okC = flat === (ROSSO && v ? attesaEff : attesa);
  if (!okC) bad++;
  console.log(`  ${String(f).padEnd(8)} ${String(v || '—').padEnd(18)} → clip ${String(flat)} · prof ${r.prof || '—'} ${okC ? '' : ' ❌ attesa ' + (ROSSO && v ? attesaEff : attesa)}`);
}
/* firme distinte per famiglia shot: nel verde ≥3 coppie (clip,prof) diverse; nel rosso collassano a 1 */
const shotRows = await page.evaluate(() => { const T = window.__CPM_GESTI(); const out = []; for (const v in (T.shot || {})) { const g = window.__CPM_GESTI('shot', v === 'base' ? null : v); out.push((g.clip || '∅') + '|' + (g.prof || '—')); } return out; });
const firme = new Set(shotRows).size;
console.log(`firme distinte famiglia shot: ${firme} (${[...new Set(shotRows)].join(' · ')})`);
/* profili dichiarati */
const profs = await page.evaluate(() => ({ chip: (window.__CPM_GESTI('shot', 'shot_chip') || {}).prof || null, power: (window.__CPM_GESTI('shot', 'shot_power') || {}).prof || null, curled: (window.__CPM_GESTI('shot', 'shot_curled') || {}).prof || null, pan: (window.__CPM_GESTI('penalty', 'penalty_panenka') || {}).prof || null }));
await b.close(); srv.close();

if (ROSSO) {
  const rBad = bad > 0 || firme > 1 || profs.chip === 'campana';
  console.log(rBad ? '❌ prova del rosso fallita: le varianti conservano la firma a tabella appiattita' : '✅ prova del rosso: tabella piatta, varianti senza firma');
  process.exit(rBad ? 1 : 0);
}
const vBad = bad > 0 || firme < 3 || profs.chip !== 'campana' || profs.power !== 'tesa' || profs.curled !== null || profs.pan !== 'campana';
console.log(vBad ? '❌ il vocabolario non risolve come dichiarato' : '✅ il vocabolario risolve: catena storica preservata, varianti con firma, profili al posto giusto');
process.exit(vBad ? 1 : 0);
