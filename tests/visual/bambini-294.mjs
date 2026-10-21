#!/usr/bin/env node
/* [giro 88 guardiano — PO-294 «I bambini arrivati a destinazione devono stare fermi» (telefono 7.999.176)]
   I bambini (mascotte) che entrano per mano ai giocatori e si schierano a centrocampo, una volta arrivati, devono stare fermi come i
   giocatori arrivati (PO-197/206): posizione bloccata, nessuna rotazione, nessuna velocita', clip «idle» nella finestra calma 0-1 s
   (come fila-206: escursione gambe al massimo 11 gradi). Causa misurata: il bambino seguiva la mano del giocatore (posizione = giocatore
   + 0,72 di lato, ruotata con il giocatore, che arrivato gira in coda verso la camera: il bambino gli orbita intorno) e la clip idle
   girava libera. Percorso vero, GLB accesi, 412x915, salvataggio e ingresso forzato di fila-206/227. Il campionatore e' in pagina, a
   ogni fotogramma (lista __CPM_HYPER_MASCOT_LIST), e conta solo dopo l'assestamento: 2 s di tempo di scena (somma dei dt di scena,
   tetto 0,05 s a fotogramma) dall'arrivo del giocatore al suo posto.
   SOGLIE (motivate dalla misura dei giocatori fermi: posizione bloccata esatta, escursione gambe <= 11 gradi, ≥95% idle calma):
   spostamento massimo <= 0,02 u (due centimetri: un giocatore fermo ne fa 0), velocita' massima <= 0,05 u/s, rotazione <= 0,5 gradi,
   clip calma (idle.time <= 1,05 s, corsa/camminata <= 0,3) in almeno il 95% delle letture, escursione gambe <= 12 gradi.
   «Salta ingresso»: il braccio di prova (peso di camminata dopo il salto) e' stato tolto: verde e rosso davano entrambi 1,0 (i bambini
   camminavano ancora al momento del salto) e non distingueva nulla; il salto e' coperto da ingresso-285/walkout-fermi-197.
   VERDE: soglie rispettate con >= 20 bambini e >= 200 letture. ROSSO (__CPM_NO_BIMBI294): spostamento > 0,2 u oppure clip calma <= 70%
   il guardiano deve accorgersene. Uso: node bambini-294.mjs */
import fs from 'fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-194-primavera-w38.json', import.meta.url)));
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const ASSESTA = 2.0, DEG = 180 / Math.PI;
async function braccio(rosso, salta) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript(([s, r]) => { window.__CPM_GLB = true; window.__CPM_WALKTEST74 = 1; if (r) window.__CPM_NO_BIMBI294 = 1; localStorage.setItem('cpm-v3', JSON.stringify(s)); }, [save, rosso]);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }).catch(() => {}); await sleep(2500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  const pm = await page.evaluate(() => window.__CPM_CAREER.playMatch());
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 40000 }).catch(() => {});
  await page.waitForFunction(() => window.__CPM_GLB_READY, null, { timeout: 60000 }).catch(() => {});
  await page.evaluate(() => {
    window.__B294 = { s: {}, skip: [], skipT: null }; let last = performance.now(), scena = 0; const bones = {};
    const ang = (q) => 2 * Math.acos(Math.min(1, Math.abs(q.w)));
    const tick = () => { const now = performance.now(); scena += Math.min((now - last) / 1000, 0.05); last = now;
      const L = window.__CPM_HYPER_MASCOT_LIST || [];
      if (window.__CPM_PHASE && window.__CPM_PHASE() === 'walkout') L.forEach((m, i) => { const a = m.glb911, p = m.p; if (!a || !a.root || !p || !a.root.visible) return;
        if (window.__B294.skipT != null) window.__B294.skip.push({ i, w: Math.max(a.walk245 ? a.walk245.weight : 0, a.run ? a.run.weight : 0) });
        const S = window.__B294.s[i] = window.__B294.s[i] || { ta: null, r: [] };
        if (p._wx != null && Math.hypot(p.position.x - p._wx, p.position.z - p._wz) < 0.001) { if (S.ta == null) S.ta = scena; } else { S.ta = null; S.r = []; return; }
        if (scena - S.ta < 2.0) return;
        if (bones[i] === undefined) { let f = null; a.root.traverse(o => { if (!f && o.isBone && /(up.?leg|thigh)/i.test(o.name)) f = o; }); bones[i] = f || 0; }
        S.r.push({ t: scena, x: a.root.position.x, z: a.root.position.z, ry: a.root.rotation.y, it: a.idle ? a.idle.time : null, w: Math.max(a.walk245 ? a.walk245.weight : 0, a.run ? a.run.weight : 0), leg: bones[i] ? ang(bones[i].quaternion) : null }); });
      window.__B294.scena = scena; requestAnimationFrame(tick); }; requestAnimationFrame(tick); });
  await page.evaluate(() => window.__CPM_FORCE_WALKOUT && window.__CPM_FORCE_WALKOUT());
  let visto = false, saltato = false; const t0 = Date.now();
  while (Date.now() - t0 < 300000) { await sleep(500);
    const r = await page.evaluate(() => ({ ph: window.__CPM_PHASE && window.__CPM_PHASE(), n: Object.values((window.__B294 || {}).s || {}).filter(S => S.r.length > 3).length }));
    if (r.ph !== 'walkout') { if (visto) break; continue; } visto = true;
    if (salta && !saltato && r.n >= 1) { saltato = true; await page.evaluate(() => { window.__B294.skipT = window.__B294.scena; window.__CPM_SKIPWALK277 = true; }); } }
  const D = await page.evaluate(() => window.__B294);
  await ctx.close();
  const out = { pm, visto, bambini: 0, letture: 0, spostMax: 0, vMax: 0, rotMax: 0, legMax: 0, calmi: 0, pesoSalto: 0 };
  for (const S of Object.values(D.s)) { const r = S.r; if (r.length < 3) continue; out.bambini++; out.letture += r.length;
    const rng = f => { const v = r.map(f); return Math.max(...v) - Math.min(...v); };
    out.spostMax = Math.max(out.spostMax, rng(x => x.x), rng(x => x.z)); out.rotMax = Math.max(out.rotMax, rng(x => x.ry) * DEG);
    if (r.every(x => x.leg != null)) out.legMax = Math.max(out.legMax, rng(x => x.leg) * DEG);
    for (let k = 1; k < r.length; k++) { const dt = r[k].t - r[k - 1].t; if (dt > 0.001) out.vMax = Math.max(out.vMax, Math.hypot(r[k].x - r[k - 1].x, r[k].z - r[k - 1].z) / dt); }
    for (const x of r) if (x.it != null && x.it <= 1.05 && x.w <= 0.3) out.calmi++; }
  out.quota = out.letture ? +(out.calmi / out.letture).toFixed(3) : null;
  out.pesoSalto = D.skip.length ? Math.max(...D.skip.map(x => x.w)) : null; out.lettureSalto = D.skip.length;
  for (const k of ['spostMax', 'vMax', 'rotMax', 'legMax']) out[k] = +out[k].toFixed(3);
  return out;
}
const v = await braccio(false, false), r = await braccio(true, false);
console.log('VERDE:', JSON.stringify(v)); console.log('ROSSO (__CPM_NO_BIMBI294):', JSON.stringify(r));
const okV = v.bambini >= 20 && v.letture >= 200 && v.spostMax <= 0.02 && v.vMax <= 0.05 && v.rotMax <= 0.5 && v.quota >= 0.95 && v.legMax <= 12;
const okR = r.letture >= 100 && (r.spostMax > 0.2 || r.quota <= 0.70);
await b.close(); srv.close();
console.log(okV && okR ? '✅ bambini-294 verde (e il rosso si vede)' : `❌ bambini-294 ROSSO (verde ${okV}, rosso ${okR})`); process.exit(okV && okR ? 0 : 1);
