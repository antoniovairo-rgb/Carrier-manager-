#!/usr/bin/env node
/* GUARDIANO — «IL PALLONE VIAGGIA DA SOLO» (codice 008): QUALCUNO CI DEVE ARRIVARE.

   NOTA PO (#188 [switch], 7.457): «nessun compagno è mai arrivato sul pallone (il più vicino si è
   fermato a 10.0 unità) — eppure l'azione prevedeva un destinatario» → «il pallone viaggia da solo,
   non è sincronizzato con i movimenti dei giocatori». Stessa famiglia: #30, #104, #105, #48.

   PERCHE' I DUE GUARDIANI ESISTENTI NON LO VEDONO, pur essendo verdi:
     · `assist-delivery-test.mjs` verifica che il ricevente sia AGGANCIATO (`assist_recv` ha un uomo)
       e che la palla non ARRETRI. Un uomo agganciato che non si muove abbastanza passa il test.
     · `carry-run-ball-test.mjs` misura la CONDUZIONE dentro il build-up — un'altra finestra: li' il
       pallone e' gia' ai piedi di qualcuno. La nota del PO parla del volo e di cosa succede DOPO.
   Nessuno dei due chiude il cerchio: «il destinatario ci ARRIVA». E' il criterio che manca.

   COSA MISURA. Sul FLUSSO VERO (partite vere, executor cine acceso), per ogni scena la distanza
   MINIMA nel tempo fra il pallone e il compagno di movimento piu' vicino — che e' esattamente la
   grandezza che il taccuino di bordo gia' registra per fotogramma (`md` nell'anello del testimone) e
   su cui e' costruita la riga che il PO ha letto. Se in tutta la scena nessuno scende sotto la
   soglia, il pallone ha viaggiato da solo.

   ⚠️⚠️ NON GIUDICA — E LA RAGIONE VA LETTA PRIMA DI FIDARSI DEI NUMERI. Il criterio giusto sarebbe
   «nell'azione, qualcuno scende sotto 3,4u dal pallone» (3,4 e' la soglia del gioco stesso per
   «ai piedi», `_addosso389` r.~12860). Ma la finestra su cui si misura e' la CHIAVE DI SCENA, e la
   chiave resta attiva molto oltre l'azione: misurate 957 e 832 fotogrammi per una singola scena
   forzata, dentro cui ci sono i fotogrammi di build-up in cui il pallone e' ai piedi di chi conduce.
   Il minimo su quella finestra crolla a 0,2-0,9u su TUTTE le scene — comprese quelle che il PO ha
   segnalato — quindi un verdetto costruito su quel minimo direbbe «tutto a posto» senza aver
   guardato l'azione. Sarebbe il verde cieco che questo repo ha gia' pagato piu' volte.
   Cio' che invece DISCRIMINA, e va nella direzione delle note, e' la distanza a FINE finestra:
   gi30 43,5u · gi105 30,4u · gi56 13,3u · gi188 7,5u contro gi158 3,0u e gi104 4,2u — e gi30/gi105
   sono proprio due delle scene su cui il PO ha scritto «la palla va da sola».
   PER CHIUDERE IL CODICE 008 SERVE UN MARCATORE DI FINESTRA D'AZIONE nell'anello del testimone
   (inizio/fine della consegna), che oggi non c'e': senza, non esiste modo onesto di dare un verdetto.
   Fino ad allora questa sonda STAMPA e basta.

     CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node delivery-arrival-test.mjs [--verbose]             */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const VERB = process.argv.includes('--verbose');
const TARGET = +(process.env.CPM_SCENE_N || 14);
const VICINO = +(process.env.CPM_VICINO || 3.4);   /* «ai piedi» secondo il gioco stesso */

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
/* i DEVTOOLS accendono il testimone di bordo (`_DEVT344`): senza, `__CPM_WATCH_SNAP` non esiste e la
   sonda gira senza guardare niente. `__CPM_CINE` accende l'executor, spento sotto `?cpmtest=1`. */
await page.addInitScript(() => {
  window.__CPM_GLB = false; window.__CPM_CINE = 1; window.__CPM_PRESENT = 1;
  try { localStorage.setItem('cpm-devtools', '1'); } catch (e) {}
});
await openMatch(page, port, { skipLoadAll: true });
await sleep(700);

const righe = [];
let secchi = 0, partite = 1;

/* MODO MIRATO (`CPM_SIT=188,30,104,105`): le note del PO nominano scene precise, e il flusso vero le
   propone a caso — su tre consegne pescate a campione la #188 non esce mai. Qui si forzano quelle.
   ⚠️ Il percorso forzato e' cieco sulla classe «props del commit sbagliato» (costo gia' pagato due
   volte col codice 007), ma questa misura non e' di quella famiglia: guarda se qualcuno CORRE sul
   pallone, cioe' l'AI off-ball e il bersaglio dell'arco — che il force-sit riproduce identici. */
if ((process.env.CPM_SIT || '').length) {
  for (const gi of process.env.CPM_SIT.split(',').map(Number)) {
    let ok = false; try { ok = await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), gi); } catch (e) {}
    if (!ok) { console.log(`  gi${gi}: non forzabile`); continue; }
    await sleep(420);
    await page.evaluate(() => { window.__CPM_FROZEN = false; });
    const acts = await page.evaluate(() => (window.__CPM_ACTS && window.__CPM_ACTS()) || null);
    const k = acts ? ((acts.find(a => /assist/i.test(String(a.rew || ''))) || acts[0] || {}).i) : 0;
    await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'success'; });
    try { await page.evaluate(i => window.__CPM_RESOLVE(i), k); } catch (e) { continue; }
    await page.waitForFunction(() => { try { const st = window.__CPM_STATE && window.__CPM_STATE(); return st && st.phase !== 'hl_result'; } catch (e) { return true; } }, { timeout: 25000 }).catch(() => {});
    await sleep(250);
    const r = await page.evaluate(() => {
      const snap = window.__CPM_WATCH_SNAP && window.__CPM_WATCH_SNAP();
      if (!snap || !snap.samples || !snap.samples.length) return null;
      const S = snap.samples, ks = S.map(x => x.sk).filter(v => v != null && v >= 0);
      if (!ks.length) return null;
      const W = S.filter(x => x.sk === Math.max(...ks));
      if (W.length < 8) return null;
      const mds = W.filter(x => x.md >= 0 && x.md < 900).map(x => x.md);
      if (!mds.length) return null;
      return { n: W.length, mdMin: Math.min(...mds), mdFin: mds[mds.length - 1] };
    });
    if (r) { r.gi = gi; righe.push(r); console.log(`  gi${gi} · ${r.n} fotogrammi · piu' vicino al pallone ${r.mdMin.toFixed(1)}u (fine scena ${r.mdFin.toFixed(1)}u)`); }
    else console.log(`  gi${gi}: nessun campione`);
  }
}
const MIRATO = (process.env.CPM_SIT || '').length > 0;
for (let round = 0; !MIRATO && round < TARGET * 12 && righe.length < TARGET; round++) {
  const inPlay = await page.evaluate(() => { const s = window.__CPM_STATE && window.__CPM_STATE(); return s && s.phase === 'playing'; });
  if (!inPlay) {
    if (++secchi >= 12) { secchi = 0; partite++; try { await openMatch(page, port, { skipLoadAll: true }); await sleep(700); } catch (e) { break; } }
    else await sleep(700);
    continue;
  }
  secchi = 0;
  await page.evaluate(() => { window.__CPM_QUEUE_REACTIVE && window.__CPM_QUEUE_REACTIVE(); });
  const ok = await page.waitForFunction(() => {
    try { const s = window.__CPM_STATE && window.__CPM_STATE(); return s && s.phase === 'hl_choose'; } catch (e) { return false; }
  }, { timeout: 30000 }).then(() => true).catch(() => false);
  if (!ok) { await sleep(600); continue; }

  /* interessa l'azione che PROMETTE UN DESTINATARIO: premio assist. Senza destinatario promesso
     «nessuno arriva sul pallone» non e' un difetto — e' un tiro. */
  const acts = await page.evaluate(() => (window.__CPM_ACTS && window.__CPM_ACTS()) || null);
  const k = acts ? (acts.find(a => /assist/i.test(String(a.rew || ''))) || {}).i : null;
  if (k == null) {
    await page.evaluate(() => window.__CPM_RESOLVE && window.__CPM_RESOLVE(0)).catch(() => {});
    await sleep(900);
    await page.waitForFunction(() => { try { const s = window.__CPM_STATE && window.__CPM_STATE(); return s && s.phase === 'playing'; } catch (e) { return true; } }, { timeout: 25000 }).catch(() => {});
    continue;
  }
  const ctx = await page.evaluate(() => { const s = window.__CPM_STATE && window.__CPM_STATE(); return { gi: s && s.hlIdx }; });
  await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'success'; });
  try { await page.evaluate(i => window.__CPM_RESOLVE && window.__CPM_RESOLVE(i), k); } catch (e) { continue; }
  /* si aspetta la fine VERA della scena (dal 7.461 dura quanto le serve): un'attesa fissa
     misurerebbe il proprio cronometro invece di quello del gioco. */
  await page.waitForFunction(() => { try { const s = window.__CPM_STATE && window.__CPM_STATE(); return s && s.phase !== 'hl_result'; } catch (e) { return true; } }, { timeout: 25000 }).catch(() => {});
  await sleep(250);

  const r = await page.evaluate(() => {
    const snap = window.__CPM_WATCH_SNAP && window.__CPM_WATCH_SNAP();
    if (!snap || !snap.samples || !snap.samples.length) return null;
    const S = snap.samples, ks = S.map(s => s.sk).filter(v => v != null && v >= 0);
    if (!ks.length) return null;
    const key = Math.max(...ks);
    const W = S.filter(s => s.sk === key);
    if (W.length < 8) return null;
    /* `md` = distanza del compagno di movimento piu' vicino al pallone, per fotogramma (r.~12190).
       Il minimo sul tempo dice se QUALCUNO ci e' mai arrivato. */
    const mds = W.map(s => s.md).filter(v => v != null && isFinite(v) && v < 900);
    if (!mds.length) return null;
    return { key, n: W.length, mdMin: Math.min(...mds), mdFin: mds[mds.length - 1] };
  });
  if (r) { r.gi = ctx.gi; righe.push(r); if (VERB) console.log(`  gi${r.gi} · ${r.n} fotogrammi · piu' vicino al pallone: ${r.mdMin.toFixed(1)}u (a fine scena ${r.mdFin.toFixed(1)}u)`); }
}
await b.close(); srv.close();

if (!righe.length) { console.log('❌ nessuna consegna misurata: il guardiano e\' cieco, non verde'); process.exit(2); }
const orfane = righe.filter(r => r.mdMin > VICINO);
console.log(`\n=== ${righe.length} consegne misurate su ${partite} partita/e (soglia «ai piedi»: ${VICINO}u) ===`);
for (const r of righe) console.log(`  ${r.mdMin <= VICINO ? '✅' : '❌'} gi${r.gi} · piu' vicino al pallone ${r.mdMin.toFixed(1)}u · a fine scena ${r.mdFin.toFixed(1)}u`);
const q = a => { const x = a.slice().sort((m, n) => m - n); return x[x.length >> 1]; };
console.log(`\ndistanza minima mediana: ${q(righe.map(r => r.mdMin)).toFixed(1)}u · peggiore ${Math.max(...righe.map(r => r.mdMin)).toFixed(1)}u`);
for (const e of errs.slice(0, 3)) console.log('  ⚠ pageerror: ' + e);
console.log(`\ndistanza a FINE finestra (la grandezza che discrimina): ${righe.map(r => `gi${r.gi}=${r.mdFin.toFixed(1)}`).join(' · ')}`);
console.log(`  (col criterio sul minimo sarebbero ${orfane.length}/${righe.length} orfane — numero NON attendibile: vedi l'intestazione)`);
console.log('\nℹ️  MISURA DICHIARATA, nessun verdetto: manca il marcatore di finestra d\'azione.');
