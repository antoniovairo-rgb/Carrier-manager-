#!/usr/bin/env node
/* [7.457.0] MISURA — «ESITO DICHIARATO ≠ 3D»: il gol dichiarato e la palla che non arriva in porta.

   LA DOMANDA, e perche' e' questa e non un'altra. Su un gol la palla entra in rete col POST-ARCO
   (hlPostArcType="in_net"), che pero' e' governato da `else if(hlPostArcT>=0 && !tlOn)` (r.~12542):
   NON avanza finche' la timeline di build-up e' viva. La guardia e' del 5.43.9 ed e' VOLUTA (sui
   BALL_CARRY lunghi i due sistemi si pestavano i piedi). Le prove del PO — scarti 52,2 · 51,8 · 9,8
   · 7,6 unita' e «arco/post-arco vivi 30 · 17 · 118 · 144 fotogrammi» — dicono che il post-arco resta
   VIVO ma FERMO. Prima di scegliere COME sciogliere la precedenza fra i due sistemi bisogna sapere
   se in quei fotogrammi il build-up sta ancora LAVORANDO o e' PIANTATO:

     · build-up LUNGO MA SANO  → `tlT` avanza fino alla somma delle durate dei suoi segmenti, poi
       molla. La precedenza e' una scelta di regia: o si mette un tetto all'attesa, o si dichiara
       l'esito dopo. Decisione del PO.
     · build-up PIANTATO       → `tlT` non avanza (o avanza e non finisce mai). Allora il difetto e'
       LUI, e mettere un tetto sarebbe convivere con un bug invece di chiuderlo.

   COME SI RIPRODUCE. Il percorso ?sit=N produce solo esiti FALLITI: per vedere un post-arco «in_net»
   serve FORZARE il successo (__CPM_FORCE_OUTCOME='success' prima di __CPM_RESOLVE), com'e' gia'
   previsto sotto ?cpmtest=1 dal 7.229.

   NON e' un guardiano e non giudica: stampa i numeri su cui si decide.

     CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node postarc-buildup-lag-test.mjs [--verbose]        */
import { startServer, launchBrowser, installCdnRoutes, openMatch, forceSituation, sleep } from './lib/harness.mjs';

const VERB = process.argv.includes('--verbose');
const SCENE = (process.env.CPM_SCENE || '').length ? process.env.CPM_SCENE.split(',').map(Number)
  : [0, 2, 6, 9, 12, 18, 24, 30, 36, 44, 52, 60, 70, 84, 96, 108, 120, 132, 150, 158];

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
const errs = []; page.on('pageerror', e => errs.push(e.message));
/* ⚠️ __CPM_CINE=1 E' OBBLIGATORIO: `?cpmtest=1` SPEGNE l'executor cine (r.~11912), quindi senza
   questo flag il build-up non viene MAI costruito e la sonda misura 0 fotogrammi bloccati su 0
   costruzioni — un verde che non ha guardato niente (verificato: prima stesura, __CPM_TLSEG null
   su tutte le scene). E' la stessa trappola del force-path gia' pagata sul codice 007. */
await page.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_CINE = 1; });
await openMatch(page, port);
await sleep(600);

const righe = [];
for (const gi of SCENE) {
  await page.evaluate(() => { window.__CPM_PA457 = []; window.__CPM_TLSEG = null; });
  let ok = false;
  try { ok = await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), gi); } catch (e) {}
  if (!ok) continue;
  await sleep(500);
  /* esito FORZATO a successo: senza questo il post-arco «in_net» non nasce mai (solo esiti falliti) */
  await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'success'; });
  try { await page.evaluate(() => window.__CPM_RESOLVE && window.__CPM_RESOLVE(0)); } catch (e) { continue; }
  await sleep(3400);          /* tutta la finestra d'esito sotto il registratore */

  const d = await page.evaluate(() => ({
    pa: (window.__CPM_PA457 || []).slice(), seg: window.__CPM_TLSEG || null,
    out: window.__CPM_OUTCOME || null,
    ball: (window.__CPM_STATE && window.__CPM_STATE().ball) || null
  }));
  if (!d.pa.length) { if (VERB) console.log(`  gi${gi}: nessun post-arco (esito senza arco d'ingresso)`); continue; }

  const bloccati = d.pa.filter(r => r.tlOn);        /* fotogrammi in cui il build-up tiene fermo il post-arco */
  const liberi = d.pa.filter(r => !r.tlOn);
  /* il build-up AVANZA? confronto fra primo e ultimo tlT nei fotogrammi bloccati */
  const tl0 = bloccati.length ? bloccati[0].tlT : null, tl1 = bloccati.length ? bloccati[bloccati.length - 1].tlT : null;
  const avanza = (tl0 != null && tl1 != null) ? +(tl1 - tl0).toFixed(3) : null;
  /* durata PIANIFICATA del build-up = somma delle durate dei segmenti fino a tlBuildN */
  const bn = bloccati.length ? bloccati[0].bn : (d.seg ? d.seg.n : null);
  const durPian = (d.seg && d.seg.seg) ? +d.seg.seg.slice(0, bn ?? d.seg.n).reduce((s, g) => s + (g.dur || 0), 0).toFixed(2) : null;
  /* la palla si e' mossa durante il blocco? */
  const mosso = bloccati.length > 1
    ? +Math.hypot(bloccati[bloccati.length - 1].bx - bloccati[0].bx, bloccati[bloccati.length - 1].bz - bloccati[0].bz).toFixed(1) : 0;
  const tipo = d.pa.find(r => r.pt)?.pt || null;
  const finita = bloccati.length ? (tl1 >= (durPian ?? 1e9) - 0.05) : true;

  righe.push({ gi, tipo, tot: d.pa.length, bloc: bloccati.length, lib: liberi.length,
    tl0, tl1, avanza, durPian, bn, mosso, finita, ok: d.out ? d.out.ok : null,
    bx: d.ball ? d.ball.x : null });
  if (VERB) console.log(`  gi${String(gi).padStart(3)} · ${tipo || '—'} · post-arco vivo ${d.pa.length}f (bloccati ${bloccati.length}, liberi ${liberi.length}) · tlT ${tl0}→${tl1} (avanza ${avanza}) · durata pianificata ${durPian}s su ${bn} segmenti · build-up finito ${finita ? 'SI' : 'NO'} · palla mossa nel blocco ${mosso}u`);
}
await b.close(); srv.close();

if (!righe.length) { console.log('❌ nessuna misura raccolta: la sonda e\' cieca'); process.exit(2); }

console.log(`\n=== ${righe.length} conclusioni con post-arco misurate ===`);
for (const r of righe)
  console.log(`  gi${String(r.gi).padStart(3)} · ${String(r.tipo || '—').padEnd(8)} · vivo ${String(r.tot).padStart(3)}f · BLOCCATI dal build-up ${String(r.bloc).padStart(3)}f · tlT ${r.tl0}→${r.tl1} (+${r.avanza}) · pianificati ${r.durPian}s/${r.bn}seg · finito ${r.finita ? 'SI' : 'NO'} · palla ${r.mosso}u`);

const conBlocco = righe.filter(r => r.bloc > 0);
const piantati = conBlocco.filter(r => r.avanza != null && r.avanza < 0.05);
const nonFiniti = conBlocco.filter(r => !r.finita);
console.log(`\nconclusioni col post-arco bloccato almeno un fotogramma: ${conBlocco.length}/${righe.length}`);
console.log(`  · blocco piu' lungo: ${conBlocco.length ? Math.max(...conBlocco.map(r => r.bloc)) : 0} fotogrammi`);
console.log(`  · build-up PIANTATO (tlT non avanza durante il blocco): ${piantati.length}`);
console.log(`  · build-up NON arrivato in fondo entro la finestra d'esito: ${nonFiniti.length}`);
for (const e of errs.slice(0, 4)) console.log('  ⚠ pageerror: ' + e);
console.log(`\n→ VERDETTO DI LETTURA: ${piantati.length ? `il build-up e' PIANTATO in ${piantati.length} conclusioni — il difetto e' la timeline, non la precedenza` : nonFiniti.length ? `il build-up AVANZA ma non finisce nella finestra d'esito in ${nonFiniti.length} conclusioni — e' lungo, non rotto: la precedenza e' una scelta di regia` : `il build-up finisce sempre entro la finestra: su questo campione la precedenza non fa danno`}`);
