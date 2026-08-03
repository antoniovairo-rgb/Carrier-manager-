/* [7.310.0] GUARDIANO PERMANENTE — LA CONSEGNA CHE VALE UN ASSIST HA SEMPRE UN UOMO,
   E LA PALLA NON TORNA INDIETRO A CERCARLO.

   Nasce dal collaudo PO: «azione chip millimetrico a centrocampo/trequarti ha dato vita a una scena
   surreale con assist a un compagno che ha segnato, la palla ha fatto un cerchio su se stesso!».
   Due difetti misurati su gi106 («Chip pass oltre la difesa»):
     (1) il selettore del ricevente del ramo build/dribble accetta solo compagni DAVANTI al portatore:
         con l'eroe come giocatore più avanzato non selezionava NESSUNO (`rcv:null`) → assist orfano;
     (2) il driver della consegna porta il pallone su `ricevente + lead`: col ricevente 10.6u alle
         spalle la palla ARRETRAVA per andargli incontro — il «cerchio su se stesso».

   Il test misura le due proprietà sulle situation che premiano un assist:
     A) dopo il dispatch post-arco, `assist_recv` ha SEMPRE un ricevente agganciato;
     B) durante la consegna la palla non arretra oltre 2 unità di gioco dal punto d'atterraggio.

   Non è nel gate (il gate cattura frame congelati): si esegue a mano o in batteria.
     node assist-delivery-test.mjs
*/
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const BACK_MAX = 2.0;   /* unità di gioco che la palla può arretrare dall'atterraggio.
   Soglia MISURATA, non scelta a occhio: col pavimento attivo gi106 arretra 1.0, senza pavimento 2.4
   (e continua a scendere oltre la finestra campionata) → 2.0 separa le due formule. */
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage();
await page.setViewportSize({ width: 900, height: 700 });
await installCdnRoutes(page);
const errs = [];
page.on('pageerror', e => errs.push(e.message.slice(0, 160)));
await page.addInitScript(() => { window.__CPM_GLB = false; });
await openMatch(page, port); await sleep(900);

/* situation il cui PRIMO tipo d'esito passa dal ramo build/dribble/tackle con reward assist:
   sono quelle in cui il difetto è strutturale (nessun setup di passaggio a monte). */
const CANDIDATI = await page.evaluate(() => {
  const S = window.__CPM_SITS || [], out = [];
  for (let g = 0; g < S.length; g++) {
    const s = S[g]; if (!s || s.type === 'def') continue;
    const a = (s.actions || [])[0]; if (!a || (a.rew || a.reward) !== 'assist') continue;
    let hl = null; try { hl = window.deriveHL && window.deriveHL(s, a); } catch (e) { }
    const ht = hl && hl.type;
    if (ht === 'build' || ht === 'dribble') out.push(g);
  }
  return out;
});
console.log('situation candidate (assist da costruzione/dribbling):', CANDIDATI.length);
if (!CANDIDATI.length) { console.log('❌ FAIL — nessuna situation candidata: il test non misura nulla'); await b.close(); srv.close(); process.exit(2); }

/* gi106 «Chip pass oltre la difesa» è IL caso del collaudo PO: se è candidata, ci sta sempre dentro */
const CAMPIONE = [...new Set([...(CANDIDATI.includes(106) ? [106] : []), ...CANDIDATI]) ].slice(0, 7);
let fails = 0;
for (const gi of CAMPIONE) {
  await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), gi); await sleep(800);
  await page.evaluate(() => { window.__CPM_FROZEN = false; }); await sleep(900);
  await page.evaluate(() => { window.__CPM_DISPATCH = null; window.__CPM_DISPATCH2 = null; window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_RESOLVE(0); });
  // traccia la palla per tutta la consegna: si registra il massimo raggiunto e il minimo DOPO di esso
  let peak = -1e9, minAfter = 1e9;
  for (let k = 0; k < 9; k++) {
    await sleep(600);
    const x = await page.evaluate(() => { try { return window.__CPM_STATE().ball.x; } catch (e) { return null; } });
    if (x == null) continue;
    if (x > peak) { peak = x; minAfter = x; } else if (x < minAfter) minAfter = x;
  }
  const d = await page.evaluate(() => ({ d1: window.__CPM_DISPATCH || null, d2: window.__CPM_DISPATCH2 || null }));
  const post = d.d2 ? d.d2.post : (d.d1 ? d.d1.post : null);
  const rcv = d.d2 ? d.d2.rcv : (d.d1 ? d.d1.rcv : null);
  const back = +(peak - minAfter).toFixed(1);
  const orfano = (post === 'assist_recv' && !rcv);
  const arretra = back > BACK_MAX;
  const ok = !orfano && !arretra;
  if (!ok) fails++;
  console.log(`${ok ? '✅' : '❌'} gi${gi} post=${post} ricevente=${rcv ? 'sì' : 'NO'} apice=${peak.toFixed(1)} arretramento=${back}`);
  if (orfano) console.log('   → assist senza ricevente: la palla resterebbe orfana');
  if (arretra) console.log(`   → la palla torna indietro di ${back}u dal punto d'atterraggio (max ${BACK_MAX})`);
}
if (errs.length) { console.log('❌ pageerror:', errs.slice(0, 3).join(' | ')); fails++; }
console.log(fails ? `\n❌ FAIL — ${fails} caso/i su ${CAMPIONE.length}` : `\n✅ PASS — ${CAMPIONE.length}/${CAMPIONE.length}: ogni consegna ha un uomo e la palla non arretra`);
await b.close(); srv.close();
process.exit(fails ? 2 : 0);
