import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const TAG = process.env.TAG || 'prima', GI = +(process.env.GI || 24);
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2 }); await installCdnRoutes(ctx);
const p = await ctx.newPage();
await p.addInitScript((ROSSO) => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; window.__CPM_CAMT767ON = 1; if (ROSSO) window.__CPM_NO_HL94 = 1; }, !!process.env.CPM_ROSSO94);
await openMatch(p, port, { skipLoadAll: true, name: 'Vairo' }); await sleep(800);
await p.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 60000 }).catch(() => {});
const cdp = await ctx.newCDPSession(p); let ult = null;
cdp.on('Page.screencastFrame', e => { ult = Buffer.from(e.data, 'base64'); cdp.send('Page.screencastFrameAck', { sessionId: e.sessionId }).catch(() => {}); });
await cdp.send('Page.startScreencast', { format: 'png', maxWidth: 824, maxHeight: 1830, everyNthFrame: 1 });
const MIS = {};
const misura = async n => MIS[n] = await p.evaluate(() => {
  const c = window.__CPM_CAMT767, v = c && c.hs94; let hy = null, hx = null;
  const cv = [...document.querySelectorAll('canvas')].sort((a, b) => b.width * b.height - a.width * a.height)[0]; const R = cv ? cv.getBoundingClientRect() : { top: 0, left: 0, width: innerWidth, height: innerHeight };
  if (v) { hy = Math.round(R.top + (1 - v[1]) / 2 * R.height); hx = Math.round(R.left + (v[0] + 1) / 2 * R.width); }
  const q = s => { const e = document.querySelector(`[data-cpm="${s}"]`); if (!e) return null; const r = e.getBoundingClientRect(); return { top: Math.round(r.top), h: Math.round(r.height) }; };
  return { ph: window.__CPM_PHASE && window.__CPM_PHASE(), hx, hy, mossa: q('mossa'), scelte: q('scelte'), corso: q('incorso94'), esito: q('esito'), dpad: q('dpad') };
}).catch(e => ({ err: String(e) }));
const shot = async n => { await sleep(900); if (ult) fs.writeFileSync(`out/hl94/${TAG}-${GI}-${n}.png`, ult); await misura(n); };
await p.evaluate(g => window.__CPM_FORCE_SIT(g, false), GI).catch(() => {});
for (let i = 0; i < 30; i++) { const ph = await p.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()); if (ph && /hl_/.test(ph)) break; await sleep(300); }
await sleep(1500); await shot('1-racconto');
for (let i = 0; i < 40; i++) { const ph = await p.evaluate(() => window.__CPM_PHASE()); if (ph === 'hl_move' || ph === 'hl_choose') break; await sleep(300); }
await sleep(2500); await shot('2-movimento');
const bt = await p.$$('button'); for (const x of bt) { const t = (await x.innerText().catch(() => '')) || ''; if (/^Scegli/i.test(t.trim())) { await x.click().catch(() => {}); break; } }
for (let i = 0; i < 20; i++) { const ph = await p.evaluate(() => window.__CPM_PHASE()); if (ph === 'hl_choose') break; await sleep(300); }
await sleep(1200); await shot('3-scelta');
await p.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_RESOLVE(0); }).catch(() => {});
await sleep(600); await shot('4-in-corso');
for (let i = 0; i < 40; i++) { const ph = await p.evaluate(() => window.__CPM_PHASE()); if (ph === 'hl_result') break; await sleep(300); }
for (let i = 0; i < 40; i++) { const ok = await p.evaluate(() => !!document.querySelector('[data-cpm="esito"]')); if (ok) break; await sleep(300); }
await sleep(600); await shot('5-esito');
fs.writeFileSync(`out/hl94/${TAG}-${GI}.json`, JSON.stringify(MIS, null, 1)); console.log(TAG, GI, JSON.stringify(MIS));
await b.close(); srv.close();
