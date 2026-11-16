/* [giro 206 PO-373] Misura fotografica della scena per ZONE: prato, cielo, spalti. La camera la mette la sonda (posizioni fisse
   nel mondo), il fotogramma si disegna e si legge nello stesso task (readPixels), e ogni campione della griglia viene assegnato
   a una zona con un raggio vero nella scena (niente maschere a occhio): prato = primo colpo a quota ~0 dentro il rettangolo di
   gioco; cielo = nessun colpo o il fondale cilindrico; spalti = tutto il resto fuori dal rettangolo sopra 1 u di quota.
   Luminosita' = luminanza Rec.709 sui valori sRGB del fotogramma (0..1); saturazione = (max-min)/max. */
export const CAMERE = {
  tribuna: { p: [0, 13, 37], l: [0, 5, -20] },     /* dal bordo della tribuna (sotto la copertura, davanti alla folla): prato, tribuna opposta, cielo */
  curva: { p: [-58, 16, 10], l: [30, 6, -4] },      /* da dietro una porta: prato in lungo, curva opposta, riflettori */
  bordo: { p: [-20, 3.2, 30], l: [25, 9, -30] },    /* da bordo campo, bassa: giocatori, spalti alti e cielo */
};
export async function misuraZone(page, camNome, fotoPath) {
  const c = CAMERE[camNome];
  const r = await page.evaluate(({ c, foto }) => {
    const T = window.__CPM3D; if (!T || !T.renderer) return { errore: 'niente __CPM3D' };
    const { scene, camera, renderer } = T; const THREE_ = window.THREE;
    const p0 = camera.position.clone(), q0 = camera.quaternion.clone();
    camera.position.set(c.p[0], c.p[1], c.p[2]); camera.lookAt(c.l[0], c.l[1], c.l[2]); camera.updateMatrixWorld(true);
    renderer.render(scene, camera);
    const gl = renderer.getContext(); const W = gl.drawingBufferWidth, H = gl.drawingBufferHeight;
    const px = new Uint8Array(W * H * 4); gl.readPixels(0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, px);
    let url = null; if (foto) { try { url = renderer.domElement.toDataURL('image/png'); } catch (e) {} }
    /* bersagli del raggio: maglie normali, visibili; niente istanze (folla), sprite, corpi */
    const objs = []; scene.traverse(o => { if (!o.isMesh || o.isInstancedMesh || o.isSkinnedMesh || !o.visible) return; let a = o, vis = true; while (a) { if (a.visible === false) { vis = false; break; } a = a.parent; } if (!vis) return; if (o.material && o.material.transparent && (o.material.opacity || 0) < 0.5) return; objs.push(o); });
    const rc = new THREE_.Raycaster(); const v = new THREE_.Vector2();
    const GX = 64, GY = Math.max(36, Math.round(64 * H / W)); const Z = { prato: [], cielo: [], spalti: [] };
    for (let gy = 0; gy < GY; gy++) for (let gx = 0; gx < GX; gx++) {
      v.set((gx + 0.5) / GX * 2 - 1, (gy + 0.5) / GY * 2 - 1); rc.setFromCamera(v, camera);
      const hit = rc.intersectObjects(objs, false)[0]; let z = null;
      if (!hit) z = 'cielo';
      else { const g = hit.object.geometry, pr = g && g.parameters; const P = hit.point;
        if (pr && pr.radiusTop >= 150) z = 'cielo';
        else if (Math.abs(P.y) < 0.35 && Math.abs(P.x) < 50 && Math.abs(P.z) < 32) z = 'prato';
        else if (P.y > 1 && (Math.abs(P.x) > 54 || Math.abs(P.z) > 36)) z = 'spalti'; }
      if (!z) continue;
      const X = Math.min(W - 1, Math.floor((gx + 0.5) / GX * W)), Y = Math.min(H - 1, Math.floor((gy + 0.5) / GY * H)); const i = (Y * W + X) * 4;
      Z[z].push([px[i] / 255, px[i + 1] / 255, px[i + 2] / 255]);
    }
    camera.position.copy(p0); camera.quaternion.copy(q0); camera.updateMatrixWorld(true);
    const out = {}; for (const k in Z) { const A = Z[k]; let L = 0, S = 0; for (const [R, G, B] of A) { const mx = Math.max(R, G, B), mn = Math.min(R, G, B); L += 0.2126 * R + 0.7152 * G + 0.0722 * B; S += mx > 0 ? (mx - mn) / mx : 0; }
      out[k] = { n: A.length, lum: A.length ? +(L / A.length).toFixed(4) : null, sat: A.length ? +(S / A.length).toFixed(4) : null }; }
    /* riflettori: testate luminose e aloni presenti in scena (testimone del gioco, se c'e') */
    let fari = null; try { fari = window.__CPM_FARI206 || null; } catch (e) {}
    return { zone: out, fari, url, W, H };
  }, { c, foto: !!fotoPath });
  if (fotoPath && r.url) { const fs = await import('node:fs'); fs.writeFileSync(fotoPath, Buffer.from(r.url.split(',')[1], 'base64')); }
  delete r.url; return r;
}
/* apre la partita del salvataggio di prova e arriva al gioco fermo (cronometro), senza corpi 3D pesanti */
export async function apriPartita(b, port, SAVE, { tod, tpl, vw = 1280, vh = 720, init = {}, glb = false, installCdnRoutes, sleep }) {
  const ctx = await b.newContext({ viewport: { width: vw, height: vh }, serviceWorkers: 'block' }); await installCdnRoutes(ctx);
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  await page.addInitScript(o => { window.__CPM_GLB = o.glb; window.__CPM_TOD = o.tod; if (o.tpl) window.__CPM_STADIUM_TPL_FORCE = o.tpl; for (const k in o.init) window[k] = o.init[k]; localStorage.setItem('cpm-v3', JSON.stringify(o.s)); }, { s: SAVE, tod, tpl, init, glb });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1&cpmwx=partly`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 40000 }); await sleep(1500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => window.__CPM_CAREER.playMatch());
  const ph = () => page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null);
  for (let k = 0; k < 80; k++) { const p = await ph(); if (p === 'playing' && await page.evaluate(() => !!(window.__CPM3D && window.__CPM3D.renderer))) break;
    await page.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null); const x = bs.find(b => /Vedi le formazioni|Ingresso in campo|Diplomatico|Siamo pronti|Continua|Salta/i.test(b.textContent || '')); if (x) x.click(); }).catch(() => {});
    await sleep(700); }
  await sleep(2500); await page.evaluate(() => { window.__CPM_FROZEN = true; }); await sleep(300);
  return { ctx, page, errs, fase: await ph() };
}
