#!/usr/bin/env node
/* [giro 153, PO-356] SONDA DI MISURA (non guardiano, non gate): com'e' oggi la prima stagione in Primavera.
   Gioca una stagione U18 intera sugli handler VERI (__CPM_CAREER.step) per tre profili (OVR 58/66/74) e
   registra, settimana per settimana: partita in calendario si/no, righe di diario/log nuove, offerte e saghe
   di mercato, convocazioni; a fine stagione le offerte di ProTransitionScreen (generateProContracts).
   Uso: CPM_CHROME=/opt/pw-browsers/chromium node primavera-misura-153.mjs [ovr...]  → out/primavera-153.json */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import fs from 'fs';
const PROFILES = (process.argv.slice(2).map(Number).filter(Boolean));
const OVRS = PROFILES.length ? PROFILES : [58, 66, 74];
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const all = [];
for (const ovr of OVRS) {
  const page = await browser.newPage({ viewport: { width: 900, height: 900 } });
  await installCdnRoutes(page);
  const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 160)));
  await page.addInitScript((ovr) => {
    window.__CPM_GLB = false; window.__CPM_SIM_NAT = 1;
    const s = Math.round(ovr);
    const save = { phase: 'career', player: { name: 'Sonda Primavera ' + ovr, nation: 'Italia', avatarId: 0, proStatus: 'u18', season: 1, week: 1, age: 17, ovr, tutorialDone: true, position: 'ATT',
      club: { id: 'milan', n: 'AC Dorvelli Primavera', a: 'ACR', p: 78, c: '#dc2626', c2: '#0f0f0f', nat: '🇮🇹', lg: 'Primavera 1', isU18: true },
      stats: { 'velocità': s, tecnica: s, fisico: s, 'mentalità': s, tiro: s + 2, passaggio: s, dribbling: s, posizionamento: s },
      form: 70, morale: 72, fatigue: 10, contract: { duration: 1, wage: 200 } } };
    localStorage.setItem('cpm-v3', JSON.stringify(save));
  }, ovr);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 30000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 40000 });
  await sleep(1500);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, { timeout: 20000 });
  await sleep(1200);
  const s0 = await page.evaluate(() => { const p = window.__CPM_CAREER.snapshot(); return { cal: (p.calendar || []).map(m => ({ md: m.matchday, w: m.week, t: m.type || 'lega' })), nStand: (p.standings || []).length, lg: p.club && p.club.lg }; });
  const weeks = []; let iter = 0, end = null, prevLog = null, prevDiary = null;
  while (iter++ < 260) {
    const r = await page.evaluate(() => {
      const C = window.__CPM_CAREER; const before = C.snapshot();
      const md = C.thisWeekMd();
      if (C.get().screen === 'proTransition') return { res: 'seasonEnd', scr: 'proTransition', w: before.week, s: before.season, log: [] };
      const res = C.step();
      const after = C.snapshot();
      const ui = document.body.innerText.slice(0, 0);
      return { res, w: before.week, s: before.season, md, log: (after.log || []).slice(0, 8), diary: (after.diary || []).length,
        saga: after.transferSaga ? { w: after.transferSaga.week, club: after.transferSaga.club, del: !!after.transferSaga.delivered } : null,
        pro: after.proStatus, club: after.club && (after.club.n || after.club.name), g: after.goals || 0, m: after.matches || 0, ovr: after.ovr,
        nat: !!(after.nationsCupQueue && after.nationsCupQueue.active), em: !!(after.euroMondiale && after.euroMondiale.active),
        cup: after.cup ? { active: !!after.cup.active, round: after.cup.round || after.cup.currentRound || null, elim: !!after.cup.eliminated } : null };
    });
    await sleep(260);
    r.modal = await page.evaluate(() => { const m = document.querySelector('[data-cpm="settimana23"]');
      const t = m ? m.innerText.replace(/\s+/g, ' ').slice(0, 140) : null;
      const nb = m ? m.querySelectorAll('button').length : 0; window.__CPM_CAREER.dismiss(); return t ? { t, nb } : null; });
    if (r.res === 'seasonEnd' || r.scr === 'proTransition') {
      end = await page.evaluate(() => { const p = window.__CPM_CAREER.snapshot();
        let pc = null; try { pc = generateProContracts(p); } catch (e) { pc = 'err:' + e.message; }
        const st = [...(p.standings || [])].sort((a, b) => b.pts - a.pts);
        return { season: p.season, week: p.week, goals: p.goals, assists: p.assists, matches: p.matches, ovr: p.ovr, u18Seasons: p.u18Seasons, pro: p.proStatus,
          pos: st.findIndex(t => t.id === (p.club && p.club.id)) + 1, awards: (p.awards || []).map(a => a.type),
          offers: pc && pc.offers ? pc.offers.map(o => ({ id: o.id, club: o.club && (o.club.n || o.club.name), lg: o.club && o.club.lg, type: o.contractType, stay: !!o.isStayU18, nc: !!o.isNonConfirmed })) : pc, perf: pc && pc.perf };
      });
      break;
    }
    if (r.res && r.res.startsWith('error:')) { weeks.push(r); break; }
    if (r.res && r.res.startsWith('blocked:')) { await page.evaluate(() => window.__CPM_CAREER.clearTournaments()); }
    const newLog = prevLog ? r.log.filter(x => !prevLog.includes(x)) : r.log;
    weeks.push({ modal: r.modal, res: r.res, s: r.s, w: r.w, md: r.md ? (r.md.type || 'lega') + ':' + r.md.opp : null, newLog, dDiary: prevDiary == null ? 0 : r.diary - prevDiary, saga: r.saga, pro: r.pro, club: r.club, g: r.g, m: r.m, ovr: r.ovr, nat: r.nat, em: r.em, cup: r.cup });
    prevLog = r.log; prevDiary = r.diary;
    if (r.pro === 'pro') { /* salto a pro a meta' stagione: lo registriamo e continuiamo */ }
  }
  const steps = weeks.length;
  const mdWeeks = new Set(weeks.filter(x => x.md).map(x => x.w)).size;
  all.push({ ovr, cal0: s0, steps, mdWeeks, weeks, end, errors });
  console.log(`OVR ${ovr}: calendario ${s0.cal.length} gare (${s0.cal.filter(c => c.t === 'lega').length} lega) · ${s0.nStand} squadre · settimane con gara ${mdWeeks} · fine: ${end ? `S${end.season} pos ${end.pos} ${end.goals}g/${end.matches}p ovr ${end.ovr} perf ${end.perf} offerte ${JSON.stringify((end.offers || []).map(o => o.id + (o.nc ? '(nc)' : '')))}` : 'NON RAGGIUNTA'} · errori ${errors.length}`);
  await page.close();
}
fs.mkdirSync('out', { recursive: true });
fs.writeFileSync('out/primavera-153.json', JSON.stringify(all, null, 1));
await browser.close(); srv.close();
