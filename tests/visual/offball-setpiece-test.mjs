/* [7.311.0] GUARDIANO PERMANENTE — DUE COLLAUDI PO SULLA SCENA DELL'EROE

   (A) «l'azione con smarcati per ricevere (dal portiere) con esito positivo sfarfalla, l'eroe
       praticamente non riceve palla, quest'ultimo arriva a centrocampo e parte un tiro senza
       compagno che va in porta».
       Su una situation OFF-BALL l'eroe non ha il pallone: si smarca per RICEVERLO. La consegna deve
       finire SU DI LUI. Misurato su gi158 «Costruzione dal basso» prima del fix: la palla partiva dal
       portiere (game 7,50), passava a 4.4u dall'eroe e proseguiva fino a game x 42 — distanza finale
       eroe-palla 27.1u — perche' il dispatch faceva `assist_recv` verso un terzo uomo a centrocampo.

   (B) «le punizioni con l'eroe: postura sbagliata del corpo, deve essere direzionato verso la porta!»
       Il facing dell'eroe deriva dal MOVIMENTO: fermo sul pallone di un piazzato non ruotava mai.
       Misurato prima del fix: errore di orientamento 34°-58° rispetto alla porta.

   Esecuzione (non e' nel gate: il gate cattura frame congelati):
     node offball-setpiece-test.mjs
*/
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const RECV_MAX = 4.0;      // unità di gioco: quanto lontano può restare la palla dall'eroe che riceve
const FACE_MAX = 0.30;     // radianti (~17°) di scarto ammesso rispetto alla porta
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage();
await page.setViewportSize({ width: 900, height: 700 });
await installCdnRoutes(page);
const errs = []; page.on('pageerror', e => errs.push(e.message.slice(0, 160)));
await page.addInitScript(() => { window.__CPM_GLB = false; });
await openMatch(page, port); await sleep(900);

let fails = 0;

/* ---------- (A) la consegna off-ball finisce sull'eroe ---------- */
const OFF = await page.evaluate(() => {
  const S = window.__CPM_SITS || [], o = [];
  for (let g = 0; g < S.length; g++) if (S[g] && S[g].offBall) o.push(g);
  return o;
});
console.log(`\n=== A · consegne OFF-BALL (l'eroe si smarca per ricevere): ${OFF.length} situation ===`);
if (!OFF.length) { console.log('❌ FAIL — nessuna situation off-ball: il test non misura nulla'); fails++; }
for (const gi of OFF.slice(0, 6)) {
  await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), gi); await sleep(800);
  await page.evaluate(() => { window.__CPM_FROZEN = false; }); await sleep(1000);
  await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_RESOLVE(0); });
  let d = 1e9;
  for (let k = 0; k < 10; k++) {
    await sleep(550);
    const s = await page.evaluate(() => { try { const st = window.__CPM_STATE(); return { d: Math.hypot(st.ball.x - st.hero.x, st.ball.y - st.hero.y), wy: st.ball.worldY }; } catch (e) { return null; } });
    if (s && s.wy < 1.0) d = s.d;   // misura solo a palla ATTERRATA (durante il volo la distanza non dice nulla)
  }
  const txt = await page.evaluate(g => (window.__CPM_SITS[g].text || '').slice(0, 40), gi);
  const ok = d <= RECV_MAX;
  if (!ok) fails++;
  console.log(`${ok ? '✅' : '❌'} gi${gi} ${txt} · distanza finale eroe-palla ${d.toFixed(1)}u (max ${RECV_MAX})`);
}

/* ---------- (B) sul piazzato l'eroe guarda la porta ---------- */
const FK = await page.evaluate(() => {
  const S = window.__CPM_SITS || [], o = [];
  for (let g = 0; g < S.length; g++) { const s = S[g]; if (!s) continue; let hl = null; try { hl = window.deriveHL(s, (s.actions || [])[0]); } catch (e) { }
    if (hl && (hl.type === 'freekick' || hl.type === 'penalty')) o.push(g); }
  return o;
});
console.log(`\n=== B · calci piazzati (l'eroe deve guardare la porta): ${FK.length} situation ===`);
if (!FK.length) { console.log('❌ FAIL — nessun calcio piazzato: il test non misura nulla'); fails++; }
for (const gi of FK.slice(0, 6)) {
  await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), gi); await sleep(800);
  await page.evaluate(() => { window.__CPM_FROZEN = false; }); await sleep(1700);
  const r = await page.evaluate(() => {
    const st = window.__CPM_STATE(), g = window.__CPM_GESTURE ? window.__CPM_GESTURE() : null;
    const wx = (st.hero.x - 50) * 1.0, wz = (st.hero.y - 50) * 0.68;   // G2X / G2Z
    const want = Math.atan2(46 - wx, -wz);                              // AWAY_GOAL_X = 46
    return { rot: g ? g.rotY : null, want: +want.toFixed(3), gx: +st.hero.x.toFixed(1), gy: +st.hero.y.toFixed(1) };
  });
  const txt = await page.evaluate(g => (window.__CPM_SITS[g].text || '').slice(0, 40), gi);
  if (r.rot == null) { console.log(`❌ gi${gi} ${txt} · rotazione non leggibile`); fails++; continue; }
  let dd = Math.abs(((r.want - r.rot + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
  const ok = dd <= FACE_MAX;
  if (!ok) fails++;
  console.log(`${ok ? '✅' : '❌'} gi${gi} ${txt} · corpo ${r.rot} vs porta ${r.want} → scarto ${(dd * 57.3).toFixed(0)}° (max ${(FACE_MAX * 57.3).toFixed(0)}°)`);
}

if (errs.length) { console.log('\n❌ pageerror:', errs.slice(0, 3).join(' | ')); fails++; }
console.log(fails ? `\n❌ FAIL — ${fails} caso/i` : `\n✅ PASS — la consegna off-ball arriva all'eroe e sul piazzato il corpo guarda la porta`);
await b.close(); srv.close();
process.exit(fails ? 2 : 0);
