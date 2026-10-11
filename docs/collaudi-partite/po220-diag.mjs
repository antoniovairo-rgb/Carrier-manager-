#!/usr/bin/env node
/* PO-220 — scene difensive in partite vere, GLB ACCESO (CH38, default del gioco), __CPM_PRESENT=1 (teatro attivo).
   Per ogni scena difensiva (__CPM_CAST219 tipo «difesa»): distanza eroe-portatore del 3D (__CPM_STATE, portatore = port del cast)
   a ogni fotogramma dell'hl; gesto GLB (__CPM_GESTURE().glb.gName e gw = peso della clip) e ampiezza gambe procedurali (lR/lL, rete di
   sicurezza); gesto DECISO (__CPM_RES218.defGesto, unito per indice hl). Output grezzo: una riga JSON per partita con tutti i fotogrammi.
   Uso: FROM=1 TO=6 OUT=file.jsonl node po220-difesa.mjs  (nome partita = base + ' ' + k, come PO-221) */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const FROM = +(process.env.FROM || 1), TO = +(process.env.TO || 6), OUT = process.env.OUT || 'po220.jsonl';
const srv = await startServer(); const b = await launchBrowser();
const url = `http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`;
for (let k = FROM; k <= TO; k++) {
  const t0 = Date.now(); const rec = { k, name: null, err: null, fine: null, scene: [] };
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  try {
    const sv = JSON.parse(JSON.stringify(save)); const pl = sv.player || sv; pl.name = pl.name + ' ' + k; rec.name = pl.name;
    /* GLB non spento: __CPM_GLB non viene impostato (default CH38). Teatro acceso: __CPM_PRESENT=1 */
    await page.addInitScript(([s]) => { window.__CPM_REC = true; window.__CPM_PRESENT = 1; localStorage.setItem('cpm-match-speed', '4'); localStorage.setItem('cpm-v3', JSON.stringify(s)); }, [sv]);
    await page.goto(url, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
    try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
    try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
    await page.evaluate(() => window.__CPM_CAREER.playMatch());
    await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
    await page.evaluate((s) => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 150 }), k);
    const tp = Date.now(); let ph = ''; let nCast = 0; let cur = null;
    const closeScene = () => { if (cur) { rec.scene.push(cur); cur = null; } };
    while (Date.now() - tp < 420000) {
      const r = await page.evaluate(() => {
        const ph = window.__CPM_PHASE && window.__CPM_PHASE();
        const cast = window.__CPM_CAST219 || []; const C = cast[cast.length - 1] || null;
        let d = null, gName = null, gw = null, lg = null;
        if (C && C.port) { try { const st = window.__CPM_STATE(); const p = st.players && st.players[C.port.i]; if (p && st.hero) d = Math.hypot(p.x - st.hero.x, p.y - st.hero.y); } catch (e) {} }
        try { const G = window.__CPM_GESTURE(); if (G) { gName = G.glb ? G.glb.gName : null; gw = G.glb ? G.glb.gw : null; lg = Math.max(Math.abs((G.lR && G.lR.x) || 0), Math.abs((G.lL && G.lL.x) || 0)); } } catch (e) {}
        return { ph, hT: (function(){try{const G=window.__CPM_GESTURE()||{};return G.hlType||null;}catch(e){return null;}})(), hV: (function(){try{const G=window.__CPM_GESTURE()||{};return G.hlVariant||null;}catch(e){return null;}})(), n: cast.length, C: C ? { hl: C.hl, min: C.min, tipo: C.tipo, port: C.port ? { i: C.port.i, nome: C.port.nome } : null, dif: C.dif ? C.dif.nome : null } : null, d, gName, gw, lg }; });
      ph = r.ph;
      /* nuova scena: il cast si allunga → si chiude la precedente e, se difensiva, se ne apre una */
      if (r.n !== nCast) { closeScene(); nCast = r.n; if (r.C && r.C.tipo === 'difesa') cur = { hl: r.C.hl, min: r.C.min, port: r.C.port, dif: r.C.dif, frames: [] }; }
      if (cur && /^hl_/.test(ph || '')) cur.frames.push({ t: Date.now() - tp, ph, hT: r.hT, hV: r.hV, d: r.d == null ? null : +r.d.toFixed(2), gName: r.gName, gw: r.gw == null ? null : +r.gw.toFixed(3), lg: r.lg == null ? null : +r.lg.toFixed(3) });
      if (cur && !/^hl_/.test(ph || '') && cur.frames.length) closeScene();
      if (ph === 'ended' || ph === 'ceremony') break;
      await sleep(120);
    }
    closeScene(); rec.fine = ph;
    const RES = await page.evaluate(() => (window.__CPM_RES218 || []).map(x => ({ hl: x.hl, label: x.label, key: x.key, ok: !!x.ok, defGesto: x.defGesto || null, outKind: x.outKind || null })));
    for (const s of rec.scene) { const R = RES.find(x => x.hl === s.hl); s.res = R || null; }
    rec.score = await page.evaluate(() => window.__CPM_SCORE ? window.__CPM_SCORE() : null);
  } catch (e) { rec.err = String(e).slice(0, 240); }
  rec.sec = Math.round((Date.now() - t0) / 1000);
  fs.appendFileSync(OUT, JSON.stringify(rec) + '\n');
  console.log(`k${k} ${rec.fine} difese=${rec.scene.length} ${rec.sec}s${rec.err ? ' ERR ' + rec.err : ''}`);
  await ctx.close();
}
await b.close(); srv.close();
