#!/usr/bin/env node
/* GUARDIANO — LA CRONACA NON SMENTISCE IL MOVIMENTO CHE HA APPENA ANNUNCIATO.

   DA DOVE VIENE. Direttiva PO: «la cronaca deve rispecchiare ed essere sincronizzata con i movimenti sul
   campo». Ogni riga di `BG_MATCH` DICHIARA dove va il pallone (`bpos`) e come si dispone la squadra
   (`pd`): testo e movimento nascono dalla stessa sorgente — tutte e 188 le voci hanno entrambi i campi,
   verificato — quindi la desincronia non era di contenuto ma di TEMPO.

   COSA GIUDICA. La FRAZIONE del tragitto dichiarato che il pallone percorre prima che la riga successiva
   sposti il bersaglio. E' un rapporto, quindi non dipende da fps o dispositivo.

   ⚠️ IL DIFETTO ERA IL RAGGRUPPAMENTO, NON LA DENSITA' MEDIA. Misurato prima: mediana 64%, ma 5 coppie su
   12 sotto un terzo — e quelle stavano TUTTE a 418-420 ms l'una dall'altra, cioe' un tick solo, con il
   pallone fermo a un passo di lerp (0,25 = 25%) dal punto di partenza. Un pavimento di 3 tick garantisce
   1-0,75^3 = 58% di ogni movimento annunciato; la probabilita' per tick e' salita in cambio (0,18 -> 0,55)
   perche' col solo pavimento la cronaca crollava da 15 righe a 4 su 40 secondi, che e' l'opposto di una
   telecronaca.

   ⚠️ DUE ECCEZIONI LEGITTIME, ed e' importante non trattarle come difetti:
     · IL GOL del micro-simulatore e' esente dal pavimento — si racconta quando accade, non quando la
       pausa lo consente. Nella misura appare come una coppia a un tick di distanza.
     · Una coppia a cavallo di un HIGHLIGHT ha un intervallo enorme (misurati 13,6 s) e una frazione
       bassa: li' la cronaca e' sospesa e il pallone e' stato mosso dall'azione, non dalla riga.
   Il criterio guarda quindi la MEDIANA e conta le coppie sotto un terzo ESCLUDENDO gol e salti di fase.

   PROVA DEL ROSSO: `__CPM_NO485` toglie il pavimento e rimette la probabilita' di prima.

     CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node bg-sync-test.mjs [CPM_ROSSO=1]                      */
/* [giro 162 PO-362] LO STRUMENTO ERA CIECO, ANCHE SULLA BASE (21 righe in 40 s, 0 coppie). MISURATO: tutte le righe arrivavano
   SENZA bersaglio (`bp` null). Causa: dal 7.870 il motore del possesso (`MOTORE870`) guida il pallone e la riga lo DESCRIVE
   (`_bt498=null`, src/15) — e il pavimento che questo guardiano sorveglia (`_pausa485`, `_bgProb`) vive solo nel ramo della
   cronaca pescata, che sotto il motore non gira: li' il ritmo lo tiene il narratore (`cool` in `narra870`), che `__CPM_NO485`
   non tocca. Quindi lo strumento si mette nel regime dove vive cio' che giudica: `__CPM_NO870` acceso in ENTRAMBI i bracci
   (cronaca pescata che comanda il pallone), e si gioca ogni partita fino al suo EVENTO di fine (fischio) e se ne gioca un'altra finche' non ci sono
   `MIN_COPPIE` coppie giudicabili, invece di 40 s fissi, con l'autoplay seedato perche' gli highlight non fermino la partita. Soglie invariate. Sotto il minimo = CIECO.
   ⚠️ Ne segue che, a motore acceso (la partita vera), questo pavimento NON e' sorvegliato da nessuno: lo dice il rapporto 162.
   ⚠️ E LA PROVA DEL ROSSO OGGI NON CADE (misurato giro 162: verde 31 coppie, 6% sotto un terzo; rosso 18 coppie, 0%): il criterio
   «sotto un terzo» fu tarato sul lerp 0,25/tick, e dal 7.511 il passo e' 0,65/tick — una riga a un tick mostra gia' il 65%.
   Col lerp d'origine (`CPM_LERP25=1`, diagnosi) il rosso cade ma cade anche il verde (75%): le righe forzate venute dopo il
   7.485 scavalcano il pavimento. Criterio e soglie NON toccati: decisione aperta nel rapporto. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, matchPhase } from './lib/harness.mjs';

const MIN_COPPIE = +(process.env.CPM_MIN_COPPIE || 12);   /* campione minimo dichiarato (la misura del 7.485 ne aveva 12) */
const TETTO = +(process.env.CPM_TETTO || 1800000);         /* solo sicurezza: si chiude prima sull'evento */
const ROSSO = !!process.env.CPM_ROSSO;
const MIN_MEDIANA = 50;   /* nuovo 68% · vecchio 64% con la coda rotta: si giudica la CODA, non la mediana */
const MAX_SCARSE = 15;    /* % di coppie sotto un terzo: misurato 0-5% col pavimento, 42% senza */

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const errs = [];
const MOTORE = !!process.env.CPM_MOTORE;   /* solo diagnosi: lascia acceso il motore del possesso (il regime in cui lo strumento e' cieco) */
const LERP25 = !!process.env.CPM_LERP25;   /* solo diagnosi: rimette il lerp 0,25/tick d'origine (__CPM_NO511), il regime per cui il pavimento fu tarato */
const MAX_PARTITE = +(process.env.CPM_PARTITE || 6);
/* ogni partita si gioca fino al FISCHIO (evento) su una pagina nuova e con un nome diverso (il seme di partita nasce anche dal
   nome, 7.496): le coppie non si formano mai a cavallo di due partite. Si gioca un'altra partita finche' il campione non c'e'. */
const t0 = Date.now(); let g = [], fine = 'tetto', coppieTot = [], scartiTot = { senzaBp: 0, vicino: 0, gol: 0, lontane: 0 }, righeTot = 0, partite = 0;
for (let n = 0; n < MAX_PARTITE && coppieTot.length < MIN_COPPIE && Date.now() - t0 < TETTO; n++) {
  const page = await b.newPage({ viewport: { width: 900, height: 900 } });
  await installCdnRoutes(page); page.on('pageerror', e => errs.push(String(e.message).slice(0, 110)));
  await page.addInitScript(([r, mot, pas]) => { window.__CPM_GLB = false; window.__CPM_BGSYNC = null; if (!mot) window.__CPM_NO870 = 1; if (pas) window.__CPM_NO511 = 1; if (r) window.__CPM_NO485 = 1; try { localStorage.setItem('cpm-match-speed', '2'); } catch (e) {} }, [ROSSO, MOTORE, LERP25]);
  await openMatch(page, port, { skipLoadAll: true, name: 'Sync' + n });
  await page.evaluate((sd) => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: sd, policy: 'seeded', tickMs: 350 }), 485 + n * 31);
  fine = 'tetto'; g = [];
  while (Date.now() - t0 < TETTO) {
    await sleep(1000);
    g = await page.evaluate(() => window.__CPM_BGSYNC || []).catch(() => g);
    const ph = await matchPhase(page); if (ph === 'ended' || ph === 'ceremony') { fine = 'fischio'; break; }
  }
  await page.close().catch(() => {});
  const m = misura(g); partite++; righeTot += g.length; coppieTot.push(...m.coppie); for (const k in scartiTot) scartiTot[k] += m.scarti[k];
  console.log(`  partita ${n + 1}: chiusa su ${fine} · righe ${g.length} · coppie ${m.coppie.length}`);
}
const FIN = Date.now() - t0;
await b.close(); srv.close();

function misura(g) {
const conBp = g.filter(x => x.bp);
const coppie = [], scarti = { senzaBp: g.length - conBp.length, vicino: 0, gol: 0, lontane: 0 };
for (let i = 0; i < conBp.length - 1; i++) {
  const a = conBp[i], c = conBp[i + 1];
  const dTot = Math.hypot(a.bp.x - a.da.x, a.bp.y - a.da.y);
  if (dTot < 3) { scarti.vicino++; continue; }              /* bersaglio gia' addosso: nulla da percorrere */
  if (/gol|gol avversario/i.test(a.txt) || /gol/i.test(c.txt)) { scarti.gol++; continue; }   /* il gol e' esente per progetto */
  if (c.t - a.t > 6000) { scarti.lontane++; continue; }     /* coppia a cavallo di un highlight */
  coppie.push({ q: 100 * Math.min(1, Math.hypot(c.da.x - a.da.x, c.da.y - a.da.y) / dTot), dt: c.t - a.t, txt: a.txt });
}
return { coppie, scarti };
}
const coppie = coppieTot, scarti = scartiTot;
coppie.sort((x, y) => x.q - y.q);
const med = coppie.length ? coppie[Math.floor(coppie.length / 2)].q : null;
const scarse = coppie.filter(x => x.q < 33).length;
const pctScarse = coppie.length ? 100 * scarse / coppie.length : 0;

console.log(`\n=== CRONACA ⟺ MOVIMENTO${ROSSO ? ' · PROVA DEL ROSSO (__CPM_NO485)' : ''} ===`);
console.log(`  righe di cronaca in ${partite} partite (${(FIN / 1000).toFixed(0)} s): ${righeTot}   ·   coppie giudicabili: ${coppie.length} (minimo ${MIN_COPPIE})`);
console.log(`  scarti: senza bersaglio ${scarti.senzaBp} · bersaglio addosso ${scarti.vicino} · gol ${scarti.gol} · oltre 6 s ${scarti.lontane}`);
if (coppie.length < MIN_COPPIE) { console.log(`\n❌ CIECO: ${coppie.length} coppie giudicabili, minimo ${MIN_COPPIE}${scarti.senzaBp === righeTot && righeTot ? ' — nessuna riga dichiara il bersaglio: il motore del possesso e\' acceso?' : ''}`); process.exit(2); }
console.log(`  tragitto annunciato percorso prima della riga dopo: mediana ${med.toFixed(0)}% (minimo ${coppie[0].q.toFixed(0)}%)`);
console.log(`  coppie sotto un terzo del tragitto: ${scarse}/${coppie.length} = ${pctScarse.toFixed(0)}%`);
for (const x of coppie.slice(0, 3)) console.log(`    ${x.q.toFixed(0).padStart(3)}% in ${String(x.dt).padStart(5)} ms · «${x.txt}»`);
for (const e of errs.slice(0, 3)) console.log('  ⚠ pageerror: ' + e);

const ko = (med < MIN_MEDIANA) || (pctScarse > MAX_SCARSE);
if (ROSSO) {
  if (ko) { console.log('\n✅ prova del rosso riuscita: senza il pavimento la cronaca smentisce i propri movimenti'); process.exit(0); }
  console.log('\n❌ PROVA DEL ROSSO FALLITA: il guardiano resta verde anche senza il pavimento'); process.exit(2);
}
if (ko) { console.log(`\n❌ la cronaca annuncia movimenti che il campo non fa in tempo a mostrare`); process.exit(2); }
console.log('\n✅ ogni riga di cronaca ha il tempo di essere mostrata prima della successiva');
