/* [7.999.7] GUARDIANO: IL PASSO SEGUE LA VELOCITA' (corpi 3D accesi).
   Il piede d'appoggio resta fermo sul prato solo se la cadenza delle gambe e' proporzionale alla velocita' del corpo: il rapporto
   velocita'/cadenza (strada percorsa per ciclo di gambe) deve restare costante. Misurato: vecchia formula 1,75 -> 3,72 fra le fasce
   (x2,1: gambe che mulinano piano e piedi che scivolano veloce); stride matching 3,3 costante.
   Soglia: fra le fasce sopra 2 u/s (sotto interviene la cadenza minima) lo scarto massimo e' 15%.
   NB: misura di RAPPORTO, indipendente dai fotogrammi al secondo; il giudizio visivo resta il telefono del PO.
   CPM_ROSSO=1 → __CPM_NO_PASSO7 (vecchia formula): deve andare ROSSO. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const ROSSO = process.env.CPM_ROSSO === '1';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
await page.addInitScript(r => { window.__CPM_GLB = true; if (r) window.__CPM_NO_PASSO7 = 1; }, ROSSO);
await openMatch(page, port, { name: 'Passo7' });
await page.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: 11, policy: 'seeded', tickMs: 300 }));
await sleep(+(process.env.CPM_SEC || 60) * 1000);
const d = await page.evaluate(() => ({ p7: window.__CPM_PASSO7 || null, st: (window.__CPM_STRIDE || []).slice(-600) }));
await b.close(); srv.close();
const fasce = {}; for (const [v, ts] of d.st) { if (v < 2) continue; const f = v < 4 ? '2-4' : v < 6 ? '4-6' : '>6'; (fasce[f] = fasce[f] || []).push(v / ts); }
const med = Object.entries(fasce).filter(([, a]) => a.length >= 20).map(([k, a]) => [k, a.reduce((x, y) => x + y, 0) / a.length]);
console.log('velocita\' naturale della clip:', JSON.stringify(d.p7), '· velocita\'/cadenza per fascia:', med.map(([k, v]) => `${k} u/s ${v.toFixed(2)}`).join(' · '));
const fails = [];
if (errs.length) fails.push('errori di pagina: ' + errs.slice(0, 2).join(' | '));
if (med.length < 2) fails.push(`misura non fatta: solo ${med.length} fasce con almeno 20 campioni`);
const vals = med.map(m => m[1]); const scarto = vals.length ? Math.max(...vals) / Math.min(...vals) : 0;
console.log(`scarto fra le fasce: x${scarto.toFixed(2)} (soglia x1,15)`);
if (!ROSSO) { if (!d.p7) fails.push('velocita\' naturale della clip non misurata'); if (scarto > 1.15) fails.push(`il passo non segue la velocita': scarto x${scarto.toFixed(2)}`); }
else { const ok = med.length >= 2 && scarto > 1.15; console.log(ok ? '✅ ROSSO come atteso: con la vecchia formula il passo non segue la velocita\'' : '❌ il rosso non riproduce il difetto'); process.exit(ok ? 0 : 1); }
console.log(fails.length ? '❌ FAIL passo-velocita\n  ' + fails.join('\n  ') : '✅ PASS passo-velocita'); process.exit(fails.length ? 1 : 0);
