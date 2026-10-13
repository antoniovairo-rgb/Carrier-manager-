#!/usr/bin/env node
/* [giro 11 PO-218 «esiti bugiardi», caso CROSS] GUARDIANO in tre parti, verde col gioco e rosso con __CPM_NO_CROSS218.
   1) RIQUADRO (enumerazione, nessuna partita): per ogni azione-cross del catalogo (etichetta da cross, non da tiro, premio assist) e
      ogni tipo d'errore che il motore puo' dare a un cross (parata/presa, fuori, murato, angolo, intercetto) il riquadro non deve usare
      il lessico del TIRO. MISURATO prima: 8 azioni (5 cross + 3 cross da punizione) con fail «miss» uscivano con «Tiro fuori di poco»,
      «Grande parata del portiere», «Conclusione murata».
   2) MOTORE (motore vero creato in pagina, cast con difensore e portiere): il fatto registrato dopo il cross sbagliato deve dire la
      stessa cosa del riquadro. MISURATO prima: presa del portiere registrata «intercetto» del difensore, cross fuori registrato
      «spazzata» del difensore, cross da punizione sbagliato registrato come TIRO dell'eroe.
   3) 3D (scena forzata gi16 in una partita vera, esito «out»): il pallone deve uscire oltre la linea di fondo. MISURATO prima: si
      assestava in area a x 38,5 (linea a 48,6).
   VERDE: 0 contraddizioni in 1 e 2 (su almeno 30 azioni) e x finale >= 46 in 3. ROSSO: contraddizioni in 1 e 2, e x finale < 44.
   Uso: node cross-218.mjs */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const srv = await startServer(); const b = await launchBrowser(); const esito = {};
const URL0 = `http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`;
for (const rosso of [false, true]) {
  const R = {};
  /* parti 1 e 2: enumerazione */
  { const ctx = await b.newContext(); const page = await ctx.newPage(); await installCdnRoutes(page);
    await page.addInitScript(r => { window.__CPM_GLB = false; if (r) window.__CPM_NO_CROSS218 = 1; }, rosso);
    await page.goto(URL0, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => typeof SITUATIONS !== 'undefined' && typeof hlOverlay === 'function' && typeof creaMotorePossesso === 'function', null, { timeout: 60000 });
    Object.assign(R, await page.evaluate(() => {
      const reCross = /cross|traverson|pennell|fendente|mette in mezzo|suggerimento dal/i, reShot = /tir|conclus|destr|sinistr|girat|vol[eé]|bomba|stoccat|incroci|piattone|pallonett|rasoterra|a giro/i;
      const lexTiro = /tiro|conclusion|specchio|parata|dice di no|gol sembrava|murat|sfiora il vantaggio|occasione mancata|che peccato/i;
      const KINDS = ['saved', 'out', 'blocked', 'corner', 'intercepted'];
      const acts = []; for (const s of SITUATIONS) { if (s.type === 'def') continue; for (const a of (s.actions || [])) if (reCross.test(a.label) && !reShot.test(a.label) && a.rew === 'assist' && (a.fail === 'intercept' || a.fail === 'miss')) { const c = deriveHL(s, a) || {}; acts.push({ l: a.label, f: a.fail, tipo: c.type || '', vr: c.variant || '' }); } }
      const lex = [], mot = []; let nm = 0;
      for (const a of acts) for (const k of KINDS) {
        for (let sd = 0; sd < 6; sd++) { const o = hlOverlay(a.f, false, a.l, 'X', sd, k); if (lexTiro.test(o.text)) { lex.push(a.l + ' [' + k + '] «' + o.text + '»'); break; } }
        const M = creaMotorePossesso({ giocatori: [], eroe: { name: 'EROE', x: 82, y: 86 }, seed: 7 });
        const ev = M.risolviEroe.eventi(a.f, { tipo: a.tipo, variante: a.vr, rew: 'assist', ok: false, cast: { difensore: { i: 12 }, portiere: { i: 10 } }, outKind: k }).map(e => e.t);
        nm++; const has = t => ev.indexOf(t) >= 0; let c = null;
        if (has('tiro')) c = 'cross registrato come tiro';
        else if (k === 'saved' && (!has('presa') || has('intercetto') || has('spazzata'))) c = 'presa del portiere registrata ' + ev.join('+');
        else if (k === 'out' && (!has('fuori') || has('intercetto') || has('spazzata'))) c = 'cross fuori registrato ' + ev.join('+');
        if (c) mot.push(a.l + ' (' + a.tipo + ') [' + k + '] ' + c);
      }
      return { n: acts.length, lex, mot, nm };
    }));
    await ctx.close(); }
  /* parte 3: 3D, scena forzata in partita vera */
  { const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
    await page.addInitScript(([s, r]) => { window.__CPM_GLB = false; window.__CPM_REC = true; if (r) window.__CPM_NO_CROSS218 = 1; localStorage.setItem('cpm-match-speed', '4'); localStorage.setItem('cpm-v3', JSON.stringify(s)); }, [save, rosso]);
    await page.goto(URL0, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
    try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 90000 }); await sleep(1500);
    try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
    await page.evaluate(() => window.__CPM_CAREER.playMatch());
    await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
    await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 5, policy: 'cross', tickMs: 150 }));
    await page.waitForFunction(() => window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ(), null, { timeout: 60000 }).catch(() => {});
    await page.evaluate(() => { window.__CPM_X218 = []; window.__CPM_FORCE_OUTCOME = 'fail'; window.__CPM_FORCE_KIND = 'out'; window.__CPM_FORCE_SIT(16, true); });
    const t0 = Date.now(); let x = null;
    while (Date.now() - t0 < 40000) { x = await page.evaluate(() => (window.__CPM_X218 || []).slice(-1)[0] || null); if (x && x.xf != null && (x.xf >= 46 || (Date.now() - t0 > 25000))) break; await sleep(500); }
    R.x3d = x; await ctx.close(); }
  esito[rosso ? 'rosso' : 'verde'] = R;
  console.log((rosso ? 'ROSSO' : 'VERDE') + ' azioni-cross ' + R.n + ' · riquadro col lessico del tiro ' + R.lex.length + ' · motore in contraddizione ' + R.mot.length + ' su ' + R.nm + ' · 3D cross fuori: x finale ' + (R.x3d ? R.x3d.xf : 'n.d.') + ' (fotogrammi ' + (R.x3d ? R.x3d.n : 0) + ')');
  { const cat = {}; R.mot.forEach(m => { const k = m.replace(/^.*\] /, '').replace(/ registrat[oa] .*/, ''); cat[k] = (cat[k] || 0) + 1; }); if (R.mot.length) console.log('  categorie motore ' + JSON.stringify(cat)); }
  R.lex.slice(0, 4).forEach(s => console.log('  · ' + s)); R.mot.slice(0, 4).forEach(s => console.log('  · ' + s));
}
await b.close(); srv.close();
const V = esito.verde, Ro = esito.rosso, g = [];
if (!(V.n >= 30 && V.lex.length === 0)) g.push('verde riquadro: ' + V.lex.length + ' su ' + V.n);
if (!(V.mot.length === 0)) g.push('verde motore: ' + V.mot.length + ' contraddizioni');
if (!(V.x3d && V.x3d.xf != null && V.x3d.xf >= 46)) g.push('verde 3D: il cross fuori non esce (x ' + (V.x3d ? V.x3d.xf : 'n.d.') + ')');
if (!(Ro.lex.length >= 1)) g.push('rosso riquadro: il difetto non si vede');
if (!(Ro.mot.length >= 1)) g.push('rosso motore: il difetto non si vede');
if (!(Ro.x3d && Ro.x3d.xf != null && Ro.x3d.xf < 44)) g.push('rosso 3D: il difetto non si vede (x ' + (Ro.x3d ? Ro.x3d.xf : 'n.d.') + ')');
if (g.length) { console.log('❌ cross-218'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ cross-218 verde (riquadro, motore e 3D concordi sul cross sbagliato) e il rosso si vede');
