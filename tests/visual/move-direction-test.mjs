/* [7.317.0] GUARDIANO PERMANENTE — LA DIREZIONE DELLA MOSSA CONTA (E IL BILANCIAMENTO NON SI MUOVE)

   Direttiva PO dopo la domanda «i movimenti contano nella percentuale di successo?»: fino al 7.316 ogni
   mossa valeva +12 di stacco dal marcatore, IDENTICI in tutte e quattro le direzioni — andare incontro al
   difensore liberava esattamente quanto scappargli via. La giocata ottimale non era una scelta di calcio
   ma un trucco di tempismo.

   Il test verifica DUE proprietà insieme, ed è il punto:
     1. DIREZIONALITÀ — allontanarsi dal marcatore rende più che andargli addosso, e il di-traverso sta in
        mezzo (è la cosa nuova);
     2. NEUTRALITÀ DEL BILANCIAMENTO — la media sulle quattro direzioni resta 12, cioè il valore fisso di
        prima: la modifica cambia la DECISIONE, non la difficoltà (è la garanzia che non ho spostato la
        taratura di nascosto).

     node move-direction-test.mjs
*/
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage();
await page.setViewportSize({ width: 900, height: 760 });
await installCdnRoutes(page);
const errs = []; page.on('pageerror', e => errs.push(e.message.slice(0, 160)));
await page.addInitScript(() => { window.__CPM_GLB = false; });
await openMatch(page, port); await sleep(900);

let fails = 0;
const say = (ok, msg) => { if (!ok) fails++; console.log(`${ok ? '✅' : '❌'} ${msg}`); };

/* situation di movimento (non un piazzato: lì il pad non c'è) */
const GI = await page.evaluate(() => {
  const S = window.__CPM_SITS || [];
  for (let g = 0; g < S.length; g++) { const s = S[g]; if (s && !s.lockMovement && (s.tactic ? s.tactic.pressure !== 'none' : true) && s.type !== 'def') return g; }
  return 0;
});

await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), GI); await sleep(1000);
await page.evaluate(() => { window.__CPM_FROZEN = false; }); await sleep(900);

const M = await page.evaluate(() => {
  if (!window.__CPM_MOVEGAIN) return null;
  /* ⚠️ si interroga IL MARCATORE CHE IL GIOCO USA (`__CPM_MARKER`), non il piu' vicino fra le mesh 3D:
     i due modelli possono indicare avversari diversi (divergenza nota, vedi commento in `_marker317`) e
     misurare contro la fonte sbagliata darebbe un risultato invertito — ci sono inciampato al primo giro. */
  const opp = window.__CPM_MARKER ? window.__CPM_MARKER() : null;
  if (!opp) return { noOpp: true };
  const bd = opp.d;
  const hero = { x: opp.hx, y: opp.hy };/* la posizione LOGICA dell'eroe, la stessa con cui il gioco calcola */
  /* direzione che porta VIA dal marcatore, e la sua opposta, e le due perpendicolari */
  const ax = hero.x - opp.x, ay = hero.y - opp.y, L = Math.hypot(ax, ay) || 1;
  const via = [2.5 * ax / L, 2.5 * ay / L], contro = [-via[0], -via[1]], lat1 = [-via[1], via[0]], lat2 = [via[1], -via[0]];
  const g = v => window.__CPM_MOVEGAIN(v[0], v[1]);
  return { hero, opp, d: +bd.toFixed(1), via: +g(via).toFixed(2), contro: +g(contro).toFixed(2), lat1: +g(lat1).toFixed(2), lat2: +g(lat2).toFixed(2) };
});

if (!M || M.noOpp) { console.log('❌ nessun marcatore in scena: il test non può misurare'); fails++; }
else {
  console.log(`gi${GI} · eroe (${M.hero.x.toFixed(1)},${M.hero.y.toFixed(1)}) · marcatore a ${M.d}u`);
  console.log(`   scappi via ${M.via} · di traverso ${M.lat1}/${M.lat2} · gli vai addosso ${M.contro}`);
  say(M.via > M.lat1 + 2 && M.lat1 > M.contro + 2, 'allontanarsi rende più del di-traverso, che rende più che andargli addosso');
  say(M.via >= 19 && M.contro <= 5, `gli estremi sono quelli previsti (~20 in fuga · ~4 addosso): ${M.via} / ${M.contro}`);
  const media = (M.via + M.contro + M.lat1 + M.lat2) / 4;
  say(Math.abs(media - 12) < 0.6, `BILANCIAMENTO NEUTRO — media sulle 4 direzioni ${media.toFixed(2)} (il valore fisso di prima era 12)`);
}

if (errs.length) { console.log('❌ pageerror:', errs.slice(0, 3).join(' | ')); fails++; }
console.log(fails ? `\n❌ FAIL — ${fails}` : `\n✅ PASS — la direzione decide quanto ti liberi, e la difficoltà media non si muove`);
await b.close(); srv.close();
process.exit(fails ? 2 : 0);
