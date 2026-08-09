#!/usr/bin/env node
/* [7.364.0] GUARDIANO DELLE BOZZE DEL TACCUINO.
   In tre release consecutive il taccuino ha messo nelle note del PO tre righe FALSE, tutte della stessa
   forma — un criterio che scattava fuori dal suo dominio:
     · 7.360 «SALTO del pallone di 8,7 unita' in un fotogramma» — il criterio era `d/dt>85 u/s` con `d`
       grezzo su campioni distanti fino a mezzo secondo: 8,7 era la soglia moltiplicata per l'intervallo,
       ed e' finita identica in QUATTRO note diverse;
     · 7.361 «nessun compagno e' arrivato sul pallone» su un DRIBBLING — l'esito `chance` veniva letto come
       «c'era un destinatario»;
     · 7.364 la stessa riga su un TIRO IN RETE — la regola guardava l'intento dichiarato della scena invece
       di cosa l'azione fosse diventata.
   Una bozza falsa costa piu' di una mancata: manda il PO a cercare un difetto che non c'e'. Qui si collauda
   `draftBugNote` come la funzione pura che e', con tracce sintetiche: nessuna partita, nessuna attesa,
   nessuna varianza.
   Uso: CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node notebook-draft-test.mjs                              */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const issues = [];
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 130)));
await page.addInitScript(() => { window.__CPM_GLB = false; });
await openMatch(page, port, { skipLoadAll: true });
await sleep(400);

const casi = await page.evaluate(() => {
  if (typeof window.draftBugNote !== 'function') return null;
  const GX = 48.6;
  /* costruttore di tracce: n campioni, passo dt in ms, la palla percorre `da`→`a` in x, compagno a `md` */
  const traccia = (n, dt, da, a, md, flag) => {
    const S = [];
    for (let i = 0; i < n; i++) S.push({ t: 1000 + i * dt, x: da + (a - da) * (i / (n - 1)), y: 0.3, z: 0, hx: da, md, f: flag == null ? 1 : flag, sk: 7 });
    return { samples: S, goalX: GX, homeX: -GX, now: 1000 + n * dt, span: (n * dt) / 1000, res: 1 };
  };
  const r = {};
  const nota = (snap, ctx) => { try { return String(window.draftBugNote(snap, ctx) || ''); } catch (e) { return 'ERR:' + e.message; } };
  /* A — tiro che FINISCE IN RETE su una scena dichiarata cross: nessun destinatario da pretendere */
  r.A = nota(traccia(40, 16, 20, 49.5, 30), { intent: 'cross', out: 'goal', ok: true, sceneKey: 7 });
  /* B — cross che resta in gioco e nessun compagno arriva: la riga DEVE esserci */
  r.B = nota(traccia(40, 16, 20, 40, 30), { intent: 'cross', out: 'assist', ok: true, sceneKey: 7 });
  /* C — dribbling con esito «chance»: `chance` non e' un destinatario */
  r.C = nota(traccia(40, 16, 20, 40, 30), { intent: 'dribble', out: 'chance', ok: true, sceneKey: 7 });
  /* D — pallone a 87 u/s campionato ogni 100ms: 8,7 unita' fra due campioni, NON e' un teletrasporto */
  r.D = nota(traccia(30, 100, 0, 25.23, 2), { intent: 'shot', out: 'miss', ok: false, sceneKey: 7 });
  /* E — pallone a ~540 u/s in un fotogramma vero (16ms): teletrasporto, e il messaggio deve dire ms e u/s */
  /* la traccia dev'essere piu' lunga della FINESTRA DI GRAZIA: i primi 750 ms di ogni scena non si
     giudicano (li' il pallone viene riposizionato di proposito). Con 30 campioni da 16 ms la traccia
     durava 480 ms in tutto e il salto cadeva dentro il setup — il guardiano ha colto un errore della
     PROVA, non del gioco, ed e' esattamente il suo mestiere. */
  r.E = nota((() => { const s = traccia(110, 16, 0, 5, 2); for (let i = 80; i < 110; i++) s.samples[i].x += 8.7; return s; })(), { intent: 'shot', out: 'miss', ok: false, sceneKey: 7 });
  return r;
});

if (!casi) { issues.push('window.draftBugNote non e\' esposto: il guardiano non puo\' collaudare le bozze'); }
else {
  const DEST = /nessun compagno/i, SALTO = /SALTO del pallone/i;
  const chk = (k, testo, re, atteso, perche) => {
    const c = re.test(testo);
    console.log(`  ${k}: ${atteso ? 'attesa' : 'NON attesa'} → ${c ? 'presente' : 'assente'} ${c === atteso ? '✓' : '✗'}`);
    if (c !== atteso) issues.push(`(${k}) ${perche} — riga ${c ? 'emessa a torto' : 'mancante'}`);
  };
  chk('A', casi.A, DEST, false, 'su un TIRO IN RETE non si pretende un destinatario');
  chk('B', casi.B, DEST, true, 'su un cross che resta in gioco senza nessuno sul pallone la riga serve');
  chk('C', casi.C, DEST, false, '«chance» non e\' un destinatario');
  chk('D', casi.D, SALTO, false, '87 u/s campionati a 100ms non sono un teletrasporto: e\' la soglia per l\'intervallo');
  chk('E', casi.E, SALTO, true, 'un salto a ~540 u/s in un fotogramma vero e\' un teletrasporto');
  if (SALTO.test(casi.E) && !/\d+ ms/.test(casi.E)) issues.push('(E) il messaggio non dichiara l\'intervallo in ms: «in un fotogramma» era la promessa che la sonda non poteva mantenere');
  if (SALTO.test(casi.E) && !/u\/s/.test(casi.E)) issues.push('(E) il messaggio non dichiara la velocita\' in u/s');
}

await browser.close(); srv.close();
if (issues.length) { console.log('\n❌ ' + issues.length + ' problemi:'); issues.forEach(i => console.log('  · ' + i)); process.exit(1); }
console.log('\n✅ TACCUINO OK — le bozze scattano dove devono e tacciono dove non c\'e\' niente da dire');
