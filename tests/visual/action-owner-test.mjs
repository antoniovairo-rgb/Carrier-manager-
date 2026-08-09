#!/usr/bin/env node
/* [7.367.0] GUARDIANO «L'AZIONE E' DI CHI HA IL PALLONE» — collaudo PO #79 «Rimessa rapida dal portiere» +
   «Scatto in profondita' e ultimo passaggio»: «il pallone non arriva all'eroe, viene lanciata a nessuno a
   centrocampo. E' giusto?».

   No. Il blocco che posiziona il pallone ha tre rami e il primo cortocircuita gli altri: se la palla NASCE
   altrove la si mette li' e basta. Per un CORNER e' corretto (resta sulla bandierina finche' non la batti),
   per il RILANCIO DEL PORTIERE no — quello e' una consegna. Misurato prima del fix su gi79: pallone fermo a
   x=7 (i piedi del portiere) con l'eroe a x=22, e alla risoluzione l'arco parte da dove sta il pallone,
   cioe' dal portiere. Il «passaggio dell'eroe» era il rilancio del portiere, e l'eroe non lo toccava mai.

   L'invariante che si presidia e' piu' largo della scena che l'ha rivelato: QUANDO L'AZIONE PARTE, il
   pallone dev'essere dell'eroe. Le eccezioni sono dichiarate e legittime — le scene OFF-BALL (l'eroe si
   smarca per ricevere, il pallone e' altrui per definizione) e le DIFENSIVE (ce l'ha l'avversario).

   ⚠️ Serve `__CPM_FORCE_INTRO`: la forzatura salta `hl_intro`, che e' esattamente la fase in cui la
   consegna avviene. Senza, si misura uno stato in cui il pallone e' gia' stato messo a posto e il difetto
   e' invisibile.
   Uso: CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node action-owner-test.mjs                                */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const issues = [];
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 130)));
await page.addInitScript(() => { window.__CPM_GLB = false; });
await openMatch(page, port); await sleep(900);

/* gi79 (l'origine `gk`, la scena della nota) + un ventaglio di famiglie diverse */
const GIS = [79, 10, 53, 55, 63, 153, 116, 8, 26, 162, 176, 25];
let misurate = 0;
for (const gi of GIS) {
  const meta = await page.evaluate(g => { const s = (window.__CPM_SITS || [])[g] || {};
    return { off: !!s.offBall, def: s.type === 'def', at: s.ballAt || null, txt: String(s.text || '').slice(0, 34) }; }, gi);
  if (meta.off || meta.def) { console.log(`  gi${gi} · off-ball/difensiva — fuori ambito per dichiarazione`); continue; }
  await page.evaluate(g => {
    window.__AO = [];
    const tick = () => { try { const s = window.__CPM_STATE(); if (s && s.ball && s.hero) window.__AO.push([s.phase, Math.hypot(s.ball.x - s.hero.x, (s.ball.y - s.hero.y) * 0.68)]); } catch (e) {} if (window.__AO.length < 600) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
    window.__CPM_FORCE_INTRO = true; window.__CPM_FORCE_INTRO_MS = 1400; window.__CPM_FORCE_SIT(g, true);
  }, gi);
  await sleep(2600);
  const ao = await page.evaluate(() => window.__AO);
  /* la distanza NELL'ISTANTE in cui la scelta e' disponibile: da li' in poi l'azione e' dell'eroe */
  const scelta = ao.filter(r => r[0] === 'hl_choose' || r[0] === 'hl_move');
  if (scelta.length < 5) { console.log(`  gi${gi} · ${scelta.length} fotogrammi di scelta, non misurata`); continue; }
  misurate++;
  const d = scelta.slice(-5).map(r => r[1]).sort((a, b) => a - b)[2];
  console.log(`  gi${String(gi).padStart(3)} ${meta.at ? '[origine ' + meta.at + '] ' : ''}palla-eroe all'inizio dell'azione ${d.toFixed(1)}u · ${meta.txt}`);
  if (d > 3) issues.push(`gi${gi}: quando l'azione parte il pallone e' a ${d.toFixed(1)}u dall'eroe — l'azione non e' sua`);
}
console.log(`\nscene misurate ${misurate}/${GIS.length}`);
/* un guardiano che non osserva niente non e' verde, e' cieco */
if (misurate < 6) issues.push(`solo ${misurate} scene misurate: la misura non e' stata fatta (manca __CPM_FORCE_INTRO?)`);

await browser.close(); srv.close();
if (issues.length) { console.log('\n❌ ' + issues.length + ' problemi:'); issues.forEach(i => console.log('  · ' + i)); process.exit(1); }
console.log('\n✅ PROPRIETA\' DELL\'AZIONE OK — quando l\'azione parte, il pallone e\' dell\'eroe');
