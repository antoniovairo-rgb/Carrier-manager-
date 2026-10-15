#!/usr/bin/env node
/* [giro 17 PO-143 #64/#126 «colpo di testa non sincronizzato», «azione confusionaria»] GUARDIANO GLB-ON sulle scene di testa GENERATE DAL
   MOTORE (testa-146 misura le schede scritte gi36/gi44, che in partita vera non escono piu': le scene di cross, angolo e secondo tempo
   nascono dai generatori di src/04). Ogni scena su una PAGINA NUOVA (le pagine stanche falsano): la scena generata si aggiunge in coda a
   SITUATIONS solo nella sonda e si forza, si sceglie l'opzione di testa, esito riuscito. Misura: distanza testa-pallone quando parte
   l'arco del colpo (testimone __CPM_P1B2, colonna testa, come testa-146). VERDE: <= 1,0 su tutte. ROSSO (__CPM_NO_TESTA146): >= 2,5.
   ⚠️ STATO AL GIRO 17: ROSSA COL GIOCO — e' la misura del difetto aperto, non un guardiano di catena. Sulle scene di cross e angolo
   generate la clip del colpo di testa gira durante il caricamento col pallone a ~3 u (testa visibile a 2,98 u), poi la correzione
   7.999.144 porta il pallone sulla testa a clip gia' finita (il gesto passa a `lift`): «colpo di testa non sincronizzato». Il secondo
   tempo (sponda) e' a posto (0,47). Sulle schede del catalogo testa-146 resta verde (0,51 e 0,78). Vedi docs/sviluppo/RAPPORTO-giro17.md. */
import path from 'node:path'; import { fileURLToPath } from 'node:url';
const DIR = path.dirname(fileURLToPath(import.meta.url));
const { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } = await import(path.join(DIR, 'lib/harness.mjs'));
const CASI = [
  { k: 'cross-potenza', gen: "scenaDalMotoreCross({tipo:'cross',zona:'area',x:90,y:46,press:0.8,liberi:0,cast:C,origine:{kind:'cross'}},P,SEED)", lab: /Testa di potenza/ },
  { k: 'angolo-piazzata', gen: "scenaDalMotoreCross({tipo:'angolo',zona:'area',x:90,y:54,press:0.8,liberi:0,cast:C,origine:{kind:'angolo'}},P,SEED)", lab: /Testa piazzata/ },
  { k: 'cross-stacco', gen: "scenaDalMotoreCross({tipo:'cross',zona:'area',x:89,y:52,press:1.6,liberi:0,cast:C,origine:{kind:'cross'}},P,SEED)", lab: /Stacco in corsa/ },
  { k: 'seguito-sponda', gen: "scenaSecondoTempo({...CHAIN_SITS.sponda,_chainDepth:1},C,P,SEED)", lab: /Testa/ },
];
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser(); const esito = { verde: [], rosso: [] };
for (const rosso of [false, true]) for (const caso of CASI) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  await page.addInitScript(r => { window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; window.__CPM_GLB = true; window.__CPM_REC = 1; window.__CPM_REALWAIT = 1; if (r) window.__CPM_NO_TESTA146 = 1; }, rosso);
  await openMatch(page, port, { skipLoadAll: true, name: 'Testa 143' }); await sleep(1500);
  await page.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 90000 }).catch(() => {});
  const pr = await page.evaluate(({ gen, lab }) => { const C = { ricevente: { nome: 'Leo SPENCER' }, difensore: { nome: 'Max BAILEY' }, portiere: { nome: 'Ian CARR' }, crossatore: { nome: 'Tom HAMMOND' } }, P = { stats: {}, foot: 'R' };
    const re = new RegExp(lab); for (let SEED = 1; SEED < 400; SEED++) { const s = eval(gen); if (!s) continue; const k = s.actions.findIndex(a => re.test(a.label) && (deriveHL(s, a) || {}).type === 'header'); if (k < 0) continue;
      SITUATIONS.push(s); return { gi: SITUATIONS.length - 1, k, label: s.actions[k].label, text: s.text, variante: (deriveHL(s, s.actions[k]) || {}).variant }; } return null; }, { gen: caso.gen, lab: caso.lab.source });
  if (!pr) { esito[rosso ? 'rosso' : 'verde'].push({ k: caso.k, err: 'scena non generata' }); await page.close(); continue; }
  await page.evaluate(gi => { window.__CPM_P1B2 = []; window.__CPM_FORCE_SIT(gi, false); window.__CPM_FROZEN = false; }, pr.gi);
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_choose', null, { timeout: 30000 }).catch(() => {});
  await sleep(700);
  await page.evaluate(k => { window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_RESOLVE(k); }, pr.k);
  for (let w = 0; w < 30; w++) { await sleep(700); const f = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()); if (!/^hl_/.test(f || '')) break; }
  const L = await page.evaluate(() => (window.__CPM_P1B2 || []).filter(r => r[0] === 'header' && r[6] > 0 && r[6] <= 0.06 && r[8] >= 0).map(r => r[8]));
  const r = { k: caso.k, label: pr.label, variante: pr.variante, lancio: L.length ? +L[0].toFixed(2) : null };
  esito[rosso ? 'rosso' : 'verde'].push(r); console.log((rosso ? 'rosso ' : 'verde ') + JSON.stringify(r)); await page.close();
}
await b.close(); srv.close();
const g = [];
if (!esito.verde.every(x => x.lancio != null && x.lancio <= 1.0)) g.push('verde: testa lontana dal pallone al colpo ' + JSON.stringify(esito.verde));
if (!esito.rosso.every(x => x.lancio != null && x.lancio >= 2.5)) g.push('rosso: testa vicina anche spento ' + JSON.stringify(esito.rosso));
if (g.length) { console.log('❌ testa-motore-143'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ testa-motore-143 verde (e il rosso si vede)');
