#!/usr/bin/env node
/* PO-227 — sonda di SOLA OSSERVAZIONE sulla fila dell'ingresso in campo (walkout), GLB acceso.
   Nessuna modifica al gioco: patch in pagina di THREE.AnimationMixer.prototype.update (lettura del peso
   effettivo di ogni clip e della posizione di ogni mixer, ad ogni fotogramma). Un mixer = un corpo.
   Per ogni corpo, nella sola fase walkout (__CPM_PHASE), si accumulano in TEMPO DI SCENA (somma degli
   argomenti dt passati a update):
     - stillS      : secondi di scena in cui il corpo è FERMO (velocità < 0,5 u/s, stessa soglia di fila-206)
     - runStillS   : di questi, quelli in cui la clip di corsa (nome contenente 'jog' o 'run') ha peso effettivo > 0,3
     - clipStillS  : secondi fermo per nome-clip con peso > 0,3 (tutte le clip)
   Lo scatto ogni ~1,5 s reali registra uno snapshot dei corpi fermi (per i fotogrammi a pausa e le foto).
   Uso: node po227-fila-sonda.mjs <outDir> [walkSecMax]  (tempo reale massimo di osservazione del walkout) */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { startServer, launchBrowser, installCdnRoutes, sleep, ROOT } from '../../../tests/visual/lib/harness.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = process.argv[2] || path.join(here, '..', 'PO227-dati');
const walkMax = (+process.argv[3] || 80) * 1000;
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(path.join(outDir, '..', 'PO227-foto'), { recursive: true });
const save = JSON.parse(fs.readFileSync(path.join(ROOT, 'tests/visual/fixtures/save-194-primavera-w38.json'), 'utf8'));

const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
const pageErrors = []; page.on('pageerror', e => pageErrors.push(String(e && e.message || e)));
await page.addInitScript((s) => {
  window.__CPM_GLB = true; window.__CPM_WALKTEST74 = 1;
  localStorage.setItem('cpm-v3', JSON.stringify(s));
}, save);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
await sleep(1200);
try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }).catch(() => {});
await sleep(2500);
try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
const pm = await page.evaluate(() => window.__CPM_CAREER.playMatch());
await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 40000 }).catch(() => {});
await page.waitForFunction(() => window.__CPM_GLB_READY, null, { timeout: 60000 }).catch(() => {});

// Patch di lettura: UNA volta, prima del walkout. Non altera posizioni né pesi.
const patched = await page.evaluate(() => {
  const T = window.THREE; if (!T || !T.AnimationMixer) return false;
  if (T.AnimationMixer.prototype.__sonda227) return true;
  const orig = T.AnimationMixer.prototype.update;
  window.__SONDA227 = { bodies: {}, n: 0 };
  const v = new T.Vector3();
  T.AnimationMixer.prototype.update = function (dt) {
    const r = orig.call(this, dt);
    try {
      const S = window.__SONDA227; const ph = window.__CPM_PHASE && window.__CPM_PHASE();
      if (!S || ph !== 'walkout') { return r; }
      const root = this._root; if (!root) return r;
      const id = root.uuid; root.getWorldPosition(v);
      let b = S.bodies[id];
      if (!b) { b = S.bodies[id] = { id, scaleY: +root.scale.y.toFixed(3), stillS: 0, runStillS: 0, clipStillS: {}, scene: 0, last: null, clips: {}, samples: [] }; }
      const acts = (this._actions || []).map(a => ({ n: a.getClip ? a.getClip().name : '?', w: a.getEffectiveWeight ? a.getEffectiveWeight() : 0 }));
      acts.forEach(a => { b.clips[a.n] = 1; });
      const d = Math.max(0, +dt || 0);
      if (b.last && d > 0) {
        const dist = Math.hypot(v.x - b.last.x, v.y - b.last.y, v.z - b.last.z);
        const vel = dist / d; // unità di mondo per secondo di scena
        b.scene += d;
        if (vel < 0.5) {
          b.stillS += d;
          let runW = 0; acts.forEach(a => { if (/jog|run/i.test(a.n) && a.w > runW) runW = a.w; if (a.w > 0.3) b.clipStillS[a.n] = (b.clipStillS[a.n] || 0) + d; });
          if (runW > 0.3) b.runStillS += d;
        }
        b.lastVel = +vel.toFixed(3);
        b.lastActs = acts.filter(a => a.w > 0.02).map(a => a.n + ':' + a.w.toFixed(2));
      }
      b.last = { x: v.x, y: v.y, z: v.z };
      b.lastW = acts.map(a => a.n + ':' + a.w.toFixed(2));
      S.n++;
    } catch (e) {}
    return r;
  };
  T.AnimationMixer.prototype.__sonda227 = true;
  return true;
});
if (!patched) { console.log('THREE non disponibile: sonda non attivabile'); await b.close(); srv.close(); process.exit(2); }

await page.evaluate(() => window.__CPM_FORCE_WALKOUT && window.__CPM_FORCE_WALKOUT());
const t0 = Date.now(); const snaps = []; let shotN = 0; let inWalk = 0; let visto = false;
while (Date.now() - t0 < walkMax) {
  await sleep(1500);
  const ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE());
  if (ph !== 'walkout') { if (visto) break; continue; }
  visto = true; inWalk++;
  const snap = await page.evaluate(() => {
    const S = window.__SONDA227; if (!S) return null;
    return { t: performance.now(), n: S.n, bodies: Object.values(S.bodies).map(b => ({ id: b.id.slice(0, 8), scaleY: b.scaleY, vel: b.lastVel, still: b.lastVel != null && b.lastVel < 0.5, acts: b.lastActs || [], stillS: +b.stillS.toFixed(2), runStillS: +b.runStillS.toFixed(2), scene: +b.scene.toFixed(2) })) };
  });
  if (snap) snaps.push(snap);
  // foto: ogni 5 scatti dentro il walkout (la fila è ferma per gran parte del tempo; la foto va letta insieme ai dati)
  if (snap && inWalk % 5 === 0 && shotN < 6) {
    shotN++; await page.screenshot({ path: path.join(outDir, '..', 'PO227-foto', `fila-ferma-${shotN}.png`) });
  }
}
const finale = await page.evaluate(() => {
  const S = window.__SONDA227; if (!S) return null;
  return Object.values(S.bodies).map(b => ({ id: b.id, scaleY: b.scaleY, scene: +b.scene.toFixed(2), stillS: +b.stillS.toFixed(2), runStillS: +b.runStillS.toFixed(2), clipStillS: Object.fromEntries(Object.entries(b.clipStillS).map(([k, v]) => [k, +v.toFixed(2)])), clips: Object.keys(b.clips) }));
});
const glb = await page.evaluate(() => ({ kids: window.__CPM_HYPER_MASCOTS || null, bimbi: window.__CPM_BIMBI23_H || null, body: window.__CPM_BODY909 ? window.__CPM_BODY909() : null }));
fs.writeFileSync(path.join(outDir, 'po227-dati-grezzi.json'), JSON.stringify({ pm, inWalk, snaps, finale, glb, pageErrors }, null, 1));
console.log(JSON.stringify({ pm, inWalk, snapshots: snaps.length, corpi: finale ? finale.length : 0, glb, pageErrors: pageErrors.slice(0, 5) }));
if (finale) {
  const sorted = [...finale].sort((a, b) => b.scene - a.scene);
  for (const f of sorted) console.log(JSON.stringify(f));
}
await ctx.close(); await b.close(); srv.close();
