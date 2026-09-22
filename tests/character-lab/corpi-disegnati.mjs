/* [23/09] IL SECONDO METRO, RIFATTO: COSA VIENE DISEGNATO DAVVERO.
   `boundsHeight` del LOD_AUDIT usa `Box3.setFromObject`, che in three r128 (1) attraversa anche i figli
   INVISIBILI e (2) sulle SkinnedMesh usa la geometria in bind-pose, non lo scheletro animato. Quindi non
   dice se un corpo si vede. Questa sonda non tocca il gioco: aggancia `Object3D.prototype.onBeforeRender`,
   che il renderer chiama per OGNI oggetto disegnato nel passaggio principale, e per un fotogramma conta
   le SkinnedMesh disegnate, i loro triangoli e a quale avatar (radice sotto la scena) appartengono.
   Con CPM_BASE=1 misura senza parametro (prova appaiata). Scrive corpi-disegnati[-base].json. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from '../visual/lib/harness.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const MODO = process.env.CPM_BASE === '1' ? null : 'cgtrader-highlight-optimized';
const SIT = Number(process.env.CPM_SIT || 33);
const ROSSO = process.env.CPM_ROSSO === '1'; /* rosso appaiato: __CPM_NO_LODPICK riporta il sorteggio dei LOD */

const server = await startServer();
const browser = await launchBrowser();
const context = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1 });
const page = await context.newPage();
const errori = [];
page.on('pageerror', e => errori.push(String(e.message).slice(0, 160)));

console.log('=== CORPI DISEGNATI (metro: onBeforeRender) ===');
console.log(`  modo: ${MODO || 'NESSUN parametro (partita normale)'} · situazione ${SIT}${ROSSO ? ' · ROSSO __CPM_NO_LODPICK' : ''}\n`);

try {
  if (ROSSO) await page.addInitScript(() => { window.__CPM_NO_LODPICK = true; });
  await installCdnRoutes(page);
  await openMatch(page, server.address().port, {
    skipLoadAll: true,
    name: 'Corpi Disegnati',
    query: MODO ? { hyperCharacter: MODO, cpmForce: 'keeper' } : { cpmForce: 'keeper' },
  });
  await page.waitForFunction(() => ['ready-lineup', 'off'].includes(window.__CPM_HYPER_CASUAL_STATUS), null, { timeout: 180000 }).catch(() => {});
  const stato = await page.evaluate(() => window.__CPM_HYPER_CASUAL_STATUS ?? '(assente)');
  await page.evaluate(i => window.__CPM_FORCE_SIT && window.__CPM_FORCE_SIT(i, true), SIT);
  await sleep(1200);

  const misura = await page.evaluate(() => new Promise(res => {
    const O = THREE.Object3D.prototype, orig = O.onBeforeRender;
    const disegnati = new Set(); let scena = null;
    O.onBeforeRender = function (r, scene) { disegnati.add(this); scena = scene; };
    const tri = o => { const g = o.geometry; if (!g) return 0; return Math.round((g.index ? g.index.count : (g.attributes.position ? g.attributes.position.count : 0)) / 3); };
    const radice = o => { let n = o; while (n.parent && n.parent !== scena) n = n.parent; return n; };
    const visibileDavvero = o => { for (let n = o; n; n = n.parent) if (!n.visible) return false; return true; };
    requestAnimationFrame(() => requestAnimationFrame(() => {
      O.onBeforeRender = orig;
      const perRadice = new Map(); let triTot = 0, triSkin = 0, skin = 0;
      disegnati.forEach(o => {
        const t = tri(o); triTot += t;
        if (!o.isSkinnedMesh) return;
        skin++; triSkin += t;
        const r = radice(o); const e = perRadice.get(r) || { mesh: 0, tri: 0, bones: 0, altezza: null };
        e.mesh++; e.tri += t; perRadice.set(r, e);
      });
      /* altezza vera del corpo disegnato: dalle ossa animate della sua scheletratura */
      perRadice.forEach((e, r) => {
        let lo = Infinity, hi = -Infinity, n = 0; const p = new THREE.Vector3();
        r.traverse(x => { if (x.isBone && visibileDavvero(x)) { x.getWorldPosition(p); lo = Math.min(lo, p.y); hi = Math.max(hi, p.y); n++; } });
        e.bones = n; e.altezza = n > 1 ? +(hi - lo).toFixed(3) : null;
      });
      /* quante SkinnedMesh esistono in scena, e quante sono nascoste dalla catena visible */
      let skinInScena = 0, skinNascoste = 0;
      if (scena) scena.traverse(o => { if (o.isSkinnedMesh) { skinInScena++; if (!visibileDavvero(o)) skinNascoste++; } });
      const corpi = [...perRadice.values()].sort((a, b) => b.tri - a.tri);
      res({
        oggettiDisegnati: disegnati.size, triangoliDisegnati: triTot, skinDisegnate: skin, triangoliSkin: triSkin,
        corpiDisegnati: corpi.length, corpi, skinInScena, skinNascoste,
        rendererTri: window.__CPM_TRI907 ? window.__CPM_TRI907() : null,
        roster: window.__CPM_CGTRADER_CINEMA_ROSTER || null,
        audit: (() => { try { const a = window.__CPM_CGTRADER_LOD_AUDIT && window.__CPM_CGTRADER_LOD_AUDIT(); return a ? { active: a.active, heroLod: a.heroLod, variants: a.variants, stats: a.stats } : null; } catch (e) { return 'errore:' + e.message; } })(),
        situazione: (window.__CPM_CURSIT?.() || {}).text ?? null,
      });
    }));
  }));

  console.log(`  stato pacchetto        : ${stato} · situazione: ${misura.situazione}`);
  console.log(`  oggetti disegnati      : ${misura.oggettiDisegnati} · triangoli (main pass) ${misura.triangoliDisegnati} · renderer.info ${misura.rendererTri}`);
  console.log(`  SkinnedMesh disegnate  : ${misura.skinDisegnate} (${misura.triangoliSkin} tri) · in scena ${misura.skinInScena}, nascoste ${misura.skinNascoste}`);
  console.log(`  CORPI DISEGNATI        : ${misura.corpiDisegnati}`);
  misura.corpi.forEach((c, i) => console.log(`    #${i} mesh ${c.mesh} · tri ${c.tri} · ossa visibili ${c.bones} · altezza ossa ${c.altezza}`));
  console.log(`  roster: ${JSON.stringify(misura.roster)}`);
  console.log(`  audit : ${JSON.stringify(misura.audit)}`);
  if (errori.length) console.log(`  errori di pagina: ${errori.slice(0, 3).join(' · ')}`);
  const f = path.join(here, (MODO ? 'corpi-disegnati' : 'corpi-disegnati-base') + (ROSSO ? '-rosso' : '') + '.json');
  fs.writeFileSync(f, JSON.stringify({ modo: MODO, rosso: ROSSO, sit: SIT, stato, ...misura, errori }, null, 1));
  console.log(`\n→ ${f}`);
} finally {
  await page.close().catch(() => {});
  await browser.close().catch(() => {});
  server.close();
}
