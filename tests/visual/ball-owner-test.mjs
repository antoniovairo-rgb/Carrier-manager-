#!/usr/bin/env node
/* CENSIMENTO DEI PADRONI DEL PALLONE — F2, fase di SOLA OSSERVAZIONE.

   DA DOVE VIENE. L'audit ha contato **62 righe distinte** che scrivono la posizione del pallone, senza
   nessun arbitro fra loro: attacco all'eroe, arco della cronaca, arco dell'highlight, post-arco, parata
   del portiere, lerp logico, snap di transizione — tutte sullo stesso oggetto, ogni fotogramma. E' il
   candidato principale per le tre note del PO «palla che si muove in autonomia», ed e' anche cio' che il
   report AI Vision chiama «ball teleport» su 17 scene su 30.

   PERCHE' SOLO OSSERVARE. Il pallone e' il cuore visivo della partita: un arbitro acceso male si vede
   subito e ovunque. La roadmap concordata col PO dice di misurare prima quanto e quando i sistemi si
   pestano i piedi, poi decidere le priorita' con quel numero in mano. Questa passata NON cambia nulla nel
   gioco: conta soltanto.

   COSA MISURA, per fotogramma:
     · quanti scrittori si sono DICHIARATI (oggi dieci punti lo fanno, dal 7.497 anche l'arco e la palla
       incollata all'eroe: erano i due movimenti posizionali che restavano anonimi);
     · quante volte piu' d'uno scrive nello STESSO fotogramma → conflitto, con la coppia colpevole;
     · quante volte il pallone si MUOVE senza che nessuno si sia dichiarato → e' la firma di «si muove da
       solo», ed e' il numero che F2 dovra' portare a zero.

   ⚠️ «NESSUNO DICHIARATO» NON VUOL DIRE «NESSUNO L'HA SCRITTO»: 52 dei 62 punti non hanno ancora un nome,
   quindi la quota anonima misura quanto lavoro resta da attribuire, non un difetto in se'. E' una mappa
   di copertura, e va letta cosi' finche' i punti dichiarati non coprono i percorsi che contano.

   ⚠️ La fase si legge da `__CPM_PHASE` (helper `matchPhase`), mai da `__CPM_STATE` (7.494/7.495/7.496).

   PROVA DEL ROSSO: `__CPM_NO497` spegne il conteggio; con `CPM_ROSSO=1` il censimento PRETENDE zero
   fotogrammi osservati. ⚠️ Il primo disegno di questa prova usava `__CPM_REC` come interruttore ed e'
   FALLITO contando 2762 fotogrammi «a strumenti spenti»: l'armamento del varco accetta anche
   `_CPM_TEST`, e l'harness apre sempre con `?cpmtest=1`. Un interruttore che non spegne non prova nulla.

     CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node ball-owner-test.mjs [CPM_ROSSO=1]                   */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, matchPhase } from './lib/harness.mjs';

const ROSSO = !!process.env.CPM_ROSSO;
const PARTITE = +(process.env.CPM_PARTITE || 3);
const TETTO_MS = +(process.env.CPM_TETTO || 240000);

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const errs = [];

async function partita(i) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  page.on('pageerror', e => errs.push(String(e.message).slice(0, 110)));
  await page.addInitScript(({ r, n515 }) => {
    window.__CPM_GLB = false; window.__CPM_REC = true; window.__CPM_CINE = 1; window.__CPM_PRESENT = 1;
    try { localStorage.setItem('cpm-devtools', '1'); } catch (e) {}
    if (r) window.__CPM_NO497 = 1;   /* l'interruttore VERO del conteggio */
    if (n515) window.__CPM_NO515 = 1; /* [7.515.0] rosso dell'arbitro inseguitore/colla */
  }, { r: ROSSO, n515: !!process.env.CPM_NO515 });
  try {
    await openMatch(page, port, { skipLoadAll: true, name: 'Owner' + i });
    await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 350 }), 500 + i * 91);
    const t0 = Date.now();
    while (Date.now() - t0 < TETTO_MS) {
      await sleep(500);
      const ph = await matchPhase(page);
      if (ph === 'ended' || ph === 'ceremony') break;
    }
    return await page.evaluate(() => window.__CPM_OWN497 || null);
  } catch (e) { return null; }
  finally { await page.close().catch(() => {}); }
}

const giri = [];
for (let i = 0; i < PARTITE; i++) giri.push(await partita(i));
await b.close(); srv.close();

const tot = { f: 0, dich: 0, multi: 0, mosso: 0, anon: 0, coppie: {} };
for (const g of giri) {
  if (!g) continue;
  tot.f += g.f || 0; tot.dich += g.dich || 0; tot.multi += g.multi || 0; tot.mosso += g.mosso || 0; tot.anon += g.anon || 0;
  for (const [k, v] of Object.entries(g.coppie || {})) tot.coppie[k] = (tot.coppie[k] || 0) + v;
}

const pc = (a, b2) => b2 ? (100 * a / b2).toFixed(1) + '%' : '—';
console.log(`\n=== CHI COMANDA IL PALLONE · F2 osservazione${ROSSO ? ' · PROVA DEL ROSSO (strumenti spenti)' : ''} ===`);
console.log(`  fotogrammi osservati        ${String(tot.f).padStart(7)}   su ${giri.filter(Boolean).length}/${PARTITE} partite`);
console.log(`  con almeno uno dichiarato   ${String(tot.dich).padStart(7)}   ${pc(tot.dich, tot.f)}`);
console.log(`  con PIU' d'uno (conflitto)  ${String(tot.multi).padStart(7)}   ${pc(tot.multi, tot.f)}`);
console.log(`  in cui il pallone si muove  ${String(tot.mosso).padStart(7)}   ${pc(tot.mosso, tot.f)}`);
console.log(`     …senza nessun padrone    ${String(tot.anon).padStart(7)}   ${pc(tot.anon, tot.mosso)} del movimento`);

const cop = Object.entries(tot.coppie).sort((a, b2) => b2[1] - a[1]).slice(0, 8);
if (cop.length) {
  console.log('\n  chi si pesta i piedi con chi:');
  for (const [k, v] of cop) console.log(`    ${String(v).padStart(6)}x  ${k}`);
} else console.log('\n  nessun fotogramma con due scrittori dichiarati');

for (const e of errs.slice(0, 3)) console.log('  ⚠ pageerror: ' + e);

if (ROSSO) {
  if (!tot.f) { console.log('\n✅ prova del rosso riuscita: con gli strumenti spenti il testimone non conta nulla'); process.exit(0); }
  console.log(`\n❌ PROVA DEL ROSSO FALLITA: ${tot.f} fotogrammi contati con gli strumenti spenti — il testimone sta guardando qualcosa che non e' il gioco`); process.exit(2);
}
/* ⚠️ un censimento che non ha osservato non e' verde, e' cieco */
if (!tot.f || !tot.mosso) { console.log('\n❌ CIECO: nessun fotogramma osservato (o pallone mai mosso) — non c\'e\' misura'); process.exit(2); }
/* [7.515.0 R2/4] MODALITA' GUARDIANO sulla COPPIA piu' rumorosa — soglie sullo strumento validato (lezione
   framing: mai un guardiano nuovo accanto a un censimento buono). Baseline con l'arbitro leggero: 50
   inseguitore+addosso su 3 partite (i passaggi di consegne legittimi); senza arbitro (__CPM_NO515): 605.
   CPM_IA_MAX giudica; CPM_ROSSO515=1 (con __CPM_NO515 acceso via env) esige il ritorno del conflitto. */
const IA_MAX = +(process.env.CPM_IA_MAX || 0);
if (IA_MAX) {
  const _ia = tot.coppie['inseguitore+addosso'] || 0;
  if (process.env.CPM_ROSSO515) {
    if (_ia > IA_MAX * 2) { console.log(`\n✅ prova del rosso 515 riuscita: senza arbitro il conflitto torna (${_ia})`); process.exit(0); }
    console.log(`\n❌ PROVA DEL ROSSO 515 FALLITA: ${_ia} conflitti anche senza arbitro`); process.exit(2);
  }
  if (_ia > IA_MAX) { console.log(`\n❌ l'arbitro si e' perso: ${_ia} conflitti inseguitore+addosso > ${IA_MAX}`); process.exit(2); }
  console.log(`\n✅ un padrone per fotogramma sulla coppia inseguitore/colla (${_ia} <= ${IA_MAX})`);
}
console.log(`\n✅ baseline F2 misurata su ${tot.f} fotogrammi · ${tot.anon} movimenti senza padrone da attribuire`);
