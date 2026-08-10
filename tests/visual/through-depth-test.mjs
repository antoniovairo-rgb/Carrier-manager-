#!/usr/bin/env node
/* [7.382.0] GUARDIANO — UN LANCIO IN PROFONDITA' VA IN PROFONDITA'
   (collaudo PO #125 «Non e' un lancio in profondita' ma orizzontale»)

   COSA MISURA. Sulle scene con intento `through` — quelle in cui l'azione promessa all'Eroe e' una
   verticalizzazione dietro la difesa — l'ANGOLO REALE del pallone: dal punto in cui parte al bersaglio
   dell'arco, quanto guadagna in avanti (verso la porta avversaria) contro quanto si sposta di lato.
   Un lancio in profondita' che guadagna meno in avanti di quanto si sposta lateralmente non e' un
   lancio in profondita': e' un passaggio orizzontale, ed e' esattamente cio' che il PO ha visto.

   Distingue anche DOVE nasce l'errore: se il ricevente designato e' gia' di fianco all'Eroe, il
   difetto sta nella SCELTA del compagno; se il ricevente e' avanti ma la palla va altrove, sta nella
   TRAIETTORIA. Sono due correzioni diverse e non vanno confuse.

     CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node through-depth-test.mjs [--verbose]                  */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const VERB = process.argv.includes('--verbose');
const N = +(process.env.CPM_N || 191);
/* soglia: il guadagno in avanti dev'essere almeno quanto lo spostamento laterale (angolo <= 45 gradi
   dall'asse d'attacco) e comunque positivo — un lancio che va indietro non e' un lancio */
const RATIO_MIN = 1.0, FWD_MIN = 3.0;

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 360, height: 260 } });
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = false; });
await openMatch(page, port); await sleep(800);

const casi = [], guasti = [];
for (let gi = 0; gi < N; gi++) {
  let ok = false; try { ok = await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), gi); } catch (e) { }
  if (!ok) break;
  await sleep(220);
  let sig = null; try { sig = await page.evaluate(() => { const s = window.__CPM_STATE(); return s && s.sitSig; }); } catch (e) { }
  if (!sig || sig.it !== 'through') continue;

  for (const k of [0, 1, 2]) {
    try { if (!await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), gi)) break; } catch (e) { break; }
    await sleep(280);
    await page.evaluate(() => { try { delete window.__CPM_DISPATCH; } catch (e) { window.__CPM_DISPATCH = null; } });
    let r = false; try { r = await page.evaluate(kk => window.__CPM_RESOLVE(kk), k); } catch (e) { }
    if (!r) continue;
    await sleep(1500);
    let d = null; try { d = await page.evaluate(() => window.__CPM_DISPATCH || null); } catch (e) { }
    if (!d || !d.tgt || !d.hero) continue;
    if (d.ht !== 'pass') continue;                 /* solo la famiglia del passaggio: il resto non e' un lancio */

    /* si misura DAL PUNTO IN CUI IL PALLONE PARTE, non dall'eroe-mesh: al lancio l'eroe puo' essere
       gia' altrove, e prendendo lui come origine si giudica la direzione di un lancio che non e' suo */
    const o = d.src || d.hero;
    const fwd = d.tgt.x - o.x;                    /* +x = verso la porta avversaria */
    const lat = Math.abs(d.tgt.z - o.z);
    const ratio = lat < 0.01 ? 99 : fwd / lat;
    /* dov'e' il compagno designato, se c'e': separa «scelta sbagliata» da «traiettoria sbagliata» */
    const rf = d.rcv ? +(d.rcv.x - o.x).toFixed(1) : null;
    const rl = d.rcv ? +Math.abs(d.rcv.z - o.z).toFixed(1) : null;
    /* la famiglia «murato» e' l'unica in cui il pallone DEVE fermarsi corto: la linea e' chiusa addosso
       al passatore, e pretendere metri guadagnati vorrebbe dire chiedere al gioco di mentire (7.331.0).
       Le si chiede solo di non andare DI LATO — la direzione resta quella del disegno. */
    const murato = /^(blocked|wall_blocked|dispossessed|beaten)$/.test(d.kind || '');
    const pass = ratio >= RATIO_MIN && (murato ? fwd > 0 : fwd >= FWD_MIN);
    casi.push({ gi, k, fwd, lat, ratio, rf, rl, pass, murato, ok: d.rew, kind: d.kind });
    if (!pass) guasti.push(`gi${gi}/az${k}: avanti ${fwd.toFixed(1)}u contro ${lat.toFixed(1)}u di lato (rapporto ${ratio === 99 ? '∞' : ratio.toFixed(2)})` +
      (rf == null ? ' · nessun ricevente designato' : ` · il compagno designato era ${rf >= 0 ? '+' : ''}${rf}u avanti e ${rl}u di lato`));
    if (VERB) console.log(`${pass ? '✅' : '❌'} gi${String(gi).padStart(3)}/az${k} · avanti ${fwd.toFixed(1).padStart(6)}u · lato ${lat.toFixed(1).padStart(5)}u · rapporto ${(ratio === 99 ? '∞' : ratio.toFixed(2)).padStart(6)} · compagno ${rf == null ? '  —' : (rf >= 0 ? '+' : '') + rf + 'u/' + rl + 'u'}`);
  }
}
await b.close(); srv.close();

if (!casi.length) { console.log('❌ FAIL — nessuna scena con intento `through` misurata: la sonda e\' cieca'); process.exit(2); }
const f = casi.map(c => c.fwd).sort((x, y) => x - y), rr = casi.map(c => c.ratio).sort((x, y) => x - y);
console.log(`\nlanci misurati ${casi.length} · mediana avanti ${f[f.length >> 1].toFixed(1)}u · mediana rapporto avanti/lato ${(rr[rr.length >> 1] === 99 ? '∞' : rr[rr.length >> 1].toFixed(2))} · in difetto ${guasti.length}`);
if (guasti.length) { console.log(`\n❌ FAIL — ${guasti.length} lanci «in profondita'» che in profondita' non vanno:`); guasti.forEach(g => console.log('  · ' + g)); process.exit(2); }
console.log(`\n✅ PASS — ogni lancio in profondita' guadagna campo verso la porta`);
