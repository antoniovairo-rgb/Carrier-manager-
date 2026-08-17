#!/usr/bin/env node
/* GUARDIANO — LA PARTITA DURA NOVANTA MINUTI.

   DA DOVE VIENE. Direttiva PO: «90 veri». L'audit aveva misurato che il fischio finale non arrivava al
   90' ma all'esaurimento degli highlight (`handleContinue`, `nx>=numHL`): sul percorso del provino la
   gara moriva al 50' — e ci moriva anche forzando `numHL` al tetto di 8. Ne seguiva che il ramo
   «cronometro a 90» non si raggiungeva quasi mai, e che tre rami di gioco (sostituzione 65-70',
   highlight disperato al 72', doppia occasione al 60') erano irraggiungibili: `match-sequence` lo
   dichiarava a ogni passata come cecita' residua.

   COSA GIUDICA, su partite VERE giocate fino in fondo:
     · il minuto del FISCHIO FINALE — deve arrivare a 90;
     · la DISTRIBUZIONE dei minuti degli highlight — devono coprire tutta la gara, non i primi due terzi:
       spostare il fischio senza spalmare gli highlight lascerebbe venti minuti di coda vuota, cioe' si
       sarebbe risolto un difetto creandone un altro;
     · la DURATA REALE a 1x, perche' e' la conseguenza che il giocatore sente davvero.

   ⚠️ La fase si legge da `__CPM_PHASE` (7.494/7.495/7.496), il minuto da `__CPM_STATE().clock` finche' il
   3D e' montato, e il MINUTO FINALE da `__CPM_CLOCK` — che sopravvive al fischio, quando il 3D si smonta.

   PROVA DEL ROSSO: `__CPM_NO500` rimette il fischio all'esaurimento degli highlight. Il minuto finale
   deve crollare.

     CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node match-full-test.mjs [CPM_ROSSO=1]                   */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, matchPhase } from './lib/harness.mjs';

const ROSSO = !!process.env.CPM_ROSSO;
const PARTITE = +(process.env.CPM_PARTITE || 3);
const TETTO_MS = +(process.env.CPM_TETTO || 300000);
const MIN_FINALE = 88;   /* il clock si ferma a 90; 88 lascia margine al campionamento */
/* ⚠️ SU COSA PUO' DAVVERO SEPARARE UNA PROVA DEL ROSSO, E PERCHE' NON SUL MINUTO FINALE.
   Il rimedio ha due meta': (a) gli highlight si spalmano su [8,84] invece che sui primi due terzi;
   (b) il fischio si sgancia dal loro esaurimento. La (b) da sola NON si vede quasi mai, perche' la coda
   REATTIVA fa crescere `numHL` durante la partita (un gol subito ne aggiunge uno): l'esaurimento spesso
   non arriva prima del 90', e il primo disegno di questa prova e' FALLITO proprio cosi' — col rimedio
   spento le partite arrivavano lo stesso al 90'. La (a) invece e' deterministica: il calendario degli
   highlight si legge da `__CPM_HLTIMES` e cambia sempre. E' li' che la prova del rosso separa. */
const MIN_ULTIMO_HL = +(process.env.CPM_HLMIN || 78);

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const errs = [];

async function partita(i) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  page.on('pageerror', e => errs.push(String(e.message).slice(0, 110)));
  await page.addInitScript(r => { window.__CPM_GLB = false; if (r) window.__CPM_NO500 = 1; }, ROSSO);
  try {
    await openMatch(page, port, { skipLoadAll: true, name: 'Full' + i });
    /* ⚠️ IL CALENDARIO SI LEGGE ALL'INIZIO, NON ALLA FINE. `__CPM_HLTIMES` e' vivo: durante la partita
       la coda REATTIVA ci infila highlight nuovi (un gol subito ne aggiunge uno, al minuto corrente+2),
       quindi a fine gara l'ultima voce e' tarda comunque e la prova del rosso FALLIVA — misurato: 82-84'
       col rimedio spento, contro una soglia di 78'. Cio' che il rimedio cambia in modo deterministico e'
       il calendario INIZIALE, e va fotografato prima che la partita lo modifichi. */
    const _sched = await page.evaluate(() => (window.__CPM_HLTIMES ? window.__CPM_HLTIMES() : []));
    await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), 900 + i * 43);
    const t0 = Date.now(); let ultimo = 0, finita = false;
    while (Date.now() - t0 < TETTO_MS) {
      await sleep(500);
      const d = await page.evaluate(() => {
        let ck = null; try { ck = window.__CPM_CLOCK ? window.__CPM_CLOCK() : null; } catch (e) {}
        return { ph: (window.__CPM_PHASE ? window.__CPM_PHASE() : null), ck };
      });
      if (d.ck != null) ultimo = d.ck;
      if (d.ph === 'ended' || d.ph === 'ceremony') { finita = true; break; }
    }
    const hl = await page.evaluate(() => {
      const ev = window.__CPM_EV ? window.__CPM_EV() : [];
      const f = ev.filter(e => e.ev === 'fine');
      return { minuti: ev.filter(e => e.ev === 'chronicle').map(e => e.min), causa: f.length ? f[f.length - 1].causa : null };
    });
    return { finale: ultimo, finita, durata: Date.now() - t0,
             cronacaMax: Math.max(0, ...(hl.minuti || [0])),
             ultimoHL: Math.max(0, ...((_sched || []).filter(t => t < 9000))), causa: hl.causa };
  } catch (e) { return { finale: 0, finita: false, durata: 0, cronacaMax: 0 }; }
  finally { await page.close().catch(() => {}); }
}

const giri = [];
for (let i = 0; i < PARTITE; i++) giri.push(await partita(i));
await b.close(); srv.close();

console.log(`\n=== LA PARTITA DURA NOVANTA MINUTI${ROSSO ? ' · PROVA DEL ROSSO (__CPM_NO500)' : ''} ===`);
for (let i = 0; i < giri.length; i++) {
  const g = giri[i];
  console.log(`  partita ${i + 1}   fischio al ${String(g.finale).padStart(2)}'  ${g.finita ? '' : '⚠ non conclusa '}· ultimo highlight al ${String(g.ultimoHL).padStart(2)}' · cronaca fino al ${String(g.cronacaMax).padStart(2)}' · fine per ${g.causa || '?'} · ${(g.durata / 1000).toFixed(0)} s reali`);
}
const finali = giri.map(g => g.finale);
const medio = finali.reduce((a, c) => a + c, 0) / finali.length;
const arrivate = giri.filter(g => g.finale >= MIN_FINALE).length;
console.log(`\n  minuto finale        min ${Math.min(...finali)} · medio ${medio.toFixed(1)} · max ${Math.max(...finali)}`);
console.log(`  arrivate al ${MIN_FINALE}'+     ${arrivate}/${giri.length}`);
console.log(`  ultimo highlight     min ${Math.min(...giri.map(g => g.ultimoHL))} · max ${Math.max(...giri.map(g => g.ultimoHL))}   (soglia ${MIN_ULTIMO_HL}')`);
console.log(`  durata reale media   ${(giri.reduce((a, g) => a + g.durata, 0) / giri.length / 1000).toFixed(0)} s`);
for (const e of errs.slice(0, 3)) console.log('  ⚠ pageerror: ' + e);

const ultimoMax = Math.max(...giri.map(g => g.ultimoHL));
const perHL = giri.filter(g => g.causa === 'highlight').length;
const perClock = giri.filter(g => g.causa === 'clock').length;
console.log(`  causa del fischio    cronometro ${perClock}/${giri.length} · esaurimento highlight ${perHL}/${giri.length}`);
if (ROSSO) {
  if (perHL > 0) { console.log(`\n✅ prova del rosso riuscita: col rimedio spento ${perHL}/${giri.length} partite finiscono perche' sono finiti gli HIGHLIGHT, non perche' e' finito il tempo`); process.exit(0); }
  console.log(`\n❌ PROVA DEL ROSSO FALLITA: tutte le partite finiscono comunque per cronometro — su questo percorso l'interruttore non separa`); process.exit(2);
}
if (perHL > 0) { console.log(`\n❌ ${perHL}/${giri.length} partite finiscono per esaurimento degli highlight, non al 90'`); process.exit(2); }
if (arrivate < giri.length) { console.log(`\n❌ solo ${arrivate}/${giri.length} partite arrivano al ${MIN_FINALE}'`); process.exit(2); }
if (ultimoMax < MIN_ULTIMO_HL) { console.log(`\n❌ l'ultimo highlight cade al ${ultimoMax}': la coda della partita resta senza momenti del giocatore`); process.exit(2); }
console.log('\n✅ la partita si gioca fino al 90\'');
