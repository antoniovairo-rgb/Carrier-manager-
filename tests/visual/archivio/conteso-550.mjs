#!/usr/bin/env node
/* GUARDIANO DELLA FASE 1 — IL PALLONE È CONTESO.
   Scritto PRIMA del rimedio, con la soglia dichiarata prima: è il numero contro cui la fase 1 della
   roadmap dovrà dimostrare di aver funzionato.

   DA DOVE VIENE. L'audit del 22 agosto: «il pallone non ha un proprietario nel modello, quindi non può
   avere eventi; il possesso è ricostruito a valle per prossimità geometrica dentro il renderer — l'unico
   strato che non ha autorità sul gioco». Il quality gate lo misura da un'altra faccia e in metri:
   «palla in metà offensiva, difensore più vicino a 26,9 m». Ventisette metri sono dal dischetto fin quasi
   a centrocampo: il pallone non è marcato, non è pressato, è SOLO.

   COSA MISURA — tre numeri, tutti sulle mesh (sorgente unica, `__CPM_OWN` + `__CPM_MP`):
     1. DISTANZA DELL'AVVERSARIO PIÙ VICINO al pallone, mediana su tutta la partita. È «quanto è solo».
     2. QUOTA DI TEMPO IN CUI NESSUN AVVERSARIO sta entro CONTESA metri. È «quanto spesso nessuno prova
        a prenderlo».
     3. CAMBI DI PADRONE CONTESI: quante volte il pallone passa da un lato all'altro CON un avversario
        entro CONTESA metri nei due secondi precedenti. Oggi il portatore cambia perché cambia «chi è più
        vicino»: un cambio senza nessuno vicino non è un recupero, è una deriva.

   SOGLIE DICHIARATE PRIMA DEL RIMEDIO:
     avversario più vicino, mediana   <= 12 m      (una marcatura larga, non un pressing)
     tempo senza nessuno entro 12 m   <= 35%
     cambi di padrone contesi         >= 50%       (metà dei cambi nasce da un duello, non da una deriva)

   NON è un guardiano bloccante finché la fase 1 non è fatta: oggi stampa la BASELINE. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, matchPhase } from './lib/harness.mjs';
const PARTITE = +(process.env.CPM_PARTITE || 3);
const CONTESA = 12;
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const tutte = [];
for (let i = 0; i < PARTITE; i++) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  await page.addInitScript(() => {
    window.__CPM_GLB = false; window.__CPM_CT = [];
    setInterval(() => { try {
      const o = window.__CPM_OWN && window.__CPM_OWN(); if (!o || o.ph !== 'playing') return;
      const mp = (window.__CPM_MP && window.__CPM_MP()) || []; if (!mp.length) return;
      /* il portatore: l'uomo piu' vicino alla palla. Il suo lato decide chi e' l'avversario. */
      let pi = -1, pd = 1e9;
      mp.forEach((q, k) => { if (!q) return; const d = Math.hypot(q.x - o.x, q.y - o.y); if (d < pd) { pd = d; pi = k; } });
      if (pi < 0) return;
      const lato = mp[pi].t;
      let ad = 1e9;
      mp.forEach(q => { if (!q || q.t === lato || q.gk) return; const d = Math.hypot(q.x - o.x, q.y - o.y); if (d < ad) ad = d; });
      /* [7.551] I TRE PALLONI: se esistesse una sorgente unica coinciderebbero. Oggi no — ed e' QUESTO
         il numero della fase 1, non la contesa (che risulta gia' al 98% e quindi non discrimina). */
      const b3 = window.__CPM_BALL3 && window.__CPM_BALL3();
      const dTM = b3 && b3.m ? Math.hypot(b3.t.x - b3.m.x, b3.t.y - b3.m.y) : null;   /* bersaglio vs mesh */
      const dLM = b3 && b3.m ? Math.hypot(b3.l.x - b3.m.x, b3.l.y - b3.m.y) : null;   /* logico  vs mesh */
      window.__CPM_CT.push({ c: o.c, lato, pd: +pd.toFixed(1), ad: +ad.toFixed(1), x: o.x, dTM, dLM });
    } catch (_e) {} }, 100);
  });
  await openMatch(page, port, { skipLoadAll: true, name: 'Ct' + i });
  await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), 7300 + i * 37);
  const t0 = Date.now();
  while (Date.now() - t0 < 600000) { await sleep(1500); const ph = await matchPhase(page); if (ph === 'ended' || ph === 'ceremony') break; }
  tutte.push(await page.evaluate(() => window.__CPM_CT || []));
  await page.close();
}
srv.close(); await b.close();
const med = a => a.length ? a.slice().sort((x, y) => x - y)[a.length >> 1] : null;
const tr = tutte.flat();
if (!tr.length) { console.log('nessun campione'); process.exit(1); }
const adAll = tr.map(s => s.ad).filter(v => v < 1e8);
const soli = adAll.filter(v => v > CONTESA).length / adAll.length;
/* cambi di lato, e se erano contesi */
let cambi = 0, contesi = 0;
for (let k = 1; k < tr.length; k++) {
  if (tr[k].lato === tr[k - 1].lato) continue;
  cambi++;
  const fin = Math.max(0, k - 20);            /* ~2 secondi a 100ms */
  let vicino = false;
  for (let j = fin; j < k; j++) if (tr[j].ad <= CONTESA) { vicino = true; break; }
  if (vicino) contesi++;
}
const off = tr.filter(s => s.x > 50).map(s => s.ad).filter(v => v < 1e8);
console.log(`\n=== IL PALLONE È CONTESO? · baseline · ${tutte.length} partite · ${tr.length} campioni ===\n`);
console.log(`  avversario più vicino al pallone, mediana : ${med(adAll)} m        soglia <=12`);
console.log(`     … con la palla in metà offensiva       : ${med(off)} m`);
console.log(`  tempo senza NESSUN avversario entro ${CONTESA} m  : ${(soli * 100).toFixed(0)}%          soglia <=35%`);
console.log(`  cambi di padrone                          : ${cambi}`);
console.log(`  di cui CONTESI (un avversario entro ${CONTESA} m) : ${contesi}/${cambi} = ${cambi ? (contesi / cambi * 100).toFixed(0) : 0}%     soglia >=50%`);
const tm = tr.map(s => s.dTM).filter(v => v != null), lm = tr.map(s => s.dLM).filter(v => v != null);
const p90 = a => { const x = a.slice().sort((u, v) => u - v); return x[Math.floor(x.length * 0.9)]; };
console.log(`\n  I TRE PALLONI — se la sorgente fosse una sola, coinciderebbero:`);
if (tm.length) {
  console.log(`    bersaglio vs mesh : mediana ${med(tm).toFixed(1)} m · p90 ${p90(tm).toFixed(1)} · max ${Math.max(...tm).toFixed(1)}      soglia mediana <=3`);
  console.log(`    logico    vs mesh : mediana ${med(lm).toFixed(1)} m · p90 ${p90(lm).toFixed(1)} · max ${Math.max(...lm).toFixed(1)}      soglia mediana <=2`);
  console.log(`    E' QUESTO il numero della fase 1: la contesa risulta gia' al 98% e non discrimina.`);
} else console.log('    __CPM_BALL3 non disponibile');
console.log(`\n  Un cambio senza nessuno vicino non è un recupero: è una deriva.`);
console.log(`  BASELINE della fase 1. Non blocca: misura il punto di partenza.`);
