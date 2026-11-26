#!/usr/bin/env node
/* SONDA giro 381 (PO-660, residuo PO-227) — non giudica: stampa. Fila dell'ingresso in campo: per OGNI corpo animato della scena
   (ogni AnimationMixer che si aggiorna, quindi giocatori, bambini, arbitri e chiunque altro) a ogni fotogramma del walkout:
   velocita' in pianta della radice del mixer nel mondo, peso delle clip di locomozione (nomi jog/run/walk/strafe), visibilita'
   (radice e antenati visibili + punto proiettato dentro lo schermo con la camera dell'ultimo disegno).
   «Corre da fermo» = locomozione con peso >= 0,3 e velocita' smussata < 0,3 u/s.  Uso: node misura-381-fila.mjs  CPM_FLAG=... CPM_SEC=90 */
import fs from 'fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-194-primavera-w38.json', import.meta.url)));
const FLAG = process.env.CPM_FLAG || '', SEC = +(process.env.CPM_SEC || 90), VISTA = process.env.CPM_VISTA || 'tel';
export async function fila381(b, port, flags) {
  const ctx = await b.newContext({ viewport: VISTA === 'pc' ? { width: 1062, height: 549 } : { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const errori = []; page.on('pageerror', e => errori.push(String(e.message).slice(0, 160)));
  await page.addInitScript(([s, fl]) => { window.__CPM_GLB = true; window.__CPM_WALKTEST74 = 1; (fl || '').split(',').filter(Boolean).forEach(f => { window[f] = 1; }); localStorage.setItem('cpm-v3', JSON.stringify(s)); }, [save, flags]);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }).catch(() => {}); await sleep(2500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => window.__CPM_CAREER.playMatch());
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 40000 }).catch(() => {});
  await page.waitForFunction(() => window.__CPM_GLB_READY, null, { timeout: 60000 }).catch(() => {});
  /* registratore: si appoggia ai prototipi di three (sola lettura, solo sonda) */
  await page.evaluate(() => {
    const T = window.THREE; const R = window.__CPM_F381 = { fr: 0, c: new Map(), cam: null, attivo: false };
    /* il renderer ha render come proprieta' propria: la camera dello schermo si prende da updateMatrixWorld (render la chiama a ogni disegno) — la prospettica aggiornata piu' spesso */ R.camC = new Map(); const um = T.Camera.prototype.updateMatrixWorld; T.Camera.prototype.updateMatrixWorld = function () { const o = um.apply(this, arguments); if (this.isPerspectiveCamera && R.attivo) { const k = (R.camC.get(this) || 0) + 1; R.camC.set(this, k); if (!R.cam || k > (R.camC.get(R.cam) || 0)) R.cam = this; R.camN = (R.camN || 0) + 1; } return o; };
    const up = T.AnimationMixer.prototype.update; const v = new T.Vector3(), w = new T.Vector3();
    T.AnimationMixer.prototype.update = function (dt) { const out = up.apply(this, arguments); try { if (!R.attivo) return out;
      const root = this.getRoot(); if (!root || !root.isObject3D) return out; root.updateWorldMatrix(true, false); v.setFromMatrixPosition(root.matrixWorld);
      let vis = true; for (let o = root; o; o = o.parent) if (!o.visible) { vis = false; break; }
      let schermo = false; if (vis && R.cam) { w.copy(v); w.y += 0.9; w.project(R.cam); schermo = w.z < 1 && Math.abs(w.x) <= 1 && Math.abs(w.y) <= 1; }
      const now = performance.now(); let c = R.c.get(this); if (!c) { c = { id: R.c.size, nome: (root.name || '') + '|' + ((root.parent && root.parent.name) || ''), n: 0, corsaFermo: 0, fermi: 0, vis: 0, schermo: 0, csVis: 0, csSchermo: 0, clips: {}, p: null, t: now, sp: 0, maxL: 0, es: [] }; R.c.set(this, c); }
      const dts = (now - c.t) / 1000; c.t = now; const vv = (c.p && dts > 0) ? Math.hypot(v.x - c.p[0], v.z - c.p[1]) / dts : 0; c.p = [v.x, v.z]; c.sp = c.sp + (vv - c.sp) * Math.min(1, dts * 6);
      let loco = 0, nomeL = ''; for (const a of this._actions) { if (!a.isRunning()) continue; const ew = a.getEffectiveWeight(); if (ew < 0.05) continue; const nm = a.getClip().name; c.clips[nm] = (c.clips[nm] || 0) + 1; if (/jog|run|walk|strafe|sprint/i.test(nm) && ew > loco) { loco = ew; nomeL = nm; } }
      c.n++; if (vis) c.vis++; if (schermo) c.schermo++; c.maxL = Math.max(c.maxL, loco);
      const cf = c.sp < 0.3 && loco >= 0.3; if (cf) { c.st = (c.st || 0) + dts; if (c.st > (c.maxSt || 0)) { c.maxSt = c.st; c.maxStSch = schermo; } } else c.st = 0;
      if (c.sp < 0.3) { c.fermi++; if (loco >= 0.3) { c.corsaFermo++; if (vis) c.csVis++; if (schermo) c.csSchermo++; if (c.es.length < 3) c.es.push([+v.x.toFixed(1), +v.z.toFixed(1), nomeL, +loco.toFixed(2)]); } }
    } catch (e) { R.err = String(e); } return out; };
  });
  await page.evaluate(() => window.__CPM_FORCE_WALKOUT && window.__CPM_FORCE_WALKOUT());
  let visto = false; const t0 = Date.now();
  while (Date.now() - t0 < SEC * 1000) { await sleep(400); const ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()); await page.evaluate((on) => { if (window.__CPM_F381) window.__CPM_F381.attivo = on; }, ph === 'walkout');
    if (ph !== 'walkout') { if (visto) break; continue; } visto = true; }
  const K = await page.evaluate(() => { const R = window.__CPM_F381; return { err: R.err || null, camN: R.camN || 0, corpi: [...R.c.values()].map(c => ({ id: c.id, nome: c.nome, n: c.n, vis: c.vis, schermo: c.schermo, fermi: c.fermi, corsaFermo: c.corsaFermo, csVis: c.csVis, csSchermo: c.csSchermo, maxL: +c.maxL.toFixed(2), maxSt: +(c.maxSt || 0).toFixed(2), maxStSch: !!c.maxStSch, es: c.es, clips: Object.keys(c.clips).slice(0, 8).join(',') })) }; });
  await ctx.close(); return { visto, errori, ...K };
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
  const K = await fila381(b, port, FLAG);
  console.log(`disegni a schermo ${K.camN} · walkout visto ${K.visto} · corpi animati ${K.corpi.length} · errori ${K.errori.length} ${K.err || ''}`);
  for (const c of K.corpi) if (c.n > 0) console.log(`#${c.id} ${c.nome.padEnd(28)} n ${c.n} vis ${c.vis} schermo ${c.schermo} fermi ${c.fermi} CORSA-DA-FERMO ${c.corsaFermo} (vis ${c.csVis} schermo ${c.csSchermo}) maxLoco ${c.maxL} striscia ${c.maxSt}s${c.maxStSch ? ' A SCHERMO' : ''} ${JSON.stringify(c.es)} [${c.clips}]`);
  await Promise.race([b.close(), new Promise(r => setTimeout(r, 5000))]); srv.close(); setTimeout(() => process.exit(0), 200);
}
