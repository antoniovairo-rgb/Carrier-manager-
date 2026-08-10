#!/usr/bin/env node
/* [7.385.0] GUARDIANO — UN PASSAGGIO DEVE ESSERE QUELLO CHE L'AZIONE PROMETTE
   (collaudo PO #116 «Passaggio ad un compagno vicinissimo» · #111 «Non e' rasoterra ed il passaggio
    al compagno dietro e' senza senso»)

   PERCHE' NON BASTAVA `through-depth-test.mjs`. Quello guarda un solo disegno — la verticalizzazione —
   e la correzione del 7.382 e' stata scritta per quello soltanto. Le due note nuove parlano di
   passaggi di ALTRE famiglie, e la regola che li rovina e' la stessa che rovinava i filtranti: sul
   passaggio FALLITO il destinatario si sceglie per pura vicinanza, quindi vince chi e' piu' vicino —
   e piu' vicino vuol dire spesso «due metri di lato», cioe' una giocata che non ha senso e non
   assomiglia a quella che il giocatore ha scelto.

   COSA MISURA, per ogni azione che produce un passaggio:
     · la LUNGHEZZA vera (dal punto in cui il pallone parte al bersaglio dell'arco);
     · quanto guadagna in avanti, quando l'azione promette di andare avanti;
     · l'ALTEZZA dell'arco contro la promessa dell'etichetta: «rasoterra» dev'essere raso terra.

   La famiglia «murato» e' esentata dalla lunghezza: li' la linea e' chiusa addosso al passatore e il
   pallone DEVE fermarsi corto (7.331.0). Non e' esentata dall'altezza.

     CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node pass-sanity-test.mjs [--verbose]                    */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const VERB = process.argv.includes('--verbose');
const N = +(process.env.CPM_N || 191);
/* ⚠️ LA LUNGHEZZA GIUSTA DIPENDE DA COSA PROMETTE L'AZIONE. Un solo numero per tutti condanna
   giocate corrette: «Passaggio corto e sicuro» a 5,7u e' un passaggio corto e sicuro, e un «Dai e vai»
   che scarica all'indietro di cinque metri e' un dai-e-vai. La soglia si legge dall'etichetta, come
   fanno gia' le varianti di tiro e cross. */
const CORTO = /cort|scaric|tacco|velo|dai e |appoggi|sponda|uno-due|triangol|rimorchi|ricev/i;
const LUNGO = /lanci|lungo|\b40\b|\b50\b|cambi[oa].*(gioco|fronte|lato)|parabola|verticalizz|apertura/i;
const minAttesa = (lbl) => CORTO.test(lbl) ? 3.5 : (LUNGO.test(lbl) ? 18 : 8);
const LUNG_MIN = 8.0;   /* riferimento per il riassunto */
const RASO_MAX = 0.55;  /* «rasoterra» e' un pallone che non si stacca dall'erba */
const MURATO = /^(blocked|wall_blocked|dispossessed|beaten)$/;

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 360, height: 260 } });
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = false; });
await openMatch(page, port); await sleep(800);

const casi = [], guasti = [];
for (let gi = 0; gi < N; gi++) {
  let meta = null;
  try {
    meta = await page.evaluate(g => {
      const S = window.__CPM_SITS || []; const s = S[g]; if (!s || !s.actions) return null;
      return { n: s.actions.length, lbl: s.actions.map(a => String(a.label || a.l || '')) };
    }, gi);
  } catch (e) { }
  if (!meta) break;

  for (let k = 0; k < meta.n && k < 3; k++) {
    let ok = false; try { ok = await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), gi); } catch (e) { }
    if (!ok) break;
    await sleep(240);
    await page.evaluate(() => { window.__CPM_DISPATCH = null; });
    let r = false; try { r = await page.evaluate(kk => window.__CPM_RESOLVE(kk), k); } catch (e) { }
    if (!r) continue;
    await sleep(1300);
    let d = null; try { d = await page.evaluate(() => window.__CPM_DISPATCH || null); } catch (e) { }
    if (!d || d.ht !== 'pass' || !d.tgt) continue;

    const o = d.src || d.hero; if (!o) continue;
    const lung = Math.hypot(d.tgt.x - o.x, d.tgt.z - o.z);
    const fwd = d.tgt.x - o.x;
    const alt = d.h385 == null ? null : +d.h385;
    const lbl = meta.lbl[k] || '';
    const murato = MURATO.test(d.kind || '');
    const raso = /raso|terra|rasoterra/i.test(lbl);

    const problemi = [];
    /* ⚠️ SU UN PASSAGGIO FALLITO LA DISTANZA NON E' UNA PROMESSA. Se l'avversario taglia la linea, il
       pallone si ferma dove viene tagliato: pretendere i quaranta metri dell'etichetta vorrebbe dire
       chiedere al gioco di mentire sull'esito. Del passaggio fallito si giudica solo che sia PARTITO
       davvero; la lunghezza promessa si pretende quando la giocata riesce. */
    const riuscito = !d.kind || d.kind === 'chance';
    const atteso = riuscito ? minAttesa(lbl) : 3.5;
    if (!murato && lung < atteso) problemi.push(`lungo ${lung.toFixed(1)}u ma ${riuscito ? `l'azione ne promette almeno ${atteso}` : 'un passaggio deve almeno partire'}`);
    if (raso && alt != null && alt > RASO_MAX) problemi.push(`l'azione dice «rasoterra» ma l'arco si alza a ${alt.toFixed(2)}u`);
    if (problemi.length) guasti.push(`gi${gi}/az${k} «${lbl.slice(0, 34)}» [${d.kind || '—'}]: ` + problemi.join(' · '));
    casi.push({ gi, k, lung, fwd, alt, raso, murato, lbl, ok: riuscito });
    if (VERB || problemi.length) console.log(`${problemi.length ? '❌' : '✅'} gi${String(gi).padStart(3)}/az${k} · lungo ${lung.toFixed(1).padStart(5)}u · avanti ${fwd.toFixed(1).padStart(6)}u · arco ${alt == null ? ' — ' : alt.toFixed(2)}u ${raso ? '[raso]' : ''}${murato ? '[murato]' : ''} · «${lbl.slice(0, 32)}»`);
  }
}
await b.close(); srv.close();

if (casi.length < 10) { console.log(`❌ FAIL — solo ${casi.length} passaggi misurati: la sonda e' cieca`); process.exit(2); }
const L = casi.filter(c => !c.murato).map(c => c.lung).sort((x, y) => x - y);
const corti = casi.filter(c => !c.murato && c.lung < (c.ok ? minAttesa(c.lbl) : 3.5)).length;
const rasoAlti = casi.filter(c => c.raso && c.alt != null && c.alt > RASO_MAX).length;
console.log(`\npassaggi misurati ${casi.length} · mediana lunghezza ${L[L.length >> 1].toFixed(1)}u · piu' corti di quanto promettono ${corti} · «rasoterra» che si alzano ${rasoAlti}`);
if (guasti.length) { console.log(`\n❌ FAIL — ${guasti.length}`); guasti.slice(0, 24).forEach(g => console.log('  · ' + g)); if (guasti.length > 24) console.log(`  … e altri ${guasti.length - 24}`); process.exit(2); }
console.log(`\n✅ PASS — ogni passaggio ha una lunghezza sensata e l'altezza che l'azione promette`);
