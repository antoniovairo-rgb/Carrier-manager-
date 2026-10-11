// Probe giro 6: la migration REALE (__CPM_MIGRATE) rimappa i nomi club sulla fixture save-190 (non sintetica)
import { startServer, launchBrowser, installCdnRoutes } from './lib/harness.mjs';
import fs from 'node:fs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url), 'utf8'));
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
try {
  const page = await browser.newPage();
  await installCdnRoutes(page);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 30000 });
  await page.waitForFunction(() => typeof window.__CPM_MIGRATE === 'function', { timeout: 40000 });
  const out = await page.evaluate((s) => {
    const p0 = s.player || s;
    const M = window.__CPM_MIGRATE;
    const m1r = M(JSON.parse(JSON.stringify(p0)));
    const m1 = m1r.player || m1r;
    const m2r = M(JSON.parse(JSON.stringify(m1)));
    const m2 = m2r.player || m2r;
    const oldNames = /FC (Nerazzurri|Partenope|Paris|Granata|Viola|Biancoceleste|München|Perico|Celeste|Köln|Azulón|Leões|Verdiblanco)|AC Rossoneri|Blucerchiati|Neroverde/;
    const count = (p) => [p.club && p.club.n, ...(p.standings||[]).map(t=>t.n), ...(p.calendar||[]).map(c=>c.opponentName)].filter(n => oldNames.test(n||'')).length;
    const keys = Object.keys(m1).filter(k => JSON.stringify(m1[k]) !== JSON.stringify(m2[k]));
    const oldIn = (p) => ({club: p.club&&p.club.n, cal: (p.calendar||[]).filter(c=>oldNames.test(c.opponentName||'')).length, st: (p.standings||[]).filter(t=>oldNames.test(t.n||'')).length});
    return { before: oldIn(p0), after: oldIn(m1), idem: keys.length===0, diffKeys: keys.slice(0,6), clubAfter: m1.club && m1.club.n,
      calLen: (m1.calendar||[]).length, sampleCal: (m1.calendar||[]).map(c=>c.opponentName).filter(Boolean).slice(0,3) };
  }, save);
  console.log(JSON.stringify(out));
} finally { await browser.close(); srv.close(); }
