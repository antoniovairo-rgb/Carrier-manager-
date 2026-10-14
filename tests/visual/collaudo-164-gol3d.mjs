#!/usr/bin/env node
/* [collaudo release 7.999.164] IL GOL DEL RIQUADRO E' UN GOL IN 3D? E LA PARATA HA IL SUO PORTIERE?
   Nata dal giro A: tre scene «gol» (riquadro + motore) col pallone campionato mai oltre x 89 (linea di porta a 98,6), ma la sonda
   principale legge il pallone ogni 1-2 s, troppo radi per giudicare. Qui un registratore DENTRO la pagina (setInterval 80 ms) scrive
   pallone (__CPM_BALL) e fase per tutta la durata delle scene dell'eroe; il gesto del portiere viene da __CPM_GK229 (per fotogramma).
   Partite vere di carriera dal salvataggio S12 (settimana 38, campionato), GLB ACCESO, autoplay seedato del gioco, una pagina per
   partita. Per ogni scena: esito (riquadro e fatti del motore, __CPM_RES218 — solo righe NUOVE), x massima del pallone, punto
   d'arrivo, pallone dentro lo specchio (x >= 98,6 e |y-50| <= 4,93), gesto del portiere; foto a +1,2 s e +2,4 s dall'esito.
   Interruttori del telefono ACCESI: __CPM_CINE e __CPM_REALWAIT (sotto ?cpmtest=1 la scena altrimenti si chiude prima che l'arco finisca,
   nota 7.460/7.461). Corpi al primo fotogramma di ogni scena: testimone __CPM_GLB232W (CGTrader, T-pose, teste, procedurali).
   Uso: CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node collaudo-164-gol3d.mjs   (CPM_SEMI=11,12,13) */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT = path.join(REPO, 'docs', 'collaudi', 'release-164'); fs.mkdirSync(path.join(OUT, 'dati'), { recursive: true });
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const SEMI = (process.env.CPM_SEMI || '11,12').split(',').map(Number);
const LINEA = 98.6, PALO = 3.35 / 0.68;
const srv = await startServer(); const b = await launchBrowser(); const tutte = [];
for (const sd of SEMI) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const sv = JSON.parse(JSON.stringify(save)); const pl = sv.player || sv; pl.name = pl.name + ' G' + sd;
  await page.addInitScript(s => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; window.__CPM_REC = true; window.__CPM_REC229 = 1; window.__CPM_GLB232W = []; window.__CPM_CINE = 1; window.__CPM_REALWAIT = 1; localStorage.setItem('cpm-match-speed', '2'); localStorage.setItem('cpm-v3', JSON.stringify(s));
    window.__G164 = []; setInterval(() => { try { const ph = window.__CPM_PHASE && window.__CPM_PHASE(); if (!/^hl_/.test(ph || '')) return; const bl = window.__CPM_BALL && window.__CPM_BALL(); if (bl && window.__G164.length < 60000) window.__G164.push([Date.now(), ph, bl.x, bl.y, bl.worldY]); } catch (e) {} }, 80); }, sv);
  await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }).catch(() => {}); await sleep(2000);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  const pm = await page.evaluate(() => window.__CPM_CAREER.playMatch());
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 120000 }).catch(() => {});
  await page.evaluate(s2 => window.__CPM_AUTOPLAY(true, { seed: s2, policy: 'seeded', tickMs: 400 }), sd);
  const t0 = Date.now(); let nRes = 0, scena = null; const scene = [];
  while (Date.now() - t0 < 420000) {
    const s = await page.evaluate(() => ({ ph: window.__CPM_PHASE && window.__CPM_PHASE(), n: (window.__CPM_RES218 || []).length })).catch(() => null);
    if (!s || s.ph === 'ended' || s.ph === 'ceremony') break;
    if (/^hl_(intro|move|choose)$/.test(s.ph) && !scena) { scena = { t: Date.now(), n0: s.n }; await page.evaluate(() => { window.__CPM_GK229 = []; }); }
    if (s.ph === 'hl_result' && scena && !scena.tr) { scena.tr = Date.now(); const k = scene.length + 1;
      await sleep(1200); scena.f1 = `g-s${sd}-scena${k}-esito+1.2s.png`; await page.screenshot({ path: path.join(OUT, scena.f1) });
      await sleep(1200); scena.f2 = `g-s${sd}-scena${k}-esito+2.4s.png`; await page.screenshot({ path: path.join(OUT, scena.f2) }); }
    if (scena && scena.tr && !/^hl_/.test(s.ph)) {
      const d = await page.evaluate(([t1, n0]) => { const R = (window.__CPM_RES218 || []); const r = R.length > n0 ? R[R.length - 1] : null;
        const G = window.__G164.filter(q => q[0] >= t1); const gk = window.__CPM_GK229 || []; let gest = null; gk.forEach(f => { if (f.op) gest = gest || f.op; });
        const bar = (document.body.innerText.match(/LA GIOCATA\n([^\n]+)/) || [])[1] || null;
        return { r: r ? { label: r.label, fam: r.fam, ovl: r.ovl, ok: r.ok, ev: r.ev } : null, giocata: bar, campioni: G.length, gest, gkFr: gk.length,
          maxX: G.length ? Math.max(...G.map(q => q[2])) : null, inRete: G.some(q => q[2] >= 98.6 && Math.abs(q[3] - 50) <= 3.35 / 0.68), oltre: G.some(q => q[2] >= 98.6),
          ultimo: G.length ? G[G.length - 1].slice(1) : null, primoResult: (G.find(q => q[1] === 'hl_result') || []).slice(1) }; }, [scena.t, scena.n0]);
      scene.push({ ...d, f1: scena.f1, f2: scena.f2 }); scena = null;
      const gol = d.r && (d.r.ev || []).some(x => /^gol\(/.test(x)); const par = d.r && d.r.fam === 'saved';
      console.log(`s${sd} scena ${scene.length}: «${d.r ? d.r.label : d.giocata}» ${d.r ? d.r.fam + ' ' + JSON.stringify(d.r.ev) : '(esito non registrato)'} · campioni ${d.campioni} · x max ${d.maxX} · in rete ${d.inRete} · oltre la linea ${d.oltre} · portiere ${d.gest} (${d.gkFr} fotogrammi)${gol && !d.inRete ? ' ⚠ GOL SENZA PALLONE IN RETE' : ''}${par && !d.gest ? ' ⚠ PARATA SENZA GESTO' : ''}`);
      await page.evaluate(() => { window.__G164.length = 0; });
    }
    await sleep(150);
  }
  const sc = await page.evaluate(() => window.__CPM_SCORE && window.__CPM_SCORE()).catch(() => null);
  const corpi = await page.evaluate(() => (window.__CPM_GLB232W || []).map(w => ({ ph: w.ph, st: w.st, pronti: w.pronti && w.pronti.pronti, motivo: w.pronti && w.pronti.motivo, proc: w.proc, n: (w.corpi || []).length, noCg: (w.corpi || []).filter(q => !q.cg).length, tpose: (w.corpi || []).filter(q => q.w <= 0.05).length, senzaTesta: (w.corpi || []).filter(q => q.teste > q.testeOk).length }))).catch(() => []);
  const nonPronte = corpi.filter(c => !c.pronti || c.noCg || c.tpose || c.senzaTesta || c.proc > 0 || !c.n);
  console.log(`s${sd} corpi al primo fotogramma di ${corpi.length} scene: non pronte ${nonPronte.length}`, JSON.stringify(nonPronte));
  tutte.push({ seme: sd, pm, score: sc, scene, corpi }); await ctx.close();
}
fs.writeFileSync(path.join(OUT, 'dati', 'gol3d.json'), JSON.stringify(tutte, null, 1));
const sc = tutte.flatMap(t => t.scene); const gol = sc.filter(d => d.r && (d.r.ev || []).some(x => /^gol\(/.test(x)));
console.log(`\nscene ${sc.length} · gol del motore ${gol.length}, di cui col pallone in rete ${gol.filter(d => d.inRete).length} · parate ${sc.filter(d => d.r && d.r.fam === 'saved').length}, con gesto del portiere ${sc.filter(d => d.r && d.r.fam === 'saved' && d.gest).length}`);
await b.close(); srv.close();
