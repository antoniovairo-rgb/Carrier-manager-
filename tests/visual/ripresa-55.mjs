#!/usr/bin/env node
/* [7.999.55 guardiano — collaudo PO «si perde l'avanzamento se metto l'app in background, durante la partita»] Una gara
   dell'EUROPEO (contesto nazionale, prima escluso dalla ripresa): si entra in campo, NON si manda alcun evento di background
   (su Android puo' non arrivare) e si ricarica la pagina come un'app uccisa dal sistema. VERDE: l'istantanea esiste senza
   evento (scrittura periodica) e dopo il riavvio si rientra in campo in `playing` a un minuto >= a quello salvato.
   ROSSO __CPM_NO_RIPRESA55: nessuna istantanea per l'Europeo (comportamento 7.150) — il guardiano deve vederlo. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import { SAVE } from './lib/banco-g0.mjs';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const save = JSON.parse(JSON.stringify(SAVE)); const P = save.player;
P.nation = 'Spagna'; P.nationalCaps = 12;
P.euroMondiale = { active: true, done: false, type: 'Europeo', phase: 'group', groupOpponents: ['Belgio', 'Croazia', 'Scozia'], groupMatchIdx: 0, groupPts: 0, groupResults: [] };
async function braccio(rosso) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, serviceWorkers: 'block' }); let page = await ctx.newPage(); await installCdnRoutes(page); page.on('pageerror', e => console.log('pageerror', String(e.message).slice(0, 160)));
  await ctx.addInitScript(([o, r]) => { window.__CPM_GLB = false; window.__CPM_RESUME_TEST = 1; if (r) window.__CPM_NO_RIPRESA55 = 1;
    if (!localStorage.getItem('r55')) { localStorage.setItem('cpm-v3', JSON.stringify(o)); localStorage.setItem('cpm-intro-seen', '1'); localStorage.setItem('r55', '1'); } }, [save, rosso]);
  const url = `http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`;
  const entra = async () => { await page.waitForFunction(() => document.getElementById('root')?.children.length > 0, null, { timeout: 90000 }); await sleep(1200);
    try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 6000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); };
  await page.goto(url, { waitUntil: 'load', timeout: 90000 }); await entra(); console.log('  entrato', rosso); await sleep(600);
  const ap = await page.evaluate(() => { const C = window.__CPM_CAREER; C.dismiss(); return C.apriNaz55(); });
  await page.waitForFunction(() => typeof window.__CPM_PHASE === 'function', null, { timeout: 30000 }).catch(() => {});
  await page.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: 5501, policy: 'seeded', tickMs: 300 }));
  let min = 0; for (let i = 0; i < 240; i++) { await sleep(500); min = await page.evaluate(() => ((window.__CPM_CLOCK && window.__CPM_CLOCK()) | 0)); if (min >= 8) break; }
  await page.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(false));
  await sleep(5000);
  const snap = await page.evaluate(() => { try { return JSON.parse(localStorage.getItem('cpm-match-resume') || 'null'); } catch (e) { return null; } });
  console.log('  prima del riavvio', min, JSON.stringify(snap && snap.clock));
  /* app uccisa: si chiude la pagina SENZA pagehide gestito (l'istantanea e' gia' stata letta prima, quindi la prova
     della scrittura periodica non dipende da lui) e se ne apre una nuova nello stesso profilo — un page.reload nel banco non riserve le librerie dal CDN locale */
  await page.close({ runBeforeUnload: false });
  page = await ctx.newPage(); await installCdnRoutes(page); page.on('pageerror', e => console.log('pageerror', String(e.message).slice(0, 160)));
  await page.goto(url, { waitUntil: 'load', timeout: 90000 }); await entra(); console.log('  rientrato');
  let dopo = null; for (let i = 0; i < 30; i++) { await sleep(700); dopo = await page.evaluate(() => ({ ph: (window.__CPM_PHASE && window.__CPM_PHASE()) || null, min: ((window.__CPM_CLOCK && window.__CPM_CLOCK()) | 0) })); if (dopo.ph) break; }
  await ctx.close();
  return { ap, minPrima: min, snap: snap ? { ctx: snap.context, clock: snap.clock, sig: snap.sig } : null, dopo };
}
const v = await braccio(false); console.log('VERDE', JSON.stringify(v));
const r = await braccio(true); console.log('ROSSO', JSON.stringify(r));
await b.close(); srv.close();
const okV = v.ap === true && v.snap && /^euroMondiale/.test(v.snap.ctx) && v.dopo && ['playing', 'hl_intro', 'hl_move', 'hl_choose', 'hl_result'].includes(v.dopo.ph) && v.dopo.min >= v.snap.clock;
const okR = r.ap === true && !r.snap && !(r.dopo && r.dopo.ph);
console.log(okV ? '✅ Europeo: istantanea senza evento di background e ripresa in campo dopo il riavvio' : '❌ ripresa dell\'Europeo non riuscita');
console.log(okR ? '✅ il rosso __CPM_NO_RIPRESA55 si vede (nessuna ripresa)' : '❌ il rosso non si distingue');
process.exit(okV && okR ? 0 : 1);
