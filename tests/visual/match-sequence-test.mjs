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
   e due a 2x, GIOCATE FINO AL FISCHIO FINALE. Confronta la sequenza `minuto|testo` sul prefisso comune.

   ⚠️ [7.494.0 F0] LA VERSIONE PRECEDENTE GUARDAVA META' PARTITA, E NON LO DICEVA. Aspettava 60 s reali
   senza autoplay: al primo highlight il gioco chiede un'azione, nessuno gliela dava e IL CLOCK SI
   CONGELAVA li'. Misurato sulla pagina vera prima di toccare niente: 12 righe raccolte, minuti 1-46,
   fase a fine finestra `hl_choose` col cronometro fermo al 50'. Tutto cio' che accade dopo — inclusi tre
   generatori non seedati che l'audit ha poi trovato — stava FUORI da quello che il guardiano guardava,
   e il verde non lo diceva. Ora la partita si gioca davvero (`__CPM_AUTOPLAY` a seed fisso: le scelte
   sono identiche fra i giri, e sono per-highlight, quindi non dipendono dalla velocita') e si aspetta
   `ended`.

   ⚠️ LA FASE SI LEGGE DA `__CPM_PHASE`, MAI DA `__CPM_STATE`. `__CPM_STATE` la espone dalle props del
   componente 3D, e `show3D` NON include `ended`: al fischio finale il 3D si smonta e quella funzione
   continua a restituire l'ultimo valore vivo per sempre. Misurando cosi' questa stessa partita risultava
   «100 s bloccata in hl_result», e la ripartizione delle fasi usciva rovesciata (28,9% invece di 69,1%
   in gioco fluido). `__CPM_PHASE` legge `phaseRef` dentro LiveMatch: e' il punto in cui il dato nasce.

   ⚠️ E DICHIARA LA PROPRIA CECITA' RESIDUA. Oggi la partita finisce quando finiscono gli highlight
   (handleContinue, `nx>=numHL`), non al 90': sul percorso del provino — l'unico che questo harness apre —
   il fischio arriva sul 50' anche forzando `numHL` al tetto di 8 (misurato). Quindi i rami che vivono
   oltre quel minuto (sostituzione 65-70', highlight disperato al 72') NON sono esercitati da qui: sono
   seedati per costruzione e diventeranno verificabili con F4, quando la partita durera' 90 minuti veri.
   Il guardiano STAMPA il minuto piu' alto che ha davvero coperto: una copertura che si abbassa si vede,
   invece di passare in silenzio.

   ⚠️ SI CONFRONTA IL PREFISSO, non la lunghezza: due partite possono chiudersi con un numero diverso di
   righe. Diverso numero di righe NON e' un difetto; una riga diversa nella stessa posizione si'.

   PROVA DEL ROSSO: `__CPM_NO489` riporta la catena ai generatori non seedati.

     CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node match-sequence-test.mjs [CPM_ROSSO=1]               */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const ROSSO = !!process.env.CPM_ROSSO;
const MIN_RIGHE = 6;
/* pavimento di copertura: sotto questo minuto il guardiano non sta guardando la partita, sta guardando
   l'avvio. Il valore sta sotto il fischio finale misurato (50') con margine per la varianza del pescaggio
   degli highlight, e va ALZATO quando F4 portera' la partita al 90'. */
const MIN_MINUTO = 30;
const TETTO_MS = +(process.env.CPM_TETTO || 240000);

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const errs = [];

async function giro(sp) {
  const page = await b.newPage({ viewport: { width: 900, height: 900 } });
  await installCdnRoutes(page);
  page.on('pageerror', e => errs.push(String(e.message).slice(0, 110)));
  await page.addInitScript(o => {
    window.__CPM_GLB = false; window.__CPM_TXT487 = null;
    if (o.r) window.__CPM_NO489 = 1;
    try { localStorage.setItem('cpm-match-speed', String(o.v)); } catch (e) {}
  }, { v: sp, r: ROSSO });
  try {
    await openMatch(page, port, { skipLoadAll: true });
    /* seed fisso => stesse scelte a ogni giro. `_ar()` avanza una volta per highlight risolto, non per
       tick dell'autoplay: la sequenza delle scelte non dipende dalla velocita'. */
    await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 12345, policy: 'seeded', tickMs: 350 }));
    const t0 = Date.now();
    let finita = false;
    while (Date.now() - t0 < TETTO_MS) {
      await sleep(500);
      const ph = await page.evaluate(() => { try { return window.__CPM_PHASE ? window.__CPM_PHASE() : null; } catch (e) { return null; } });
      if (ph === 'ended' || ph === 'ceremony') { finita = true; break; }
    }
    const txt = await page.evaluate(() => window.__CPM_TXT487 || []);
    return { txt, finita };
  } catch (e) { return { txt: [], finita: false }; }
  finally { await page.close().catch(() => {}); }
}

const a1 = await giro(1), b1 = await giro(1), a2 = await giro(2), b2 = await giro(2);
await b.close(); srv.close();

const chiave = t => t.map(x => `${x.m}|${(x.txt || '').slice(0, 30)}`);
const confronta = (x, y) => {
  const A = chiave(x), B = chiave(y), n = Math.min(A.length, B.length);
  let ug = 0; for (let i = 0; i < n; i++) if (A[i] === B[i]) ug++;
  return { n, ug, pct: n ? 100 * ug / n : 0, la: A.length, lb: B.length, primaDiff: A.findIndex((v, i) => i < n && v !== B[i]) };
};
const casi = [['1x contro 1x', confronta(a1.txt, b1.txt)], ['2x contro 2x', confronta(a2.txt, b2.txt)], ['1x contro 2x', confronta(a1.txt, a2.txt)]];

console.log(`\n=== LE TRE VELOCITA' SONO LA STESSA PARTITA${ROSSO ? ' · PROVA DEL ROSSO (__CPM_NO489)' : ''} ===`);
let rossi = 0, ciechi = 0;
for (const [nome, r] of casi) {
  if (r.n < MIN_RIGHE) { console.log(`  ${nome.padEnd(14)} ⚠ solo ${r.n} righe confrontabili`); ciechi++; continue; }
  const ko = r.pct < 100; if (ko) rossi++;
  console.log(`  ${nome.padEnd(14)} righe ${String(r.la).padStart(3)} vs ${String(r.lb).padStart(3)} · prefisso identico ${r.ug}/${r.n} = ${r.pct.toFixed(0)}% ${ko ? `❌ prima differenza alla posizione ${r.primaDiff}` : '✅'}`);
}

/* COPERTURA — quanto della partita e' stato davvero guardato. Un guardiano che passa su tre righe
   d'avvio non ha verificato la partita, e deve dirlo. */
const giri = [['1x #1', a1], ['1x #2', b1], ['2x #1', a2], ['2x #2', b2]];
const minuti = giri.map(([, g]) => g.txt.length ? Math.max(...g.txt.map(x => x.m)) : 0);
const minutoMax = Math.max(...minuti, 0);
console.log(`\n  copertura   minuto piu' alto coperto ${minutoMax} · fischio finale raggiunto ${giri.filter(([, g]) => g.finita).length}/4 giri`);
console.log(`              minuti per giro: ${giri.map(([n], i) => `${n}=${minuti[i]}`).join(' · ')}`);
if (minutoMax < 65) console.log(`              ⚠ oltre il ${minutoMax}' non si guarda: sostituzione (65-70') e HL disperato (72') restano fuori — vedi F4`);

if (a1.txt.length) console.log('\n  sequenza (1x): ' + chiave(a1.txt).slice(0, 4).join('  ·  '));
for (const e of errs.slice(0, 3)) console.log('  ⚠ pageerror: ' + e);

/* ⚠️ un guardiano che non ha confrontato nulla non e' verde, e' cieco */
if (ciechi) { console.log(`\n❌ CIECO: ${ciechi} confronti senza abbastanza righe`); process.exit(2); }
if (!ROSSO && minutoMax < MIN_MINUTO) { console.log(`\n❌ CIECO: coperto solo fino al ${minutoMax}' (minimo ${MIN_MINUTO}') — la partita non e' stata giocata`); process.exit(2); }
if (ROSSO) {
  if (rossi) { console.log('\n✅ prova del rosso riuscita: senza i generatori seedati la sequenza diverge'); process.exit(0); }
  console.log('\n❌ PROVA DEL ROSSO FALLITA: la sequenza resta identica anche coi generatori non seedati'); process.exit(2);
}
if (rossi) { console.log(`\n❌ ${rossi} confronti divergono`); process.exit(2); }
console.log('\n✅ le tre velocita\' raccontano la stessa partita');
