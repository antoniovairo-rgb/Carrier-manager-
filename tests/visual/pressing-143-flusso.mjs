#!/usr/bin/env node
/* [giro 17 PO-123/PO-143 «difensori che pressano»] SONDA DI FLUSSO (il guardiano e' pressing-143.mjs): la pressione che la scena DICHIARA contro quella che si VEDE.
   Il motore consegna con l'occasione `press` = pressioneSu(eroe) (src/14 r.258), cioe' la DISTANZA dell'avversario piu' vicino; i
   generatori delle scene (src/04) la leggevano come INTENSITA' (press<1 = «1 contro 1 senza pressione», tipo «spalle» con press>=3 =
   «il marcatore ti e' addosso»). Partite S12 su pagina nuova, teatro acceso; per ogni scena del motore: distanza dichiarata, contesto
   della scena (tactic.pressure) e distanza VERA del difensore piu' vicino all'eroe in hl_choose (mesh, metri).
   VERDE: nessuna scena dichiarata «high» con il difensore oltre 6 m e nessuna «low» con il difensore entro 2 m (CPM_TOL143 scene
   tollerate, default 0); almeno 6 scene giudicate. ROSSO (__CPM_NO_PRESS143 + __CPM_NO_MARCA143: la lettura di prima e nessun marcatore sul portatore): almeno una scena incoerente. */
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const DIR = path.dirname(fileURLToPath(import.meta.url));
const { startServer, launchBrowser, installCdnRoutes, sleep } = await import(path.join(DIR, 'lib/harness.mjs'));
const save = JSON.parse(fs.readFileSync(path.join(DIR, 'fixtures/save-190-s12-ovr93.json')));
const semi = (process.env.CPM_SEMI143 || '41,67,11,23').split(',').map(Number), ROSSO = process.env.CPM_ROSSO143 === '1';
const srv = await startServer(); const b = await launchBrowser();
async function una(sd) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript(s => { window.__CPM_GLB = false; window.__CPM_REC = true; window.__CPM_PRESENT = 1; if (s.r) { window.__CPM_NO_PRESS143 = 1; window.__CPM_NO_MARCA143 = 1; } localStorage.setItem('cpm-match-speed', '4'); const c = { ...s }; delete c.r; localStorage.setItem('cpm-v3', JSON.stringify(c)); },
    { ...save, player: { ...save.player, name: save.player.name + ' ' + String.fromCharCode(65 + sd % 26) }, r: ROSSO });
  await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => window.__CPM_CAREER.playMatch());
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
  await page.evaluate(o => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: o.sd, policy: 'seeded', tickMs: o.tk }), { sd, tk: +(process.env.CPM_TICK143 || 2500) });/* il tempo di LETTURA: con 700 ms la sonda fotografava il marcatore in corsa */
  const t0 = Date.now(); const camp = {}; let ph = '';
  while (Date.now() - t0 < +(process.env.CPM_MS143 || 900000)) {
    const f = await page.evaluate(() => { const ph = window.__CPM_PHASE && window.__CPM_PHASE(); if (ph !== 'hl_choose') return { ph };
      try { const s = window.__CPM_STATE(); const P6 = window.__CPM_P6 || []; const H = s.hero; let d = 99; for (const p of s.players) if (p.team === 'away' && !p.gk) d = Math.min(d, Math.hypot((p.x - H.x) * 1.05, (p.y - H.y) * 0.68)); return { ph, n: P6.length, d }; } catch (e) { return { ph }; } });
    ph = f.ph; if (ph === 'ended' || ph === 'ceremony') break;
    if (f.n && f.d != null) (camp[f.n - 1] = camp[f.n - 1] || []).push(f.d);
    await sleep(150);
  }
  const P6 = await page.evaluate(() => (window.__CPM_P6 || []).map(x => ({ min: x.min, tipo: x.tipo, press: x.press, ctx: x.pr, text: x.text })));
  await ctx.close();
  return P6.map((x, i) => { const a = (camp[i] || []).sort((p, q) => p - q); return { ...x, dVero: a.length ? +a[a.length >> 1].toFixed(1) : null, n: a.length }; });
}
const tutte = [];
for (let i = 0; i < semi.length; i += 2) { const o = await Promise.all(semi.slice(i, i + 2).map(una)); for (const r of o) tutte.push(...r); }
await b.close(); srv.close();
for (const x of tutte) console.log(`  ${x.min}' ${x.tipo} press=${x.press} dich=${x.ctx || '?'} difensore vero=${x.dVero}m (${x.n}) · ${String(x.text).slice(0, 50)}`);
const giud = tutte.filter(x => x.dVero != null && x.ctx && !/^(rigore|punizione)$/.test(x.tipo));
const inc = giud.filter(x => (x.ctx === 'high' && x.dVero > 6) || ((x.ctx === 'low' || x.ctx === 'none') && x.dVero < 2));
console.log((ROSSO ? 'ROSSO' : 'VERDE') + ` scene giudicate ${giud.length} · incoerenti ${inc.length}` + (inc.length ? ': ' + inc.map(x => x.tipo + ' ' + x.ctx + ' ' + x.dVero + 'm').join(', ') : ''));
if (process.env.CPM_SOLO143 === '1') process.exit(0);
if (ROSSO) { console.log(inc.length ? '✅ pressing-143 rosso visibile' : '❌ pressing-143: il rosso non si vede'); process.exit(inc.length ? 0 : 1); }
if (giud.length < 6) { console.log('❌ pressing-143 cieco: ' + giud.length + ' scene'); process.exit(1); }
const ok = inc.length <= +(process.env.CPM_TOL143 || 0); console.log(ok ? '✅ pressing-143 verde' : '❌ pressing-143'); process.exit(ok ? 0 : 1);
