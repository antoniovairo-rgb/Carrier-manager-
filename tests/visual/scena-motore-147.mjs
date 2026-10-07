#!/usr/bin/env node
/* [7.999.147 PO-022 Passo 6, strato 1] GUARDIANO: la conclusione nasce dall'occasione del motore. Due partite S12 in autoplay
   (semi 7 e 99). VERDE: almeno 3 conclusioni generate; per ognuna la zona di partenza contiene il punto del motore, nessuna
   opzione promette un gesto senza clip, l'assist solo se il motore ha compagni liberi. VERDE vuole TUTTE le conclusioni del motore generate (almeno 2). ROSSO (__CPM_NO_P6C): 0 generate. */
import fs from 'node:fs';
const { startServer, launchBrowser, installCdnRoutes, sleep } = await import('/home/user/cm-poc/tests/visual/lib/harness.mjs');
const save = JSON.parse(fs.readFileSync('/home/user/cm-poc/tests/visual/fixtures/save-190-s12-ovr93.json'));
const semi = [7, 99]; const TOT = { verde: [], rosso: [] }, CONC = { verde: 0, rosso: 0 }; const TIPI = ['conclusione', 'spalle']; /* [7.999.148] strati del Passo 6 coperti */
const srv = await startServer(); const b = await launchBrowser();
for (const arm of ['verde', 'rosso']) for (const sd of semi) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript(s => { window.__CPM_GLB = false; window.__CPM_REC = true; if (s.r) window[s.r] = 1; localStorage.setItem('cpm-match-speed', '4'); const c = { ...s }; delete c.r; localStorage.setItem('cpm-v3', JSON.stringify(c)); }, { ...save, r: arm === 'rosso' ? '__CPM_NO_P6' : '' });
  await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => window.__CPM_CAREER.playMatch());
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
  await page.evaluate((s) => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 150 }), sd);
  const t0 = Date.now(); let ph = '', last = null;
  while (Date.now() - t0 < 420000) { const s = await page.evaluate(() => ({ ph: window.__CPM_PHASE && window.__CPM_PHASE(), sc: window.__CPM_SCORE && window.__CPM_SCORE(), m: (() => { try { const M = window.__CPM_MOTORE_OBJ(); const t = M.tabellino(); return t.home.gol + '-' + t.away.gol; } catch (e) { return null; } })(), deb: window.__CPM_DEB202 })); ph = s.ph; if (s.ph === 'playing' || /^hl_/.test(s.ph || '')) last = s; if (ph === 'ended' || ph === 'ceremony') break; await sleep(700); }
  const r = await page.evaluate(() => { const B7 = (window.__CPM_B7 || []); const P6 = (window.__CPM_P6 || []); let sit = []; try { sit = (window.__CPM_SIT_LIST ? window.__CPM_SIT_LIST() : []); } catch (e) {} return { b7: B7.map(x => ({ tipo: x.tipo, x: x.x, y: x.y })), p6: P6 }; });
  console.log('seme', sd, ph, 'occasioni', r.b7.length, 'coperte', r.b7.filter(x => TIPI.includes(x.tipo)).length, 'generate', r.p6.length, JSON.stringify(r.b7.map(x => x.tipo)));
  for (const g of r.p6) console.log('  P6', JSON.stringify(g)); TOT[arm].push(...r.p6); CONC[arm] += r.b7.filter(x => TIPI.includes(x.tipo)).length;
  await ctx.close();
}
await b.close(); srv.close();
const V = TOT.verde, g = [];
if (V.length < 2 || V.length < CONC.verde) g.push('verde: scene generate ' + V.length + ' su ' + CONC.verde + ' occasioni coperte dichiarate dal motore (servono tutte, almeno 2)');
for (const p of V) {
  if (!(p.x >= p.sz.x[0] && p.x <= p.sz.x[1] && p.y >= p.sz.y[0] && p.y <= p.sz.y[1])) g.push('zona di partenza senza il punto del motore: ' + JSON.stringify(p));
  if (p.rq && p.rq.replace(/\|/g, '')) g.push('opzione con gesto senza clip: ' + p.rq);
  if (!p.liberi && p.az.some(a => /^🤝/.test(a))) g.push('assist senza compagni liberi: ' + JSON.stringify(p));
}
if (TOT.rosso.length) g.push('rosso: ' + TOT.rosso.length + ' generate anche spento');
console.log('generate verde', V.length, '· rosso', TOT.rosso.length);
if (g.length) { console.log('❌ scena-motore-147'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ scena-motore-147 verde (e il rosso si vede)');
