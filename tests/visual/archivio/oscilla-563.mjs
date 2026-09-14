#!/usr/bin/env node
/* MISSIONE — CODICE 007: CHI SCRIVE LA CAMERA, E QUANTO OSCILLA L'ASSE.
   Nota PO dal telefono (7.560): «lo SGUARDO della camera oscilla: 41,5 inversioni/s dell'asse ottico
   (ampiezza max 6,2°) — ultima passata per fotogramma: vista-reale 51% + bisezione 49% · 2,5 passate/
   fotogramma». E' la stessa firma del pallone prima del 7.556: DUE scrittori, nessuna elezione.
   Qui si legge in laboratorio quello che il telefono ha misurato sul campo: il testimone B (asse RESO,
   dopo lerp e reti post-lerp) e il censimento delle passate per fotogramma.
     CPM_CHROME=... node oscilla-563.mjs [CPM_MS=200000]                                               */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const MS = +(process.env.CPM_MS || 200000);
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
async function giro(rosso){
  const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  await page.addInitScript(([r]) => {
    window.__CPM_GLB = false; window.__CPM_REC = true;
    if (r) window.__CPM_NO563 = true;
    window.__CPM_OSC521B = { p: null, s: null, flips: 0, amp: 0, f: 0, att: {} };
    window.__CPM_CAM503 = { f: 0, tocchi: 0, multi: 0, combo: {}, per: {} };
    window.__CPM_FRAME480 = { n: 0, min: 9, max: 0, fuori: 0, ultimo: 0 };
  }, [rosso]);
  await openMatch(page, port, { skipLoadAll: true, name: rosso ? 'Ro' : 'Ve' });
  await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 4400, policy: 'seeded', tickMs: 300 }));
  const t0 = Date.now();
  await sleep(MS);
  const sec = (Date.now() - t0) / 1000;
  const R = await page.evaluate(() => ({
    osc: JSON.parse(JSON.stringify(window.__CPM_OSC521B || {})),
    cam: JSON.parse(JSON.stringify(window.__CPM_CAM503 || {})),
    fr: JSON.parse(JSON.stringify(window.__CPM_FRAME480 || {})),
  }));
  await page.close(); R.sec = sec; return R;
}
const RR = await giro(true), RV = await giro(false);
srv.close(); await b.close();
for (const [nome, R] of [['ROSSO (due reti di legalita\')', RR], ['VERDE (una sola)', RV]]) {
  const c = R.cam, o = R.osc;
  const due = Object.entries(c.combo || {}).filter(([k]) => k.split('+').includes('bisezione') && /vista-reale/.test(k)).reduce((a, e) => a + e[1], 0);
  console.log(`\n  ${nome}`);
  console.log(`    fotogrammi HL ${c.f} · passate ${c.tocchi} · media ${c.f ? (c.tocchi / c.f).toFixed(2) : '—'}/fotogramma`);
  console.log(`    fotogrammi con PIU' DI UNA passata ${c.multi} (${c.f ? (100 * c.multi / c.f).toFixed(1) + '%' : '—'})`);
  console.log(`    fotogrammi con DUE RETI DI LEGALITA' insieme (bisezione+vista-reale): ${due}`);
  console.log(`    asse reso: ${o.flips} inversioni in ${R.sec.toFixed(0)}s = ${(o.flips / R.sec).toFixed(2)}/s`);
  const fr = R.fr || {};
  console.log(`    EROE FUORI QUADRO: ${fr.fuori || 0}/${fr.n || 0} fotogrammi (${fr.n ? (100 * (fr.fuori || 0) / fr.n).toFixed(1) + '%' : '\u2014'})  <- il controguardia: tacere non deve lasciarlo fuori`);
}
{
  const dueR = Object.entries(RR.cam.combo || {}).filter(([k]) => k.split('+').includes('bisezione') && /vista-reale/.test(k)).reduce((a, e) => a + e[1], 0);
  const dueV = Object.entries(RV.cam.combo || {}).filter(([k]) => k.split('+').includes('bisezione') && /vista-reale/.test(k)).reduce((a, e) => a + e[1], 0);
  console.log('');
  if (!dueR) console.log(`\u2717 NON SEPARATI \u2014 il rosso non mostra nessun fotogramma con due reti di legalita': il giudizio non prova niente.`);
  else if (dueV) console.log(`\u2717 FAIL \u2014 il verde ha ancora ${dueV} fotogrammi con due reti di legalita' (rosso ${dueR}).`);
  else {
    const fR = RR.fr || {}, fV = RV.fr || {};
    const qR = fR.n ? (fR.fuori || 0) / fR.n : 0, qV = fV.n ? (fV.fuori || 0) / fV.n : 0;
    if (fV.n > 100 && qV > qR + 0.03) { console.log(`\u2717 FAIL \u2014 la legalita' tace ma l'eroe finisce fuori quadro piu' di prima: ${(100*qV).toFixed(1)}% contro ${(100*qR).toFixed(1)}%.`); process.exit(1); }
    console.log(`\u2713 PASS \u2014 rosso ${dueR} fotogrammi con due reti di legalita', verde 0, e l'eroe non esce di piu' (${(100*qV).toFixed(1)}% contro ${(100*qR).toFixed(1)}%).`);
  }
  console.log(`\n\u26a0 QUESTA MISURA NON VEDE IL TREMORE: headless l'asse inverte ~0,2 volte al secondo, sul telefono del PO 41,5. Il numero difendibile qui e' quello strutturale; la conferma la da' il collaudo sul dispositivo.`);
}

