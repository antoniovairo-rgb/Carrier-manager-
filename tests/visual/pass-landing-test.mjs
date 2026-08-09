#!/usr/bin/env node
/* [7.369.0] GUARDIANO DEL PUNTO D'ATTERRAGGIO — collaudo PO, residuo di 7.367 su gi79
   «Rimessa rapida dal portiere!» → k0 «Scatto in profondita' e ultimo passaggio»:
   «l'ultimo passaggio atterra a 2-5u da chiunque».

   E' una famiglia DIVERSA da quella di `pass-target-test.mjs`. Li' si misura CHI viene scelto
   (il ricevente e' davanti? e' a distanza da passaggio?); qui si misura DOVE CADE LA PALLA rispetto
   a chi la deve prendere. Si puo' scegliere il compagno giusto e servirlo lo stesso a cinque metri:
   sono due difetti indipendenti e servono due misure.

   METRICA: alla fine dell'arco (`__CPM_DISPATCH`, scritto a u>=1) la distanza fra il bersaglio
   dell'arco `tgt` e il ricevente `rcv`, in unita' mondo Three.js. E' la distanza fra dove la palla
   e' arrivata e dove sta l'uomo. 0 = gliela metti sui piedi.

   ⚠️ Trappole di misura, tutte gia' pagate in questo repo:
     · `__CPM_DISPATCH` si scrive SOLO a fine arco e SOLO in certi rami: se la scena non ne produce
       uno si rilegge quello della scena PRECEDENTE → va azzerato prima di ogni scena.
     · in headless l'arco parte 2,5-3s dopo la scelta: finestre corte misurano la palla ferma.
     · la scelta del ricevente dipende dalle posizioni off-ball, che derivano fra un run e l'altro
       (per questo il gate le tiene fuori dalla firma golden) → si giudica la POPOLAZIONE su piu'
       repliche, mai la singola scena.
   Uso: CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node pass-landing-test.mjs                          */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const REPS = +(process.env.LAND_REPS || 3);
/* gi79 e' la scena del collaudo; le altre sono le scene della stessa famiglia (ramo `pass` con
   post-arco `assist_recv`) che nella misura completa producono un servizio a un compagno. */
const GIS = (process.env.LAND_GIS || '79,25,85,47,107,57,147,24,156,60,89,125,26,176,162,119,187,66,18,178')
  .split(',').map(s => +s.trim()).filter(n => Number.isFinite(n));

const issues = [];
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 130)));
await page.addInitScript(() => { window.__CPM_GLB = false; });
await openMatch(page, port);
await sleep(900);

const perGi = new Map();   // gi → [{rcv,near,who}, …]
const all = [];
for (let r = 0; r < REPS; r++) {
  for (const gi of GIS) {
    await page.evaluate(g => { window.__CPM_DISPATCH = null; window.__CPM_FORCE_SIT(g, true); }, gi);
    await sleep(560);
    await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'success'; try { window.__CPM_RESOLVE(0); } catch (e) {} });
    await sleep(2900);
    const d = await page.evaluate(() => window.__CPM_DISPATCH);
    if (!d || !d.tgt || !d.rcv || d.post !== 'assist_recv') continue;
    const rec = {
      ht: d.ht || null,                                         // famiglia: solo `pass` passa dal rendez-vous
      rcv: Math.hypot(d.tgt.x - d.rcv.x, d.tgt.z - d.rcv.z),   // dal ricevente DESIGNATO
      near: d.near ? d.near.d : null,                           // da CHIUNQUE (metrica della nota PO)
      who: d.near ? d.near.who : null,
    };
    if (!perGi.has(gi)) perGi.set(gi, []);
    perGi.get(gi).push(rec); all.push(rec);
  }
}

const med = a => { if (!a.length) return NaN; const s = [...a].sort((x, y) => x - y); return s[s.length >> 1]; };
const medBy = (a, k) => med(a.map(r => r[k]).filter(v => v != null));
console.log(`\n  scena   n   ricevente   chiunque   piu' vicino`);
for (const gi of GIS) {
  const a = perGi.get(gi); if (!a || !a.length) continue;
  const who = a.map(r => r.who).filter(Boolean);
  console.log(`  gi${String(gi).padStart(3)}  ${String(a.length).padStart(2)}   ${medBy(a, 'rcv').toFixed(1).padStart(6)}u   ${medBy(a, 'near').toFixed(1).padStart(6)}u   ${who.length ? who[0] : '—'}`);
}
/* SOLO la famiglia `pass` passa dal rendez-vous del ramo filtrante. Le scene con post-arco
   `assist_recv` ma hlType `dribble`/`build` (gi176/gi18/gi178) ci finivano dentro per il solo filtro
   sul post-arco e falsavano la mediana di 20u: sono un'altra famiglia, con un'altra causa, e vanno
   misurate a parte — non nascoste dentro questa media. */
const passOnly = all.filter(r => r.ht === 'pass');
const M = medBy(passOnly, 'rcv'), N = medBy(all, 'near');
const nearVals = all.map(r => r.near).filter(v => v != null);
console.log(`\natterraggi misurati ${all.length} (${REPS} repliche x ${GIS.length} scene) · di cui famiglia pass ${passOnly.length}`);
console.log(`  mediana palla↔ricevente designato (solo pass) ${M.toFixed(1)}u`);
console.log(`  mediana palla↔chiunque                        ${N.toFixed(1)}u · oltre 2u ${nearVals.filter(v => v > 2).length}/${nearVals.length}`);

/* un guardiano che non osserva niente non e' verde, e' cieco: e' successo davvero in questo repo,
   con 191 scene su 191 «senza dispatch» perche' l'attesa era piu' corta dell'arco. */
if (all.length < 8) issues.push(`solo ${all.length} atterraggi osservati: la misura non e' stata fatta (attesa piu' corta dell'arco?)`);
else {
  /* SOGLIE — misurate, non scelte a priori. Prima del fix: mediana palla↔chiunque 4,3u con 42/46
     atterraggi oltre i 2u, e gi79 (la scena del collaudo) col ricevente designato a 11,0u e un
     AVVERSARIO come uomo piu' vicino al pallone. Dopo: 1,1u, 13/34, gi79 a 0,5u.
     La soglia primaria e' su «chiunque» perche' e' la metrica della nota del PO; quella sul ricevente
     designato copre il rendez-vous vero e proprio e vale SOLO per la famiglia `pass`. */
  if (N > 2.5) issues.push(`mediana palla↔chiunque ${N.toFixed(1)}u su ${nearVals.length} atterraggi: la palla cade nello spazio vuoto (prima del fix 4,3u, dopo 1,1u)`);
  if (passOnly.length >= 6 && M > 3) issues.push(`mediana palla↔ricevente designato ${M.toFixed(1)}u su ${passOnly.length} passaggi: il rendez-vous non chiude (prima del fix 9,3u, dopo 0,5u)`);
  const g79 = (perGi.get(79) || []).filter(r => r.ht === 'pass');
  if (g79.length && medBy(g79, 'rcv') > 3) issues.push(`gi79 mediana ${medBy(g79, 'rcv').toFixed(1)}u: e' la scena del collaudo PO (prima del fix 11,0u, dopo 0,5u)`);
}

await browser.close(); srv.close();
if (issues.length) { console.log('\n❌ ' + issues.length + ' problemi:'); issues.forEach(i => console.log('  · ' + i)); process.exit(1); }
console.log("\n✅ ATTERRAGGIO OK — l'ultimo passaggio arriva sull'uomo, non nello spazio vuoto");
