import fs from 'fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from '/tmp/cpm157/tests/visual/lib/harness.mjs';
const A = +process.env.QA || 0, B = +process.env.QB || 0, OUT = process.env.QOUT;
const server = await startServer('/tmp/cpm157'); const port = server.address().port; const browser = await launchBrowser();
const BASE = { name: 'Test Q', nation: 'Italia', avatarId: 3, proStatus: 'pro', season: 3, week: 10, age: 22, ovr: 80,
  club: { id: 'mer', n: 'FC Merseyside', a: 'MER', p: 88, c: '#8e1f33', c2: '#f0b33a', nat: '🏴', lg: 'Premier Division' },
  stats: { 'velocità': 80, tecnica: 80, fisico: 80, 'mentalità': 80, tiro: 80, passaggio: 80, dribbling: 80, posizionamento: 80 }, form: 70, morale: 70, fatigue: 30, coachTrust: 60, popularity: 50, value: 10, bankBalance: 5000000, tutorialDone: true,
  contract: { duration: 3, wage: 120000, expiresAtSeason: 14 } };
const res = []; const t0 = Date.now();
const ids = JSON.parse(fs.readFileSync("/tmp/claude-0/-home-user-Carrier-manager-/9fe8e0dc-96d2-52c0-a0af-b74fab6c163d/scratchpad/catalog.json","utf8")); const _unused = (async () => { const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(ctx); const p = await ctx.newPage();
  await p.addInitScript((b) => { try { localStorage.setItem('cpm-v3', JSON.stringify({ phase: 'career', player: b })); } catch (_e) {} }, BASE);
  await p.goto(`http://127.0.0.1:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await p.waitForFunction(() => !!(window.__CPM_IMPULSES && window.__CPM_CAREER), null, { timeout: 60000 }).catch(() => {});
  const cat = await p.evaluate(() => (window.__CPM_IMPULSES || []).map(im => ({ id: im.id, cat: im.cat, once: !!im.once, addio: !!im.addio, mile: !!im.mile, choices: (im.choices || []).map(c => ({ txt: c.txt, ef: c.ef || null, bond: c.bond ?? null, flag: c.flag ?? null })) })));
  await ctx.close(); return cat; })();
fs.writeFileSync(OUT + '.catalog.json', JSON.stringify(ids, null, 1));
const sel = ids.slice(A, B);
const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(ctx); const page = await ctx.newPage();
const errs = []; page.on("pageerror", e => errs.push(String(e.message).slice(0, 120)));
await page.addInitScript((b) => { try { if (!sessionStorage.getItem("q-init")) { sessionStorage.setItem("q-init","1"); localStorage.setItem("cpm-v3", JSON.stringify({ phase: "career", player: b })); } } catch (_e) {} }, BASE);
await page.goto(`http://127.0.0.1:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: "load", timeout: 90000 });
await page.waitForFunction(() => !!(window.__CPM_CAREER && window.__CPM_CAREER.apriImpulso), null, { timeout: 25000 }).catch(() => {});
if (!(await page.evaluate(() => !!(window.__CPM_CAREER && window.__CPM_CAREER.apriImpulso)))) { try { await page.getByText("CONTINUA", { exact: false }).first().click({ timeout: 8000 }); } catch (_e) {} await page.waitForFunction(() => !!(window.__CPM_CAREER && window.__CPM_CAREER.apriImpulso), null, { timeout: 25000 }).catch(() => {}); }
await sleep(800);
for (const im of sel) {
  for (let k = 0; k < im.choices.length; k++) {
    const ch = im.choices[k]; const pref = ch.txt.slice(0, 18);
    const snap = () => page.evaluate(() => { const raw = localStorage.getItem('cpm-v3'); const p = raw ? JSON.parse(raw).player : {}; const o = {}; for (const kk of Object.keys(p)) { if (kk === 'savedAt') continue; const v = p[kk]; o[kk] = (v && typeof v === 'object') ? JSON.stringify(v).length + ':' + JSON.stringify(v).slice(0, 80) : v; } return { p: o, evt: (window.__CPM_TAP449 || {}).evt || 0 }; });
    const r = await page.evaluate((id) => window.__CPM_CAREER.apriImpulso(id), im.id);
    let opened = false;
    for (let w = 0; w < 15 && !opened; w++) { opened = await page.evaluate((pf) => Array.from(document.querySelectorAll('button')).some(b => (b.innerText || '').includes(pf)), pref); if (!opened) await sleep(200); }
    const before = await snap();
    const textBefore = await page.evaluate(() => document.body.innerText || '');
    const clicked = await page.evaluate((pf) => { const bs = Array.from(document.querySelectorAll('button')).filter(b => (b.innerText || '').includes(pf)); if (!bs.length) return false; bs[0].click(); return true; }, pref);
    await sleep(900);
    const after = await snap();
    const textAfter = await page.evaluate(() => document.body.innerText || '');
    const stillOpen = await page.evaluate((pf) => Array.from(document.querySelectorAll('button')).some(b => (b.innerText || '').includes(pf)), pref);
    const diff = {}; for (const kk of new Set([...Object.keys(before.p), ...Object.keys(after.p)])) if (JSON.stringify(before.p[kk]) !== JSON.stringify(after.p[kk])) diff[kk] = [before.p[kk], after.p[kk]];
    const bl = new Set(textBefore.split('\n')); const newLines = textAfter.split('\n').map(s => s.trim()).filter(s => s && !bl.has(s) && s.length < 160).slice(0, 12);
    const pre = {}; for (const f of ["morale","fatigue","form","popularity","coachTrust","value","bankBalance","teamChemistry","season","totalMatches","transferListed","investmentPending"]) pre[f] = before.p[f] === undefined ? null : before.p[f];
    res.push({ pre, id: im.id, cat: im.cat, k, txt: ch.txt, decl: ch.ef, bond: ch.bond, flag: ch.flag, apri: r, opened, clicked, closed: !stillOpen, applied: after.evt - before.evt, diff, newLines, errs: errs.slice(0, 2) });
  }
}
await ctx.close();
server.close(); await browser.close();
fs.writeFileSync(OUT, JSON.stringify(res, null, 1));
console.log(`fatti ${sel.length} impulsi · ${res.length} scelte · ${((Date.now()-t0)/1000).toFixed(0)} s`);
