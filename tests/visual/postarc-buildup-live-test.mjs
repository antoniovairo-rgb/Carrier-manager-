#!/usr/bin/env node
/* [7.458.0] MISURA — «ESITO DICHIARATO ≠ 3D» SUL FLUSSO VERO.

   PERCHE' QUESTA E NON QUELLA DEL 7.457. La sonda del 7.457 (`postarc-buildup-lag-test.mjs`) ha
   misurato ~30 conclusioni FORZATE e ha trovato: build-up di 0,7s su 2 segmenti, zero fotogrammi di
   blocco sul post-arco. Ma il percorso forzato e' quello che in questo repo si e' gia' dimostrato
   CIECO due volte (il codice 007: chiave e staging nello stesso commit, difetto invisibile per
   costruzione). La domanda che resta aperta e' UNA: in partita vera i build-up sono piu' lunghi di
   0,7s? Se lo sono, il post-arco puo' davvero restare in attesa e la precedenza fra i due sistemi
   diventa una scelta da fare; se non lo sono, lo scarto misurato dal PO (52,2 · 51,8 · 9,8 · 7,6
   unita') ha un'altra causa e va cercata altrove.

   COME. Partita VERA: provino → `playing` col clock reale → highlight reattivi in coda (lo stesso
   percorso del giocatore), esito forzato a SUCCESSO al momento della scelta — senza forzarlo il
   gioco produce quasi solo fallimenti e un post-arco «in_net» non nasce mai.

   ⚠️ __CPM_CINE=1 E' OBBLIGATORIO: `?cpmtest=1` SPEGNE l'executor cine (`_cineTest`, r.~11912) e
   senza il flag la timeline non viene MAI costruita — si misurerebbero 0 blocchi su 0 costruzioni,
   cioe' un verde che non ha guardato niente (trappola gia' pagata nel 7.457).

   NON e' un guardiano e non giudica: stampa i numeri su cui si decide.

     CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node postarc-buildup-live-test.mjs [--verbose]       */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const VERB = process.argv.includes('--verbose');
const TARGET = +(process.env.CPM_SCENES || 10);

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
const errs = []; page.on('pageerror', e => errs.push(e.message));
await page.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_CINE = 1; window.__CPM_PRESENT = 1; });
await openMatch(page, port, { skipLoadAll: true });
await sleep(700);

const righe = [];
for (let round = 0; round < TARGET * 4 && righe.length < TARGET; round++) {
  const inPlay = await page.evaluate(() => { const s = window.__CPM_STATE && window.__CPM_STATE(); return s && s.phase === 'playing'; });
  if (!inPlay) { await sleep(700); continue; }
  await page.evaluate(() => { window.__CPM_PA457 = []; window.__CPM_TLSEG = null; });
  await page.evaluate(() => { window.__CPM_QUEUE_REACTIVE && window.__CPM_QUEUE_REACTIVE(); });
  /* si aspetta la fase di SCELTA della partita vera, poi si forza il successo e si risolve */
  const gotChoose = await page.waitForFunction(() => {
    try { const s = window.__CPM_STATE && window.__CPM_STATE(); return s && s.phase === 'hl_choose'; } catch (e) { return false; }
  }, { timeout: 30000 }).then(() => true).catch(() => false);
  if (!gotChoose) { await sleep(600); continue; }
  /* si sceglie l'azione la cui RICOMPENSA e' il gol: forzare il successo sull'azione 0 da' quasi
     sempre outKey="chance", e una chance non mette la palla in rete per definizione — misurarla
     significherebbe misurare un caso che non e' quello del PO. */
  const acts = await page.evaluate(() => (window.__CPM_ACTS && window.__CPM_ACTS()) || null);
  const kGoal = acts ? (acts.find(a => /goal/i.test(String(a.rew || ''))) || {}).i : null;
  if (kGoal == null) { if (VERB) console.log(`  · scena senza azione da GOL (ricompense: ${acts ? acts.map(a => a.rew).join('/') : '?'}) — saltata`); await page.evaluate(() => window.__CPM_RESOLVE && window.__CPM_RESOLVE(0)).catch(() => {}); await sleep(1200); await tornaAPlaying(); continue; }
  await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'success'; });
  try { await page.evaluate(k => window.__CPM_RESOLVE && window.__CPM_RESOLVE(k), kGoal); } catch (e) { continue; }
  await sleep(3600);   /* tutta la finestra d'esito sotto il registratore */

  const d = await page.evaluate(() => ({
    pa: (window.__CPM_PA457 || []).slice(), seg: window.__CPM_TLSEG || null,
    out: window.__CPM_OUTCOME || null,
    st: (window.__CPM_STATE && window.__CPM_STATE()) || null
  }));
  if (!d.pa.length) { if (VERB) console.log('  · nessun fotogramma d\'esito campionato'); await tornaAPlaying(); continue; }

  const conTl = d.pa.filter(r => r.tlOn);                    /* fotogrammi col build-up ACCESO */
  const conPa = d.pa.filter(r => r.pa >= 0);                 /* fotogrammi col post-arco vivo */
  const bloccati = d.pa.filter(r => r.tlOn && r.pa >= 0);    /* ← IL BLOCCO: post-arco vivo E build-up acceso */
  const tl0 = conTl.length ? conTl[0].tlT : null, tl1 = conTl.length ? conTl[conTl.length - 1].tlT : null;
  const bn = conTl.length ? conTl[0].bn : (d.seg ? d.seg.n : null);
  const durPian = (d.seg && d.seg.seg) ? +d.seg.seg.slice(0, bn ?? d.seg.n).reduce((s, g) => s + (g.dur || 0), 0).toFixed(2) : null;
  const tipo = d.pa.find(r => r.pt)?.pt || null;
  /* quanto e' rimasto FERMO il post-arco: fotogrammi bloccati in cui `pa` non avanza */
  let fermo = 0;
  for (let i = 1; i < bloccati.length; i++) if (Math.abs(bloccati[i].pa - bloccati[i - 1].pa) < 1e-6) fermo++;

  /* [7.458.0] l'ESITO DICHIARATO accanto al post-arco: se un GOL si dichiara senza post-arco,
     non c'e' nessun sistema che porti la palla in rete — ed e' esattamente «esito dichiarato ≠ 3D». */
  const key = d.out ? (d.out.outKey || d.out.key || d.out.rew || null) : null;
  const bxFin = d.pa.length ? d.pa[d.pa.length - 1].bx : null;
  righe.push({ tipo, tot: d.pa.length, tlF: conTl.length, paF: conPa.length, bloc: bloccati.length,
    fermo, tl0, tl1, durPian, bn, ok: d.out ? d.out.ok : null, key, bxFin,
    outKeys: d.out ? Object.keys(d.out).join(',') : null });
  if (VERB) console.log(`  · esito «${key}» ok=${d.out ? d.out.ok : '?'} · post-arco ${tipo || 'NESSUNO'} vivo ${conPa.length}f · build-up ${conTl.length}f (pian. ${durPian}s/${bn}seg) · BLOCCATI ${bloccati.length}f · palla finale x=${bxFin}`);
  await tornaAPlaying();
}

async function tornaAPlaying() {
  await page.waitForFunction(() => { try { const s = window.__CPM_STATE && window.__CPM_STATE(); return s && s.phase === 'playing'; } catch (e) { return false; } }, { timeout: 25000 }).catch(() => {});
}

await b.close(); srv.close();
if (!righe.length) { console.log('❌ nessuna conclusione misurata sul flusso vero: la sonda e\' cieca'); process.exit(2); }

console.log(`\n=== ${righe.length} conclusioni misurate SUL FLUSSO VERO ===`);
for (const r of righe)
  console.log(`  esito «${String(r.key).padEnd(12)}» ok=${String(r.ok).padEnd(5)} · post-arco ${String(r.tipo || 'NESSUNO').padEnd(12)} ${String(r.paF).padStart(3)}f · build-up ${String(r.tlF).padStart(3)}f (pian. ${r.durPian}s/${r.bn}seg) · BLOCCATI ${String(r.bloc).padStart(3)}f · palla finale x=${r.bxFin}`);
/* ⚠️ solo l'outKey decide: la prima stesura contava anche `ok===true`, e cosi' una CHANCE riuscita
   finiva nel conteggio dei gol — un numero che diceva il contrario di quello che sembrava dire. */
const gol = righe.filter(r => /goal/i.test(String(r.key || '')));
const golSenzaArco = gol.filter(r => r.paF === 0);
console.log(`\nesiti RIUSCITI/gol: ${gol.length} · di questi SENZA alcun post-arco: ${golSenzaArco.length}`);
if (righe[0]) console.log(`  (campi di __CPM_OUTCOME: ${righe[0].outKeys})`);

const conBlocco = righe.filter(r => r.bloc > 0);
const durate = righe.map(r => r.durPian).filter(v => v != null);
const conTl = righe.filter(r => r.tlF > 0);
console.log(`\nconclusioni con build-up costruito: ${conTl.length}/${righe.length}`);
if (durate.length) console.log(`  · durata pianificata del build-up: min ${Math.min(...durate)}s · max ${Math.max(...durate)}s · mediana ${durate.slice().sort((a, b) => a - b)[durate.length >> 1]}s`);
console.log(`  · conclusioni col post-arco BLOCCATO dal build-up: ${conBlocco.length}`);
if (conBlocco.length) console.log(`  · blocco piu' lungo: ${Math.max(...conBlocco.map(r => r.bloc))} fotogrammi (post-arco fermo ${Math.max(...conBlocco.map(r => r.fermo))}f)`);
for (const e of errs.slice(0, 4)) console.log('  ⚠ pageerror: ' + e);
console.log(`\n→ LETTURA: ${conBlocco.length
  ? `il blocco ESISTE in partita vera (${conBlocco.length}/${righe.length} conclusioni, fino a ${Math.max(...conBlocco.map(r => r.bloc))} fotogrammi) — la precedenza fra post-arco e build-up e' una scelta da fare`
  : `NEMMENO in partita vera il build-up blocca il post-arco (0/${righe.length}) — con build-up ${durate.length ? `da ${Math.min(...durate)}s a ${Math.max(...durate)}s` : 'brevi'}: lo scarto del PO ha un'altra causa`}`);
