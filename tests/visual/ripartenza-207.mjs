#!/usr/bin/env node
/* [7.999.126 PO-207 collaudo PO 03/10 «Ad ogni gol il 2D non riparte dalla rimessa in gioco da centrocampo»] GUARDIANO su una
   partita vera dal salvataggio S12 (autoplay, seme fisso, fino al primo gol + 10 s, massimo 300 s; un braccio senza gol si ritenta fino a 3 partite): a ogni aumento del punteggio il motore riparte dal centro con la
   palla a chi ha subito il gol (testimone __CPM_KO207) e subito dopo la ripartenza il motore e' in «kickoff» con il pallone a (50,50) (letto dal testimone nel gioco, non a campione).
   Verde: almeno una ripartenza e il pallone al centro. Rosso (__CPM_NO_KO207): nessuna ripartenza. MISURATO prima della correzione:
   dopo 3 gol il motore restava in «tenuta»/«volo» con il pallone dove era. */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const srv = await startServer(); const b = await launchBrowser(); const esito = {};
for (const rosso of [false, true]) { for (let tent = 0; tent < 3; tent++) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);/* un contesto per braccio: il salvataggio non si condivide */
  /* il seme della partita nasce da avversario+stagione+settimana+NOME: a ogni tentativo un nome diverso, cioe' una partita diversa */
  const sv = JSON.parse(JSON.stringify(save)); const pl = sv.player || sv; pl.name = pl.name + ' ' + String.fromCharCode(65 + tent);
  await page.addInitScript(s => { window.__CPM_GLB = false; window.__CPM_REC = true; if (s.r) window.__CPM_NO_KO207 = 1; localStorage.setItem('cpm-match-speed', '4'); const c = { ...s }; delete c.r; localStorage.setItem('cpm-v3', JSON.stringify(c)); }, { ...sv, r: rosso });
  await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => window.__CPM_CAREER.playMatch());
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 40000 }).catch(() => {});
  await page.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: 2071, policy: 'seeded', tickMs: 150 }));
  const t0 = Date.now(); let nKo = 0, attesa = 0, centro = 0, primoGol = 0;
  while (Date.now() - t0 < 300000 && !(primoGol && Date.now() - primoGol > 10000)) {
    const s = await page.evaluate(() => { let st = null; try { st = window.__CPM_MOTORE_OBJ().stato(); } catch (e) {} return { f: window.__CPM_PHASE(), g: (window.__CPM_EV ? window.__CPM_EV() : []).filter(e => e.ev === 'goal').length, ko: (window.__CPM_KO207 || []).length, kos: (window.__CPM_KO207 || []).slice(), p: st && st.palla ? [st.palla.x, st.palla.y] : null }; });
    if (s.f === 'ended' || s.f === 'ceremony') break;
    if (s.g && !primoGol) primoGol = Date.now();
    if (s.ko > nKo) { nKo = s.ko; attesa = 3; for (const k of s.kos) if (k.dopo === 'kickoff' && k.palla && k.palla[0] === 50 && k.palla[1] === 50) centro = Math.max(centro, s.kos.filter(q => q.dopo === 'kickoff' && q.palla && q.palla[0] === 50 && q.palla[1] === 50).length); }
    if (attesa > 0) { attesa--; if (s.p && Math.abs(s.p[0] - 50) <= 4 && Math.abs(s.p[1] - 50) <= 6) { centro++; attesa = 0; } }
    await sleep(300);
  }
  const _e = { ripartenze: nKo, alCentro: centro, gol: await page.evaluate(() => (window.__CPM_EV ? window.__CPM_EV() : []).filter(e => e.ev === 'goal').length), tentativi: tent + 1, fine: await page.evaluate(() => ({ f: window.__CPM_PHASE && window.__CPM_PHASE(), sc: window.__CPM_SCORE && window.__CPM_SCORE() })), s: Math.round((Date.now() - t0) / 1000) };
  console.log((rosso ? 'rosso' : 'verde') + ' tentativo ' + (tent + 1) + ' ' + JSON.stringify(_e));
  esito[rosso ? 'rosso' : 'verde'] = _e;
  await ctx.close();
  if (_e.gol >= 1) break; } /* le partite non sono identiche fra un giro e l'altro: un braccio senza gol si ritenta, fino a 3 partite */
}
await b.close(); srv.close();
console.log(JSON.stringify(esito));
const V = esito.verde, R = esito.rosso, g = [];
if (!(V.ripartenze >= 1 && V.alCentro >= 1)) g.push('verde: ' + JSON.stringify(V));
if (R.ripartenze !== 0) g.push('rosso: il difetto non si vede ' + JSON.stringify(R));
if (!(V.gol >= 1) || !(R.gol >= 1)) g.push('un braccio senza gol: misura cieca ' + JSON.stringify(esito));
if (g.length) { console.log('❌ ripartenza-207'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ ripartenza-207 verde (e il rosso si vede)');
