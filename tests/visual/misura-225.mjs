#!/usr/bin/env node
/* [giro 225 · PO-489] SONDA di misura della serata di presentazione: foto (telefono 375x812 e PC 1280x720), tifo (istanze della folla
   della partita / tifosi dipinti), colori di pelle e capelli resi contro la figurina, quota dei piedi di ogni corpo per tutta la scena,
   geometria del braccio del saluto, fascia in basso al battito 0. Uso: node misura-225.mjs [flag,flag]  (CPM_OUT=prefisso delle foto) */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import fs from 'node:fs';
fs.mkdirSync('out', { recursive: true });
const FLAGS = (process.argv[2] || '').split(',').filter(Boolean);
const OUT = process.env.CPM_OUT || 'out/m225';
const PRO = { id: 'liv', n: 'FC Merseyside', a: 'MER', p: 96, c: '#dc2626', c2: '#f5f5f5', nat: '🏴', lg: 'Premier Division' };
export const save = { phase: 'career', player: { name: 'Leo Wade', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 16, week: 1, age: 24, ovr: 80,
  tutorialDone: true, campDone: true, jerseyNum: 9, jerseyNumSeason: 16, presidentModalSeason: 16, drawSeen: 16, mercatoSeen: 16, coachPactSeason: 16,
  presentedClub: PRO.id, presentSeason: 16, seasonPledge: { season: 16, tone: 'equilibrato' }, squadRole: 'titolare', club: PRO,
  stats: { 'velocità': 78, tecnica: 78, fisico: 76, 'mentalità': 76, tiro: 80, passaggio: 76, dribbling: 79, posizionamento: 78 },
  form: 80, morale: 72, fatigue: 25, coachTrust: 70, teamChemistry: 60, popularity: 45, bankBalance: 1e6, goals: 0, assists: 0, matches: 0,
  totalMatches: 90, totalGoals: 40, matchHistory: [], contract: { duration: 3, wage: 400000, expiresAtSeason: 19 } } };
export async function apri(b, port, flags, vp) {
  const p = await b.newPage({ viewport: vp || { width: 375, height: 812 } }); await installCdnRoutes(p);
  p.on('pageerror', e => console.log('PAGEERROR', String(e).slice(0, 200)));
  await p.addInitScript(([o, f]) => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; for (const k of f) window[k] = 1; localStorage.setItem('cpm-v3', JSON.stringify(o)); localStorage.setItem('cpm-intro-seen', '1'); }, [save, flags]);
  await p.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await p.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1500);
  try { await p.getByText('Continua', { exact: false }).first().click({ timeout: 4000 }); } catch (e) {}
  await p.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 25000 }); await sleep(900);
  try { await p.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  return p;
}
export const corpi = (p) => p.waitForFunction(() => window.__CPM_PRES142 && window.__CPM_PRES142.men && window.__CPM_PRES142.men.length >= 2, null, { timeout: 90000 }).catch(() => {});
/* un campione: per ogni uomo quota minima dei piedi (ossa foot/ball), z, e geometria del braccio destro */
export const campione = (p) => p.evaluate(() => { const P = window.__CPM_PRES142, T = window.THREE; if (!P) return null; const v = new T.Vector3();
  const men = P.men.map((m, i) => { m.updateMatrixWorld(true); const B = m.userData._b225 || (m.userData._b225 = (() => { const o = {}; m.traverse(x => { if (x.isBone) o[x.name] = x; }); return o; })());
    const W = n => { if (!B[n]) return null; B[n].getWorldPosition(v); return [v.x, v.y, v.z]; };
    const fl = W('foot_l'), fr = W('foot_r'), bl = W('ball_l'), br = W('ball_r'), pe = W('pelvis'), uR = W('upperarm_r'), uL = W('upperarm_l'), lR = W('lowerarm_r'), hR = W('hand_r'), ne = W('neck_01'), s3 = W('spine_03');
    const ang = (a, c, d) => { const x = [a[0] - c[0], a[1] - c[1], a[2] - c[2]], y = [d[0] - c[0], d[1] - c[1], d[2] - c[2]]; return Math.acos(Math.max(-1, Math.min(1, (x[0] * y[0] + x[1] * y[1] + x[2] * y[2]) / Math.hypot(...x) / Math.hypot(...y)))) * 180 / Math.PI; };
    return { i, z: +m.position.z.toFixed(3), y: +m.position.y.toFixed(3), piedeMin: +Math.min(bl[1], br[1]).toFixed(3), ballL: +bl[1].toFixed(3), ballR: +br[1].toFixed(3), footL: +fl[1].toFixed(3), footR: +fr[1].toFixed(3), footLz: +fl[2].toFixed(3), footRz: +fr[2].toFixed(3),
      gomR: +ang(uR, lR, hR).toFixed(1), spallaR: +ang(lR, uR, [uR[0], uR[1] - 1, uR[2]]).toFixed(1), manoX: +(hR[0] - pe[0]).toFixed(3), manoY: +(hR[1] - uR[1]).toFixed(3), manoZ: +(hR[2] - pe[2]).toFixed(3), uRx: +(uR[0] - pe[0]).toFixed(3), uLx: +(uL[0] - pe[0]).toFixed(3) }; });
  return { t: +(P.t144 || 0).toFixed(2), el: +(P.el || 0).toFixed(2), chi: P.pi144, w: +(P.w144 || 0).toFixed(2), men }; });
if (import.meta.url === `file://${process.argv[1]}`) {
  const srv = await startServer(); const b = await launchBrowser(); const port = srv.address().port;
  const soloFoto = !!process.env.CPM_FOTO;
  for (const [nome, vp] of [['tel', { width: 375, height: 812 }], ['pc', { width: 1280, height: 720 }]]) {
    const p = await apri(b, port, FLAGS, vp);
    await p.evaluate(() => window.__CPM_CAREER.apriPresentazione(0)); await corpi(p); await sleep(2500);
    await p.screenshot({ path: `${OUT}-${nome}-b0.png` });
    const folla = await p.evaluate(() => { const S = window.__CPM_PRES_SCENE; let f129 = 0, vis = null; S && S.traverse(o => { if (o.name === 'folla129') { f129 = o.count; vis = o.visible; } }); return { pres192: window.__CPM_PRES192 || null, f129, vis, FOLLA129: window.__CPM_FOLLA129 || null }; });
    console.log(nome, 'tifo', JSON.stringify(folla));
    await p.evaluate(() => window.__CPM_CAREER.apriPresentazione(1)); await sleep(3500); await p.screenshot({ path: `${OUT}-${nome}-b1.png` });
    if (nome === 'tel' || !soloFoto) {
      await p.evaluate(() => window.__CPM_CAREER.apriPresentazione(3)); const S = []; let foto = { 1.2: 0, 2.4: 0, 3.9: 0, 5.0: 0, 6.5: 0 };
      for (let k = 0; k < 400; k++) { const c = await campione(p); if (c) { S.push(c); for (const q in foto) if (!foto[q] && c.t >= +q) { foto[q] = 1; await p.screenshot({ path: `${OUT}-${nome}-b3-t${q}.png` }); } if (c.t > 8) break; } await sleep(60); }
      if (nome === 'tel') { const chi = S[S.length - 1].chi;
        const perUomo = S[0].men.map((_, i) => { const a = S.map(s => s.men[i].piedeMin); return { i, min: Math.min(...a), max: Math.max(...a) }; });
        console.log('PIEDI (quota minima delle punte, per uomo, su', S.length, 'campioni):', JSON.stringify(perUomo));
        console.log('CHIAMATO', chi, 't  z  piedeMin  footLz-z  footRz-z  ballL ballR | gomR spallaR manoX manoY manoZ');
        let prev = -1; for (const s of S) { if (s.t - prev < 0.2) continue; prev = s.t; const m = s.men[chi]; console.log(s.t.toFixed(2), m.z, m.piedeMin, (m.footLz - m.z).toFixed(3), (m.footRz - m.z).toFixed(3), m.ballL, m.ballR, '|', m.gomR, m.spallaR, m.manoX, m.manoY, m.manoZ, 'w', s.w); }
        fs.writeFileSync(`${OUT}-serie.json`, JSON.stringify(S)); }
    }
    await p.close();
  }
  await b.close(); srv.close();
}
