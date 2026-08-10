#!/usr/bin/env node
/* [7.388.0] GUARDIANO — I MOVIMENTI CONCESSI SONO QUELLI, E NON UNO DI PIU'
   (collaudo PO «troppi movimenti concessi all'eroe» · «i movimenti dell'eroe sono controllati, sono
    riuscito a muovermi più volte del previsto»)

   PERCHE' CONTA PIU' DI UN DETTAGLIO DI COMODO. Muoversi non e' gratis per finta: ogni passo alza la
   distanza dal marcatore, e quella distanza decide un malus che vale fino a QUINDICI punti percentuali
   di probabilita' di riuscita. Un budget che non tiene non e' una svista di interfaccia, e' una leva
   con cui si compra il successo tenendo premuto un tasto.

   COSA MISURA: legge quanti passi la situazione concede (`sitSig.mm`, funzione pura sulla situation),
   poi tiene premuta una direzione ben oltre quel budget e conta quanto l'Eroe si e' spostato davvero e
   di quanto e' cresciuta la distanza dal marcatore. Ogni passo vale 2,5 unita' di griglia.

     CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node moves-budget-test.mjs [--verbose]                    */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const VERB = process.argv.includes('--verbose');
const SCENE = (process.env.CPM_SCENE || '').length ? process.env.CPM_SCENE.split(',').map(Number)
  : [4, 12, 22, 40, 56, 96, 118, 141, 149, 150];
const PASSO = 2.5;      /* unita' di griglia per passo, come nel ramo tastiera */
const TOLL = 1.2;       /* un passo puo' essere clampato dalla zona di movimento */

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 700, height: 700 } });
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = false; });
await openMatch(page, port); await sleep(1000);

const righe = [], guasti = [];
for (const gi of SCENE) {
  let ok = false; try { ok = await page.evaluate(g => window.__CPM_FORCE_SIT(g, false), gi); } catch (e) { }
  if (!ok) break;
  await sleep(500);
  const pre = await page.evaluate(() => {
    const s = window.__CPM_STATE && window.__CPM_STATE();
    return { mm: s && s.sitSig ? s.sitSig.mm : null, x: s && s.hero ? s.hero.x : null, y: s && s.hero ? s.hero.y : null,
      dd: window.__CPM_DEFDIST ? window.__CPM_DEFDIST() : null, moves: window.__CPM_MOVES };
  });
  if (pre.mm == null) continue;

  /* si tiene premuto MOLTO oltre il budget: il passo ha una pausa di 400 ms, quindi in cinque secondi
     ce ne starebbero dodici */
  await page.keyboard.down('d');
  await sleep(5200);
  await page.keyboard.up('d');
  await sleep(250);

  const post = await page.evaluate(() => {
    const s = window.__CPM_STATE && window.__CPM_STATE();
    return { x: s && s.hero ? s.hero.x : null, y: s && s.hero ? s.hero.y : null,
      dd: window.__CPM_DEFDIST ? window.__CPM_DEFDIST() : null, moves: window.__CPM_MOVES };
  });

  const spost = Math.hypot((post.x || 0) - (pre.x || 0), (post.y || 0) - (pre.y || 0));
  const passiFatti = spost / PASSO;
  const ammessi = pre.mm + TOLL / PASSO;
  const ddCresciuta = (post.dd != null && pre.dd != null) ? +(post.dd - pre.dd).toFixed(1) : null;

  const problemi = [];
  if (passiFatti > ammessi) problemi.push(`concessi ${pre.mm} passi, l'Eroe ne ha fatti ${passiFatti.toFixed(1)} (spostamento ${spost.toFixed(1)} unita')`);
  if (pre.mm === 0 && spost > TOLL) problemi.push(`la scena non concede nessun passo e l'Eroe si e' spostato di ${spost.toFixed(1)} unita'`);
  if (problemi.length) guasti.push(`gi${gi}: ` + problemi.join(' · '));
  righe.push({ gi, mm: pre.mm, passiFatti, spost, ddCresciuta, movesFinali: post.moves });
  if (VERB || problemi.length) console.log(`${problemi.length ? '❌' : '✅'} gi${String(gi).padStart(3)} · concessi ${pre.mm} · fatti ${passiFatti.toFixed(1)} · spostamento ${spost.toFixed(1)}u · distanza dal marcatore ${pre.dd}→${post.dd} (${ddCresciuta >= 0 ? '+' : ''}${ddCresciuta}) · budget residuo ${post.moves}`);
}
await b.close(); srv.close();

if (righe.length < 4) { console.log(`❌ FAIL — solo ${righe.length} scene misurate: la sonda e' cieca`); process.exit(2); }
const extra = righe.reduce((s, r) => s + Math.max(0, r.passiFatti - r.mm), 0);
console.log(`\nscene misurate ${righe.length} · passi in piu' del concesso, in totale ${extra.toFixed(1)} · crescita massima della distanza dal marcatore ${Math.max(...righe.map(r => r.ddCresciuta || 0))}`);
if (guasti.length) { console.log(`\n❌ FAIL — ${guasti.length}`); guasti.forEach(g => console.log('  · ' + g)); process.exit(2); }
console.log(`\n✅ PASS — il budget di movimento tiene: nessun passo regalato`);
