#!/usr/bin/env node
/* [giro 192 · PO-406] SONDA: serata di presentazione, corpi 3D. Per ogni uomo della fila e per il chiamato nel tempo:
   spalle avanti (punto medio delle spalle davanti al bacino, lungo l'avanti del corpo), inclinazione busto e testa dalla verticale,
   e per il braccio destro del chiamato: gomito (gradi), mano sopra la spalla, mano davanti al corpo. Tifosi: istanze folla129 e
   tifosi dipinti nelle tele degli spalti (__CPM_PRES192). Uso: node misura-pres-192.mjs [flag,flag] */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const FLAGS = (process.argv[2] || '').split(',').filter(Boolean);
const PRO = { id: 'liv', n: 'FC Merseyside', a: 'MER', p: 96, c: '#dc2626', c2: '#f5f5f5', nat: '🏴', lg: 'Premier Division' };
const save = { phase: 'career', player: { name: 'Leo Wade', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 15, week: 1, age: 24, ovr: 80,
  tutorialDone: true, campDone: true, jerseyNum: 9, jerseyNumSeason: 15, presidentModalSeason: 15, drawSeen: 15, mercatoSeen: 15, coachPactSeason: 15,
  presentedClub: PRO.id, presentSeason: 15, seasonPledge: { season: 15, tone: 'equilibrato' }, squadRole: 'titolare', club: PRO,
  stats: { 'velocità': 78, tecnica: 78, fisico: 76, 'mentalità': 76, tiro: 80, passaggio: 76, dribbling: 79, posizionamento: 78 },
  form: 80, morale: 72, fatigue: 25, coachTrust: 70, teamChemistry: 60, popularity: 45, bankBalance: 1e6, goals: 0, assists: 0, matches: 0,
  totalMatches: 90, totalGoals: 40, matchHistory: [], contract: { duration: 3, wage: 400000, expiresAtSeason: 18 } } };
export async function apri(b, port, flags) {
  const p = await b.newPage({ viewport: { width: 375, height: 812 } }); await installCdnRoutes(p);
  await p.addInitScript(([o, f]) => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; for (const k of f) window[k] = 1; localStorage.setItem('cpm-v3', JSON.stringify(o)); localStorage.setItem('cpm-intro-seen', '1'); }, [save, flags]);
  await p.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await p.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1500);
  try { await p.getByText('Continua', { exact: false }).first().click({ timeout: 4000 }); } catch (e) {}
  await p.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 25000 }); await sleep(900);
  try { await p.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  return p;
}
export async function posa(p, beat) {
  await p.evaluate(bt => window.__CPM_CAREER.apriPresentazione(bt), beat);
  await p.waitForFunction(() => window.__CPM_PRES142 && window.__CPM_PRES142.men && window.__CPM_PRES142.men.length >= 2, null, { timeout: 60000 }).catch(() => {});
  const out = [];
  for (let k = 0; k < 10; k++) { await sleep(500);
    out.push(await p.evaluate(() => { const P = window.__CPM_PRES142, T = window.THREE; if (!P) return null; const v = new T.Vector3(), cam = P.scene && null;
      const res = P.men.map((m, i) => { const B = {}; m.updateMatrixWorld(true); m.traverse(o => { if (o.isBone) B[o.name] = o; });
        const W = n => { if (!B[n]) return null; B[n].getWorldPosition(v); return [v.x, v.y, v.z]; };
        const pe = W('pelvis'), ne = W('neck_01'), he = W('head'), uL = W('upperarm_l'), uR = W('upperarm_r'), lR = W('lowerarm_r'), hR = W('hand_r'), bl = W('ball_l'), br = W('ball_r');
        if (!pe || !ne || !uL) return null;
        let fx = (bl[0] + br[0]) / 2 - pe[0], fz = (bl[2] + br[2]) / 2 - pe[2]; const fl = Math.hypot(fx, fz) || 1; fx /= fl; fz /= fl;
        const sm = [(uL[0] + uR[0]) / 2, (uL[1] + uR[1]) / 2, (uL[2] + uR[2]) / 2];
        const ang = (a, b) => { const d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]]; return Math.acos(d[1] / Math.hypot(...d)) * 180 / Math.PI; };
        const avanti = (q) => (q[0] - pe[0]) * fx + (q[2] - pe[2]) * fz;
        const gom = (lR && hR) ? (() => { const a = [uR[0] - lR[0], uR[1] - lR[1], uR[2] - lR[2]], c = [hR[0] - lR[0], hR[1] - lR[1], hR[2] - lR[2]]; return Math.acos((a[0] * c[0] + a[1] * c[1] + a[2] * c[2]) / Math.hypot(...a) / Math.hypot(...c)) * 180 / Math.PI; })() : null;
        const lL = W('lowerarm_l'), hL = W('hand_l');
        const gomL = (lL && hL) ? (() => { const a = [uL[0] - lL[0], uL[1] - lL[1], uL[2] - lL[2]], c = [hL[0] - lL[0], hL[1] - lL[1], hL[2] - lL[2]]; return Math.acos((a[0] * c[0] + a[1] * c[1] + a[2] * c[2]) / Math.hypot(...a) / Math.hypot(...c)) * 180 / Math.PI; })() : null;
        const shr = q => Math.atan2(q[1] - ne[1], Math.hypot(q[0] - ne[0], q[2] - ne[2])) * 180 / Math.PI;
        return { i, spalleSu: +((shr(uL) + shr(uR)) / 2).toFixed(1), gomL: gomL != null ? +gomL.toFixed(1) : null, manoAvantiL: +(avanti(hL) - avanti(uL)).toFixed(3), spalleAvanti: +avanti(sm).toFixed(3), testaAvanti: +(avanti(he) - avanti(ne)).toFixed(3), busto: +ang(pe, ne).toFixed(1), testa: +ang(ne, he).toFixed(1),
          gomR: gom != null ? +gom.toFixed(1) : null, manoSuSpalla: +(hR[1] - uR[1]).toFixed(3), manoAvanti: +(avanti(hR) - avanti(uR)).toFixed(3) }; });
      return { t: +(P.t144 || 0).toFixed(2), chiamato: P.pi144, men: res, folla: window.__CPM_PRES192 || null, f129: window.__CPM_FOLLA129 ? window.__CPM_FOLLA129.n : null }; })); }
  return out;
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const srv = await startServer(); const b = await launchBrowser(); const p = await apri(b, srv.address().port, FLAGS);
  const S = await posa(p, +(process.env.BEAT || 3));
  for (const s of S) { if (!s) continue; const c = s.men[s.chiamato] || null; console.log('t', s.t, 'chiamato', s.chiamato, JSON.stringify(c), 'f129', s.f129, 'folla', JSON.stringify(s.folla)); }
  const s = S[S.length - 1]; console.log('fila', JSON.stringify(s.men.filter(Boolean).map(m => [m.spalleSu, m.gomL, m.gomR, m.manoAvantiL])));
  await b.close(); srv.close();
}
