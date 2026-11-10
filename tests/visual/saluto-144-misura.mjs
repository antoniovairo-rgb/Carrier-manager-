#!/usr/bin/env node
/* [giro 144 PO-347] SONDA DI MISURA del saluto del chiamato (GLB acceso, serata di presentazione). Per il beat dato campiona nel
   tempo di scena (el): chi e' avanti (z massima), la mano destra e sinistra rispetto alla spalla (m), il verso del palmo rispetto
   allo sguardo del corpo (coseno), e la z di ogni corpo. Uso: node saluto-144-misura.mjs [beat] (CPM_ROSSO=1 → __CPM_NO_G144S). */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
export async function campionaSaluto(page, beat, durMs = 90000) {
  await page.evaluate(b => window.__CPM_CAREER.apriPresentazione(b), beat);
  await page.waitForFunction(() => window.__CPM_PRES142 && window.__CPM_PRES142.men && window.__CPM_PRES142.men.length >= 2, null, { timeout: 60000 });
  return page.evaluate(async (dur) => {
    const P = window.__CPM_PRES142, T = window.THREE, va = new T.Vector3(), vb = new T.Vector3(), vc = new T.Vector3(), S = [];
    const ossa = P.men.map(m => { const B = {}; m.traverse(o => { if (o.isBone && /^(upperarm_[lr]|hand_[lr]|middle_01_r|index_01_r|pinky_01_r)$/.test(o.name)) B[o.name] = o; }); return B; });
    { const tw = performance.now(); while ((P.t144 || 0) >= 1 && performance.now() - tw < 20000) await new Promise(r => setTimeout(r, 50)); }
    const t0 = performance.now(), el0 = P.el;
    while (performance.now() - t0 < dur && !((P.t144 || 0) >= 6.0)) {
      const z = P.men.map(m => +m.position.z.toFixed(3)); let k = 0; z.forEach((v, i) => { if (v > z[k]) k = i; });
      const m = P.men[k], B = ossa[k]; m.updateMatrixWorld(true);
      const W = (n, v) => B[n].getWorldPosition(v);
      const mr = W('hand_r', va).y - W('upperarm_r', vb).y, ml = W('hand_l', va).y - W('upperarm_l', vb).y;
      /* palmo: (polso→medio) x (indice→mignolo); sguardo del corpo = su x destra */
      W('upperarm_r', va); W('upperarm_l', vb); const dx = va.clone().sub(vb); dx.y = 0; dx.normalize(); const fwd = new T.Vector3(0, 1, 0).cross(dx).normalize();
      W('hand_r', va); W('middle_01_r', vb); const a = vb.clone().sub(va); W('index_01_r', va); W('pinky_01_r', vc); const b = vc.clone().sub(va);
      const n = a.clone().cross(b).normalize();
      S.push({ el: +(P.el - el0).toFixed(3), avanti: k, pi: P.pi144 != null ? P.pi144 : null, t: P.t144 != null ? +P.t144.toFixed(2) : null, w: P.w144 != null ? +P.w144.toFixed(2) : null, eroe: P.HERO, z, mr: +mr.toFixed(3), ml: +ml.toFixed(3), palmo: +n.dot(fwd).toFixed(2), pz: +m.position.z.toFixed(2) });
      await new Promise(r => setTimeout(r, 90));
    }
    return S;
  }, durMs);
}
export const SAVE = { phase: 'career', player: {
  name: 'Presenta Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 4, week: 1, age: 24, ovr: 80,
  tutorialDone: true, campDone: true, jerseyNum: 9, jerseyNumSeason: 4, presidentModalSeason: 4,
  drawSeen: 4, mercatoSeen: 4, coachPactSeason: 4, presentedClub: 'parm', presentSeason: 4,
  seasonPledge: { season: 4, tone: 'equilibrato' }, squadRole: 'titolare', club: { id: 'parm', n: 'FC Parmense', a: 'PAR', p: 62, c: '#facc15', c2: '#2563eb', nat: '🇮🇹', lg: 'Lega A' },
  stats: { 'velocità': 78, tecnica: 78, fisico: 76, 'mentalità': 76, tiro: 80, passaggio: 76, dribbling: 79, posizionamento: 78 },
  form: 80, morale: 72, fatigue: 25, coachTrust: 70, teamChemistry: 60, popularity: 45, bankBalance: 1e6,
  goals: 0, assists: 0, matches: 0, totalMatches: 90, totalGoals: 40, matchHistory: [], contract: { duration: 3, wage: 400000, expiresAtSeason: 8 } } };
export async function apriCarriera(page, port, rosso) {
  await page.addInitScript(([o, r]) => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; if (r) window.__CPM_NO_G144S = 1;
    localStorage.setItem('cpm-v3', JSON.stringify(o)); localStorage.setItem('cpm-intro-seen', '1'); }, [SAVE, rosso]);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1500); try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 4000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 25000 }); await sleep(900);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const srv = await startServer(); const browser = await launchBrowser();
  const page = await browser.newPage({ viewport: { width: 360, height: 800 } }); await installCdnRoutes(page);
  await apriCarriera(page, srv.address().port, !!process.env.CPM_ROSSO);
  for (const b of (process.argv[2] || '3,7').split(',')) {
    const S = await campionaSaluto(page, +b, +(process.env.DUR || 90000));
    console.log('beat ' + b + ' corpi ' + S[0].z.length + ' eroe ' + S[0].eroe);
    S.filter((_, i) => i % 4 === 0).forEach(s => console.log(`  el ${s.el} avanti #${s.avanti} pi ${s.pi} t ${s.t} w ${s.w} z ${s.pz} manoDx-spalla ${s.mr} manoSx ${s.ml} palmo ${s.palmo}`));
  }
  await browser.close(); srv.close();
}
