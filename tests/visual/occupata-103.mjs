#!/usr/bin/env node
/* [giro 103] SONDA «quanto resta occupata la conclusione, in secondi DI SCENA» (highlight-95 D3, catena 178: «Tiro a giro» rivelato dalla
   riserva mentre il 3D mostrava ancora la conclusione). La riserva dell'esito (revealRiserva95, src/15) parte 2,6 s dopo la risoluzione e
   aspetta il renderer fino a 6 s DI SCENA (guardia di parete 30 s): se la conclusione resta occupata (build-up o arco vivi, flag cineBusy)
   oltre quel tetto la riserva rivela l'esito con la scena ancora in corso. Questa sonda forza ogni scena con una giocata di tiro, la
   risolve (parata/fuori/gol a turno, deterministico sull'indice), campiona cineBusy (__CPM_CB95) e registra la durata OCCUPATA in secondi
   di scena (ck del renderer, indipendente dai fotogrammi) e chi ha rivelato l'esito (__CPM_REV95). Pagina nuova ogni CPM_PER scene.
   Uso: node occupata-103.mjs  [CPM_PER=8] [CPM_MAX=60] [CPM_FLAG=__CPM_NO_...] */
import fs from 'node:fs';
if (!process.env.CPM_CHROME && fs.existsSync('/opt/pw-browsers/chromium')) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH && fs.existsSync('/opt/pw-browsers')) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } = await import('./lib/harness.mjs');
const PER = +(process.env.CPM_PER || 8), MAX = +(process.env.CPM_MAX || 60);
const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
async function nuova() {
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript(f => { window.__CPM_GLB = false; window.__CPM_REC = true; window.__CPM_REALWAIT = 1; window.__CPM_CINE = 1; window.__CPM_PARETE103 = 150000; (f || '').split(',').forEach(k => { if (k) window[k] = 1; });
    window.__B103 = []; const g = () => { try { const ph = window.__CPM_PHASE && window.__CPM_PHASE(); const c = window.__CPM_CB95 ? window.__CPM_CB95() : null;
      if (ph === 'hl_result' && c && window.__B103.length < 20000) window.__B103.push([performance.now(), c.ck, c.on && (c.tl || c.arc) ? 1 : 0, c.tl ? 1 : 0, c.arc ? 1 : 0, c.pa ? 1 : 0, (window.__CPM_REV95 || []).length]); } catch (e) {} requestAnimationFrame(g); }; requestAnimationFrame(g); }, process.env.CPM_FLAG || '');
  await openMatch(page, port, { name: 'Occupata Centotre' }); page._ctx = ctx; return page;
}
const fase = p => p.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null);
let page = await nuova();
const cat = await page.evaluate(() => SITUATIONS.map((s, gi) => ({ gi, a: (s.actions || []).map(a => { let h = {}; try { h = deriveHL(s, a) || {}; } catch (e) {} return h.type || null; }), lab: (s.actions || []).map(a => a.label) })));
const lav = []; for (const s of cat) { const k = s.a.findIndex(t => t === 'shot'); if (k >= 0) lav.push({ gi: s.gi, k, lab: s.lab[k] }); }
const ES = [['fail', 'saved'], ['fail', 'wide'], ['success', null]];
const righe = []; let usate = 0;
for (let i = 0; i < Math.min(MAX, lav.length); i++) { const L = lav[i]; const [o, kd] = ES[i % 3];
  if (usate >= PER) { await page._ctx.close().catch(() => {}); page = await nuova(); usate = 0; } usate++;
  try {
    await page.evaluate(() => { window.__CPM_FORCE_INTRO = 1; delete window.__CPM_FORCE_KIND; delete window.__CPM_FORCE_OUTCOME; });
    if (!await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), L.gi).catch(() => false)) throw new Error('forzatura');
    const t0 = Date.now(); while (Date.now() - t0 < 10000 && (await fase(page)) !== 'hl_choose') await sleep(120);
    const n0 = await page.evaluate(([oo, kk]) => { window.__CPM_FORCE_OUTCOME = oo; if (kk) window.__CPM_FORCE_KIND = kk; window.__B103 = []; return (window.__CPM_REV95 || []).length; }, [o, kd]);
    if (!await page.evaluate(k => window.__CPM_RESOLVE(k), L.k).catch(() => false)) throw new Error('risoluzione');
    const t1 = Date.now(); let visto = false; while (Date.now() - t1 < 90000) { const ph = await fase(page); if (ph === 'hl_result') visto = true; else if (visto) break;
      const q = await page.evaluate(n => { const B = window.__B103; if (!B.length) return null; const c0 = B[0][1], l = B[B.length - 1]; let lo = c0; for (const f of B) if (f[2]) lo = f[1]; return { sc: l[1] - c0, libero: l[1] - lo, rev: (window.__CPM_REV95 || []).length > n }; }, n0).catch(() => null);
      if (q && ((q.rev && q.libero > 1.5 && q.sc > 3) || q.sc > 20)) break;/* esito rivelato e scena libera da 1,5 s di scena, o 20 s di scena: la misura e' fatta */
      await sleep(200); }
    const B = await page.evaluate(() => window.__B103.slice()); const R = await page.evaluate(n => (window.__CPM_REV95 || []).slice(n), n0);
    const occ = B.filter(f => f[2]); const ck0 = B.length ? B[0][1] : null;
    const r = { gi: L.gi, lab: L.lab, esito: kd || o, fr: B.length, wall: B.length ? Math.round(B[B.length - 1][0] - B[0][0]) : 0,
      scena: B.length ? +(B[B.length - 1][1] - ck0).toFixed(2) : 0, occFine: occ.length ? +(occ[occ.length - 1][1] - ck0).toFixed(2) : 0,
      rev: R[0] ? { via: R[0].via, busy: R[0].busy, cap: R[0].cap, rr: R[0].rr103, c: R[0].c103 } : null };
    const rv = R.length ? B.find(f => f[6] > n0) : null; r.revCk = rv ? +(rv[1] - ck0).toFixed(2) : null;
    righe.push(r);
    console.log(`gi${String(L.gi).padEnd(4)} ${String(r.esito).padEnd(7)} «${String(L.lab).slice(0, 28)}» fr ${r.fr} parete ${r.wall} ms · scena ${r.scena} s · occupata fino a ${r.occFine} s · esito a ${r.revCk} s via ${r.rev ? r.rev.via + (r.rev.busy ? '+occupata' : '') + (r.rev.cap ? '+' + r.rev.cap : '') : '-'}${r.rev && r.rev.via === 'riserva' && r.rev.busy ? ' ⚠ ' + JSON.stringify(r.rev) : ''}`);
  } catch (e) { console.log(`gi${L.gi} errore ${String(e.message || e).slice(0, 100)}`); }
}
await page._ctx.close().catch(() => {}); await browser.close(); srv.close();
const occ = righe.map(r => r.occFine).sort((a, b) => a - b); const lunghe = righe.filter(r => r.occFine > 8.6); const ris = righe.filter(r => r.rev && r.rev.via === 'riserva' && r.rev.busy);
console.log(`scene ${righe.length} · occupata mediana ${occ[Math.floor(occ.length / 2)]} s · 95° ${occ[Math.floor(occ.length * 0.95)]} s · massimo ${occ[occ.length - 1]} s · oltre 8,6 s di scena ${lunghe.length} · rivelate dalla riserva a scena occupata ${ris.length}`);
lunghe.forEach(r => console.log(`  · lunga gi${r.gi} «${r.lab}» ${r.esito} occupata ${r.occFine} s`));
process.exit(0);
