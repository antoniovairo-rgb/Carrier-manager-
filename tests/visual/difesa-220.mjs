#!/usr/bin/env node
/* [7.999.155 PO-220 «l'eroe nelle scene difensive sembra quasi disinteressato, lì per caso a fare una passeggiata»] GUARDIANO su partite
   vere dal salvataggio S12 (autoplay, semi fissi). Nella scena difensiva generata dal motore campiona, durante la risoluzione, la distanza
   eroe-portatore nel 3D (__CPM_STATE, portatore del cast __CPM_CAST219) e l'ampiezza del gesto delle gambe dell'eroe (__CPM_GESTURE),
   e registra il gesto deciso (__CPM_RES218.defGesto). MISURATO prima: 3 azioni su 5 della scena difensiva finivano nel gesto «press»
   (sola corsa). VERDE: nessuna scena difensiva risolta col gesto «press» fra quelle generate, e l'eroe arriva entro 4 u dal portatore.
   ROSSO (__CPM_NO_GESTO220): almeno un «press», oppure nessuna differenza misurabile (dichiarato). Uso: node difesa-220.mjs */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const SEMI = (process.env.SEMI || '7,99,1234,2021').split(',').map(Number);
const srv = await startServer(); const b = await launchBrowser(); const esito = {};
for (const rosso of [false, true]) { const tot = { scene: 0, press: 0, gesti: {}, dmin: [], gambe: [] };
  for (const sd of SEMI) {
    const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
    const sv = JSON.parse(JSON.stringify(save)); const pl = sv.player || sv; pl.name = pl.name + ' ' + sd;
    await page.addInitScript(([s, r]) => { window.__CPM_GLB = false; window.__CPM_REC = true; window.__CPM_PRESENT = 1; if (r) window.__CPM_NO_GESTO220 = 1; localStorage.setItem('cpm-match-speed', '4'); localStorage.setItem('cpm-v3', JSON.stringify(s)); }, [sv, rosso]);
    await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
    try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
    try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
    await page.evaluate(() => window.__CPM_CAREER.playMatch());
    await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
    await page.evaluate((s) => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 150 }), sd);
    const t0 = Date.now(); let ph = '', inDif = false, dmin = 99, gmax = 0;
    while (Date.now() - t0 < 420000) {
      const r = await page.evaluate(() => { const ph = window.__CPM_PHASE && window.__CPM_PHASE(); const C = (window.__CPM_CAST219 || []).slice(-1)[0] || null; let d = null, g = null;
        if (C && C.tipo === 'difesa' && /^hl_/.test(ph || '')) { try { const st = window.__CPM_STATE(); const p = C.port && st.players[C.port.i]; if (p) d = Math.hypot(p.x - st.hero.x, p.y - st.hero.y); } catch (e) {}
          try { const G = window.__CPM_GESTURE(); g = Math.max(Math.abs((G.lR && G.lR.x) || 0), Math.abs((G.lL && G.lL.x) || 0)); } catch (e) {} }
        return { ph, dif: !!(C && C.tipo === 'difesa'), d, g }; });
      ph = r.ph;
      if (r.dif && /^hl_/.test(ph || '')) { inDif = true; if (r.d != null) dmin = Math.min(dmin, r.d); if (r.g != null && ph === 'hl_result') gmax = Math.max(gmax, r.g); }
      else if (inDif && !/^hl_/.test(ph || '')) { tot.dmin.push(+dmin.toFixed(1)); tot.gambe.push(+gmax.toFixed(2)); inDif = false; dmin = 99; gmax = 0; }
      if (ph === 'ended' || ph === 'ceremony') break; await sleep(150); }
    const R = await page.evaluate(() => (window.__CPM_RES218 || []).filter(x => x.tipo === 'tackle').map(x => x.defGesto || '?'));
    for (const g of R) { tot.scene++; tot.gesti[g] = (tot.gesti[g] || 0) + 1; if (g === 'press') tot.press++; }
    console.log((rosso ? 'rosso' : 'verde') + ' seme ' + sd + ' fine ' + ph + ' gesti ' + JSON.stringify(R)); await ctx.close();
  }
  esito[rosso ? 'rosso' : 'verde'] = tot; console.log((rosso ? 'ROSSO' : 'VERDE') + ' ' + JSON.stringify(tot));
}
await b.close(); srv.close();
const V = esito.verde, R = esito.rosso, g = [];
if (!(V.scene >= 2 && V.press === 0)) g.push('verde: ' + V.press + ' scene difensive col gesto «press» su ' + V.scene);
if (V.dmin.length && Math.min(...V.dmin) > 4) g.push('verde: l\'eroe non arriva mai entro 4 u dal portatore (' + V.dmin.join(', ') + ')');
if (!(R.press >= 1)) console.log('⚠️ rosso: nessun «press» nel campione (' + JSON.stringify(R.gesti) + ') — la prova del rosso dipende dalle azioni sorteggiate');
if (g.length) { console.log('❌ difesa-220'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ difesa-220 verde (gesti ' + JSON.stringify(V.gesti) + ', distanza minima ' + V.dmin.join('/') + ' u; rosso ' + JSON.stringify(R.gesti) + ')');
