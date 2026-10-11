/* GIRO 3, punto 3 — replay settimana per settimana della classifica del salvataggio 194.
   Modello: docs/rilascio/probe-rilascio-3s.mjs (stessi handler veri: __CPM_CAREER.step/get/startNewSeason).
   Fase 1: fixture save-194 (S1 W38) → un passo fino a fine stagione. Misura GF−GA a ogni passo.
   Fase 2: rollover → S2 da zero, si gioca l'intera stagione passo per passo, misurando per settimana:
     ΣGF, ΣGA, Δ=ΣGF−ΣGA, variazione di Δ nel passo, squadre che hanno giocato (Δpl=+1), squadre ferme (Δpl=0),
     partita del giocatore nella settimana (calendar.type==null). Riposo = numero DISPARI di squadre simulate
     (updateStandings: others esclude il giocatore; 17 → una squadra va in «bye», riga 1433-1441 in src/09). */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const FIX = new URL('./fixtures/save-194-primavera-w38.json', import.meta.url);
import fs from 'node:fs';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 160)));
const oldSave = fs.readFileSync(FIX, 'utf8');
await page.addInitScript(({ oldSave }) => {
  window.__CPM_GLB = false;
  if (sessionStorage.getItem('g3-seeded')) return; sessionStorage.setItem('g3-seeded', '1');
  localStorage.setItem('cpm-v3', oldSave);
}, { oldSave });
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 30000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 40000 });
await sleep(1500);
try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, { timeout: 20000 });
await sleep(1200);
const REC = () => {
  const C = window.__CPM_CAREER; const p = C.snapshot();
  const st = p.standings || [];
  return { s: p.season, w: p.week, lived: !!p.weekLived, screen: C.screen(), n: st.length,
    gf: st.reduce((a, t) => a + (t.gf || 0), 0), ga: st.reduce((a, t) => a + (t.ga || 0), 0),
    team: st.map(t => ({ k: t.id || t.n, pl: t.played || 0, gf: t.gf || 0, ga: t.ga || 0, pts: t.pts || 0 })),
    cal: (p.calendar || []).map(m => ({ w: m.week, md: m.matchday, type: m.type || null, pl: !!m.played, opp: m.opponentId })) };
};
const log = [];
const rows = [];
let iter = 0, stuck = 0, prevKey = '';
const doStep = async () => page.evaluate(() => { const C = window.__CPM_CAREER; const r = C.step(); C.dismiss(); return r; });
const scan = (b, a, phase) => {
  const dGF = a.gf - b.gf, dGA = a.ga - b.ga;
  const ids = new Map(b.team.map(t => [t.k, t]));
  let plus = 0, zero = 0, capped = 0;
  for (const t of a.team) { const o = ids.get(t.k); if (!o) continue; const d = t.pl - o.pl;
    if (d === 1) plus++; else if (d === 0) { if (o.pl >= 34) capped++; else zero++; } }
  const wk = b.w;
  const pl = (b.cal.filter(c => c.w === wk && c.type == null && c.opp != null)).length;
  const plDone = a.cal.some(c => c.w === wk && c.type == null && c.pl && !b.cal.find(x => x.w === c.w && x.md === c.md && x.pl));
  const unc = b.team.filter(t => t.pl < 34).length;
  return { unc, phase, s: b.s, w: b.w, w2: a.w, s2: a.s, res: null, gf: a.gf, ga: a.ga, d: a.gf - a.ga, dD: (a.gf - a.ga) - (b.gf - b.ga), dGF, dGA, plus, zero, capped, pl, plDone, n: a.n };
};
let cur = await page.evaluate(REC);
const rec0 = cur;
log.push(`start S${cur.s}W${cur.w} n=${cur.n} GF=${cur.gf} GA=${cur.ga} D=${cur.gf - cur.ga}`);
let phase = 'F1';
let seasonEnds = 0;
while (iter++ < 400) {
  const before = cur;
  if (before.screen === 'proTransition') {
    // stessa scelta del probe (probe-rilascio-3s.mjs): la prima offerta che accetta/firma
    const btns = await page.evaluate(() => [...document.querySelectorAll('button')].map(b => (b.innerText || '').trim()).filter(Boolean));
    const ix = btns.findIndex(t => /firm|accett|scegli|sì|si,|prosegu|continu/i.test(t));
    const sel = ix >= 0 ? btns[ix] : btns[0];
    if (sel) await page.getByRole('button', { name: sel, exact: false }).first().click({ timeout: 5000 }).catch(() => {});
    log.push(`transizione U18→pro a S${before.s}W${before.w}: scelta «${(sel || '').slice(0, 60)}»`);
    await sleep(700); cur = await page.evaluate(REC);
    rows.push({ ...scan(before, cur, 'PRO'), res: 'pro-transition' });
    log.push(`dopo transizione: S${cur.s}W${cur.w} n=${cur.n} GF=${cur.gf} GA=${cur.ga} D=${cur.gf - cur.ga}`);
    continue;
  }
  if (before.w > 38 && before.screen === 'seasonAwards') {
    // save U18: a fine stagione il gioco apre la cerimonia; il suo onContinue (18-career-app.jsx:5779) va a seasonEnd
    await page.evaluate(() => window.__CPM_CAREER.goScreen('seasonEnd')); await sleep(250);
    cur = await page.evaluate(REC); log.push(`cerimonia (seasonAwards) → seasonEnd a S${cur.s}W${cur.w}`);
    continue;
  }
  if (before.screen === 'seasonEnd' || before.screen === 'seasonAwards') {
    // fine stagione: rollover, poi si entra in fase 2
    if (phase === 'F1') {
      log.push(`F1 fine S${before.s}: GF=${before.gf} GA=${before.ga} D=${before.gf - before.ga} (standings letti prima del rollover)`);
      const ok = await page.evaluate(() => window.__CPM_CAREER.startNewSeason());
      if (ok !== true) { log.push('startNewSeason fallita: ' + ok); break; }
      await sleep(300); await page.evaluate(() => window.__CPM_CAREER.dismiss());
      cur = await page.evaluate(REC);
      rows.push({ ...scan(before, cur, 'ROLLOVER'), res: 'rollover' });
      log.push(`rollover → S${cur.s}W${cur.w} n=${cur.n} GF=${cur.gf} GA=${cur.ga} D=${cur.gf - cur.ga}`);
      phase = 'F2'; continue;
    }
    seasonEnds++; log.push(`F2 fine S${before.s}: GF=${before.gf} GA=${before.ga} D=${before.gf - before.ga}`);
    break;
  }
  const res = await doStep();
  await sleep(60);
  cur = await page.evaluate(REC);
  if (typeof res === 'string' && res.startsWith('blocked:')) { await page.evaluate(() => window.__CPM_CAREER.clearTournaments()); continue; }
  if (typeof res === 'string' && res.startsWith('error:')) { log.push(`ERRORE passo ${iter}: ${res}`); break; }
  const row = { ...scan(before, cur, phase), res };
  if (row.dD !== 0 || row.w !== row.w2 || before.w !== cur.w || row.dGF || row.dGA || res === 'advanced' || res === 'simulated') rows.push(row);
  const key = `${cur.s}/${cur.w}/${cur.lived}/${cur.gf}/${cur.screen}`;
  if (key === prevKey) { if (++stuck > 8) { log.push('BLOCCO ' + key + ' res=' + res); break; } } else stuck = 0;
  prevKey = key;
  if (cur.s >= 3) { log.push('raggiunta S3: stop'); break; }
}
const finalRec = cur;
log.push(`fine run: S${finalRec.s}W${finalRec.w} GF=${finalRec.gf} GA=${finalRec.ga} D=${finalRec.gf - finalRec.ga} passi=${iter}`);
console.log('══ GIRO3 CLASSIFICA 194 · replay settimanale ══');
log.forEach(l => console.log('  ' + l));
console.log('  passo | fase | S W→W2 | res | ΣGF | ΣGA | Δ | variazione Δ | ΔGF | ΔGA | giocano(+1) | ferme(0) | tappate(34) | non tappate prima | pl.giocatore');
rows.forEach((r, i) => console.log(`  ${String(i).padStart(3)} | ${r.phase} | S${r.s} W${r.w}→W${r.w2} | ${String(r.res).padEnd(9)} | ${r.gf} | ${r.ga} | ${r.d} | ${r.dD >= 0 ? '+' : ''}${r.dD} | ${r.dGF} | ${r.dGA} | ${r.plus} | ${r.zero} | ${r.capped} | ${r.unc} | ${r.pl}`));
// rilettura: JSON con tutte le righe per l'analisi
fs.writeFileSync(new URL('./giro3-rows.json', import.meta.url), JSON.stringify({ log, rows, rec0 }, null, 1));
console.log('  pageerror: ' + errors.length + (errors.length ? ' → ' + errors.slice(0, 3).join(' | ') : ''));
await browser.close(); srv.close(); process.exit(0);
