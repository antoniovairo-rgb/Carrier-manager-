#!/usr/bin/env node
/* [giro 35 PO-207/PO-228, decisione PO 15/10 «Restringi, poi ritara»] GUARDIANO della regola del giro 27 RISTRETTA.
   Il giro 32 ha misurato che lo schieramento dei ventidue + 11 passi di palla ferma alla ripresa dal centro (giro 27) scattava a
   OGNI gol fuori scena, anche ambientale, e spostava la partita vissuta (passaggi +6 %, tiri -14 %, xG -19 %, cross -22 %).
   Ora schiera solo dopo un gol dell'eroe in scena (highlight, rigore/punizione). Tre verifiche:
     1. dopo un gol AMBIENTALE si riparte dal centro (kickoff, pallone a 50,50, palla a chi ha subito) — PO-207 resta soddisfatta;
     2. dopo un gol AMBIENTALE niente schieramento ne' palla tenuta (testimone __CPM_KO207: sch=false, hold < 8);
     3. dopo rigore/punizione dell'eroe lo schieramento c'e' (delegato a ripartenza-piazzato-27.mjs, braccio verde, caso rigore;
        CPM_SENZA_PIAZZATO=1 per saltarlo, CPM_CASI per scegliere i casi).
   Braccio ROSSO (__CPM_NO_RIP235 = regola larga della 7.999.170): dopo il gol ambientale lo schieramento c'e' (hold >= 8, fuori <= 2).
   Partita vera dal salvataggio S12, autoplay seedato, fino al primo gol ambientale (massimo 300 s, fino a 3 partite per braccio). */
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const srv = await startServer(); const b = await launchBrowser(); const esito = {};
for (const braccio of ['verde', 'rosso']) { for (let tent = 0; tent < 3; tent++) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  const sv = JSON.parse(JSON.stringify(save)); const pl = sv.player || sv; pl.name = pl.name + ' R' + String.fromCharCode(65 + tent);
  await page.addInitScript(s => { window.__CPM_GLB = false; window.__CPM_REC = true; if (s.r === 'rosso') window.__CPM_NO_RIP235 = 1; localStorage.setItem('cpm-match-speed', '4'); const c = { ...s }; delete c.r; localStorage.setItem('cpm-v3', JSON.stringify(c)); }, { ...sv, r: braccio });
  await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => window.__CPM_CAREER.playMatch());
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 40000 }).catch(() => {});
  await page.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: 2071, policy: 'seeded', tickMs: 150 }));
  const t0 = Date.now(); let amb = null;
  while (Date.now() - t0 < 300000) {
    const s = await page.evaluate(() => ({ f: window.__CPM_PHASE(), kos: (window.__CPM_KO207 || []).slice() }));
    amb = s.kos.find(k => !k.scena && !k.eroe && k.dopo != null) || null;
    if (amb || s.f === 'ended' || s.f === 'ceremony') break;
    await sleep(300);
  }
  const tutti = await page.evaluate(() => (window.__CPM_KO207 || []).slice());
  const gol = await page.evaluate(() => (window.__CPM_EV ? window.__CPM_EV() : []).filter(e => e.ev === 'goal').map(e => e.src + '@' + e.min));
  const r = { tentativo: tent + 1, ambientale: amb, ripartenze: tutti.map(k => (k.eroe ? 'eroe' : (k.scena ? 'scena' : 'amb')) + '/' + (k.sch ? 'sch' : '-') + '/' + k.dopo + '@' + (k.palla || []).join(',') + '/h' + k.hold + '/f' + k.fuori), gol, errs: errs.slice(0, 2), s: Math.round((Date.now() - t0) / 1000) };
  console.log(braccio + ' ' + JSON.stringify(r));
  esito[braccio] = r; await ctx.close();
  if (amb) break; }
}
await b.close(); srv.close();
const g = [], V = esito.verde, R = esito.rosso;
const alCentro = k => k && k.dopo === 'kickoff' && k.palla && k.palla[0] === 50 && k.palla[1] === 50;
if (!V || !V.ambientale) g.push('verde: nessun gol ambientale in 3 partite: misura cieca');
else { const k = V.ambientale;
  if (!alCentro(k)) g.push('verde: dopo il gol ambientale non si riparte dal centro ' + JSON.stringify(k));
  if (k.lato !== 'home' && k.lato !== 'away') g.push('verde: lato della ripresa assente ' + JSON.stringify(k));
  if (k.sch || (k.hold | 0) >= 8) g.push('verde: dopo il gol ambientale ci sono ancora schieramento/palla tenuta ' + JSON.stringify(k));
  if (V.errs.length) g.push('verde: errori di pagina ' + V.errs.join(' | ')); }
if (!R || !R.ambientale) g.push('rosso: nessun gol ambientale: misura cieca');
else { const k = R.ambientale; if (!(alCentro(k) && (k.hold | 0) >= 8 && k.fuori <= 2)) g.push('rosso: la regola larga (schieramento a ogni gol) non si vede ' + JSON.stringify(k)); }
if (!process.env.CPM_SENZA_PIAZZATO) {
  const r = spawnSync(process.execPath, ['ripartenza-piazzato-27.mjs'], { cwd: new URL('.', import.meta.url).pathname, env: { ...process.env, CPM_CASI: process.env.CPM_CASI || 'rigore', CPM_SOLO: 'verde' }, encoding: 'utf8' });
  const coda = String(r.stdout || '').trim().split('\n').slice(-3).join('\n'); console.log('--- piazzato dell\'eroe (ripartenza-piazzato-27, verde)\n' + coda);
  if (r.status !== 0) g.push('piazzato dell\'eroe: lo schieramento dopo rigore/punizione non c\'e\' (exit ' + r.status + ')');
}
if (g.length) { console.log('❌ ripartenza-235'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ ripartenza-235 verde: gol ambientale → centro senza schieramento; piazzato dell\'eroe → schieramento; il rosso (regola larga) si vede');
