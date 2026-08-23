#!/usr/bin/env node
/* ============================================================================
   INTORNO — «la squadra e' intorno al pallone», misurata in modo RIPETIBILE.

   PERCHE' ESISTE, e perche' non e' l'ennesima copia di appoggio-555.
   Il 23 agosto la baseline diceva «all'apertura della scena il compagno piu' vicino sta a 13,9 m,
   e nel 56% delle scene non c'e' NESSUNO entro 12 m». Su quel numero sono stati costruiti e revocati
   tre rimedi in un giorno. Il numero e' un ARTEFATTO DELLO STRUMENTO, e si dimostra in due righe di
   sorgente:
     r.15147  const _pres345=(window.__CPM_PRESENT===1);
     r.15148  const _asIfPlay=_pres345||!_CPM_TEST;
   Sotto `?cpmtest=1` — cioe' in OGNI sonda — `_asIfPlay` e' falso: lo SNAP di scena (r.15216) e il
   FREEZE di lettura (r.15232) sono spenti, e i ventuno off-ball vengono colti MENTRE CAMMINANO dalla
   scena precedente. Non e' la presentazione che vede il giocatore: e' il transito che il giocatore non
   vede mai. Stessa sonda, stesse scene, stesso processo, con `__CPM_PRESENT=1`:
     compagno piu' vicino 12,7 m → 6,2 m · scene senza nessuno entro 12 m  50% → 16%.
   Percio' questa sonda impone due cose che le altre non avevano:
     (1) `__CPM_PRESENT=1` SEMPRE — si misura cio' che va a schermo, non un suo stato intermedio;
     (2) il FLUSSO VERO (autoplay: playing → hl_intro → hl_move → hl_choose → hl_result), MAI il
         force-sit: forzare una scena salta l'intro, ed e' li' che si armano lo snap e le corse
         pre-azione (`preActionT`, r.14591) — una misura fatta col force le vede spente.

   COSA MISURA, e con quale unita' (una unita' logica ≈ un metro):
     d1        distanza del compagno piu' vicino al pallone, ESCLUSO chi ce l'ha
     gioc      quanti compagni stanno entro 12 m dal pallone, escluso chi ce l'ha
     vuoti     % di campioni in cui NESSUN compagno sta entro 12 m  →  «il padrone e' solo»
     tripla    % di campioni con ALMENO TRE compagni entro 15 m     →  «la squadra e' intorno»
     att       distanza media delle due PUNTE dal pallone           →  «l'unica opzione, e lontana»
   separate per CRONACA (fase playing) e SCENA (fasi hl_*), perche' i due contesti hanno due
   driver posizionali diversi e vanno giudicati a parte.

   COME GIUDICA: attraverso `lib/paragone.mjs` — rosso e verde nello STESSO processo, alternati,
   due giri per colore, e verdetto «non separati» quando il rumore interno a un colore e' piu' grande
   dello scarto fra i colori. Il rosso si sceglie con CPM_ROSSO (default `__CPM_NO556`): finche' quel
   rosso non esiste nel gioco i due bracci sono IDENTICI per costruzione, e allora la sonda sta
   misurando SOLO SE STESSA — il suo pavimento di rumore. E' l'uso giusto al primo giro: una soglia
   piu' stretta del rumore non e' una soglia, e' un sorteggio.

   SOGLIE, dichiarate PRIMA di qualunque rimedio (baseline misurata sul flusso vero il 23/8):
     cronaca  d1     ≤  8,0 m   (baseline 11,7)     cronaca  vuoti  ≤ 20%   (baseline 49%)
     cronaca  gioc   ≥  2       (baseline 1)        scena    att    ≤ 25 m  (baseline ~40)
     scena    tripla ≥ 60%      (baseline da leggere sotto)
   Scelte DOVE FANNO MALE: nessuna e' gia' centrata dalla baseline. Una soglia che passa al primo
   colpo non ha dimostrato niente (lezione della baseline della fase 1, 23/8).

     CPM_CHROME=... node intorno-556.mjs [CPM_MS=60000] [CPM_GIRI=2] [CPM_ROSSO=__CPM_NO556]
   ========================================================================== */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
import { paragone, stampaParagone } from './lib/paragone.mjs';

const MS    = +(process.env.CPM_MS || 180000);/* gli highlight sono RARI: sotto i ~180 s il braccio SCENA raccoglie 16-17 campioni e il suo rumore misurato e' 23 punti — cioe' non decide niente */
const GIRI  = Math.max(2, +(process.env.CPM_GIRI || 2));/* due giri per colore sono il minimo: un numero non ripetuto non e' un numero (lezione paragone) */
const ROSSO = process.env.CPM_ROSSO || '__CPM_NO556';
const VICINO = 12, INTORNO = 15;

const SOGLIE = {
  cron_d1:    { max: 8.0,  nome: 'cronaca · 1º compagno (m)',        basso: true },
  cron_gioc:  { min: 2,    nome: 'cronaca · compagni entro 12 m',    basso: false },
  cron_vuoti: { max: 20,   nome: 'cronaca · nessuno entro 12 m (%)', basso: true },
  scen_d1:    { max: 8.0,  nome: 'scena · 1º compagno (m)',          basso: true },
  scen_vuoti: { max: 20,   nome: 'scena · nessuno entro 12 m (%)',   basso: true },
  scen_tripla:{ min: 60,   nome: 'scena · almeno 3 entro 15 m (%)',  basso: false },
  scen_att:   { max: 25,   nome: 'scena · punte dal pallone (m)',    basso: true },
};

/* Una sola sorgente per il pallone E per i giocatori: le MESH, cioe' cio' che lo spettatore vede.
   Mescolare il pallone-mesh coi giocatori-logici e' la trappola gia' pagata nel 7.322 e nel 7.370. */
const LEGGI = () => {
  const S = window.__CPM_STATE && window.__CPM_STATE(); if (!S || !S.ball) return null;
  const ph = (window.__CPM_PHASE && window.__CPM_PHASE()) || S.phase; if (!ph) return null;
  const bx = S.ball.x, by = S.ball.y;
  const n = [];
  (S.players || []).forEach((p, i) => { if (p.gk || p.team !== 'home') return; n.push({ i, d: Math.hypot(p.x - bx, p.y - by) }); });
  if (S.hero) n.push({ i: -1, d: Math.hypot(S.hero.x - bx, S.hero.y - by) });
  if (n.length < 4) return null;
  n.sort((a, c) => a.d - c.d);
  const senzaPadrone = n.slice(1);                    /* [0] e' chi ha il pallone, chiunque sia */
  const att = n.filter(z => z.i === 8 || z.i === 9).map(z => z.d);
  return { ph, d1: n[1].d,
    gioc: senzaPadrone.filter(z => z.d <= 12).length,
    intorno: senzaPadrone.filter(z => z.d <= 15).length,
    att: att.length ? att.reduce((a, c) => a + c, 0) / att.length : null };
};

const med = a => { const s = a.filter(Number.isFinite).slice().sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : NaN; };
const pct = (a, f) => a.length ? 100 * a.filter(f).length / a.length : NaN;

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();

/* Un giro = una partita intera guidata dall'autoplay, campionata a cadenza fissa.
   Il seed dell'autoplay e il NOME sono FISSI e uguali nei due bracci: rosso e verde
   giocano LA STESSA partita, quindi lo scarto non puo' venire da due partite diverse. */
async function unGiro(rossoOn) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  await page.addInitScript(([r, nome]) => {
    window.__CPM_GLB = false;
    window.__CPM_PRESENT = 1;          /* ⚠️ senza questo si misura il transito, non la scena */
    if (r) window[nome] = 1;
  }, [rossoOn ? 1 : 0, ROSSO]);
  await openMatch(page, port, { skipLoadAll: true, name: 'Intorno' });
  await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 5561, policy: 'seeded', tickMs: 300 }));
  const C = [], S = [];
  const t0 = Date.now();
  while (Date.now() - t0 < MS) {
    await sleep(200);
    let r = null; try { r = await page.evaluate(LEGGI); } catch (e) { break; }
    if (!r) continue;
    if (r.ph === 'playing') C.push(r); else if (/^hl_/.test(r.ph)) S.push(r);
  }
  await page.close();
  const out = {
    n_cron: C.length, n_scen: S.length,
    cron_d1: med(C.map(r => r.d1)), cron_gioc: med(C.map(r => r.gioc)),
    cron_vuoti: pct(C, r => r.gioc === 0), cron_tripla: pct(C, r => r.intorno >= 3),
    scen_d1: med(S.map(r => r.d1)), scen_gioc: med(S.map(r => r.gioc)),
    scen_vuoti: pct(S, r => r.gioc === 0), scen_tripla: pct(S, r => r.intorno >= 3),
    scen_att: med(S.map(r => r.att)), cron_att: med(C.map(r => r.att)),
  };
  console.log(`   giro ${rossoOn ? 'ROSSO' : 'verde'}: cronaca ${C.length} campioni · scena ${S.length} · d1 ${out.cron_d1?.toFixed(1)}/${out.scen_d1?.toFixed(1)} m`
    + (S.length < 60 ? `   ⚠️ scena sotto i 60 campioni: i campi «scena · …» NON sono giudicabili in questo giro (alza CPM_MS)` : ''));
  return out;
}

console.log(`\n=== INTORNO — la squadra attorno al pallone (flusso vero, presentazione ACCESA) ===`);
console.log(`   ${GIRI} giri per colore · ${(MS / 1000) | 0} s di partita per giro · rosso = ${ROSSO}\n`);
const R = await paragone({ giri: GIRI, rosso: ROSSO, misura: unGiro });
srv.close(); await b.close();

const campi = {};
for (const [k, s] of Object.entries(SOGLIE)) campi[k] = { basso: s.basso, nome: s.nome };
campi.scen_gioc  = { basso: false, nome: 'scena · compagni entro 12 m' };
campi.cron_tripla= { basso: false, nome: 'cronaca · almeno 3 entro 15 m (%)' };
campi.cron_att   = { basso: true,  nome: 'cronaca · punte dal pallone (m)' };
const V = stampaParagone('la squadra attorno al pallone', R, campi);

/* Il VERDETTO contro le soglie si legge sul VERDE (il gioco cosi' com'e' spedito). */
console.log(`\n=== SOGLIE (dichiarate prima del rimedio) ===`);
let rotte = 0;
for (const [k, s] of Object.entries(SOGLIE)) {
  const v = med(R.verde.map(x => +x[k]));
  if (!Number.isFinite(v)) { console.log(`  ${s.nome.padEnd(36)} campioni insufficienti`); continue; }
  const ok = s.max != null ? v <= s.max : v >= s.min;
  if (!ok) rotte++;
  console.log(`  ${s.nome.padEnd(36)} ${v.toFixed(1).padStart(7)}   soglia ${s.max != null ? '≤ ' + s.max : '≥ ' + s.min}   ${ok ? '✅' : '❌'}`);
}
console.log(`\n  ${rotte} soglie su ${Object.keys(SOGLIE).length} non raggiunte.`);
const scenScarsi = R.verde.concat(R.rosso).some(x => x.n_scen < 60);
if (scenScarsi) console.log(`\n  ⚠️ ALMENO UN GIRO HA MENO DI 60 CAMPIONI DI SCENA: sui campi «scena · …» questa passata NON decide.\n     Misurato il 23/8 con CPM_MS=55000: 16-17 campioni per giro e rumore 23,5 punti su «nessuno entro 12 m».\n     Gli highlight sono rari nel flusso vero — e forzarli col force-sit falsa la misura (salta hl_intro: niente snap, niente preActionT).`);
console.log(`  Riferimento del calcio vero: col pallone in gioco DUE O TRE compagni sono giocabili quasi sempre.`);
console.log(`  Un solo appoggio non e' una squadra: e' un uomo e venti figuranti.`);
process.exit(V.peggio.length ? 1 : 0);
