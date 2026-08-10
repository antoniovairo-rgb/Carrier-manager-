#!/usr/bin/env node
/* [7.387.0] GUARDIANO — NEL BUILD-UP IL PALLONE E L'EROE VANNO INSIEME
   (collaudo PO «durante i movimenti si muove solo il pallone e non l'eroe» · «si porta solo la palla
    avanti e fine» · «SALTO del pallone di 8.7 unità — sembra un teletrasporto», segnalato quattro
    volte con la stessa identica misura a x diverse: 10.8, 17.7, 25.2, 33.2)

   PERCHE' PROPRIO QUI. Il build-up cinematografico e' l'unico tratto in cui il pallone e l'eroe hanno
   DUE MOTORI DIVERSI: il pallone lo posiziona la timeline, fotogramma per fotogramma, mentre l'eroe
   lo muove il modello fisico, con inerzia e una velocita' massima. Se la timeline corre piu' del
   corpo, si vede esattamente cio' che il PO descrive — la palla che va e l'uomo che resta. Ed e'
   anche l'unico posto dove un cambio di beat puo' spostare il pallone di uno scatto: se il beat che
   comincia non parte dove finiva quello prima, il pallone ci salta dentro.
   Quel tratto e' invisibile sotto `?cpmtest=1` (scoperta del 7.381): serve l'opt-in `__CPM_CINE`.

   COSA MISURA, per ogni fotogramma del build-up:
     · il SALTO del pallone fra due fotogrammi, con il beat in cui accade e quello da cui viene;
     · quanto cammina il pallone contro quanto cammina l'eroe, sullo stesso tratto.

     CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node buildup-sync-test.mjs [--verbose]                   */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const VERB = process.argv.includes('--verbose');
const SCENE = (process.env.CPM_SCENE || '').length ? process.env.CPM_SCENE.split(',').map(Number)
  : [4, 8, 11, 12, 13, 21, 27, 40, 43, 63, 83, 84, 91, 92, 96, 97, 103, 141, 150, 181];
const SALTO_MAX = 3.0;   /* fra due fotogrammi il pallone non si sposta piu' di un tocco */
const RAPP_MIN = 0.25;   /* e l'eroe non puo' camminare meno di un quarto di quanto cammina la palla */

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 360, height: 260 } });
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_REC = true; window.__CPM_CINE = 1; });
await openMatch(page, port); await sleep(800);

const righe = [], guasti = [];
for (const gi of SCENE) {
  for (const k of [0, 1]) {
    let ok = false; try { ok = await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), gi); } catch (e) { }
    if (!ok) break;
    await sleep(420);
    await page.evaluate(() => { window.__CPM_FROZEN = false; });
    await sleep(160);
    await page.evaluate(() => window.__CPM_REC_DRAIN());
    let r = false; try { r = await page.evaluate(kk => window.__CPM_RESOLVE(kk), k); } catch (e) { }
    if (!r) continue;
    await sleep(2600);
    let fr = []; try { fr = await page.evaluate(() => window.__CPM_REC_DRAIN()); } catch (e) { }

    let n = 0, salto = 0, saltoCtx = null, camB = 0, camH = 0, guidato = 0, carB = 0, carH = 0, carN = 0;
    for (let i = 1; i < fr.length; i++) {
      const a = fr[i - 1], c = fr[i];
      /* ⚠️ ANCHE IL FOTOGRAMMA DI CONSEGNA (tl 1→0). Chiedere `tl===1` su entrambi i fotogrammi
         scartava proprio la transizione build-up→conclusione, dove il pallone viene SCRITTO al punto
         d'arrivo dell'ultimo beat: un punto cieco esattamente sul passaggio piu' brusco della scena. */
      const bordo = (a.tl === 1 && c.tl !== 1);
      const ingresso = (a.tl !== 1 && c.tl === 1);       /* [7.395.0] e anche l'INGRESSO: era il salto piu' visto dal PO */
      if (!(c.tl === 1 && a.tl === 1) && !bordo && !ingresso) continue;
      const dt = (c.t - a.t) / 1000; if (dt <= 0 || dt > 0.5) continue;
      if (bordo || ingresso) {
        const dbb = Math.hypot(c.b[0] - a.b[0], c.b[1] - a.b[1]);
        if (dbb > salto) { salto = dbb; saltoCtx = { da: ingresso ? 'INGRESSO' : a.tk, a: ingresso ? c.tk : 'CONSEGNA', ms: Math.round(dt * 1000), x: c.b[0] }; }
        continue;                                        /* i bordi contano solo per il salto */
      }
      n++;
      const db = Math.hypot(c.b[0] - a.b[0], c.b[1] - a.b[1]);
      const dh = Math.hypot(c.h[0] - a.h[0], c.h[1] - a.h[1]);
      camB += db; camH += dh;
      /* ⚠️ IL RAPPORTO SI GIUDICA SOLO DOVE HA SENSO. In un beat di PASSAGGIO il pallone vola e i corpi
         restano: e' calcio, non un difetto — e la prima versione di questa sonda condannava quindici
         build-up su venti proprio per quello. Il patto «vanno insieme» vale dove il pallone e' ai piedi
         di qualcuno, cioe' nei beat di CONDUZIONE. */
      /* ⚠️ «chi lo porta» NON e' sempre l'eroe: nel build-up di cross e incornata conduce un compagno,
         e misurare il corpo dell'eroe al posto suo condanna una scena sana. Il portatore lo DICHIARA il
         renderer (`tc`, dal 7.381). */
      if (c.tk === 'carry' && c.tc && a.tc) { carB += db; carH += Math.hypot(c.tc[0] - a.tc[0], c.tc[1] - a.tc[1]); carN++; }
      if (db > salto) { salto = db; saltoCtx = { da: a.tk, a: c.tk, ms: Math.round(dt * 1000), x: c.b[0] }; }
      if (c.hd) guidato++;
    }
    if (n < 4) continue;
    const rapp = carB > 0.5 ? carH / carB : 1;
    /* e una scena in cui NESSUNO si muove per tutta la costruzione e' l'altra faccia della stessa nota
       del PO: «si porta solo la palla avanti e fine» */
    const immobile = (camH < 1.0 && camB > 6);
    const problemi = [];
    if (salto > SALTO_MAX) problemi.push(`salto del pallone di ${salto.toFixed(1)}u in ${saltoCtx.ms}ms (a x ${saltoCtx.x}) al passaggio di beat ${saltoCtx.da}→${saltoCtx.a}`);
    if (carN >= 3 && rapp < RAPP_MIN) problemi.push(`in conduzione il pallone cammina ${carB.toFixed(1)}u e chi lo porta ${carH.toFixed(1)}u (rapporto ${rapp.toFixed(2)}): si muove solo la palla`);
    if (immobile) problemi.push(`per tutta la costruzione il pallone fa ${camB.toFixed(1)}u e l'eroe ${camH.toFixed(1)}u: la scena e' un pallone che scorre e basta`);
    if (problemi.length) guasti.push(`gi${gi}/az${k}: ` + problemi.join(' · '));
    righe.push({ gi, k, n, salto, rapp, camB, camH, saltoCtx, guidato, carN, carB, carH, immobile });
    if (VERB || problemi.length) console.log(`${problemi.length ? '❌' : '✅'} gi${String(gi).padStart(3)}/az${k} · fotogrammi ${String(n).padStart(3)} · salto max ${salto.toFixed(1).padStart(5)}u ${saltoCtx ? `(${saltoCtx.da}→${saltoCtx.a})`.padEnd(18) : ''} · palla ${camB.toFixed(1).padStart(6)}u · eroe ${camH.toFixed(1).padStart(6)}u · rapporto ${rapp.toFixed(2)} · conduzione ${carN} fr (palla ${carB.toFixed(1)}u / eroe ${carH.toFixed(1)}u) · timeline guida l'eroe ${guidato}/${n}`);
  }
}
await b.close(); srv.close();

if (righe.length < 4) { console.log(`❌ FAIL — solo ${righe.length} build-up osservati: la sonda e' cieca`); process.exit(2); }
const sj = righe.map(r => r.salto).sort((x, y) => x - y), sr = righe.map(r => r.rapp).sort((x, y) => x - y);
console.log(`\nbuild-up osservati ${righe.length} · salto mediano ${sj[sj.length >> 1].toFixed(1)}u (max ${Math.max(...sj).toFixed(1)}u) · rapporto eroe/palla mediano ${sr[sr.length >> 1].toFixed(2)} (min ${Math.min(...sr).toFixed(2)})`);
if (guasti.length) { console.log(`\n❌ FAIL — ${guasti.length}`); guasti.slice(0, 20).forEach(g => console.log('  · ' + g)); process.exit(2); }
console.log(`\n✅ PASS — nel build-up il pallone non salta e l'eroe lo accompagna`);
