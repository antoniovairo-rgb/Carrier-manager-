#!/usr/bin/env node
/* [giro 192] GUARDIANO DELLE CERIMONIE 3D — un controllo per punto del collaudo PO, ciascuno verde col verde e rosso col rosso.
   A · PO-402 «il mister vola sull'erba»: premiazione di coppa, testimone __CPM_COACH77 (punte dei piedi) e __CPM_CER476 (velocita').
       Verde: velocita' mediana ≤ 1,8 u/s, slittamento del piede d'appoggio ≤ 0,08, verso del corpo entro 30° dal moto.
       Rosso __CPM_NO_G192A: velocita' ≥ 2,8 e slittamento ≥ 0,20 (misurato prima: 3,2 · 0,29).
   B · PO-404 «la coppa all'inizio non deve volare»: testimone __CPM_G192B (coppa e mani nello stesso fotogramma) su present+captain.
       Volo libero = strada percorsa dalla coppa quando non e' ferma sul palco e dista > 0,35 dalle mani di chiunque. Verde: ≤ 0,6u e
       nessun salto > 0,35u in un fotogramma; eroe capitano: nessun capitano, nessun passaggio, coppa alle sue mani nell'alzata.
       Rosso __CPM_NO_G192B: volo libero ≥ 1,5u (misurato prima: podio→eroe→capitano).
   C · PO-406 presentazione · D · PO-407 parata: vedi i blocchi sotto.
   Uso: node cerimonie-192.mjs  (CPM_SOLO=A,B per restringere). «Non giudicato» = rosso. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const SOLO = (process.env.CPM_SOLO || 'A,B,C,D').split(',');
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const med = a => { const s = [...a].sort((x, y) => x - y); return s.length ? +s[Math.floor(s.length / 2)].toFixed(3) : null; };
const d3 = (a, c) => Math.hypot(a[0] - c[0], a[1] - c[1], a[2] - c[2]);
const guasti = [], righe = [];
async function cerimonia(flags, kind, finche, extra) {
  const p = await b.newPage({ viewport: { width: 375, height: 812 } }); await installCdnRoutes(p);
  await p.addInitScript(f => { window.__CPM_GLB = true; window.__CPM_REC = 1; window.__CPM_PRESENT = 1; for (const k of f) window[k] = 1; }, flags.concat(extra || []));
  await openMatch(p, port, { skipLoadAll: true, name: 'Cer192' });
  await p.waitForFunction(() => window.__CPM_GLB_READY, null, { timeout: 60000 }).catch(() => {}); await sleep(1500);
  await p.evaluate(k => { window.__CPM_FORCE_CEREMONY({ name: 'COPPA NAZIONALE', kind: k }); }, kind);
  await p.waitForFunction(() => { const W = window.__CPM_COACH77; return W && W.fr.some(f => f.glb === 1); }, null, { timeout: 40000 }).catch(() => {});
  await p.evaluate(() => { window.__CPM_COACH77 = { fr: [] }; window.__CPM_CER476 = []; window.__CPM_G192B = { fr: [] }; window.__CPM_CERT_SET = 0; });
  await p.waitForFunction(finche, null, { timeout: 90000 }).catch(() => {});
  const r = await p.evaluate(() => ({ F: (window.__CPM_COACH77 || { fr: [] }).fr.filter(f => f.glb === 1), C: (window.__CPM_CER476 || []).map(w => w.coach && w.coach.v).filter(v => v != null),
    T: (window.__CPM_G192B || { fr: [] }).fr, beats: (window.__CPM_CER425 || {}).beats || [] }));
  await p.close(); return r;
}
function misuraA(r) {
  const sl = [], fac = [];
  for (let i = 1; i < r.F.length; i++) { const a = r.F[i - 1], c = r.F[i]; if (!a.tL || !c.tL) continue; const dg = Math.hypot(c.g[0] - a.g[0], c.g[2] - a.g[2]); if (dg < 0.03) continue;
    sl.push(Math.min(Math.hypot(c.tL[0] - a.tL[0], c.tL[2] - a.tL[2]), Math.hypot(c.tR[0] - a.tR[0], c.tR[2] - a.tR[2])) / dg);
    let e = Math.abs(Math.atan2(c.g[0] - a.g[0], c.g[2] - a.g[2]) - c.ry) % (2 * Math.PI); if (e > Math.PI) e = 2 * Math.PI - e; fac.push(e * 180 / Math.PI); }
  return { passi: sl.length, vel: med(r.C.filter(v => v > 0.3)), slitt: med(sl), verso: med(fac) };
}
function misuraB(r) {
  const T = r.T.filter(f => f.b === 'present' || f.b === 'captain'); let volo = 0, salto = 0;
  const dmin = f => Math.min(f.e ? d3(f.t, f.e) : 9, f.c ? d3(f.t, f.c) : 9);
  for (let i = 1; i < T.length; i++) { const a = T[i - 1], c = T[i], dd = d3(a.t, c.t), dm = dmin(c);
    if (!(dmin(a) <= 0.35 && dm <= 0.35)) salto = Math.max(salto, dd);/* in mano a qualcuno la coppa si muove con le sue braccia: non e' un salto */
    if (!c.r && dm > 0.35) volo += dd; }
  const L = r.T.filter(f => f.b === 'lift' && f.e).map(f => d3(f.t, f.e));
  return { campioni: T.length, volo: +volo.toFixed(2), salto: +salto.toFixed(2), capitano: r.T.some(f => f.cap), passaggio: r.beats.includes('pass'), alzataMani: med(L) };
}
const fineCaptain = () => { const W = window.__CPM_G192B; return W && W.fr.some(f => f.b === 'pass' || f.b === 'lift'); };
if (SOLO.includes('A')) {
  const v = misuraA(await cerimonia([], 'cup', () => (window.__CPM_CER476 || []).some(w => w.beat === 'captain'))), r = misuraA(await cerimonia(['__CPM_NO_G192A'], 'cup', () => (window.__CPM_CER476 || []).some(w => w.beat === 'captain')));
  righe.push('A verde ' + JSON.stringify(v), 'A rosso ' + JSON.stringify(r));
  if (!(v.passi >= 15 && v.vel <= 1.8 && v.slitt <= 0.08 && v.verso <= 30)) guasti.push('A verde: il mister non cammina ' + JSON.stringify(v));
  if (!(r.passi >= 15 && r.vel >= 2.8 && r.slitt >= 0.2)) guasti.push('A rosso: il difetto non si vede ' + JSON.stringify(r));
}
if (SOLO.includes('B')) {
  const v = misuraB(await cerimonia([], 'cup', fineCaptain)), r = misuraB(await cerimonia(['__CPM_NO_G192B'], 'cup', fineCaptain));
  const ec = misuraB(await cerimonia([], 'cup', () => { const W = window.__CPM_G192B; return W && W.fr.filter(f => f.b === 'lift').length > 12; }, ['__CPM_EROE_CAPITANO192']));
  const ecR = misuraB(await cerimonia(['__CPM_NO_G192B'], 'cup', fineCaptain, ['__CPM_EROE_CAPITANO192']));
  righe.push('B verde ' + JSON.stringify(v), 'B rosso ' + JSON.stringify(r), 'B eroe capitano ' + JSON.stringify(ec), 'B eroe capitano rosso ' + JSON.stringify(ecR));
  if (!(v.campioni >= 15 && v.volo <= 0.6 && v.salto <= 0.35 && v.capitano)) guasti.push('B verde: la coppa vola ' + JSON.stringify(v));
  if (!(r.campioni >= 15 && r.volo >= 1.5)) guasti.push('B rosso: il difetto non si vede ' + JSON.stringify(r));
  if (!(ec.campioni >= 10 && ec.volo <= 0.6 && ec.salto <= 0.35 && !ec.capitano && !ec.passaggio && ec.alzataMani != null && ec.alzataMani <= 0.6)) guasti.push('B eroe capitano: ' + JSON.stringify(ec));
  if (!(ecR.capitano && ecR.passaggio)) guasti.push('B eroe capitano rosso: il difetto non si vede ' + JSON.stringify(ecR));
}
/* D · PO-407 parata: colore del pullman (pixel della fiancata contro l'esadecimale del club, saturazione e tono) e coppa davvero fra le
   mani sopra la testa senza coprire il viso (testimone __CPM_PARATA.d192). Verde: saturazione ≥ 0,85 x quella del club e tono entro
   12°; faccia coperta 0; mani sopra la testa ≥ 0,15; presa ≤ 0,20; gomiti ≥ 140°. Rosso __CPM_NO_G192D: pullman sbiadito (misurato
   prima) e coppa sul viso. */
import { PNG } from 'pngjs';
const hsv = (r, g, bb) => { r /= 255; g /= 255; bb /= 255; const mx = Math.max(r, g, bb), mn = Math.min(r, g, bb), d = mx - mn; let h = 0;
  if (d) h = mx === r ? ((g - bb) / d) % 6 : mx === g ? (bb - r) / d + 2 : (r - g) / d + 4; return { h: (h * 60 + 360) % 360, s: mx ? d / mx : 0, v: mx }; };
async function parata(flags) {
  const club = { id: 'liv', n: 'FC Merseyside', a: 'MER', p: 96, c: '#dc2626', c2: '#f5f5f5', nat: '🏴', lg: 'Premier Division' };
  const p = await b.newPage({ viewport: { width: 375, height: 812 } }); await installCdnRoutes(p);
  await p.addInitScript(f => { for (const k of f) window[k] = 1; }, flags);
  await p.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await p.waitForFunction(() => typeof window.__CPM_PARATA198_C === 'function', null, { timeout: 60000 });
  await p.evaluate(c => { document.body.innerHTML = '<div id="parata" style="position:fixed;inset:0"></div>';
    ReactDOM.createRoot(document.getElementById('parata')).render(React.createElement(window.__CPM_PARATA198_C, { club: c, euroWin: true, avatarId: 0, heroNum: 9 })); }, club);
  await p.waitForFunction(() => window.__CPM_PARATA && (window.__CPM_PARATA.cg23 || 0) >= 8 && window.__CPM_PARATA.bus, null, { timeout: 60000 }).catch(() => {});
  const colori = [], coppa = [];
  for (let k = 0; k < 6; k++) { await sleep(1500);
    const pts = await p.evaluate(() => { const P = window.__CPM_PARATA, T = window.THREE; if (!P || !P.bus) return null; const cam = P.cam, out = [];
      P.bus.updateMatrixWorld(true); const cp = cam.position;
      for (const sx of [-3.21, 3.21]) for (let z = -6; z <= 6; z += 1.5) for (const y of [4.3, 4.8]) { const v = new T.Vector3(sx, y, z); P.bus.localToWorld(v);
        const n = new T.Vector3(Math.sign(sx), 0, 0).transformDirection(P.bus.matrixWorld); if (n.dot(cp.clone().sub(v)) <= 0) continue; const q = v.clone().project(cam);
        if (Math.abs(q.x) < 0.95 && Math.abs(q.y) < 0.95 && q.z < 1) out.push([(q.x + 1) / 2 * innerWidth, (1 - q.y) / 2 * innerHeight]); }
      return out; });
    const shot = PNG.sync.read(await p.screenshot());
    for (const [x, y] of pts || []) { const X = Math.round(x * shot.width / 375), Y = Math.round(y * shot.height / 812); if (X < 2 || Y < 2 || X >= shot.width - 2 || Y >= shot.height - 2) continue;
      const i = (Y * shot.width + X) * 4; colori.push(hsv(shot.data[i], shot.data[i + 1], shot.data[i + 2])); }
    const d = await p.evaluate(() => (window.__CPM_PARATA || {}).d192 || null); if (d) coppa.push(d); }
  await p.close();
  const ref = hsv(0xdc, 0x26, 0x26);
  return { punti: colori.length, sat: med(colori.map(c => c.s)), satRif: +ref.s.toFixed(3), tono: med(colori.map(c => Math.min(Math.abs(c.h - ref.h), 360 - Math.abs(c.h - ref.h)))), lum: med(colori.map(c => c.v)),
    coppa: coppa.length, faccia: med(coppa.map(c => c.faccia)), sopra: med(coppa.map(c => c.sopra)), presa: med(coppa.map(c => c.presa)), gomiti: med(coppa.map(c => Math.min(c.gomL, c.gomR))) };
}
if (SOLO.includes('D')) {
  const v = await parata([]), r = await parata(['__CPM_NO_G192D']);
  righe.push('D verde ' + JSON.stringify(v), 'D rosso ' + JSON.stringify(r));
  if (!(v.punti >= 10 && v.sat >= 0.85 * v.satRif && v.tono <= 12)) guasti.push('D verde: pullman sbiadito ' + JSON.stringify(v));
  if (!(v.coppa >= 3 && v.faccia === 0 && v.sopra >= 0.15 && v.presa <= 0.20 && v.gomiti >= 140)) guasti.push('D verde: coppa/braccia ' + JSON.stringify(v));
  if (!(r.punti >= 10 && r.sat < 0.85 * r.satRif)) guasti.push('D rosso: il pullman sbiadito non si vede ' + JSON.stringify(r));
  if (!(r.coppa >= 3 && (r.faccia > 0 || r.gomiti < 140))) guasti.push('D rosso: la coppa sul viso non si vede ' + JSON.stringify(r));
}
/* C: aggiunto sotto */
await b.close(); srv.close();
righe.forEach(x => console.log(x));
if (guasti.length) { console.log('❌ cerimonie-192'); guasti.forEach(g => console.log('  · ' + g)); process.exit(1); }
console.log('✅ cerimonie-192 verde (e ogni rosso si vede) · punti ' + SOLO.join(','));
