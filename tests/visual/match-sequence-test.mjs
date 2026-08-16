#!/usr/bin/env node
/* GUARDIANO — LE TRE VELOCITA' SONO LA STESSA PARTITA.

   DA DOVE VIENE. Direttiva PO: «1x, 1,5x e 2x devono utilizzare la stessa identica sequenza di eventi;
   cambiare velocita' deve modificare solo il tempo di presentazione, mai eventi, ordine, minuti,
   giocatori, risultato, statistiche o highlight».

   ⚠️ L'AUDIT HA MISURATO CHE NON ERA VERO NEMMENO A PARITA' DI VELOCITA'. La stessa partita giocata due
   volte a 1x produceva lo ZERO PER CENTO di sequenza identica, gia' dal primo evento: il tiro della
   cronaca ambientale, la scelta pesata della riga, il nome estratto, il drift di momentum e possesso e
   perfino i minuti degli highlight usavano generatori non seedati. E momentum e possesso alimentano la
   lambda del micro-simulatore, quindi nemmeno il RISULTATO era riproducibile.

   Percio' la garanzia non si poteva ottenere «presentando la stessa coda piu' lentamente»: andava
   COSTRUITA. Ora la cronaca e' una funzione pura di (seed di partita, minuto) — identica a ogni
   velocita' per costruzione, non per verifica a posteriori.

   COSA GIUDICA. Quattro partite identiche (stesso avversario, stagione, settimana, giocatore): due a 1x
   e due a 2x. Confronta la sequenza `minuto|testo` sul prefisso comune.

   ⚠️ SI CONFRONTA IL PREFISSO, non la lunghezza: in una finestra d'orologio fissa una velocita' piu'
   lenta arriva a meno minuti di gioco. Diverso numero di righe NON e' un difetto; una riga diversa
   nella stessa posizione si'.

   PROVA DEL ROSSO: `__CPM_NO489` riporta la catena ai generatori non seedati.

     CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node match-sequence-test.mjs [CPM_ROSSO=1]               */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const ROSSO = !!process.env.CPM_ROSSO;
const MIN_RIGHE = 6;

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const errs = [];
async function giro(sp, ms) {
  const page = await b.newPage({ viewport: { width: 900, height: 900 } });
  await installCdnRoutes(page);
  page.on('pageerror', e => errs.push(String(e.message).slice(0, 110)));
  await page.addInitScript(o => { window.__CPM_GLB = false; window.__CPM_TXT487 = null; if (o.r) window.__CPM_NO489 = 1; try { localStorage.setItem('cpm-match-speed', String(o.v)); } catch (e) {} }, { v: sp, r: ROSSO });
  try { await openMatch(page, port, { skipLoadAll: true }); await sleep(ms); return await page.evaluate(() => window.__CPM_TXT487 || []); }
  catch (e) { return []; } finally { await page.close().catch(() => {}); }
}
/* stessa finestra di MINUTI di gioco, non stesso orologio: 900 ms/minuto a 1x, 450 a 2x */
const a1 = await giro(1, 60000), b1 = await giro(1, 60000), a2 = await giro(2, 30000), b2 = await giro(2, 30000);
await b.close(); srv.close();

const chiave = t => t.map(x => `${x.m}|${(x.txt || '').slice(0, 30)}`);
const confronta = (x, y) => {
  const A = chiave(x), B = chiave(y), n = Math.min(A.length, B.length);
  let ug = 0; for (let i = 0; i < n; i++) if (A[i] === B[i]) ug++;
  return { n, ug, pct: n ? 100 * ug / n : 0, la: A.length, lb: B.length, primaDiff: A.findIndex((v, i) => i < n && v !== B[i]) };
};
const casi = [['1x contro 1x', confronta(a1, b1)], ['2x contro 2x', confronta(a2, b2)], ['1x contro 2x', confronta(a1, a2)]];
console.log(`\n=== LE TRE VELOCITA' SONO LA STESSA PARTITA${ROSSO ? ' · PROVA DEL ROSSO (__CPM_NO489)' : ''} ===`);
let rossi = 0, ciechi = 0;
for (const [nome, r] of casi) {
  if (r.n < MIN_RIGHE) { console.log(`  ${nome.padEnd(14)} ⚠ solo ${r.n} righe confrontabili`); ciechi++; continue; }
  const ko = r.pct < 100; if (ko) rossi++;
  console.log(`  ${nome.padEnd(14)} righe ${String(r.la).padStart(3)} vs ${String(r.lb).padStart(3)} · prefisso identico ${r.ug}/${r.n} = ${r.pct.toFixed(0)}% ${ko ? `❌ prima differenza alla posizione ${r.primaDiff}` : '✅'}`);
}
if (a1.length) console.log('\n  sequenza (1x): ' + chiave(a1).slice(0, 4).join('  ·  '));
for (const e of errs.slice(0, 3)) console.log('  ⚠ pageerror: ' + e);

/* ⚠️ un guardiano che non ha confrontato nulla non e' verde, e' cieco */
if (ciechi) { console.log(`\n❌ CIECO: ${ciechi} confronti senza abbastanza righe`); process.exit(2); }
if (ROSSO) {
  if (rossi) { console.log('\n✅ prova del rosso riuscita: senza i generatori seedati la sequenza diverge'); process.exit(0); }
  console.log('\n❌ PROVA DEL ROSSO FALLITA: la sequenza resta identica anche coi generatori non seedati'); process.exit(2);
}
if (rossi) { console.log(`\n❌ ${rossi} confronti divergono: la velocita' sta cambiando la partita`); process.exit(2); }
console.log('\n✅ stessa partita a ogni velocita\': cambia solo quando gli eventi vengono presentati');
