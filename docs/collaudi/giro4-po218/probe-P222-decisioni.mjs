#!/usr/bin/env node
/* GIRO 4 · PO-222 (parte pura) · distribuzione delle decisioni prepartita su 30 varianti del giocatore COMPLETO.
   Nessuna partita giocata: calcCoachDecision(giocatore, 1) — funzione del gioco — su 30 stati derivati dal salvataggio 190
   (fiducia, forma, fatica, ruolo, ovr variati con passo deterministico). ⚠️ Sono varianti di un salvataggio, non carriere diverse. */
import fs from 'node:fs';
import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, sleep } from '/tmp/cpm157/tests/visual/lib/harness.mjs';

const FIX = '/tmp/cpm157/tests/visual/fixtures';
const outDir = process.argv[2] || '.';
fs.mkdirSync(outDir, { recursive: true });
const save = JSON.parse(fs.readFileSync(path.join(FIX, 'save-190-s12-ovr93.json'), 'utf8'));
const sv = JSON.parse(JSON.stringify(save));
const srv = await startServer(); const b = await launchBrowser();
const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage();
await installCdnRoutes(page);
await page.addInitScript(([s]) => { window.__CPM_GLB = false; window.__CPM_PRESENT = 1; localStorage.setItem('cpm-v3', JSON.stringify(s)); }, [sv]);
await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 });
await sleep(1500);
const res = await page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('cpm-v3')); const base = s.player || s;
  if (typeof calcCoachDecision !== 'function') return { errore: 'calcCoachDecision non globale' };
  const ruoli = ['leader', 'titolare', 'rotazione', 'riserva', 'primavera'];
  const out = [];
  for (let i = 0; i < 30; i++) {
    const v = { ...base, coachTrust: 3 + ((i * 37) % 96), form: 35 + ((i * 23) % 58), fatigue: (i * 41) % 96,
      squadRole: ruoli[(i * 3) % ruoli.length], ovr: 55 + ((i * 11) % 31) };
    const d = calcCoachDecision(v, 1);
    out.push({ i, trust: v.coachTrust, form: v.form, fatigue: v.fatigue, squadRole: v.squadRole, ovr: v.ovr, decisione: d.status, entryMinute: d.entryMinute ?? null });
  }
  return { base: { coachTrust: base.coachTrust, squadRole: base.squadRole, ovr: base.ovr, club: base.club && base.club.n }, out };
});
fs.writeFileSync(path.join(outDir, 'P222-decisioni-30.json'), JSON.stringify(res, null, 1));
if (res.errore) console.log('ERRORE', res.errore);
else { const c = {}; for (const r of res.out) c[r.decisione] = (c[r.decisione] || 0) + 1; console.log('30 varianti · decisioni', JSON.stringify(c)); }
await ctx.close(); await b.close(); srv.close();
