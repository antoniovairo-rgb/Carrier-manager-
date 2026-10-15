#!/usr/bin/env node
/* [7.999.168 PO-249, foto PO 14/10 (riquadrino giallo «3 fps» sopra la scena, Nazionale 27'): «devi togliere completamente
   la scritta fps, è una cosa tecnica che al player non interessa»] Il riquadrino degli fps (src/15-live-match.jsx,
   data-cpm="fps907") si mostrava negli highlight dell'eroe. Ora non si mostra piu' al giocatore; la misura resta
   (window.__CPM_FPS907, usata dalle bozze del taccuino).
   VERDE: durante un highlight forzato nessun elemento data-cpm="fps907" e nessuna scritta «N fps» nella pagina,
   mentre la misura __CPM_FPS907 risponde.
   ROSSO (__CPM_NO_FPS249): il riquadrino ricompare. Uso: node fps-249.mjs */
import { startServer, launchBrowser, installCdnRoutes, openMatch, forceSituation, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port; const esito = {};
for (const rosso of [false, true]) {
  const b = await launchBrowser();
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(ctx);
  const page = await ctx.newPage(); let errori = 0; page.on('pageerror', () => { errori++; });
  await page.addInitScript(r => { window.__CPM_GLB = false; if (r) window.__CPM_NO_FPS249 = 1; }, rosso);
  await openMatch(page, port, { name: 'Vairo' });
  const campioni = [];
  for (const gi of [0, 21, 50]) {
    await forceSituation(page, gi, { settle: 2600 });
    campioni.push(await page.evaluate(() => {
      const chip = !!document.querySelector('[data-cpm="fps907"]');
      const testo = (document.body.innerText.match(/\b\d{1,3} fps\b/g) || []);
      let misura = null; try { const f = window.__CPM_FPS907 && window.__CPM_FPS907(); misura = f ? f.fps5s : null; } catch (_e) {}
      let fase = null; try { fase = window.__CPM_PHASE ? window.__CPM_PHASE() : null; } catch (_e) {}
      return { chip, testo, misura, fase };
    }));
  }
  esito[rosso ? 'rosso' : 'verde'] = { campioni, errori };
  console.log((rosso ? 'rosso ' : 'verde ') + JSON.stringify(esito[rosso ? 'rosso' : 'verde']));
  await b.close();
}
srv.close();
const V = esito.verde, R = esito.rosso, g = [];
if (V.campioni.some(c => c.chip || c.testo.length)) g.push('verde: la scritta fps si vede ancora ' + JSON.stringify(V.campioni));
if (!V.campioni.some(c => c.misura != null)) g.push('verde: la misura __CPM_FPS907 non risponde (cieco)');
if (!R.campioni.some(c => c.chip)) g.push('rosso: il riquadrino non ricompare con __CPM_NO_FPS249 ' + JSON.stringify(R.campioni));
if (V.errori || R.errori) g.push(`errori di pagina: verde ${V.errori}, rosso ${R.errori}`);
if (g.length) { console.log('❌ fps-249'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ fps-249 verde (nessuna scritta fps al giocatore, misura viva) e il rosso si vede'); process.exit(0);
