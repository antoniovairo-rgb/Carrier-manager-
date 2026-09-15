/* [D12 passo 2] Il GLB unito espone davvero l'attributo _PARTE alla scena? Carica assets/footballer-uno.glb
   con il loader del gioco e stampa gli attributi della geometria, i materiali e le ossa. Sola lettura. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const server = await startServer(); const port = server.address().port;
const browser = await launchBrowser();
const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1 });
await installCdnRoutes(ctx);
const page = await ctx.newPage();
let errori = 0; page.on('pageerror', () => { errori++; });
await page.addInitScript(() => { window.__CPM_GLB = true; });
await openMatch(page, port, { skipLoadAll: true, name: 'Vairo' });
try { await page.waitForFunction(() => window.__CPM_GLB_READY === true, { timeout: 90000 }); } catch (_e) {}
await sleep(1500);
const r = await page.evaluate(async () => {
  const T = window.THREE; if (!T) return { errore: 'niente THREE' };
  const L = T.GLTFLoader ? new T.GLTFLoader() : (window.GLTFLoader ? new window.GLTFLoader() : null);
  if (!L) return { errore: 'niente GLTFLoader' };
  const g = await new Promise((ok, no) => L.load('./assets/footballer-uno.glb', ok, undefined, no)).catch((e) => ({ errore: String(e) }));
  if (!g || g.errore) return { errore: (g && g.errore) || 'carico fallito' };
  const mesh = []; g.scene.traverse((o) => { if (o.isMesh || o.isSkinnedMesh) mesh.push(o); });
  return {
    mesh: mesh.length,
    dettagli: mesh.map((m) => ({
      nome: m.name, skinnata: !!m.isSkinnedMesh,
      attributi: Object.keys(m.geometry.attributes),
      gruppi: (m.geometry.groups || []).length,
      materiali: Array.isArray(m.material) ? m.material.length : 1,
      ossa: m.skeleton ? m.skeleton.bones.length : 0,
      vertici: m.geometry.attributes.position ? m.geometry.attributes.position.count : 0,
    })),
    animazioni: (g.animations || []).length,
  };
});
console.log(JSON.stringify(r, null, 1));
console.log('errori pagina:', errori);
await browser.close(); server.close();
