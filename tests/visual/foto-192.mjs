#!/usr/bin/env node
/* [giro 192] FOTO PRIMA/DOPO delle quattro cerimonie (corpi 3D accesi, come sul telefono): premiazione di coppa (mister in cammino,
   coppa al capitano), serata di presentazione (stadio e nuovo acquisto), parata sul pullman. Telefono 375x812 e PC 1440x900.
   Uso: node foto-192.mjs <prima|dopo> [flag rossi separati da virgola]. Scrive docs/sviluppo/giro192/<tag>-*.jpg */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const TAG = process.argv[2] || 'prima'; const FLAGS = (process.argv[3] || '').split(',').filter(Boolean);
const OUT = '../../docs/sviluppo/giro192'; fs.mkdirSync(OUT, { recursive: true });
const FMT = (process.env.CPM_FMT || 'tel,pc').split(',').map(f => f === 'pc' ? { n: 'pc', w: 1440, h: 900 } : { n: 'tel', w: 375, h: 812 });
const SCENE = (process.env.CPM_SCENE || 'prem,pres,parata').split(',');
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const PRO = { id: 'liv', n: 'FC Merseyside', a: 'MER', p: 96, c: '#dc2626', c2: '#f5f5f5', nat: '🏴', lg: 'Premier Division' };
const save = { phase: 'career', player: { name: 'Leo Wade', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 15, week: 1, age: 24, ovr: 80,
  tutorialDone: true, campDone: true, jerseyNum: 9, jerseyNumSeason: 15, presidentModalSeason: 15, drawSeen: 15, mercatoSeen: 15, coachPactSeason: 15,
  presentedClub: PRO.id, presentSeason: 15, seasonPledge: { season: 15, tone: 'equilibrato' }, squadRole: 'titolare', club: PRO,
  stats: { 'velocità': 78, tecnica: 78, fisico: 76, 'mentalità': 76, tiro: 80, passaggio: 76, dribbling: 79, posizionamento: 78 },
  form: 80, morale: 72, fatigue: 25, coachTrust: 70, teamChemistry: 60, popularity: 45, bankBalance: 1e6, goals: 0, assists: 0, matches: 0,
  totalMatches: 90, totalGoals: 40, matchHistory: [], contract: { duration: 3, wage: 400000, expiresAtSeason: 18 } } };
const init = f => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; for (const k of f) window[k] = 1; };
const shot = async (p, nome) => { await p.screenshot({ path: `${OUT}/${TAG}-${nome}.jpg`, type: 'jpeg', quality: 80 }); console.log('foto', `${TAG}-${nome}.jpg`); };
for (const F of FMT) {
  if (SCENE.includes('prem')) {
    const p = await b.newPage({ viewport: { width: F.w, height: F.h } }); await installCdnRoutes(p); await p.addInitScript(init, FLAGS);
    await openMatch(p, port, { skipLoadAll: true, name: 'Foto192' });
    await p.waitForFunction(() => window.__CPM_GLB_READY, null, { timeout: 60000 }).catch(() => {}); await sleep(1500);
    await p.evaluate(() => window.__CPM_FORCE_CEREMONY({ name: 'COPPA NAZIONALE', kind: 'cup' }));
    await p.waitForFunction(() => window.__CPM_CER425 && window.__CPM_COACH77 && window.__CPM_COACH77.fr.some(f => f.glb === 1), null, { timeout: 60000 }).catch(() => {});
    const info = await p.evaluate(() => window.__CPM_CER425); const at = k => { const i = info.beats.indexOf(k); return info.beatsD.slice(0, i).reduce((a, x) => a + x, 0); };
    for (const [nome, t] of [['premiazione-mister', at('present') + 1.0], ['premiazione-coppa-inizio', at('present') + info.beatsD[info.beats.indexOf('present')] * 0.8], ['premiazione-capitano', at('captain') + 1.5], ['premiazione-alzata', at('lift') + 2.0]]) {
      await p.evaluate(t => { window.__CPM_CERT_SET = t; }, t); await sleep(2500); await shot(p, `${nome}-${F.n}`); }
    await p.close();
  }
  if (SCENE.includes('pres')) {
    const p = await b.newPage({ viewport: { width: F.w, height: F.h } }); await installCdnRoutes(p);
    await p.addInitScript(([o, f]) => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; for (const k of f) window[k] = 1; localStorage.setItem('cpm-v3', JSON.stringify(o)); localStorage.setItem('cpm-intro-seen', '1'); }, [save, FLAGS]);
    await p.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await p.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1500);
    try { await p.getByText('Continua', { exact: false }).first().click({ timeout: 4000 }); } catch (e) {}
    await p.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 25000 }); await sleep(900);
    for (const beat of [0, 3]) {
      await p.evaluate(bt => window.__CPM_CAREER.apriPresentazione(bt), beat);
      await p.waitForFunction(() => window.__CPM_PRES142 && window.__CPM_PRES142.men && window.__CPM_PRES142.men.length >= 2, null, { timeout: 60000 }).catch(() => {});
      await sleep(5000); await shot(p, `presentazione-beat${beat}-${F.n}`); }
    await p.close();
  }
  if (SCENE.includes('parata')) {
    const p = await b.newPage({ viewport: { width: F.w, height: F.h } }); await installCdnRoutes(p); await p.addInitScript(init, FLAGS);
    await p.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await p.waitForFunction(() => typeof window.__CPM_PARATA198_C === 'function', null, { timeout: 60000 });
    await p.evaluate(club => { document.body.innerHTML = '<div id="parata" style="position:fixed;inset:0"></div>';
      ReactDOM.createRoot(document.getElementById('parata')).render(React.createElement(window.__CPM_PARATA198_C, { club, euroWin: true, avatarId: 0, heroNum: 9 })); }, PRO);
    await p.waitForFunction(() => window.__CPM_PARATA && (window.__CPM_PARATA.cg23 || 0) >= 8, null, { timeout: 60000 }).catch(() => {});
    for (const [i, w] of [[0, 4000], [1, 5000], [2, 6000]]) { await sleep(w); await shot(p, `parata-${i}-${F.n}`); }
    await p.close();
  }
}
await b.close(); srv.close();
