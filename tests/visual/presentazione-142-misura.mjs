#!/usr/bin/env node
/* [giro 142] SONDA DI MISURA (non guardiano): serata di presentazione, GLB acceso. Per ogni corpo della fila: aspetto (altezza,
   corporatura, testa/capelli), clip e suo tempo, angolo testa↔busto, quota mani↔anche, quota piedi↔prato, ampiezza di moto delle
   ossa nel tempo di scena. Uso: node presentazione-142-misura.mjs [etichetta] (VW/VH per il formato, CPM_ROSSO=1 per i rossi). */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import fs from 'node:fs';
fs.mkdirSync('out/g142', { recursive: true });
const tag = process.argv[2] || 'misura';
const VW = +(process.env.VW || 360), VH = +(process.env.VH || 800), ROSSO = !!process.env.CPM_ROSSO;
const PRO = { id: 'parm', n: 'FC Parmense', a: 'PAR', p: 62, c: '#facc15', c2: '#2563eb', nat: '🇮🇹', lg: 'Lega A' };
const save = { phase: 'career', player: {
  name: 'Presenta Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 4, week: 1, age: 24, ovr: 80,
  tutorialDone: true, campDone: true, jerseyNum: 9, jerseyNumSeason: 4, presidentModalSeason: 4,
  drawSeen: 4, mercatoSeen: 4, coachPactSeason: 4, presentedClub: PRO.id, presentSeason: 4,
  seasonPledge: { season: 4, tone: 'equilibrato' }, squadRole: 'titolare', club: PRO,
  stats: { 'velocità': 78, tecnica: 78, fisico: 76, 'mentalità': 76, tiro: 80, passaggio: 76, dribbling: 79, posizionamento: 78 },
  form: 80, morale: 72, fatigue: 25, coachTrust: 70, teamChemistry: 60, popularity: 45, bankBalance: 1e6,
  goals: 0, assists: 0, matches: 0, totalMatches: 90, totalGoals: 40, matchHistory: [],
  contract: { duration: 3, wage: 400000, expiresAtSeason: 8 } } };
export async function misura({ page, beat = 3, finestra = 2500 }) {
  await page.evaluate(b => window.__CPM_CAREER.apriPresentazione(b), beat);
  await page.waitForFunction(() => window.__CPM_PRES142 && window.__CPM_PRES142.men && window.__CPM_PRES142.men.length >= 2, null, { timeout: 60000 });
  await sleep(1500);
  /* riposo di riferimento: un corpo CGTrader appena clonato (posa di legame), stessa statura */
  const rif = await page.evaluate(async () => { const T = THREE, pkg = await loadGLB('./assets/cgtrader-review-lod1-kit-adapter.glb');
    const av = corpoCG23(pkg, { shirt: '#fff', shorts: '#fff', socks: '#fff', altezza: 1.8 }); av.updateMatrixWorld(true); const B = {}; av.traverse(o => { if (o.isBone) B[o.name] = o; });
    const qa = new T.Quaternion(), qb = new T.Quaternion(), va = new T.Vector3(), vb = new T.Vector3(); B.spine_03.getWorldQuaternion(qa); B.head.getWorldQuaternion(qb);
    const rH = qa.clone().invert().multiply(qb); B.foot_l.getWorldPosition(va); B.ball_l.getWorldPosition(vb); const d = vb.clone().sub(va);
    window.__RIF142 = { rH: rH.toArray(), pend: Math.atan2(d.y, Math.hypot(d.x, d.z)) * 180 / Math.PI, ball: vb.y }; return window.__RIF142; });
  const campione = () => page.evaluate(() => {
    const P = window.__CPM_PRES142, T = window.THREE, v = new T.Vector3(), out = [], RF = window.__RIF142, rH = new T.Quaternion().fromArray(RF.rH);
    const marchio = (() => { const e = document.querySelector('[data-cpm="marchio142"]') || null; return e ? e.innerText.replace(/\s+/g, ' ').trim() : null; })();
    P.men.forEach((m, i) => {
      m.updateMatrixWorld(true);
      const B = {}; m.traverse(o => { if (o.isBone && /^(head|neck_01|spine_03|pelvis|hand_[lr]|foot_[lr]|ball_[lr]|upperarm_[lr])$/.test(o.name)) B[o.name] = o; });
      const W = n => { if (!B[n]) return null; B[n].getWorldPosition(v); return [v.x, v.y, v.z]; };
      const pe = W('pelvis'), ne = W('neck_01'), he = W('head'), sp = W('spine_03');
      const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], ang = (a, b) => { const d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; return Math.acos(Math.max(-1, Math.min(1, d / Math.hypot(...a) / Math.hypot(...b)))) * 180 / Math.PI; };
      const busto = sub(ne, pe), testa = sub(he, ne);
      const qa = new T.Quaternion(), qb = new T.Quaternion(); B.spine_03.getWorldQuaternion(qa); B.head.getWorldQuaternion(qb);
      const testaRiposo = 2 * Math.acos(Math.min(1, Math.abs(qa.clone().invert().multiply(qb).dot(rH)))) * 180 / Math.PI;
      const pnd = (f, p) => { const d = sub(W(p), W(f)); return Math.atan2(d[1], Math.hypot(d[0], d[2])) * 180 / Math.PI; };
      const sc = m.scale.y / 1.0;
      const hl = W('hand_l'), hr = W('hand_r'), fl = W('foot_l'), fr = W('foot_r'), bl = W('ball_l'), br = W('ball_r');
      let teste = null, capelli = null; m.traverse(o => { if (!o.isMesh || !o.material) return; (Array.isArray(o.material) ? o.material : [o.material]).forEach(mt => { if (mt && /^(Material\.002|KorwardNativeHair_)/.test(mt.name || '')) capelli = mt.name; }); });
      const mx = P.mixers[i], a = mx && mx._actions && mx._actions[0];
      const pz = []; m.traverse(o => { if (o.isBone) { o.getWorldPosition(v); pz.push(+v.x.toFixed(4), +v.y.toFixed(4), +v.z.toFixed(4)); } });
      const alt = he[1];
      out.push({ i, eroe: i === P.HERO, sx: +m.scale.x.toFixed(4), sy: +m.scale.y.toFixed(4), corp: +(m.scale.x / m.scale.y).toFixed(3), alt: +alt.toFixed(3), capelli,
        clip: a ? a._clip.name : null, t: a ? +a.time.toFixed(3) : null, pausa: a ? a.paused : null,
        testaRiposo: +testaRiposo.toFixed(1), puntaGradi: [+(pnd('foot_l', 'ball_l') - RF.pend).toFixed(1), +(pnd('foot_r', 'ball_r') - RF.pend).toFixed(1)],
        piedeMin: +(Math.min(W('ball_l')[1], W('ball_r')[1]) - RF.ball).toFixed(3), piedeMax: +(Math.max(W('ball_l')[1], W('ball_r')[1]) - RF.ball).toFixed(3),
        variante: (m.userData.aspetto142 || {}).variante || null, posaT: (m.userData.posa142 || {}).tb != null ? +m.userData.posa142.tb.toFixed(2) : null, el: P.el,
        testaBusto: +ang(busto, testa).toFixed(1), testaVert: +ang([0, 1, 0], testa).toFixed(1), bustoVert: +ang([0, 1, 0], busto).toFixed(1),
        maniAnche: [+(hl[1] - pe[1]).toFixed(3), +(hr[1] - pe[1]).toFixed(3)], piedi: [fl[1], fr[1], bl[1], br[1]].map(x => +x.toFixed(3)),
        puntaGiu: [+(fl[1] - bl[1]).toFixed(3), +(fr[1] - br[1]).toFixed(3)], pz });
    });
    return { marchio, men: out };
  });
  /* moto nel tempo di scena: campioni fitti, si misura la striscia piu' lunga senza movimento (per uomo) */
  const traccia = await page.evaluate(async (dur) => { const P = window.__CPM_PRES142, v = new THREE.Vector3(), S = [];
    const snap = () => ({ el: P.el, pz: P.men.map(m => { const a = []; m.updateMatrixWorld(true); m.traverse(o => { if (o.isBone && /^(head|hand_[lr]|spine_03|upperarm_[lr])$/.test(o.name)) { o.getWorldPosition(v); a.push(v.x, v.y, v.z); } }); return a; }) });
    const t0 = performance.now(); while (performance.now() - t0 < dur) { S.push(snap()); await new Promise(r => setTimeout(r, 120)); }
    const fermo = P.men.map((_, i) => { let best = 0, run = 0; for (let k = 1; k < S.length; k++) { const a = S[k - 1].pz[i], b = S[k].pz[i]; let mx = 0; for (let j = 0; j < a.length; j += 3) mx = Math.max(mx, Math.hypot(a[j] - b[j], a[j + 1] - b[j + 1], a[j + 2] - b[j + 2]));
      const dt = (S[k].el || 0) - (S[k - 1].el || 0); if (mx < 0.0015) { run += dt; best = Math.max(best, run); } else run = 0; } return +best.toFixed(2); });
    return { fermo, scena: +((S[S.length - 1].el || 0) - (S[0].el || 0)).toFixed(2), campioni: S.length }; }, finestra + 1500);
  const a = await campione(); await sleep(finestra); const b = await campione();
  a.traccia = traccia;
  a.men.forEach((m, k) => { const q = b.men[k]; let mx = 0; for (let j = 0; j < m.pz.length; j += 3) mx = Math.max(mx, Math.hypot(m.pz[j] - q.pz[j], m.pz[j + 1] - q.pz[j + 1], m.pz[j + 2] - q.pz[j + 2])); m.moto = +mx.toFixed(4); m.t2 = q.t; delete m.pz; });
  return a;
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const srv = await startServer(); const browser = await launchBrowser();
  const page = await browser.newPage({ viewport: { width: VW, height: VH } }); await installCdnRoutes(page);
  await page.addInitScript(([o, r]) => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; if (r) { window.__CPM_NO_G142 = 1; window.__CPM_NO_G142M = 1; }
    localStorage.setItem('cpm-v3', JSON.stringify(o)); localStorage.setItem('cpm-intro-seen', '1'); }, [save, ROSSO]);
  await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1500); try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 4000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 25000 }); await sleep(900);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  const r = await misura({ page, beat: +(process.env.BEAT || 3) });
  await page.screenshot({ path: `out/g142/${tag}-${VW}x${VH}.png` });
  for (const bt of (process.env.BEATS || '').split(',').filter(Boolean)) { await page.evaluate(b => window.__CPM_CAREER.apriPresentazione(b), +bt); await sleep(2500); await page.screenshot({ path: `out/g142/${tag}-${VW}x${VH}-beat${bt}.png` }); }
  console.log(JSON.stringify(r, null, 0).replace(/\},\{/g, '},\n{'));
  await browser.close(); srv.close();
}
