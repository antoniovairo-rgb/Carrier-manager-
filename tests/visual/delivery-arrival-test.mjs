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

   LA FINESTRA D'AZIONE C'ERA GIA', e la prima stesura di questa sonda non l'aveva vista: lo slot 6
   dell'anello (`f`) e' un BITFIELD scritto ogni fotogramma — bit1 arco in volo, bit2 post-arco vivo,
   bit4 build-up (`tlOn`), bit8 «sono dentro la scena» (aggiunto dal 7.420 proprio perche' la chiave
   `sk` resta attiva anche DOPO l'esito e la finestra sconfinava nella cronaca). Misurare il minimo su
   tutta la chiave di scena dava 0,2-0,9u su OGNI scena, comprese quelle segnalate dal PO: erano i
   fotogrammi di build-up, dove il pallone e' al piede di chi conduce, a schiacciare il minimo.

   LA FINESTRA GIUSTA E' UNA SOLA: da quando l'arco della consegna ATTERRA (bit1 che si spegne) fino
   alla fine della scena (bit8), esclusi i fotogrammi di build-up (bit4). E' l'unico tratto in cui la
   domanda «qualcuno e' arrivato sul pallone?» ha senso: prima il pallone e' ai piedi del portatore,
   durante e' in volo e nessuno puo' esserci sopra.

   SOGLIA: 3,4u, che e' quella con cui il GIOCO STESSO considera il pallone «ai piedi»
   (`_addosso389`, r.~12860; il guardiano gemello giudica a 3). Non e' scelta a occhio.   PROVA DEL ROSSO: `CPM_NO464=1` rimette il ripiego cieco del bersaglio. ⚠️ VA LANCIATA CON L'INTERA
   SEQUENZA (`CPM_SIT=188,30,104,105,98,158,39,56`): il difetto dipende dallo STATO DI CAMPO che le
   scene precedenti lasciano — gi56 da sola non lo riproduce (0,7u), in coda alle altre sette si'
   (5,5u col ripiego cieco, 0,2u col fix). Misurare la scena isolata avrebbe dato un verde falso.

     CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node delivery-arrival-test.mjs [--verbose]
     CPM_SIT=188,30,104,105,98,158,39,56 node delivery-arrival-test.mjs      (modo mirato)          */
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
await page.addInitScript(n => {
  window.__CPM_GLB = false; window.__CPM_CINE = 1; window.__CPM_PRESENT = 1;
  if (n) window.__CPM_NO464 = 1;   /* prova del rosso: rimette il ripiego cieco del bersaglio */
  try { localStorage.setItem('cpm-devtools', '1'); } catch (e) {}
}, process.env.CPM_NO464 ? 1 : 0);
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
      const W = S.filter(x => x.sk === Math.max(...ks) && (x.f & 8));
      if (W.length < 8) return null;
      /* ultimo fotogramma con l'arco IN VOLO: da li' in poi il pallone e' stato consegnato */
      let last = -1; for (let i = 0; i < W.length; i++) if (W[i].f & 1) last = i;
      if (last < 0) return { n: W.length, senzaArco: true };
      /* ⚠️ E LA FINESTRA VA CHIUSA ANCHE NEL TEMPO. Col force-sit la scena resta aperta ~50 secondi
         (misurati 860 fotogrammi dopo l'atterraggio): in cinquanta secondi qualcuno passa vicino al
         pallone comunque, e il minimo torna a 0,7u su tutto — un altro verde che non guarda l'azione.
         «Arrivare sul pallone» e' una cosa che succede SUBITO: 2,5s e' l'ordine di grandezza della
         finestra d'esito del gioco (`postHighlightDuration`, >=2,55s). */
      const t0 = W[last].t;
      const dopo = W.slice(last + 1).filter(x => x.t - t0 <= 2500 && !(x.f & 4) && x.md >= 0 && x.md < 900);
      if (dopo.length < 4) return { n: W.length, corta: dopo.length };
      const mds = dopo.map(x => x.md);
      return { n: W.length, nDopo: dopo.length, mdMin: Math.min(...mds), mdFin: mds[mds.length - 1] };
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
    const S = snap.samples, ks = S.map(x => x.sk).filter(v => v != null && v >= 0);
    if (!ks.length) return null;
    const W = S.filter(x => x.sk === Math.max(...ks) && (x.f & 8));
    if (W.length < 8) return null;
    let last = -1; for (let i = 0; i < W.length; i++) if (W[i].f & 1) last = i;
    if (last < 0) return null;
    const t0 = W[last].t;
    const dopo = W.slice(last + 1).filter(x => x.t - t0 <= 2500 && !(x.f & 4) && x.md >= 0 && x.md < 900);
    if (dopo.length < 4) return null;
    const mds = dopo.map(x => x.md);
    return { n: W.length, nDopo: dopo.length, mdMin: Math.min(...mds), mdFin: mds[mds.length - 1] };
  });
  if (r) { r.gi = ctx.gi; righe.push(r); if (VERB) console.log(`  gi${r.gi} · ${r.n} fotogrammi · piu' vicino al pallone: ${r.mdMin.toFixed(1)}u (a fine scena ${r.mdFin.toFixed(1)}u)`); }
}
await b.close(); srv.close();

if (!righe.length) { console.log('❌ nessuna consegna misurata: il guardiano e\' cieco, non verde'); process.exit(2); }
const utili = righe.filter(r => r.mdMin != null);
if (!utili.length) { console.log('❌ nessuna finestra d\'azione utilizzabile: il guardiano e\' cieco'); process.exit(2); }
const orfane = utili.filter(r => r.mdMin > VICINO);
console.log(`\n=== ${utili.length} consegne misurate su ${partite} partita/e (soglia «ai piedi»: ${VICINO}u) ===`);
for (const r of utili) console.log(`  ${r.mdMin <= VICINO ? '✅' : '❌'} gi${r.gi} · dopo la consegna, il piu' vicino arriva a ${r.mdMin.toFixed(1)}u (${r.nDopo} fotogrammi di finestra · a fine scena ${r.mdFin.toFixed(1)}u)`);
const q = a => { const x = a.slice().sort((m, n) => m - n); return x[x.length >> 1]; };
console.log(`\ndistanza d'arrivo mediana: ${q(utili.map(r => r.mdMin)).toFixed(1)}u · peggiore ${Math.max(...utili.map(r => r.mdMin)).toFixed(1)}u`);
for (const e of errs.slice(0, 3)) console.log('  ⚠ pageerror: ' + e);
if (orfane.length) {
  console.log(`\n❌ FAIL — ${orfane.length}/${utili.length} consegne in cui, dopo l'atterraggio, NESSUNO arriva sul pallone:`);
  for (const r of orfane) console.log(`   · gi${r.gi}: il piu' vicino si ferma a ${r.mdMin.toFixed(1)} unita'`);
  console.log('   e\' il «pallone che viaggia da solo» (codice 008).');
  process.exit(1);
}
console.log('\n✅ PASS — dopo ogni consegna qualcuno arriva davvero sul pallone.');
