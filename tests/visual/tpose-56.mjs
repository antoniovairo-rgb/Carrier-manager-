#!/usr/bin/env node
/* [7.999.56 guardiano — collaudo PO «sono ritornati in T pose e non corrono i giocatori in 3D»] Regressione della 7.999.37
   (bisezione: .36 pulita, .37 T-pose): se il primo fotogramma di un corpo era uno stacco di scena la velocita' smussata restava
   undefined → NaN nel peso idle/corsa → nessuna clip applicata. Qui, coi corpi 3D accesi, sulle scene delle note del PO si
   conta per ogni campione dell'esito i corpi con peso non finito (nanW) o senza nessuna azione pesata (senza), da __CPM_ANIM_AUDIT.
   VERDE: nessun campione con corpi fermi. ROSSO __CPM_NO_TPOSE56: deve comparire (il guardiano vede il difetto). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const SCENE = (process.env.CPM_SCENE || '110:1:fail,6:0:success,76:0:fail').split(',').map(x => x.split(':'));
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function braccio(rosso) {
  const out = [];
  for (const [gi, az, es] of SCENE) {
    const page = await b.newPage({ viewport: { width: 412, height: 700 } }); await installCdnRoutes(page);
    await page.addInitScript(r => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; if (r) window.__CPM_NO_TPOSE56 = 1; }, rosso);
    await openMatch(page, port, { skipLoadAll: true, name: 'Tpose56' });
    await page.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 90000 }).catch(() => {});
    await sleep(1500);
    await page.evaluate(g => { window.__CPM_FORCE_SIT(g, false); window.__CPM_FROZEN = false; }, +gi);
    await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_choose', null, { timeout: 30000 }).catch(() => {});
    await sleep(600);
    await page.evaluate(([a, e]) => { window.__CPM_FORCE_OUTCOME = e; window.__CPM_RESOLVE(a); }, [+az, es]);
    const c = [];
    for (let i = 0; i < 4; i++) { await sleep(1300); c.push(await page.evaluate(() => { const r = window.__CPM_ANIM_AUDIT && window.__CPM_ANIM_AUDIT(); return r ? [r.avatars, r.nanW, r.senza] : null; })); }
    await page.close();
    const fermi = c.filter(x => x && (x[1] > 0 || x[2] > 0)).length;
    out.push({ gi: +gi, campioni: c, fermi });
  }
  return out;
}
const v = await braccio(false); console.log('VERDE', JSON.stringify(v));
const r = await braccio(true); console.log('ROSSO', JSON.stringify(r));
await b.close(); srv.close();
const okV = v.every(s => s.fermi === 0 && s.campioni.every(Boolean));
const okR = r.some(s => s.fermi > 0);
console.log(okV ? '✅ nessun corpo fermo in T-pose nelle scene delle note' : '❌ corpi senza animazione (T-pose)');
console.log(okR ? '✅ il rosso __CPM_NO_TPOSE56 mostra i corpi fermi' : '❌ il rosso non riproduce il difetto: guardiano cieco');
process.exit(okV && okR ? 0 : 1);
