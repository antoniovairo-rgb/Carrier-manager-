#!/usr/bin/env node
/* CENSIMENTO — LA DIREZIONE DEL PASSAGGIO MISURATA SUL PALLONE, NON SUL BERSAGLIO DELL'ARCO (nota PO #187).

   PERCHE' SERVE UN TERZO STRUMENTO. Due guardiani coprono gia' questa famiglia — `pass-forward-test`
   («il bersaglio sta avanti rispetto all'origine») e `through-depth-test` («un lancio in profondita'
   guadagna piu' in avanti di quanto si sposta di lato») — ma leggono ENTRAMBI il bersaglio dell'ARCO.
   E meta' delle risoluzioni non produce nessun arco di passaggio: il pallone ci arriva col lerp verso la
   palla logica. Il numero non e' un'ipotesi, e' gia' stampato da `pass-forward-test` e non lo aveva mai
   letto nessuno — «risolte 20 · risolte senza arco di passaggio 10». Su quelle dieci i due guardiani non
   sono verdi: sono muti.

   COSA MISURA QUI. Lo SPOSTAMENTO NETTO DELLA MESH del pallone lungo l'asse d'attacco durante la
   finestra d'esito, su scene a intento passaggio, con e senza arco. E' la grandezza che il giocatore
   vede: dove il pallone va davvero, non dove qualcuno aveva deciso che andasse.

   COME LEGGERE IL RISULTATO. Un passaggio all'indietro NON e' di per se' un difetto — esistono le
   sponde, e nel repertorio ci sono situazioni che si chiamano «Sponda indietro» e fanno esattamente
   quello. Il difetto della nota #187 e' un FILTRANTE che parte all'indietro. Per questo il censimento
   separa le scene per intento dichiarato e stampa il NOME dell'azione accanto al numero: e' l'unico
   modo di distinguere «il gioco ha sbagliato» da «il gioco ha fatto cio' che aveva dichiarato».

   PRIMA PASSATA, E VA SCRITTA: su dieci scene a intento passaggio lo spostamento netto del pallone e'
   AVANTI in dieci casi su dieci, da +6,8 a +31,8 unita' — filtranti dichiarati compresi (gi24 «Assist
   filtrante» +31,8 · gi120 «Verticale filtrante di prima» +21,2 · gi187 «Palla filtrante a scavalcare»
   +8,3). La nota #187 non si riproduce nemmeno guardando il pallone invece del bersaglio: resta aperta
   come SEGNALAZIONE, ma ora e' senza una sola misura a sostegno, su due strumenti indipendenti.

   NON E' UN GATE: dichiara, non giudica. Vira rosso solo se non misura niente.

     CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node pass-mesh-direction-census.mjs                     */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const N = +(process.env.CPM_N || 14);
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
await page.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_REC = true; window.__CPM_CINE = 1; window.__CPM_PRESENT = 1; });
await openMatch(page, port); await sleep(800);

/* le scene si chiedono al gioco, non si indovinano (lezione 7.475): intento dall'azione 0, che e'
   quella che questa sonda risolve */
const SCENE = await page.evaluate(n => {
  const o = [];
  for (let i = 0; i < SITUATIONS.length; i++) {
    try {
      const a = (SITUATIONS[i].actions || [])[0]; const h = deriveHL(SITUATIONS[i], a);
      if (h && h.type === 'pass') o.push({ gi: i, variante: h.variant || null, azione: (a && a.label) || null });
    } catch (e) {}
  }
  return o.filter((_, i) => i % 3 === 0).slice(0, n);
}, N);
console.log(`scene a intento passaggio campionate: ${SCENE.length}`);

const righe = [];
for (const s of SCENE) {
  let ok = false; try { ok = await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), s.gi); } catch (e) {}
  if (!ok) continue;
  await sleep(350);
  await page.evaluate(() => { window.__CPM_FROZEN = false; window.__CPM_PA457 = []; window.__CPM_PASS475 = []; window.__CPM_FORCE_OUTCOME = 'success'; });
  try { await page.evaluate(() => window.__CPM_RESOLVE(0)); } catch (e) { continue; }
  /* si dorme piu' della catena che si vuole misurare: la conclusione parte DOPO la finestra d'esito
     (lezione 7.460 — una sonda che dorme meno misura il proprio cronometro) */
  await sleep(2600);
  const d = await page.evaluate(() => {
    const pa = (window.__CPM_PA457 || []);
    if (!pa.length) return null;
    /* ⚠️ «e' nato un arco di passaggio?» NON si chiede a `__CPM_ARC` a fine finestra: li' l'arco e' gia'
       spento da un pezzo e la risposta sarebbe sempre no (prima stesura: 10 scene su 10 marcate «senza
       arco», che era il mio orologio, non il gioco). Lo dice il testimone che scrive sulla riga stessa in
       cui il bersaglio viene fissato — lo stesso che legge `pass-forward-test`. */
    return { x0: pa[0].bx, x1: pa[pa.length - 1].bx, z0: pa[0].bz, z1: pa[pa.length - 1].bz,
      min: Math.min(...pa.map(r => r.bx)), max: Math.max(...pa.map(r => r.bx)),
      n: pa.length, arco: ((window.__CPM_PASS475 || []).length > 0) };
  });
  if (!d) continue;
  righe.push({ ...s, ...d, avanti: +(d.x1 - d.x0).toFixed(1) });
}
await b.close(); srv.close();

if (!righe.length) { console.log('❌ censimento cieco: nessuna scena misurata'); process.exit(2); }
const indietro = righe.filter(r => r.avanti < -1.0);
const senzArco = righe.filter(r => !r.arco);
console.log(`\n=== ${righe.length} scene a intento passaggio · spostamento NETTO del pallone lungo l'asse d'attacco ===`);
for (const r of righe) console.log(`  gi${String(r.gi).padStart(3)} ${(r.variante || '—').padEnd(12)} ${r.avanti >= 0 ? '+' : ''}${r.avanti.toFixed(1)}u ${r.arco ? '(arco)' : '(SENZA arco)'} · «${r.azione || '—'}»`);
console.log(`\nall'INDIETRO (oltre 1u): ${indietro.length}/${righe.length}`);
console.log(`risolte SENZA arco di passaggio — cieche ai due guardiani esistenti: ${senzArco.length}/${righe.length}`);
if (indietro.length) console.log(`  scene all'indietro: ${indietro.map(r => `gi${r.gi} (${r.avanti}u, «${r.azione}»)`).join(' · ')}`);
console.log('\n⚠️  Un passaggio all\'indietro non e\' un difetto se l\'azione dichiarata e\' una sponda: il nome dell\'azione, stampato qui accanto, e\' cio\' che distingue il difetto dal repertorio.');
for (const e of errs.slice(0, 3)) console.log('  ⚠ pageerror: ' + e);
