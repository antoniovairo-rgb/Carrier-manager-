#!/usr/bin/env node
/* Collaudo 7.999.174 (3D): foto GLB acceso 412x915 delle scene di PO-282/283/284 e «fra le linee». Sola lettura del prodotto.
   Riusa i generatori del motore come corpi-073.mjs. Uso: CPM_CHROME=/opt/pw-browsers/chromium node foto-174.mjs */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from '../../../tests/visual/lib/harness.mjs';
const OUT = new URL('./', import.meta.url).pathname;
const srv = await startServer(); const b = await launchBrowser();
async function pagina() {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript(() => { window.__CPM_GLB = true; window.__CPM_REC = true; window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; });
  await openMatch(page, srv.address().port, { skipLoadAll: true, name: 'Coll174' });
  await page.waitForFunction(() => window.__CPM_GLB_READY === true, null, { timeout: 90000 }).catch(() => {});
  await sleep(2500); return { ctx, page };
}
async function scena(page, tipo, rx, seme) {
  return page.evaluate(([tipo, rx, seme]) => {
    const cast = { portatore: { nome: 'Joe MARSHALL' }, difensore: { nome: 'Max BAILEY' }, crossatore: { nome: 'Tom HAMMOND' }, portiere: { nome: 'Ian CARR' } };
    for (let s = seme; s < seme + 400; s++) {
      const o = tipo === 'difesa' ? { tipo: 'difesa', zona: 'centro', x: 42, y: 50, press: 1, cast } : tipo === 'linee' ? { tipo: 'fra-le-linee', zona: 'trequarti', x: 70, y: 50, press: 0.8, liberi: 2, cast } : { tipo: 'angolo', zona: 'area', x: 90, y: 52, press: 1, liberi: 0, cast, origine: { kind: 'angolo', chi: cast.crossatore } };
      const sc = tipo === 'difesa' ? scenaDalMotoreDifesa(o, { stats: {}, foot: 'R' }, s * 2654435761 >>> 0) : tipo === 'linee' ? scenaDalMotoreLinee(o, { stats: {}, foot: 'R' }, s * 2654435761 >>> 0) : scenaDalMotoreCross(o, { stats: {}, foot: 'R' }, s * 2654435761 >>> 0);
      if (!sc) continue; const k = sc.actions.findIndex(a => new RegExp(rx).test(a.label || a.l || '')); if (k < 0) continue;
      SITUATIONS.push(sc); return { gi: SITUATIONS.length - 1, k, seme: s, label: sc.actions[k].label }; } return null; }, [tipo, rx, seme]);
}
const shot = async (page, nome) => { await page.screenshot({ path: OUT + nome + '.png' }); console.log('foto', nome); };
const SCR = process.env.CPM_SCR || '/tmp/f174/'; (await import('node:fs')).mkdirSync(SCR, { recursive: true });
async function esito(nome, tipo, rx, seme, out) {
  const { ctx, page } = await pagina(); const S = await scena(page, tipo, rx, seme); if (!S) { console.log(nome, 'scena non costruita'); await ctx.close(); return; }
  await page.evaluate(() => { window.__CPM_FORCE_INTRO = 1; window.__CPM_FROZEN = false; });
  await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), S.gi); await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_choose', null, { timeout: 30000 }).catch(() => {}); await sleep(300);
  await page.evaluate(o => { window.__CPM_FORCE_OUTCOME = o; }, out); await page.evaluate(k => window.__CPM_RESOLVE(k), S.k);
  const t0 = Date.now(); let n = 0, txt = '';
  while (Date.now() - t0 < 30000 && n < (+process.env.CPM_N || 12)) {
    const m = await page.evaluate(() => ({ g: window.__CPM_GST ? [window.__CPM_GST.cur, window.__CPM_GST.at] : null, e: window.__CPM_EROE73 ? window.__CPM_EROE73() : null, ph: window.__CPM_PHASE && window.__CPM_PHASE(), t: window.__CPM_SCENET }));
    const f = nome + '-' + String(n++).padStart(2, '0') + '.png'; await page.screenshot({ path: SCR + f });
    console.log(f, m.ph, 'scena', m.t == null ? '-' : m.t.toFixed(2), 'gesto', JSON.stringify(m.g), 'inclin', m.e ? m.e.tilt : '-', 'clip', m.e ? (m.e.cn || m.e.g) : '-');
    if (!txt) txt = await page.evaluate(() => document.body.innerText.split('\n').filter(x => /Fallito|Riuscito|Raddoppio|Anticipa|Stacco|Tiro da fuori/i.test(x)).slice(0, 3).join(' | ')); }
  console.log(nome, 'testo esito:', txt); await ctx.close();
}
const which = (process.argv[2] || 'a,b,c,d').split(',');
if (which.includes('a')) await esito('282a-recupero', 'difesa', 'Anticipa sul primo controllo', 3, 'success');
if (which.includes('b')) await esito('282b-fra-le-linee-tiro', 'linee', 'Tiro da fuori', 3, 'success');
if (which.includes('c')) await esito('283-stacco-angolo', 'angolo', 'Stacco in corsa potente', 3, 'fail');
if (which.includes('d')) { /* 284: apertura dell'angolo, compagno gia' sulla bandierina (condizione del flusso vero) */
  const { ctx, page } = await pagina(); await page.evaluate(() => { window.__CPM_NO554 = 1; }); const S = await scena(page, 'angolo', '.', 3);
  await page.evaluate(([gi]) => { const mp = window.__CPM_MP(); let k = -1; mp.forEach((q, i) => { if (k < 0 && i > 0 && q && q.t === 'home' && !q.gk && q.x < 70) k = i; }); window.__CPM_MP_PLACE073 && window.__CPM_MP_PLACE073(k, 96.4, 95.8); window.__CPM_FORCE_SIT(gi, false); }, [S.gi]);
  for (let i = 1; i <= 5; i++) { await sleep(500); await shot(page, '284-apertura-angolo-' + i); }
  await ctx.close();
}
await Promise.race([b.close(), sleep(5000)]); srv.close(); process.exit(0);
