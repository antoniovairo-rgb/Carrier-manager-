#!/usr/bin/env node
/* [7.359.0] GUARDIANO DEL SERVIZIO AL COMPAGNO — collaudo PO #116 «passaggio scoordinato»,
   #39 «sponda a un compagno troppo vicino e in orizzontale», #38 «dai e vai, passaggio orizzontale».

   Il ricevente del ramo `pass` si sceglieva col punteggio `d - avanti*0,6`: la distanza contava piu'
   della profondita' e, a differenza dei due siti gemelli (che penalizzano di +14 chi sta sotto i 6u),
   qui non c'era NESSUNA penalita' di vicinanza. Misurato su 31 servizi reali prima del fix: 7 sotto i
   6 metri e 12 senza profondita', con gi25 «Filtrante per il centravanti!» servito a 1,8u e 0,0u di
   avanzamento e gi156 «Lancio millimetrico in profondita'!» giocato 6,8u ALL'INDIETRO.

   ⚠️ Due trappole di misura, entrambe pagate:
     · il gioco scrive `__CPM_DISPATCH` alla FINE dell'arco (u>=1) e con headless il tempo di scena
       scorre a ~1/3 del reale: leggerlo a 0,9s dal resolve da' 191 scene su 191 «senza dispatch».
     · la sonda dev'essere generosa sull'attesa ma severa sul conteggio: se osserva pochi servizi non
       e' verde, e' cieca.
   Uso: CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node pass-target-test.mjs                              */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const issues = [];
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 130)));
await page.addInitScript(() => { window.__CPM_GLB = false; });
await openMatch(page, port);
await sleep(900);

/* le scene che nella misura completa hanno prodotto un servizio a un compagno */
const GIS = [25, 85, 47, 107, 57, 147, 24, 156, 60, 89, 125, 26, 176, 162, 119, 187, 66, 18, 178];
let misurati = 0; const prof = []; let piatti = 0, vicini = 0;
for (const gi of GIS) {
  await page.evaluate(g => { window.__CPM_DISPATCH = null; window.__CPM_FORCE_SIT(g, true); }, gi);
  await sleep(560);
  await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'success'; try { window.__CPM_RESOLVE(0); } catch (e) {} });
  await sleep(2900);
  const d = await page.evaluate(() => window.__CPM_DISPATCH);
  if (!d || !d.rcv || !d.hero || d.post !== 'assist_recv') continue;
  misurati++;
  const fw = d.rcv.x - d.hero.x, lat = Math.abs(d.rcv.z - d.hero.z), dist = Math.hypot(fw, lat);
  prof.push(fw); if (dist < 6) vicini++;
  /* IL DIFETTO NELLA SUA FORMA PURA: il compagno e' praticamente addosso all'eroe E il servizio non ha
     nessuna direzione. Non basta «vicino» (una sponda si gioca corta) ne' «all'indietro» (un TACCO si
     gioca all'indietro per definizione — gi26 «Assist di tacco» e' calcio giusto, non un difetto): serve
     che manchino tutt'e due le cose insieme, ed e' esattamente il caso gi25 «Filtrante per il
     centravanti!» servito a 1,8u con 0,0u di profondita'. */
  if (dist < 4 && Math.abs(fw) < 2) { piatti++; issues.push(`gi${gi}: compagno a ${dist.toFixed(1)}u con ${fw.toFixed(1)}u di direzione — addosso all'eroe e senza senso di marcia`); }
  console.log(`  gi${String(gi).padStart(3)} dist ${dist.toFixed(1).padStart(5)}u · avanti ${fw.toFixed(1).padStart(6)}u · laterale ${lat.toFixed(1).padStart(5)}u`);
}
prof.sort((a, b) => a - b);
const med = prof.length ? prof[prof.length >> 1] : 0;
console.log(`\nservizi misurati ${misurati}/${GIS.length} · profondita' mediana ${med.toFixed(1)}u · sotto i 6u ${vicini}/${misurati}`);
/* LA MISURA UTILE E' AGGREGATA. La scelta del ricevente dipende dalle posizioni off-ball, che derivano
   tra un run e l'altro (per questo il gate le tiene fuori dalla firma golden): la stessa scena da' 12u
   in una passata e 3,8u in un'altra. Il singolo caso non e' ripetibile, la POPOLAZIONE si'. Prima del
   fix la mediana della profondita' su 31 servizi era 3,4u; dopo, 11u. */
if (med < 5) issues.push(`profondita' mediana ${med.toFixed(1)}u su ${misurati} servizi: i passaggi non guadagnano campo (prima del fix era 3,4u, dopo 11u)`);
if (misurati && vicini / misurati > 0.35) issues.push(`${vicini} servizi su ${misurati} sotto i 6 metri: troppi appoggi a un compagno che l'eroe ha addosso`);
/* un guardiano che non osserva niente non e' verde, e' cieco: e' successo davvero, con 191 scene su 191
   «senza dispatch» perche' l'attesa era piu' corta della durata dell'arco in headless. */
if (misurati < 8) issues.push(`solo ${misurati} servizi osservati: la misura non e' stata fatta (attesa piu' corta dell'arco?)`);

await browser.close(); srv.close();
if (issues.length) { console.log('\n❌ ' + issues.length + ' problemi:'); issues.forEach(i => console.log('  · ' + i)); process.exit(1); }
console.log('\n✅ SERVIZIO OK — il compagno servito e\' davanti e a distanza da passaggio');
