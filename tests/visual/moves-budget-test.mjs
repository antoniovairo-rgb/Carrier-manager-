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

   [giro 220, PO-485] LA MISURA PARTE A SCENA ARRIVATA. Il «prima» si leggeva 500 ms dopo la forzatura,
   a orologio. Misurato: chiave di scena e punto logico dell'eroe arrivano subito, ma su una pagina appena
   aperta i fotogrammi sono radi e lo STACCO DI SCENA della mesh (7.194, un teletrasporto voluto) atterra
   da 0,7 a oltre 2 s dopo. Se atterrava dopo i 500 ms, lo stacco veniva contato come passi: gi4 «concessi
   0, fatti 17,3». Gara persa anche sulla 7.700.0 e sulla 7.999.128: rosso intermittente da sempre, non un
   difetto del gioco. Ora si aspetta un EVENTO (chiave nuova al 3D + mesh sul punto logico, due letture
   di fila); se non arriva entro 12 s la scena e' «non giudicata», e non giudicato = rosso.
   Si misura sia la mesh sia il punto logico: conta il maggiore dei due spostamenti. Soglie invariate.

   BRACCIO ROSSO INCORPORATO: dopo il verde il guardiano ripete le scene provocando il difetto che deve
   vedere — il budget dei passi viene ricaricato durante la pressione (`__CPM_FILL_MOVES` ogni 300 ms),
   cioe' l'eroe fa passi veri non concessi. Il guardiano e' verde solo se il verde passa E il rosso cade.
   `--solo-verde` salta il braccio rosso (solo per iterare, non vale come esito).

     CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node moves-budget-test.mjs [--verbose] [--solo-verde]      */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const VERB = process.argv.includes('--verbose');
const SCENE = (process.env.CPM_SCENE || '').length ? process.env.CPM_SCENE.split(',').map(Number)
  : [4, 12, 22, 40, 56, 96, 118, 141, 149, 150];
const PASSO = 2.5;      /* unita' di griglia per passo, come nel ramo tastiera */
const TOLL = 1.2;       /* un passo puo' essere clampato dalla zona di movimento */

const SOLO_VERDE = process.argv.includes('--solo-verde');
const ATTESA_MAX = 12000;  /* tetto d'attesa della scena arrivata: oltre, «non giudicata» */

async function braccio(nome, rosso) {
  const srv = await startServer(); const port = srv.address().port;
  const b = await launchBrowser();
  const page = await b.newPage({ viewport: { width: 700, height: 700 } });
  await installCdnRoutes(page);
  await page.addInitScript(() => { window.__CPM_GLB = false; });
  await openMatch(page, port); await sleep(1000);
  const lettura = () => page.evaluate(() => {
    const s = window.__CPM_STATE && window.__CPM_STATE(); const g = window.__CPM_G96 && window.__CPM_G96();
    return { sk: g ? g.sk : null, mm: s && s.sitSig ? s.sitSig.mm : null,
      x: s && s.hero ? s.hero.x : null, y: s && s.hero ? s.hero.y : null,
      lx: s && s.heroTarget ? s.heroTarget.x : null, ly: s && s.heroTarget ? s.heroTarget.y : null,
      dd: window.__CPM_DEFDIST ? window.__CPM_DEFDIST() : null, moves: window.__CPM_MOVES };
  });
  const righe = [], guasti = [], nonGiudicate = [];
  for (const gi of SCENE) {
    const sk0 = (await lettura()).sk;
    let ok = false; try { ok = await page.evaluate(g => window.__CPM_FORCE_SIT(g, false), gi); } catch (e) { }
    if (!ok) { nonGiudicate.push(`gi${gi}: forzatura rifiutata`); break; }
    /* si aspetta la scena ARRIVATA: chiave nuova nel 3D e mesh dell'eroe sul suo punto logico, due volte di fila */
    const t0 = Date.now(); let pre = null, fila = 0, ult = null;
    while (Date.now() - t0 < ATTESA_MAX) {
      await sleep(150); const r = await lettura(); ult = r;
      const chiave = r.sk != null && String(r.sk) !== String(sk0) && (+r.sk % 10000) === gi;
      const sulPunto = r.x != null && r.lx != null && Math.hypot(r.x - r.lx, r.y - r.ly) < 0.5;
      fila = (chiave && sulPunto) ? fila + 1 : 0;
      if (fila >= 2) { pre = r; break; }
    }
    if (!pre) { nonGiudicate.push(`gi${gi}: scena non arrivata in ${ATTESA_MAX} ms (chiave ${ult && ult.sk}, mesh ${ult && ult.x},${ult && ult.y}, logico ${ult && ult.lx},${ult && ult.ly})`); continue; }
    const attesa = Date.now() - t0;
    if (pre.mm == null) { nonGiudicate.push(`gi${gi}: budget della scena illeggibile`); continue; }

    /* braccio rosso: il difetto provocato — il budget si ricarica durante la pressione */
    if (rosso) await page.evaluate(g => { const st = (typeof SITUATIONS !== 'undefined') ? SITUATIONS[g] : null;
      window.__G220R = setInterval(() => { try { window.__CPM_FILL_MOVES(st); } catch (e) { } }, 300); }, gi);
    /* si tiene premuto MOLTO oltre il budget: il passo ha una pausa di 400 ms, quindi in cinque secondi
       ce ne starebbero dodici */
    await page.keyboard.down('d');
    await sleep(5200);
    await page.keyboard.up('d');
    if (rosso) await page.evaluate(() => clearInterval(window.__G220R));
    await sleep(250);
    const post = await lettura();

    const spostMesh = Math.hypot((post.x || 0) - (pre.x || 0), (post.y || 0) - (pre.y || 0));
    const spostLog = Math.hypot((post.lx || 0) - (pre.lx || 0), (post.ly || 0) - (pre.ly || 0));
    const spost = Math.max(spostMesh, spostLog);
    const passiFatti = spost / PASSO;
    const ammessi = pre.mm + TOLL / PASSO;
    const ddCresciuta = (post.dd != null && pre.dd != null) ? +(post.dd - pre.dd).toFixed(1) : null;

    const problemi = [];
    if (passiFatti > ammessi) problemi.push(`concessi ${pre.mm} passi, l'Eroe ne ha fatti ${passiFatti.toFixed(1)} (spostamento ${spost.toFixed(1)} unita')`);
    if (pre.mm === 0 && spost > TOLL) problemi.push(`la scena non concede nessun passo e l'Eroe si e' spostato di ${spost.toFixed(1)} unita'`);
    if (problemi.length) guasti.push(`gi${gi}: ` + problemi.join(' · '));
    righe.push({ gi, mm: pre.mm, passiFatti, spost, ddCresciuta, movesFinali: post.moves });
    if (VERB || (problemi.length && !rosso)) console.log(`[${nome}] ${problemi.length ? '❌' : '✅'} gi${String(gi).padStart(3)} · attesa scena ${attesa} ms · concessi ${pre.mm} · fatti ${passiFatti.toFixed(1)} · mesh ${spostMesh.toFixed(1)}u · logico ${spostLog.toFixed(1)}u · distanza dal marcatore ${pre.dd}→${post.dd} (${ddCresciuta >= 0 ? '+' : ''}${ddCresciuta}) · budget residuo ${post.moves}`);
  }
  await b.close(); srv.close();
  return { righe, guasti, nonGiudicate };
}

let esito = 0;
const V = await braccio('verde', false);
const extra = V.righe.reduce((s, r) => s + Math.max(0, r.passiFatti - r.mm), 0);
console.log(`\n[verde] scene misurate ${V.righe.length} · non giudicate ${V.nonGiudicate.length} · passi in piu' del concesso, in totale ${extra.toFixed(1)} · crescita massima della distanza dal marcatore ${Math.max(0, ...V.righe.map(r => r.ddCresciuta || 0))}`);
if (V.righe.length < 4) { console.log(`❌ [verde] solo ${V.righe.length} scene misurate: la sonda e' cieca`); esito = 2; }
if (V.nonGiudicate.length) { console.log(`❌ [verde] ${V.nonGiudicate.length} scene non giudicate (= rosso)`); V.nonGiudicate.forEach(g => console.log('  · ' + g)); esito = 2; }
if (V.guasti.length) { console.log(`❌ [verde] FAIL — ${V.guasti.length}`); V.guasti.forEach(g => console.log('  · ' + g)); esito = 2; }

if (!SOLO_VERDE) {
  const R = await braccio('rosso', true);
  /* scene LIBERE: quelle in cui nel verde l'eroe ha speso tutto il budget verso destra. Nelle altre e' al
     bordo della zona di movimento (anche nel verde non avanza) e nessun passo in piu' puo' manifestarsi. */
  const libere = V.righe.filter(r => r.mm >= 1 && r.passiFatti >= r.mm - 0.2).map(r => r.gi);
  const bocciate = new Set(R.guasti.map(g => +g.slice(2, g.indexOf(':'))));
  const mancate = libere.filter(gi => !bocciate.has(gi));
  console.log(`\n[rosso] scene misurate ${R.righe.length} · libere ${libere.length} (${libere.map(g => 'gi' + g).join(' ')}) · non giudicate ${R.nonGiudicate.length} · bocciate ${R.guasti.length}`);
  R.guasti.forEach(g => console.log('  · ' + g));
  if (R.nonGiudicate.length) { console.log(`❌ [rosso] ${R.nonGiudicate.length} scene non giudicate (= rosso)`); R.nonGiudicate.forEach(g => console.log('  · ' + g)); esito = 2; }
  if (libere.length < 3 || mancate.length) { console.log(`❌ [rosso] il difetto provocato non si vede su tutte le scene libere (mancate: ${mancate.map(g => 'gi' + g).join(' ') || 'nessuna'}, libere ${libere.length} < 3?): il guardiano e' cieco`); esito = 2; }
} else console.log('\n⚠️ --solo-verde: braccio rosso saltato, l\'esito non vale come verde del guardiano');

if (esito) { console.log(`\n❌ FAIL — moves-budget`); process.exit(esito); }
console.log(SOLO_VERDE ? `\n✅ verde (solo braccio verde)` : `\n✅ PASS — il budget di movimento tiene: nessun passo regalato (e il rosso si vede)`);
