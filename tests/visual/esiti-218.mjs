#!/usr/bin/env node
/* [7.999.154 PO-218 «i pop di chiusura scena non rispecchiano sempre la verità»] GUARDIANO su partite vere dal salvataggio S12 (autoplay,
   semi fissi). Per ogni scena dell'eroe confronta la FAMIGLIA del riquadro d'esito con i FATTI che il motore racconta dopo la scena
   (testimone __CPM_RES218). Contraddizione: passaggio intercettato raccontato come tiro (murato/fuori/parata/palo); tiro fuori raccontato
   come parata, palo o muro (e viceversa); «fallo subito» senza fallo nel motore. MISURATO prima (7.999.153, 40 scene): 6 contraddizioni
   evidenti più tutti i tiri sbagliati registrati «fuori». VERDE: 0 contraddizioni su almeno 12 scene. ROSSO (__CPM_NO_ESITI218): almeno 1.
   Uso: node esiti-218.mjs */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const SEMI = [1234, 2021];
const srv = await startServer(); const b = await launchBrowser(); const esito = {};
const contraddizione = (r) => {
  const ev = r.ev || [], fam = r.fam;
  const t = ev.find(e => e.startsWith('tiro:')); const es = t ? t.split(':')[1].split('(')[0] : null;
  if (ev.some(e => e.startsWith('intercetto')) && /^(blocked|wide|saved|post)$/.test(fam || '')) return 'passaggio intercettato raccontato come ' + fam;
  if (fam === 'foul' && !ev.some(e => e.startsWith('fallo'))) return 'fallo subito senza fallo nel motore';
  if (es && fam) { const m = { fuori: 'wide', saved: 'saved', blocked: 'blocked', post: 'post' }[es]; if (m && /^(wide|saved|blocked|post)$/.test(fam) && m !== fam) return 'tiro ' + es + ' raccontato come ' + fam; }
  return null;
};
for (const rosso of [false, true]) { const tot = { scene: 0, contr: [] };
  for (const sd of SEMI) {
    const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
    const sv = JSON.parse(JSON.stringify(save)); const pl = sv.player || sv; pl.name = pl.name + ' ' + sd;
    await page.addInitScript(([s, r]) => { window.__CPM_GLB = false; window.__CPM_REC = true; if (r) window.__CPM_NO_ESITI218 = 1; localStorage.setItem('cpm-match-speed', '4'); localStorage.setItem('cpm-v3', JSON.stringify(s)); }, [sv, rosso]);
    await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
    try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
    try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
    await page.evaluate(() => window.__CPM_CAREER.playMatch());
    await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
    await page.evaluate((s) => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 150 }), sd);
    const t0 = Date.now(); let ph = '';
    while (Date.now() - t0 < 420000) { ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()); if (ph === 'ended' || ph === 'ceremony') break; await sleep(1000); }
    const R = await page.evaluate(() => window.__CPM_RES218 || []);
    for (const r of R) { tot.scene++; const c = contraddizione(r); if (c) tot.contr.push(sd + ' «' + r.label + '» ' + c + ' — riquadro «' + (r.ovl || '') + '» · motore ' + (r.ev || []).join(',')); }
    console.log((rosso ? 'rosso ' : 'verde ') + 'seme ' + sd + ' fine ' + ph + ' scene ' + R.length); await ctx.close();
  }
  esito[rosso ? 'rosso' : 'verde'] = tot; console.log((rosso ? 'ROSSO' : 'VERDE') + ' scene ' + tot.scene + ' contraddizioni ' + tot.contr.length); tot.contr.slice(0, 8).forEach(x => console.log('  · ' + x));
}
await b.close(); srv.close();
const V = esito.verde, R = esito.rosso, g = [];
if (!(V.scene >= 12 && V.contr.length === 0)) g.push('verde: ' + V.contr.length + ' contraddizioni su ' + V.scene + ' scene');
if (!(R.contr.length >= 1)) g.push('rosso: nessuna contraddizione anche spento (' + R.scene + ' scene)');
if (g.length) { console.log('❌ esiti-218'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ esiti-218 verde (e il rosso si vede)');
