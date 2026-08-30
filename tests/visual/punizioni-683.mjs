/* [STRUMENTO] DA DOVE SI BATTONO LE PUNIZIONI?
   Nota di collaudo PO [KE 7.681] su SIT #15: «Punizione da oltre meta' campo».
   MISURATO, e il difetto e' piu' grosso della segnalazione: la scena «Punizione DAL LIMITE — tiro
   diretto!» (gi13) DICHIARA la zona di partenza a gx 64-68 e apre con il pallone a gx 50, cioe'
   esattamente sulla linea di centrocampo, a cinquanta unita' dalla porta. Le punizioni «dalla fascia»
   (gi14/gi15) stanno a 37-38 unita'. Per confronto, quelle che leggono bene: gi81 «muro a 9 metri» a
   27 u, gi150 e gi161 a 17-20 u.
   ⚠️ COSA NON SO ANCORA, e per questo non ho toccato niente: `hlBallSpot` nel caso base mette il
   pallone DOVE STA L'EROE, e non esiste una zona-palla dichiarata dalla scena (il quarto argomento di
   S() e' la startZone dell'EROE). Ma su gi13 l'eroe risulta a gx 34 mentre la sua startZone dice
   65-67: c'e' una terza sorgente in mezzo che non ho ancora nominato, e sui piazzati non si mette
   mano a occhio. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_PRESENT = 1; });
await openMatch(page, port, { skipLoadAll: true, name: 'Fk' });
/* tutte le scene di punizione/piazzato: dove sta il pallone quando si batte? */
const cand = await page.evaluate(() => (window.__CPM_SITS || []).map((s, i) => ({ i, t: String(s.text || s.title || ''), z: (s.zones || [])[0], bs: s.ballState, it: s.intent }))
  .filter(r => /punizion|calcio di punizione|freekick/i.test(r.t) || r.it === 'freekick'));
console.log(`\n=== DOVE SI BATTONO LE PUNIZIONI? ===\n  scene trovate: ${cand.length}\n`);
/* ⚠️ [7.684.0] WARM-UP DICHIARATO. Senza, le prime due scene forzate dopo il caricamento davano mesh
   IDENTICHE fra loro — eroe (34,48), pallone (50.7,52.8): le posizioni di default, con le mesh non
   ancora mosse. E' lo stesso flake da avvio freddo del 7.660, ed e' la terza volta in una giornata che
   mi inganna: la regola incisa nel 7.599 («quando due scene diverse danno la stessa terna, il sospetto
   va allo strumento») va applicata PRIMA di accusare il gioco, non dopo. */
await page.evaluate(() => window.__CPM_FORCE_SIT(81, true)); await sleep(1800);
for (const c of cand) {
  await page.evaluate(([i, ch]) => window.__CPM_FORCE_SIT(i, ch), [c.i, true]);
  await sleep(1200);
  const r = await page.evaluate(() => { const s = window.__CPM_STATE(); return { bx: +s.ball.x.toFixed(1), by: +s.ball.y.toFixed(1), hx: +s.hero.x.toFixed(1) }; });
  const dist = (100 - r.bx).toFixed(1);
  console.log(`  gi${String(c.i).padStart(3)} [${c.z}] pallone a gx ${String(r.bx).padStart(5)} (${dist} u dalla porta) · eroe gx ${r.hx} · ${c.t.slice(0, 44)}${r.bx < 50 ? '   ← NELLA PROPRIA META CAMPO' : ''}`);
}
await b.close(); srv.close();
console.log('');
