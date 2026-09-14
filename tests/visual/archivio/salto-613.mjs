/* [7.613.0 STRUMENTO] IL SALTO DEL BUILDUP-VOLO, CLASSIFICATO PER CAUSA.
   COLLAUDO PO (SIT #10, dispositivo a 60 fps): «SALTO del pallone di 8,1 unita' in 32 ms
   (scrittore: buildup-volo) — 252 u/s, sembra un teletrasporto». Sul dispositivo non ci sono
   fotogrammi lunghi: un lerp che salta ha una causa discreta. Candidati (dal sorgente, r.~4620):
     SEAM    — cambio di beat cucito male (bi cambia e la posizione strappa);
     REMAP   — la rimappatura del ricevente 7.414 sposta il bersaglio con p gia' alto
               (peso p^2: a p 0,8 un ricevente spostato di 12u muove il pallone di ~7,7u in UN frame);
     BASE    — il from usato (_f0387) cambia dentro lo stesso beat;
     P-JUMP  — p avanza molto in un frame lungo (LEGITTIMO in laboratorio a ~7 fps: qui si
               riconosce e si scarta, e' il singhiozzo di Nyquist, non il difetto del PO).
   ⚠️ PRIMA STESURA NON GIUDICABILE, annotato per il prossimo: in autoplay ambientale il buildup-volo
   NON GIRA MAI (0 frame su 4 minuti; il censimento scrittori-601 non ha il codice 13). La timeline
   cinematografica vive solo nelle SCENE GIOCATE: la sonda apre PROVINI, come rovesciata-596.
   NON e' un guardiano: misura. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_BV613 = []; window.__CPM_CINE = true; /* senza questo, ?cpmtest=1 SPEGNE l'executor cine (nota 7.381) e il buildup-volo non gira mai: e' il motivo dei due «0 frame» qui sopra */ });
await openMatch(page, port, { skipLoadAll: true, name: 'Sj' });
const GIS = Array.from({ length: 60 }, (_, i) => i * 2); /* 0,2,...,118: un pettine largo sul repertorio */
for (const gi of GIS) {
  try {
    await page.evaluate(([i, c]) => window.__CPM_FORCE_SIT(i, c), [gi, true]);
    await sleep(500);
    await page.evaluate((g) => { window.__CPM_FROZEN = false; window.__CPM_BV613.push({ mark: g }); }, gi);
    await sleep(5200); /* la costruzione (timeline) corre qui, prima della conclusione */
    await page.evaluate(() => window.__CPM_RESOLVE && window.__CPM_RESOLVE(0));
    await sleep(1200);
  } catch (_e) { /* un provino che non si apre non ferma il censimento */ }
}
const A = await page.evaluate(() => window.__CPM_BV613 || []);
await b.close(); srv.close();

let gi = null, frames = 0; const salti = [];
let prev = null;
for (const c of A) {
  if (c.mark != null) { gi = c.mark; prev = null; continue; }
  frames++;
  const a = prev; prev = c;
  if (!a || c.t - a.t > 1500) continue;
  const d = Math.hypot(c.x - a.x, c.y - a.y);
  if (d < 3) continue;
  /* attribuzione in due meta': quanto ha mosso QUALCUN ALTRO fra le due scritture del volo
     (scrittura scorsa -> pallone all'inizio di questo frame) e quanto ha mosso IL VOLO in questo
     frame (pallone prima -> scrittura). Il colpevole e' chi ha la meta' grande. */
  const dAltrui = (c.bx0 != null) ? Math.hypot(c.bx0 - a.x, c.by0 - a.y) : null;
  const dVolo = (c.bx0 != null) ? Math.hypot(c.x - c.bx0, c.y - c.by0) : null;
  const dp = Math.abs(c.p - a.p);
  const blen = Math.abs(c.tx - c.fx) || 1;
  let causa;
  if (dAltrui != null && dAltrui > d * 0.6) causa = 'ALTRUI (un altro scrittore ha mosso il pallone fra le due scritture del volo)';
  else if (c.bi !== a.bi) causa = 'SEAM (cambio beat)';
  else if (c.rm) causa = 'REMAP (ricevente rimappato questo frame)';
  else if (dp * blen > d * 0.6) causa = 'P-JUMP (frame lungo del laboratorio: legittimo)';
  else if (Math.abs(c.fx - a.fx) > 0.6) causa = 'BASE (il from e\' cambiato nello stesso beat)';
  else causa = 'ALTRO (rendez-vous o non classificato)';
  salti.push({ gi, d: +d.toFixed(1), dt: c.t - a.t, causa, k: c.k, bi: c.bi, p: c.p, dp: +dp.toFixed(3), da: dAltrui != null ? +dAltrui.toFixed(1) : null, dv: dVolo != null ? +dVolo.toFixed(1) : null, fu: c.fu });
}
console.log(`\n=== SALTI DEL BUILDUP-VOLO (${frames} frame su ${GIS.length} provini) ===\n`);
if (frames < 50) { console.log('  ⚠ quasi nessun frame di buildup-volo: NON GIUDICABILE.\n'); process.exit(1); }
console.log(`  salti >=3u fra frame consecutivi: ${salti.length}`);
const perCausa = {};
for (const s of salti) perCausa[s.causa] = (perCausa[s.causa] || 0) + 1;
for (const [k, n] of Object.entries(perCausa).sort((x, y) => y[1] - x[1]))
  console.log(`    ${String(n).padStart(3)}  ${k}`);
const veri = salti.filter(s => !/P-JUMP/.test(s.causa));
console.log(`\n  ESEMPI (salti NON spiegati dal frame lungo, i primi 14):`);
for (const s of veri.slice(0, 14))
  console.log(`    gi${s.gi} · ${s.d}u in ${s.dt}ms · beat ${s.bi} (${s.k}) · p ${s.p} (Δp ${s.dp}) · altrui ${s.da}u / volo ${s.dv}u · base ${s.fu ? 'pallone' : 'piano'} · ${s.causa}`);
if (!veri.length) console.log('    (nessuno: in questa passata il difetto del PO non si e\' riprodotto)');
console.log('\nCENSIMENTO registrato. Non e\' un guardiano: non fallisce, misura.\n');
