#!/usr/bin/env node
/* GUARDIANO — CAMBIARE VELOCITA' A META' PARTITA NON CAMBIA LA PARTITA.

   DA DOVE VIENE. Direttiva PO §7: «il giocatore deve poter passare liberamente 1x ↔ 1,5x ↔ 2x durante
   una partita; il cambio deve avere effetto sul ritmo senza ricominciare la coda, saltare eventi,
   duplicare eventi, modificare la simulazione o perdere eventi gia' programmati».

   COSA GIUDICA. Due partite identiche: una a velocita' COSTANTE, una in cui la velocita' cambia due
   volte mentre si gioca (1x → 1,5x → 2x). La sequenza `minuto|testo` deve essere la stessa, e dentro la
   partita col cambio non devono comparire ne' doppioni ne' minuti fuori ordine.

   PERCHE' DOVREBBE REGGERE, e perche' va comunque misurato: dal 7.489 la cronaca e' una funzione pura di
   (seed di partita, minuto), quindi il cambio di velocita' non PUO' cambiare cosa esce — puo' pero'
   rompere il MECCANISMO, perche' cambiare velocita' ricrea l'intervallo del clock (`matchSpeed` sta
   nelle dipendenze dell'effetto). Un intervallo ricreato al momento sbagliato e' esattamente il posto in
   cui un minuto verrebbe saltato o ripetuto. E' questo che il guardiano guarda.

   ⚠️ SI CONFRONTA IL PREFISSO COMUNE: la partita col cambio accelera, quindi in una finestra d'orologio
   fissa arriva a piu' minuti. Diversa lunghezza non e' un difetto; una riga diversa nella stessa
   posizione si'.

     CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node match-speed-change-test.mjs                         */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const FIN = +(process.env.CPM_FIN || 54000);
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const errs = [];

async function partita(cambi) {
  const page = await b.newPage({ viewport: { width: 900, height: 900 } });
  await installCdnRoutes(page);
  page.on('pageerror', e => errs.push(String(e.message).slice(0, 110)));
  await page.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_TXT487 = null; try { localStorage.setItem('cpm-match-speed', '1'); } catch (e) {} });
  try {
    await openMatch(page, port, { skipLoadAll: true });
    let atteso = 0;
    for (const c of cambi) {
      await sleep(c.dopo - atteso); atteso = c.dopo;
      /* si clicca il bottone VERO: cambiare la preferenza da fuori non esercita il percorso del giocatore */
      const fatto = await page.evaluate(v => {
        const et = v === 1.5 ? '1,5×' : v + '×';
        const bs = [...document.querySelectorAll('button')].filter(x => x.textContent.trim() === et);
        if (!bs.length) return false; bs[0].click(); return true;
      }, c.v);
      if (!fatto) errs.push(`bottone ${c.v}× non trovato`);
    }
    await sleep(Math.max(0, FIN - atteso));
    /* ⚠️ SI VERIFICA CHE L'ACCELERAZIONE SIA AVVENUTA DAVVERO. Se il cambio non avesse effetto, le due
       partite sarebbero identiche in tutto e il guardiano passerebbe A VUOTO: un verde che non prova
       nulla e' il difetto che questo repo ha gia' pagato piu' volte. Il clock finale lo dimostra —
       accelerando si arriva a un minuto piu' avanti nella stessa finestra d'orologio. */
    const clock = await page.evaluate(() => { try { const p = window.__CPM_PROBE && window.__CPM_PROBE(); return p ? p.clock : null; } catch (e) { return null; } });
    const righe = await page.evaluate(() => window.__CPM_TXT487 || []);
    righe.__clock = clock;
    return righe;
  } catch (e) { return []; } finally { await page.close().catch(() => {}); }
}

const costante = await partita([]);
const conCambi = await partita([{ dopo: 16000, v: 1.5 }, { dopo: 32000, v: 2 }]);
await b.close(); srv.close();

const chiave = t => t.map(x => `${x.m}|${(x.txt || '').slice(0, 30)}`);
const A = chiave(costante), B = chiave(conCambi);
const n = Math.min(A.length, B.length);
let ug = 0, primaDiff = -1;
for (let i = 0; i < n; i++) { if (A[i] === B[i]) ug++; else if (primaDiff < 0) primaDiff = i; }
/* doppioni e minuti che tornano indietro: e' li' che si vedrebbe un intervallo ricreato male */
const doppi = B.filter((v, i) => i > 0 && v === B[i - 1]).length;
const minuti = conCambi.map(x => x.m);
const indietro = minuti.filter((m, i) => i > 0 && m < minuti[i - 1]).length;

console.log('\n=== CAMBIO VELOCITA\' DURANTE LA PARTITA (1x → 1,5x → 2x) ===');
console.log(`  righe: costante ${A.length} · con cambi ${B.length}   ·   prefisso comune ${n}`);
console.log(`  sequenza identica: ${ug}/${n} = ${n ? (100 * ug / n).toFixed(0) : '—'}%${primaDiff >= 0 ? ` (prima differenza alla posizione ${primaDiff})` : ''}`);
console.log(`  righe duplicate consecutive: ${doppi}`);
console.log(`  minuti fuori ordine: ${indietro}`);
console.log(`  clock raggiunto: costante ${costante.__clock}' · con cambi ${conCambi.__clock}'  ${(conCambi.__clock > costante.__clock) ? '✅ l\'accelerazione e\' avvenuta' : '⚠ NESSUNA accelerazione osservata'}`);
if (B.length) console.log('  sequenza con cambi: ' + B.slice(0, 4).join('  ·  '));
for (const e of errs.slice(0, 4)) console.log('  ⚠ ' + e);

if (n < 6) { console.log(`\n❌ CIECO: solo ${n} righe confrontabili`); process.exit(2); }
let ko = 0;
if (ug !== n) { console.log('\n❌ cambiare velocita\' ha cambiato la sequenza degli eventi'); ko++; }
if (doppi) { console.log(`❌ ${doppi} righe duplicate: il cambio ha ri-emesso un evento`); ko++; }
if (indietro) { console.log(`❌ ${indietro} minuti fuori ordine: il clock e' tornato indietro`); ko++; }
if (!(conCambi.__clock > costante.__clock)) { console.log(`❌ il cambio di velocita' NON ha accelerato la partita (${costante.__clock}' contro ${conCambi.__clock}'): il guardiano passerebbe a vuoto`); ko++; }
if (errs.some(e => /non trovato/.test(e))) { console.log('❌ un bottone della velocita\' non e\' raggiungibile: il giocatore non puo\' cambiare'); ko++; }
if (ko) process.exit(2);
console.log('\n✅ il cambio di velocita\' muove solo il ritmo: stessi eventi, stesso ordine, nessun doppione');
